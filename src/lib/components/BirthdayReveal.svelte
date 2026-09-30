<script>
	import {onDestroy, onMount} from 'svelte';
	import CinematicSky from '$lib/components/CinematicSky.svelte';
	import {persona} from '$lib/persona.svelte.js';
	import {card, fill} from '$lib/config/card.svelte.js';

	let {onReady} = $props();

	let phase = $state(0);
	let linesVisible = $state(false);
	let heartVisible = $state(false);
	let canContinue = $state(false);
	let timers = [];

	onMount(() => {
		timers = [
			setTimeout(() => { phase = 1; }, 600),
			setTimeout(() => { phase = 2; linesVisible = true; }, 1800),
			setTimeout(() => { phase = 3; heartVisible = true; }, 3500),
			setTimeout(() => { canContinue = true; onReady?.(); }, 4800),
		];
	});

	onDestroy(() => {
		timers.forEach(clearTimeout);
	});

	const titleWords = [
		{ text: 'Happy', gold: false },
		{ text: 'Birthday,', gold: false },
		{ text: persona.display, gold: true },
	];

	const wishLines = $derived(card.settings.greet.wishLines.map(fill));
</script>

<div class="reveal">
	<CinematicSky />

	<div class="text-wrap">
		<h1 class="title {phase >= 1 ? 'show' : ''}">
			{#each titleWords as w, i}
				<span class="tword {w.gold ? 'gold' : ''}" style="--d:{0.5 + 0.5 * i}s;">{w.text}</span>
			{/each}
		</h1>

		{#if linesVisible}
			<div class="festoon" aria-hidden="true">
				<span class="rule"></span>
				<span class="diamond">✦</span>
				<span class="rule"></span>
			</div>

			<div class="wishes">
				{#each wishLines as line, i}
					<p class="wish" style="--d:{0.45 * i}s;">{line}</p>
				{/each}
			</div>
		{/if}

		{#if heartVisible}
			<div class="heart-wrap show" aria-hidden="true">
				<span class="halo"></span>
				<svg width="30" height="28" viewBox="0 0 28 26" fill="none">
					<path d="M14 24.5C14 24.5 2 16.5 2 9.5C2 5.5 5 3 8.5 3C10.8 3 13 4.5 14 6.5C15 4.5 17.2 3 19.5 3C23 3 26 5.5 26 9.5C26 16.5 14 24.5 14 24.5Z" fill="rgba(244,200,180,0.45)" />
				</svg>
			</div>
		{/if}

		{#if canContinue}
			<div class="continue-hint">ready for the next moment ◌</div>
		{/if}
	</div>
</div>

<style>
	.reveal {
		position: fixed;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: radial-gradient(ellipse at 50% 35%, #261838 0%, #0e0b16 80%);
		overflow: hidden;
	}

	.text-wrap {
		position: relative;
		z-index: 2;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.6rem;
		margin-top: clamp(56px, 16vh, 200px);
		min-height: clamp(430px, 62vh, 620px);
		padding-bottom: max(8vh, env(safe-area-inset-bottom), 40px);
	}

	.text-wrap::before {
		content: '';
		position: absolute;
		inset: -12% -12%;
		z-index: -1;
		border-radius: 50%;
		background: radial-gradient(ellipse at center, rgba(10, 8, 16, 0.62), transparent 70%);
		filter: blur(30px);
	}

	.title {
		display: inline-block;
		font-size: clamp(2.4rem, 9vw, 3.6rem);
		line-height: 1.3;
		opacity: 0;
		transition: opacity 2s ease-out;
	}

	.title.show {
		opacity: 1;
	}

	.tword {
		display: inline-block;
		margin-right: 0.32em;
		color: #ffead9;
		text-shadow: 0 2px 22px rgba(8, 6, 14, 0.7);
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
		width: clamp(40px, 14vw, 90px);
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
		color: rgba(250, 234, 222, 0.85);
		text-shadow: 0 1px 16px rgba(8, 6, 14, 0.55);
		line-height: 1.7;
		opacity: 0;
		transform: translateY(10px);
		animation: wishAppear 1.2s ease forwards var(--d);
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
		animation: haloPulse 2.6s ease-in-out infinite;
	}

	@keyframes heartPulse {
		0%,100% { transform: scale(1); }
		50% { transform: scale(1.1); }
	}

	@keyframes haloPulse {
		0%,100% { opacity: 0.4; }
		50% { opacity: 0.9; }
	}

	.heart-wrap > svg {
		position: relative;
		z-index: 1;
	}

	.continue-hint {
		margin-top: 2rem;
		font-size: 0.6rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: rgba(240,235,227,0.18);
		animation: hintPulse 3s ease-in-out infinite;
	}

	@keyframes hintPulse {
		0%,100% { opacity: 0.18; }
		50% { opacity: 0.4; }
	}
</style>