<script>
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import RetroReel from '$lib/components/RetroReel.svelte';
	import BirthdayMusic from '$lib/components/BirthdayMusic.svelte';
	import {persona} from '$lib/persona.svelte.js';
	import {getFlow} from '$lib/flow.svelte.js';

	const flow = getFlow();

	let reelDone = $state(false);

	const themeEmoji = {
		warm: ['🌞', '🧡'],
		party: ['🥳', '🎉'],
		mystery: ['🗝️', '🔎'],
		cozy: ['🧸', '🕯️'],
		dream: ['🌠', '✨'],
	};

	const dayTheme = () => {
		const ch = flow.choices;
		if (!['s0', 's1', 's2', 's3'].every((key) => Number.isInteger(ch[key]))) return 'warm';
		return ['party', 'mystery', 'cozy', 'dream'][ch.s3] || 'warm';
	}

	const closingText = () => {
		const ch = flow.choices;
		const ready = ['s0', 's1', 's2', 's3'].every((key) => Number.isInteger(ch[key]));
		const fallback = 'and a whole year that\u2019s kinder to you than you expect. happy birthday.';
		if (!ready) return fallback;
		const morning = ch.s0, next = ch.s1, afternoon = ch.s2, evening = ch.s3;
		if (evening === 1) return 'may the mystery be fun and the answer quick, then let yourself celebrate it loudly. happy birthday.';
		if (evening === 0) return 'dance like nobody\u2019s counting, and let this year keep giving you reasons to. happy birthday.';
		if (next === 1 || afternoon === 1) return 'go take that adventure: may every small detour this year be worth it. happy birthday.';
		if (next === 2) return 'may the nothing be luxurious and exactly what you needed. happy birthday.';
		if (afternoon === 0) return 'may this year save you plenty of sweet treats, and plenty of reasons to deserve them. happy birthday.';
		if (morning === 1) return 'may your mornings keep starting slow, and yours. happy birthday.';
		if (evening === 2) return 'blankets warm, world quiet, and the whole year gentle with you. happy birthday.';
		if (evening === 3) return 'may you keep dreaming easy: tomorrow is already holding something good. happy birthday.';
		return fallback;
	}

	const wishes = [
		'you\u2019ve shared some parts of yourself already',
		'they\u2019re the kind of parts people are lucky to know',
		'and the parts still left to show are the best kind of gift',
		closingText(),
	];

	const restart = () => {
		flow.reset();
		goto(base + '/');
	}
</script>

<RetroReel
	name={persona.display}
	wishes={wishes}
	treatLeft={themeEmoji[dayTheme()][0]}
	treatRight={themeEmoji[dayTheme()][1]}
	onReady={() => {
		flow.complete('final');
		reelDone = true;
	}}
	onRestart={restart}
/>

{#if reelDone}
	<BirthdayMusic />
{/if}