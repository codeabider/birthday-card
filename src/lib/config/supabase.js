import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';
import { browser } from '$app/environment';

// Read through the dynamic public env rather than $env/static/public: a static
// import of a missing key is a hard build error, and the app must still build
// (and run on the built-in defaults) before anyone adds a .env.
//
// Supabase renamed the browser key: the current one is the "publishable" key
// (sb_publishable_...), while the old JWT "anon" key is legacy but still works.
// Accept either so upgrading the dashboard does not break the build.
const supabaseUrl = env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.PUBLIC_SUPABASE_ANON_KEY;

export const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const PHOTO_BUCKET = 'card-photos';

// A client built with placeholder values would throw on first network call, so
// callers must check isConfigured first. Returning null keeps that explicit.
export const supabase = isConfigured
	? createClient(supabaseUrl, supabaseAnonKey, {
			auth: {
				persistSession: browser,
				autoRefreshToken: browser,
				detectSessionInUrl: false
			}
		})
	: null;

export const photoPublicUrl = (path) => {
	if (!path) return '';
	if (/^https?:\/\//.test(path)) return path;
	if (!supabase) return '';
	const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
	return data?.publicUrl ?? '';
};
