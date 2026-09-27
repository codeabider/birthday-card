<script>
	import { onDestroy, onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { getFlow } from '$lib/flow.svelte.js';
	import CinematicSky from '$lib/components/CinematicSky.svelte';

	let revealing = $state(false);
	let linesOut = $state(0);
	let timers = [];

	const flow = getFlow();

	function restart() {
		flow.reset();
		goto(base + '/');
	}

	function closingText() {
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

	const themeEmoji = {
		warm: ['🌞', '🧡'],
		party: ['🥳', '🎉'],
		mystery: ['🗝️', '🔎'],
		cozy: ['🧸', '🕯️'],
		dream: ['🌠', '✨'],
	};

	function dayTheme() {
		const ch = flow.choices;
		if (!['s0', 's1', 's2', 's3'].every((key) => Number.isInteger(ch[key]))) return 'warm';
		return ['party', 'mystery', 'cozy', 'dream'][ch.s3] || 'warm';
	}

	let theme = $derived(dayTheme());

	const titleWords = [
		{ text: 'happy', gold: false },
		{ text: 'birthday', gold: false },
		{ text: 'Namita.', gold: true },
	];

	const lines = [
		'you\u2019ve shared some parts of yourself already',
		'they\u2019re the kind of parts people are lucky to know',
		'and the parts still left to show are the best kind of gift',
		closingText(),
	];

	onMount(() => {
		if (typeof window === 'undefined') return;
		timers = [
			setTimeout(() => { revealing = true; }, 300),
			setTimeout(() => { linesOut = 1; }, 1900),
			setTimeout(() => { linesOut = 2; }, 2700),
			setTimeout(() => { linesOut = 3; }, 3500),
			setTimeout(() => { linesOut = 4; }, 4200),
		];
	});

	onDestroy(() => {
		timers.forEach(clearTimeout);
	});
</script>

<div class="dusk">
	<CinematicSky />

		<div class="center {revealing ? 'show' : ''}">
			<h1 class="title show">
				{#each titleWords as w, i}
					<span class="tword {w.gold ? 'gold' : ''}" style="--d:{0.5 + 0.7 * i}s;">{w.text}</span>
				{/each}
			</h1>

			{#if linesOut >= 1}
				<div class="festoon" aria-hidden="true">
					<span class="rule"></span>
					<span class="diamond">✦</span>
					<span class="rule"></span>
				</div>
			{/if}

			{#if linesOut >= 1}
				<div class="wishes">
					<p class="wish" style="--d:0s;">{lines[0]}<br/>{lines[1]}</p>
					{#if linesOut >= 2}<p class="wish" style="--d:0.35s;">{lines[2]}</p>{/if}
					{#if linesOut >= 2}<p class="wish last" style="--d:0.7s;">{lines[3]}</p>{/if}
				</div>
			{/if}

			{#if linesOut >= 3}
				<div class="heart-wrap show" aria-hidden="true">
					<span class="halo"></span>
					<span class="side treat-left">{themeEmoji[theme][0]}</span>
					<span class="side treat-right">{themeEmoji[theme][1]}</span>
					<svg width="30" height="28" viewBox="0 0 28 26" fill="none">
						<path d="M14 24.5C14 24.5 2 16.5 2 9.5C2 5.5 5 3 8.5 3C10.8 3 13 4.5 14 6.5C15 4.5 17.2 3 19.5 3C23 3 26 5.5 26 9.5C26 16.5 14 24.5 14 24.5Z" fill="rgba(244,200,180,0.45)" />
					</svg>
				</div>
			{/if}

			{#if linesOut >= 4}
				<p class="end-mark">✦ that's everything</p>
				<button class="restart-btn" onclick={restart} aria-label="Start the whole experience over">↺ from the top</button>
			{/if}
		</div>
</div>

<style>
	.dusk {
		position: fixed;
		inset: 0;
		overflow: hidden;
		background:
			radial-gradient(ellipse at 50% 42%, rgba(255, 180, 120, 0.1) 0%, transparent 46%),
			radial-gradient(ellipse at 50% 118%, rgba(120, 140, 210, 0.1) 0%, transparent 55%),
			linear-gradient(180deg, #060a15 0%, #0a1122 55%, #0d1526 100%);
	}

	/* text overlay */
	.center {
		position: relative;
		z-index: 2;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.6rem;
		margin-top: clamp(52px, 15vh, 170px);
		min-height: clamp(430px, 62vh, 620px);
		padding-bottom: max(6vh, env(safe-area-inset-bottom), 32px);
		opacity: 0;
		transition: opacity 1.6s ease;
	}

	.center.show {
		opacity: 1;
	}

	.center::before {
		content: '';
		position: absolute;
		inset: -10% -14%;
		z-index: -1;
		border-radius: 50%;
		background: radial-gradient(ellipse at center, rgba(6, 10, 21, 0.66), transparent 70%);
		filter: blur(30px);
	}

	.title {
		display: inline-block;
		font-size: clamp(2.4rem, 9vw, 3.6rem);
		line-height: 1.3;
	}

	.tword {
		display: inline-block;
		margin-right: 0.32em;
		color: #ffead9;
		text-shadow: 0 2px 22px rgba(6, 8, 18, 0.8);
		opacity: 0;
		transform: translateY(22px) scale(0.95);
		animation: twordIn 1.35s cubic-bezier(0.22, 0.61, 0.36, 1) forwards var(--d);
	}

	.tword.gold {
		margin-right: 0;
		text-shadow: none;
		background: linear-gradient(90deg, #ffe6c2, #fbd09b, #f4b870, #ffe6c2);
		background-size: 220% auto;
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		animation: twordIn 1.35s cubic-bezier(0.22, 0.61, 0.36, 1) forwards var(--d),
			shimmer 5s linear infinite;
	}

	@keyframes twordIn {
		to { opacity: 1; transform: translateY(0) scale(1); }
	}

	@keyframes shimmer {
		to { background-position: -220% center; }
	}

	.festoon {
		display: flex;
		align-items: center;
		gap: 0.8rem;
		opacity: 0;
		animation: festoonIn 1.2s ease forwards;
	}

	@keyframes festoonIn {
		to { opacity: 1; }
	}

	.rule {
		width: clamp(40px, 14vw, 110px);
		height: 1px;
		background: linear-gradient(90deg, transparent, rgba(244,213,200,0.5), transparent);
		transform: scaleX(0);
		animation: ruleIn 1.1s ease forwards 0.4s;
	}

	@keyframes ruleIn {
		to { transform: scaleX(1); }
	}

	.diamond {
		color: rgba(244,213,200,0.75);
		font-size: 0.85rem;
		animation: dSpin 8s ease-in-out infinite;
	}

	@keyframes dSpin {
		0%, 100% { transform: rotate(0deg); }
		50% { transform: rotate(180deg); }
	}

	.wishes {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		align-items: center;
	}

	.wish {
		font-size: clamp(1.05rem, 4vw, 1.3rem);
		font-family: 'Playfair Display', Georgia, serif;
		font-style: italic;
		color: rgba(252, 238, 224, 0.85);
		text-shadow: 0 1px 16px rgba(6, 8, 18, 0.7);
		line-height: 1.7;
		opacity: 0;
		transform: translateY(10px);
		animation: wishAppear 1.2s ease forwards var(--d);
	}

	.wish.last {
		color: rgba(255, 221, 178, 0.95);
		margin-top: 0.4rem;
	}

	@keyframes wishAppear {
		to { opacity: 1; transform: translateY(0); }
	}

	.heart-wrap {
		position: relative;
		opacity: 0;
		transform: translateY(6px);
		transition: opacity 1.4s ease, transform 1.4s ease;
	}

	.heart-wrap.show {
		opacity: 1;
		transform: translateY(0);
		animation: heartPulse 2.6s ease-in-out infinite 0.4s;
	}

	.heart-wrap .halo {
		position: absolute;
		inset: -10px;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(244,200,180,0.28) 0%, transparent 68%);
		animation: haloPulseH 2.6s ease-in-out infinite;
	}

	@keyframes heartPulse {
		0%,100% { transform: scale(1); }
		50% { transform: scale(1.1); }
	}

	@keyframes haloPulseH {
		0%,100% { opacity: 0.4; }
		50% { opacity: 0.9; }
	}

	.heart-wrap > svg {
		position: relative;
		z-index: 1;
	}

	.side {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		font-size: 1.05rem;
		z-index: 2;
		animation: sideBob 2.6s ease-in-out infinite;
	}

	.treat-left { right: calc(100% + 12px); }
	.treat-right { left: calc(100% + 12px); animation-delay: 0.5s; }

	@keyframes sideBob {
		0%, 100% { transform: translateY(calc(-50% - 3px)); }
		50% { transform: translateY(calc(-50% + 3px)); }
	}

	.end-mark {
		margin-top: 1.4rem;
		font-size: 0.6rem;
		letter-spacing: 0.3em;
		text-transform: uppercase;
		color: rgba(255,221,178,0.45);
		opacity: 0;
		animation: wishAppear 0.9s ease 0.6s forwards;
	}

	.restart-btn {
		margin-top: 0.6rem;
		font-size: 0.6rem;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: rgba(255,221,178,0.55);
		padding: 0.7rem 1.4rem;
		border-radius: 100px;
		border: 1px solid rgba(255,221,178,0.18);
		background: rgba(6,10,21,0.35);
		backdrop-filter: blur(8px);
		cursor: pointer;
		transition: color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
	}

	.restart-btn:hover,
	.restart-btn:focus-visible {
		color: rgba(255,232,206,0.92);
		border-color: rgba(255,221,178,0.42);
		box-shadow: 0 0 22px rgba(255,190,130,0.22);
	}

	@media (prefers-reduced-motion: reduce) {
		.tword, .tword.gold, .diamond, .heart-wrap, .heart-wrap .halo, .side {
			animation: none !important;
			opacity: 1;
		}
		.center, .center.show { opacity: 1; transform: none; }
		.wish, .end-mark, .restart-btn { animation: none; opacity: 1; }
	}
</style>