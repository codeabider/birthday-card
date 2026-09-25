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
		stars = Array.from({length: 80}, () => ({
			x: Math.random() * 100,
			y: Math.random() * 100,
			size: 1.5 + Math.random() * 3,
			delay: (Math.random() * 2).toFixed(2),
			dur: (4 + Math.random() * 6).toFixed(2),
		}));

		sparkles = Array.from({length: 30}, () => ({
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

	const titleWords = [
		{ text: 'happy', gold: false },
		{ text: 'birthday.', gold: true },
	];

	const wishLines = [
		'today is about you',
		'and all the light you carry',
		'into another year',
	];
</script>

<div class="reveal">
	<span class="aurora au1"></span>
	<span class="aurora au2"></span>

	<svg class="warmth {phase >= 1 ? 'show' : ''}" viewBox="0 0 200 200" aria-hidden="true">
		<circle cx="100" cy="100" r={40 + phase * 15} fill="none" stroke="rgba(244,200,180,0.15)" stroke-width="0.5"></circle>
		<circle cx="100" cy="100" r={70 + phase * 20} fill="none" stroke="rgba(244,200,180,0.08)" stroke-width="0.3"></circle>
	</svg>

	<div class="orb-wrap">
		<span class="orb {phase >= 2 ? 'big' : ''}"></span>
		<svg class="ring" viewBox="0 0 200 200" aria-hidden="true">
			<circle class="ring-a" cx="100" cy="100" r="62" fill="none" stroke="rgba(244,213,200,0.22)" stroke-width="0.8" stroke-dasharray="1.5 7"></circle>
			<circle class="ring-b" cx="100" cy="100" r="80" fill="none" stroke="rgba(180,140,220,0.14)" stroke-width="1" stroke-dasharray="14 18"></circle>
		</svg>
	</div>

	{#each stars as star}
		<span class="star" style="--x:{star.x}%;--y:{star.y}%;width:{star.size}px;height:{star.size}px;--delay:{star.delay}s;--dur:{star.dur}s;"></span>
	{/each}

	{#each sparkles as sp}
		<span class="sparkle" style="--x:{sp.x}%;width:{sp.size}px;--delay:{sp.delay}s;--dur:{sp.dur}s;"></span>
	{/each}

	<span class="shoot shoot-1" aria-hidden="true"></span>
	<span class="shoot shoot-2" aria-hidden="true"></span>

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

	.aurora {
		position: absolute;
		border-radius: 50%;
		filter: blur(70px);
		pointer-events: none;
	}

	.au1 {
		width: 62vmin;
		height: 62vmin;
		top: -18vmin;
		left: -12vmin;
		background: radial-gradient(circle, rgba(244,200,180,0.16) 0%, transparent 62%);
		animation: au1 11s ease-in-out infinite alternate;
	}

	.au2 {
		width: 70vmin;
		height: 70vmin;
		bottom: -22vmin;
		right: -16vmin;
		background: radial-gradient(circle, rgba(150,110,210,0.14) 0%, transparent 62%);
		animation: au2 14s ease-in-out infinite alternate;
	}

	@keyframes au1 {
		0%, 100% { transform: translate(0, 0) scale(1); }
		50% { transform: translate(9vmin, 5vmin) scale(1.15); }
	}

	@keyframes au2 {
		0%, 100% { transform: translate(0, 0) scale(1.1); }
		50% { transform: translate(-10vmin, -6vmin) scale(0.95); }
	}

	.warmth {
		position: absolute;
		width: min(480px, 92vw);
		height: min(480px, 92vw);
		top: 50%;
		left: 50%;
		transform: translate(-50%, -58%);
		opacity: 0;
		transition: opacity 2s ease;
	}

	.warmth.show {
		opacity: 1;
	}

	.orb-wrap {
		position: absolute;
		top: 24%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: min(150px, 36vw);
		height: min(150px, 36vw);
		pointer-events: none;
	}

	.orb {
		position: absolute;
		top: 50%;
		left: 50%;
		width: min(56px, 14vw);
		height: min(56px, 14vw);
		border-radius: 50%;
		transform: translate(-50%, -50%);
		background: radial-gradient(circle at 32% 32%, #ffe8dd 0%, #f4c9b7 50%, #d8aead 100%);
		box-shadow: 0 0 34px 8px rgba(244,200,180,0.22), 0 0 90px 18px rgba(244,200,180,0.08);
		transition: transform 2s ease, box-shadow 2s ease;
	}

	.orb.big {
		transform: translate(-50%, -50%) scale(1.55);
		box-shadow: 0 0 50px 16px rgba(244,200,180,0.34), 0 0 110px 32px rgba(244,200,180,0.14);
	}

	.ring {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		opacity: 0;
		transform: rotate(-18deg);
		animation: ringFade 2.4s ease forwards 0.6s;
	}

	@keyframes ringFade {
		to { opacity: 1; }
	}

	.ring-a,
	.ring-b {
		transform-origin: 100px 100px;
	}

	.ring-a {
		animation: spinCw 24s linear infinite;
	}

	.ring-b {
		animation: spinCcw 32s linear infinite;
	}

	@keyframes spinCw {
		to { transform: rotate(360deg); }
	}

	@keyframes spinCcw {
		to { transform: rotate(-360deg); }
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

	.shoot {
		position: absolute;
		width: 130px;
		height: 1.5px;
		border-radius: 2px;
		background: linear-gradient(90deg, rgba(255,255,255,0.75), transparent);
		opacity: 0;
		pointer-events: none;
	}

	.shoot-1 {
		top: 16%;
		left: 68%;
		transform: rotate(-38deg);
		animation: shootFly 7s ease-in-out infinite 2.5s;
	}

	.shoot-2 {
		top: 58%;
		left: 14%;
		transform: rotate(-42deg);
		animation: shootFly 9s ease-in-out infinite 6s;
	}

	@keyframes shootFly {
		0% { opacity: 0; transform: translate(0, 0) rotate(-38deg); }
		3% { opacity: 0.8; }
		10% { opacity: 0; transform: translate(-42vw, 32vh) rotate(-38deg); }
		100% { opacity: 0; transform: translate(-42vw, 32vh) rotate(-38deg); }
	}

	.shoot-2 {
		animation-name: shootFly2;
	}

	@keyframes shootFly2 {
		0% { opacity: 0; transform: translate(0, 0) rotate(-42deg); }
		3% { opacity: 0.7; }
		10% { opacity: 0; transform: translate(-40vw, 30vh) rotate(-42deg); }
		100% { opacity: 0; transform: translate(-40vw, 30vh) rotate(-42deg); }
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