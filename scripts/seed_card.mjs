#!/usr/bin/env node
// Seed a card into Supabase from the built-in defaults.
//
//   npm run seed -- namita
//   npm run seed -- namita "Ada Lovelace" 2027-03-14
//
// Reads PUBLIC_SUPABASE_URL and the publishable key from .env. Run
// supabase/schema.sql first.

import { readFileSync, existsSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const loadEnv = () => {
	if (!existsSync('.env')) return {};
	return Object.fromEntries(
		readFileSync('.env', 'utf8')
			.split('\n')
			.map((line) => line.trim())
			.filter((line) => line && !line.startsWith('#') && line.includes('='))
			.map((line) => {
				const at = line.indexOf('=');
				return [line.slice(0, at).trim(), line.slice(at + 1).trim()];
			}),
	);
};

const env = { ...loadEnv(), ...process.env };

const url = env.PUBLIC_SUPABASE_URL;
const key = env.PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
	console.error('missing PUBLIC_SUPABASE_URL / a publishable key (see .env.example)');
	process.exit(1);
}

const slug = process.argv[2];
if (!slug) {
	console.error('usage: npm run seed -- <slug> [name] [YYYY-MM-DD]');
	process.exit(1);
}

const { DEFAULT_CARD } = await import('../src/lib/config/defaults.js');

const name = process.argv[3] || DEFAULT_CARD.name;
const birthday = process.argv[4] || DEFAULT_CARD.birthdayAt.slice(0, 10);

// Visual properties (orbit radius, size, colour) are generated from list
// position at render time, so only the editable fields are stored.
const planets = DEFAULT_CARD.planets.map(({ orbitRadius, orbitSpeed, size, color, glowColor, rings, surface, ...rest }) => ({
	kind: 'planet',
	...rest
}));

const supabase = createClient(url, key, {
	auth: { persistSession: false, autoRefreshToken: false }
});

const row = {
	slug,
	name,
	birthday_at: `${birthday}T00:00:00+05:30`,
	photo_path: null,
	planets,
	gifts: DEFAULT_CARD.gifts,
	settings: DEFAULT_CARD.settings
};

const { data, error } = await supabase.from('cards').upsert(row, { onConflict: 'slug' }).select('slug').single();
if (error) {
	console.error(error.message);
	process.exit(1);
}

console.log(`seeded /c/${data.slug} (${name}, ${birthday})`);