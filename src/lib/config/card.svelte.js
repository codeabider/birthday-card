import { DEFAULT_CARD, withVisuals } from './defaults.js';
import { supabase, isConfigured, photoPublicUrl } from './supabase.js';
import { persona, setPersonaName } from '$lib/persona.svelte.js';

// Merge saved settings over the defaults so a card saved before a field was
// added still renders, and a field cleared in the admin falls back to the
// built-in copy rather than rendering blank.
const deepMerge = (base, override) => {
	if (Array.isArray(base)) return Array.isArray(override) ? override : base;
	if (base === null || typeof base !== 'object') return override ?? base;
	if (override === null || typeof override !== 'object' || Array.isArray(override)) return override ?? base;
	const out = { ...base };
	for (const key of Object.keys(override)) out[key] = deepMerge(base[key], override[key]);
	return out;
};

const normaliseList = (list, fallback, prefix) => {
	if (!Array.isArray(list) || list.length === 0) return fallback.map((item) => ({ ...item }));
	return list.map((item, i) => ({
		...item,
		id: String(item?.id || `${prefix}-${i + 1}`),
		name: String(item?.name ?? ''),
		text: String(item?.text ?? '')
	}));
};

export const card = $state({
	slug: '',
	name: DEFAULT_CARD.name,
	birthdayAt: DEFAULT_CARD.birthdayAt,
	photoPath: '',
	photoUrl: '',
	planets: DEFAULT_CARD.planets.map((p) => withVisuals(p, DEFAULT_CARD.planets.indexOf(p))),
	gifts: DEFAULT_CARD.gifts.map((g) => ({ ...g })),
	settings: deepMerge({}, DEFAULT_CARD.settings)
});

export const cardState = $state({
	status: isConfigured ? 'idle' : 'defaults-only',
	error: ''
});

const applyCard = (row) => {
	const planets = normaliseList(row.planets, DEFAULT_CARD.planets, 'planet');
	card.slug = row.slug ?? '';
	card.name = row.name || DEFAULT_CARD.name;
	card.birthdayAt = row.birthday_at || DEFAULT_CARD.birthdayAt;
	card.photoPath = row.photo_path || '';
	card.photoUrl = photoPublicUrl(row.photo_path || '');
	card.planets = planets.map((planet, i) => withVisuals(planet, i));
	card.gifts = normaliseList(row.gifts, DEFAULT_CARD.gifts, 'gift');
	card.settings = deepMerge(DEFAULT_CARD.settings, row.settings || {});
	setPersonaName(card.name);
};

// Substitute the {name} token used throughout the copy.
export const fill = (value) =>
	typeof value === 'string' ? value.replaceAll('{name}', persona.display) : (value ?? '');

// Load one card by slug. Falls back to the built-in defaults when Supabase is
// not configured or the row is missing, so a fresh clone still runs.
export const loadCard = async (slug) => {
	if (!slug) {
		applyCard({ slug: '', settings: {} });
		return;
	}
	if (!isConfigured || !supabase) {
		cardState.status = 'defaults-only';
		applyCard({ slug, name: DEFAULT_CARD.name, settings: {} });
		return;
	}

	cardState.status = 'loading';
	cardState.error = '';
	try {
		const { data, error } = await supabase
			.from('cards')
			.select('slug, name, birthday_at, photo_path, planets, gifts, settings')
			.eq('slug', slug)
			.maybeSingle();

		if (error) throw error;
		if (!data) {
			cardState.status = 'missing';
			applyCard({ slug, name: DEFAULT_CARD.name, settings: {} });
			return;
		}
		cardState.status = 'ready';
		applyCard(data);
	} catch (err) {
		cardState.status = 'error';
		cardState.error = err?.message || 'could not load this card';
		applyCard({ slug, name: DEFAULT_CARD.name, settings: {} });
	}
};
