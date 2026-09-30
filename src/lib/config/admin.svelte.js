import { supabase, PHOTO_BUCKET, photoPublicUrl } from './supabase.js';
import { DEFAULT_CARD } from './defaults.js';

export const adminState = $state({
	loading: false,
	saving: false,
	rows: [],
	error: ''
});

const CARDS = () => supabase.from('cards');

// Rows come out of $state, so they are Proxies — structuredClone throws
// DataCloneError on those. $state.snapshot unwraps them into plain objects
// (and still deep-copies plain values, so it covers DEFAULT_CARD too).
const plain = (value) => (value == null ? value : $state.snapshot(value));

const stripVisuals = (planets = []) =>
	planets.map(({ orbitRadius, orbitSpeed, size, color, glowColor, rings, surface, kind, ...rest }) => ({
		kind: 'planet',
		...rest
	}));

export const listCards = async () => {
	if (!supabase) return [];
	adminState.loading = true;
	adminState.error = '';
	try {
		const { data, error } = await CARDS()
			.select('id, slug, name, birthday_at, photo_path, planets, gifts, settings, updated_at')
			.order('updated_at', { ascending: false });
		if (error) throw error;
		adminState.rows = data ?? [];
	} catch (err) {
		adminState.error = err?.message || 'could not load cards';
		adminState.rows = [];
	} finally {
		adminState.loading = false;
	}
	return adminState.rows;
};

// A blank card starts from the built-in defaults so a new card is never empty.
export const blankCard = () => ({
	id: null,
	slug: '',
	name: DEFAULT_CARD.name,
	birthday_at: DEFAULT_CARD.birthdayAt,
	photo_path: '',
	planets: stripVisuals(DEFAULT_CARD.planets),
	gifts: DEFAULT_CARD.gifts.map((gift) => ({ ...gift })),
	settings: plain(DEFAULT_CARD.settings)
});

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const slugify = (value) =>
	String(value || '')
		.trim()
		.toLowerCase()
		.replace(/['’]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 60);

export const validateCard = (card) => {
	const problems = [];
	if (!card.name.trim()) problems.push('name is required');
	if (!SLUG_RE.test(card.slug)) {
		problems.push('slug must be lowercase letters, numbers and single dashes (e.g. namita)');
	}
	if (!card.birthday_at) problems.push('birthday date is required');
	if (!Array.isArray(card.planets) || card.planets.length === 0) {
		problems.push('at least one planet is required');
	}
	if (!Array.isArray(card.gifts) || card.gifts.length === 0) {
		problems.push('at least one gift is required');
	}
	const giftKinds = new Set(['quote', 'playful', 'message', 'visual', 'interactive']);
	(card.gifts ?? []).forEach((gift, i) => {
		if (giftKinds.has(gift.kind) && !gift.kind) problems.push(`gift ${i + 1} has no kind`);
	});
	// The closing rules index into the planner's four stages, so those must
	// keep their exact shape no matter what the editor allows elsewhere.
	const stages = card.settings?.planner?.stages ?? [];
	if (stages.length !== 4) problems.push('the planner must keep exactly four stages');
	if (!card.settings?.planner?.planTemplate) problems.push('plan template is required');
	if (!card.settings?.finale?.closing?.fallback) problems.push('closing fallback is required');
	return problems;
};

export const saveCard = async (card) => {
	adminState.saving = true;
	adminState.error = '';
	try {
		const payload = {
			slug: card.slug.trim(),
			name: card.name.trim(),
			birthday_at: card.birthday_at,
			photo_path: card.photo_path || null,
			planets: stripVisuals(card.planets),
			gifts: card.gifts,
			settings: card.settings
		};

		if (card.id) {
			const { error } = await CARDS().update(payload).eq('id', card.id);
			if (error) throw error;
		} else {
			const { data, error } = await CARDS().insert(payload).select('id').single();
			if (error) throw error;
			card.id = data.id;
		}
		await listCards();
		return true;
	} catch (err) {
		adminState.error = err?.message || 'could not save this card';
		return false;
	} finally {
		adminState.saving = false;
	}
};

export const deleteCard = async (id) => {
	adminState.error = '';
	try {
		const { error } = await CARDS().delete().eq('id', id);
		if (error) throw error;
		adminState.rows = adminState.rows.filter((row) => row.id !== id);
		return true;
	} catch (err) {
		adminState.error = err?.message || 'could not delete this card';
		return false;
	}
};

export const duplicateCard = async (source) => {
	const copy = {
		...blankCard(),
		name: `${source.name} (copy)`,
		slug: `${source.slug}-copy`,
		photo_path: source.photo_path ?? '',
		birthday_at: source.birthday_at,
		planets: stripVisuals(source.planets ?? []),
		gifts: plain(source.gifts ?? []),
		settings: plain(source.settings ?? {})
	};
	return saveCard(copy);
};

// Reel photo only. PNG is preferred for a transparent cutout; anything else is
// stored as-is. Objects are keyed by card id so re-uploads can be cleaned up.
export const uploadPhoto = async (cardId, file) => {
	if (!file) return { ok: false, error: 'no file chosen' };
	const isPng = file.type === 'image/png';
	const ext = isPng ? 'png' : (file.name.split('.').pop() || 'jpg').toLowerCase();
	const path = `cards/${cardId}/reel.${ext}`;
	adminState.error = '';
	try {
		const { error } = await supabase.storage
			.from(PHOTO_BUCKET)
			.upload(path, file, { cacheControl: '3600', upsert: true, contentType: file.type });
		if (error) throw error;
		return { ok: true, path, url: photoPublicUrl(path) };
	} catch (err) {
		adminState.error = err?.message || 'could not upload the photo';
		return { ok: false, error: adminState.error };
	}
};

export const removePhoto = async (cardId, path) => {
	if (!path) return;
	try {
		await supabase.storage.from(PHOTO_BUCKET).remove([path]);
	} catch {
		// a leftover object is harmless; the card simply points elsewhere
	}
};

export { photoPublicUrl };