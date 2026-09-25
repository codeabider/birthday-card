<script>
	import {onDestroy, onMount} from 'svelte';

	let {onReady} = $props();

	let phase = $state(0);
	let linesVisible = $state(false);
	let heartVisible = $state(false);
	let canContinue = $state(false);
	let stars = $state([]);
	let sparkles = $state([]);
	let timers = [];

	onMount(() => {
		stars = Array.from({length: 80}, (_, i) => ({
			x: Math.random() * 100,
			y: Math.random() * 100,
			size: 1.5 + Math.random() * 3,
			delay: (Math.random() * 2).toFixed(2),
			dur: (4 + Math.random() * 6).toFixed(2),
		}));

		sparkles = Array.from({length: 30}, (_, i) => ({
			x: Math.random() * 100,
			delay: (1.5 + Math.random() * 4).toFixed(2),
			dur: (6 + Math.random() * 8).toFixed(2),
			size: 3 + Math.random() * 4,
		}));

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

	const wishLines = [
		'today is about you',
		'and all the light you carry',
		'into another year',
	];
</script>

<div class="reveal">
	<svg class="warmth {phase >= 1 ? 'show' : ''}" viewBox="0 0 200 200" aria-hidden="true">
		<circle cx="100" cy="100" r={40 + phase * 15} fill="none" stroke="rgba(244,200,180,0.15)" stroke-width="0.5"></circle>
		<circle cx="100" cy="100" r={70 + phase * 20} fill="none" stroke="rgba(244,200,180,0.08)" stroke-width="0.3"></circle>
	</svg>

	<div class="orb {phase >= 2 ? 'big' : ''}"></div>

	{#each stars as star}
		<span class="star" style="--x:{star.x}%;--y:{star.y}%;width:{star.size}px;height:{star.size}px;--delay:{star.delay}s;--dur:{star.dur}s;"></span>
	{/each}

	{#each sparkles as sp}
		<span class="sparkle" style="--x:{sp.x}%;width:{sp.size}px;--delay:{sp.delay}s;--dur:{sp.dur}s;"></span>
	{/each}

	<div class="text-wrap">
		<h1 class="title {phase >= 1 ? 'show' : ''}">happy<br/>birthday.</h1>

		{#if linesVisible}
			<div class="wishes">
				{#each wishLines as line, i}
					<p class="wish" style="--d:{0.4 * i}s;">{line}</p>
				{/each}
  			</div>
		{/if}

		{#if heartVisible}
			<div class="heart-wrap" aria-hidden="true">
				<svg width="28" height="26" viewBox="0 0 28 26" fill="none">
					<path d="M14 24.5C14 24.5 2 16.5 2 9.5C2 5.5 5 3 8.5 3C10.8 3 13 4.5 14 6.5C15 4.5 17.2 3 19.5 3C23 3 26 5.5 26 9.5C26 16.5 14 24.5 14 24.5Z" fill="rgba(244,200,180,0.4)" />
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

	.warmth {
		position: absolute;
		width: min(420px, 90vw);
		height: min(420px, 90vw);
		top: 50%;
		left: 50%;
		transform: translate(-50%, -55%);
		opacity: 0;
		transition: opacity 1.8s ease;
	}

	.warmth.show {
		opacity: 1;
	}

	.orb {
		position: absolute;
		top: 38%;
		width: min(56px, 14vw);
		height: min(56px, 14vw);
		border-radius: 50%;
		background: radial-gradient(circle at 32% 32%, #ffe8dd 0%, #f4c9b7 50%, #d8aead 100%);
		box-shadow: 0 0 40px 12px rgba(244,200,180,0.3), 0 0 100px 24px rgba(244,200,180,0.1);
		transition: transform 1.5s ease, box-shadow 1.5s ease;
	}

	.orb.big {
		transform: scale(1.6);
		box-shadow: 0 0 60px 20px rgba(244,200,180,0.45), 0 0 120px 40px rgba(244,200,180,0.18);
	}

	.star {
		position: absolute;
		border-radius: 50%;
		background: #f4d5c8;
		animation: twinkle var(--dur) ease-in-out infinite var(--delay);
		opacity: 0.12;
	}

	@keyframes twinkle {
		0%,100% { transform: scale(1); }
		50% { transform: scale(1.8); opacity: 0.3; }
	}

	.sparkle {
		position: absolute;
		left: var(--x);
		width: var(--size);
		height: calc(var(--size) / 2);
		background: rgba(255,228,210,0.35);
		border-radius: 50%;
		animation: driftDown var(--dur) ease-out forwards calc(var(--delay) + 2s);
		opacity: 0;
	}

	@keyframes driftDown {
		0% { transform: translateY(0); opacity: 0; }
		15% { opacity: 0.6; }
		70% { opacity: 0.3; }
		100% { transform: translateY(110vh); opacity: 0; }
	}

	.text-wrap {
		position: relative;
		z-index: 2;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.4rem;
		margin-top: -4vh;
		padding-bottom: max(8vh, env(safe-area-inset-bottom), 40px);
	}

	.title {
		font-size: clamp(2.4rem, 9vw, 3.6rem);
		color: #f4d5c8;
		line-height: 1.25;
		opacity: 0;
		transform: translateY(14px) scale(0.97);
		transition: opacity 1.6s ease, transform 1.6s ease;
	}

	.title.show {
		opacity: 1;
		transform: translateY(0) scale(1);
	}

	.wishes {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		align-items: center;
	}

	.wish {
		font-size: clamp(0.95rem, 3.6vw, 1.15rem);
		color: rgba(240,235,227,0.6);
		line-height: 1.6;
		opacity: 0;
		transform: translateY(8px);
		animation: wishAppear 0.9s ease forwards var(--d);
	}

	@keyframes wishAppear {
		to { opacity: 1; transform: translateY(0); }
	}

	.heart-wrap {
		opacity: 0;
		transform: translateY(6px);
		transition: opacity 1s ease, transform 1s ease;
		animation: heartPulse 2.5s ease-in-out infinite 0.4s;
	}

	@keyframes heartPulse {
		0%,100% { transform: scale(1); }
		50% { transform: scale(1.12); }
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
