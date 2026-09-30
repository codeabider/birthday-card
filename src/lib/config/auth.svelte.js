import { supabase, isConfigured } from './supabase.js';

export const session = $state({
	user: null,
	loading: true,
	error: ''
});

let initialised = false;

export const initAuth = async () => {
	if (initialised) return;
	initialised = true;
	if (!supabase) {
		session.loading = false;
		session.error = 'supabase is not configured — add PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY to .env';
		return;
	}
	try {
		const { data } = await supabase.auth.getSession();
		session.user = data.session?.user ?? null;
	} catch (err) {
		session.error = err?.message || 'could not read the session';
	} finally {
		session.loading = false;
	}
	supabase.auth.onAuthStateChange((_event, next) => {
		session.user = next?.user ?? null;
	});
};

export const signIn = async (email, password) => {
	session.error = '';
	if (!supabase) {
		session.error = 'supabase is not configured';
		return false;
	}
	const { data, error } = await supabase.auth.signInWithPassword({ email, password });
	if (error) {
		session.error = error.message;
		return false;
	}
	session.user = data.user ?? null;
	return true;
};

export const signOut = async () => {
	if (supabase) await supabase.auth.signOut();
	session.user = null;
};

// The admin is single-owner by design, but RLS on the table is "any
// authenticated user may write". Keep an explicit allowlist so a stray signup
// cannot edit cards: set the owner address in .env as PUBLIC_OWNER_EMAIL.
import { env } from '$env/dynamic/public';

export const ownerEmail = (env.PUBLIC_OWNER_EMAIL || '').trim().toLowerCase();

// Derived values can't be exported from a module, so expose them as getters the
// templates call instead.
export const isOwner = () =>
	Boolean(session.user) && (!ownerEmail || session.user.email?.toLowerCase() === ownerEmail);

export { isConfigured };