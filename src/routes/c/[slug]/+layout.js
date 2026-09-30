// Cards are loaded at runtime from Supabase, so these routes are never
// prerendered — the 404.html fallback (see vite.config.js) serves the SPA
// shell for any /c/<slug> deep link.
export const prerender = false;
export const ssr = false;
export const trailingSlash = 'never';