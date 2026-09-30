#!/usr/bin/env node
// Diagnose a /admin sign-in failure. Prints the exact Supabase error.
//   node scripts/check_auth.mjs you@example.com 'password'

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
	console.error('missing url/key in .env');
	process.exit(1);
}
console.log('url  :', url);
console.log('key  :', key.slice(0, 22) + '…');

const supabase = createClient(url, key, { auth: { persistSession: false } });

// 1. is the key accepted at all?
const { error: pingError } = await supabase.from('cards').select('slug').limit(1);
console.log('select cards ->', pingError ? `FAIL ${pingError.message} (${pingError.code})` : 'ok');

// 2. what does the auth config say about signup/confirmation?
const { data: cfg } = await supabase.auth.signInWithPassword({
	email: 'nobody@example.invalid',
	password: 'x'
}).then((r) => ({ data: r }));
if (cfg) console.log('auth reachable: yes');

const email = process.argv[2];
const password = process.argv[3];
if (!email || !password) {
	console.log('\nusage: node scripts/check_auth.mjs <email> <password>');
	process.exit(0);
}

const { data, error } = await supabase.auth.signInWithPassword({ email, password });
if (error) {
	console.log('\nsign-in FAILED');
	console.log('  code   :', error.code ?? '(none)');
	console.log('  status :', error.status ?? '(none)');
	console.log('  message:', error.message);
	if (/not confirmed/i.test(error.message)) {
		console.log('\n  fix: in Supabase → Authentication → Users, open the user and set');
		console.log('       "Email Confirmed" to on (or re-send the confirmation email).');
	}
	if (/invalid login credentials/i.test(error.message)) {
		console.log('\n  fix: either the password is wrong, or no such user exists.');
		console.log('       Check Authentication → Users for the exact email address.');
	}
	process.exit(1);
}

console.log('\nsign-in OK for', data.user.email, '| id', data.user.id);
console.log('email_confirmed_at:', data.user.email_confirmed_at ?? 'NEVER CONFIRMED');
