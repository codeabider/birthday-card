<script>
	import {onMount} from 'svelte';

	let {phrases, onDone} = $props();

	let currentIndex = $state(0);
	let phraseVisible = $state(false);
	let isFinishing = $state(false);
	let glowBurst = $state(0);
	let total = $state(phrases.length);
	let ambientStars = $state([]);

	onMount(() => {
		ambientStars = Array.from({length: 40}, (_, i) => ({
			x: Math.random() * 100,
			y: Math.random() * 100,
			size: 1 + Math.random() * 2,
			delay: (Math.random() * 5).toFixed(1),
			dur: (3 + Math.random() * 4).toFixed(1),
			opacity: 0.08 + Math.random() * 0.15,
		}));

		setTimeout(() => { phraseVisible = true; }, 300);
	});

	function tapOrb() {
		if (isFinishing) return;

		glowBurst = 60;
		setTimeout(() => { glowBurst = 0; }, 500);

		currentIndex++;

		if (currentIndex >= phrases.length) {
			isFinishing = true;
			phraseVisible = false;
			setTimeout(() => onDone(), 1200);
			return;
		}

		phraseVisible = false;
		setTimeout(() => { phraseVisible = true; }, 400);
	}

	function currentPhrase() {
		const idx = currentIndex;
		return phrases[idx] ?? '';
	}
</script>

<div
	class="jar"
	role="button"
	tabindex="0"
	aria-label={`Light number ${currentIndex + 1} of ${total}`}
	onclick={tapOrb}
	onkeydown={(e) => { if (e.key === 'Enter') tapOrb(); }}
>
	{#each ambientStars as star}
		<span class="star" style="--x:{star.x}%;--y:{star.y}%;width:{star.size}px;height:{star.size}px;--delay:{star.delay}s;--dur:{star.dur}s;opacity:{star.opacity};"></span>
	{/each}

	<div class="orb-container">
		<div class="orb-glow" style="--burst: {glowBurst}%"></div>
		<div class="orb-core"></div>
	</div>

	<p class="phrase {phraseVisible ? 'visible' : ''} {isFinishing ? 'dissolve' : ''}" role="status">{currentPhrase()}</p>

	<div class="progress">
		{#each phrases as _, i}
			<span class="dot {i <= currentIndex ? 'lit' : ''}"></span>
		{/each}
	</div>

	{#if currentIndex === 0 && phraseVisible}
		<p class="hint">tap the light</p>
	{/if}
</div>

<style>
	.jar {
		position: fixed;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2rem;
		background: #0e0b16;
		padding-bottom: max(8vh, env(safe-area-inset-bottom), 40px);
	}

	.star {
		position: absolute;
		top: var(--y);
		left: var(--x);
		border-radius: 50%;
		background: #f4d5c8;
		animation: twinkle var(--dur) ease-in-out infinite var(--delay);
	}

	@keyframes twinkle {
		0%,100% { opacity: var(--opacity); transform: scale(1); }
		50% { opacity: calc(var(--opacity) * 2.5); transform: scale(1.4); }
	}

	.orb-container {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: min(200px, 45vw);
		height: min(200px, 45vw);
	}

	.orb-glow {
		position: absolute;
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(244,200,180,calc(0.3 + var(--burst) * 0.006)) 0%, transparent 70%);
		animation: pulseGlow 4s ease-in-out infinite;
	}

	@keyframes pulseGlow {
		0%,100% { transform: scale(1); opacity: 0.6; }
		50% { transform: scale(1.12); opacity: 0.9; }
	}

	.orb-core {
		position: relative;
		width: min(72px, 18vw);
		height: min(72px, 18vw);
		border-radius: 50%;
		background: radial-gradient(circle at 35% 35%, #ffe8dd 0%, #f4c6b4 40%, #d4a99a 100%);
		box-shadow: 0 0 40px 8px rgba(244,196,180,0.4), 0 0 80px 16px rgba(244,196,180,0.15);
		animation: coreFloat 3s ease-in-out infinite;
	}

	@keyframes coreFloat {
		0%,100% { transform: translateY(0); }
		50% { transform: translateY(-4px); }
	}

	.phrase {
		text-align: center;
		max-width: min(360px, 82vw);
		font-size: 1.15rem;
		line-height: 1.7;
		color: rgba(240,235,227,0.75);
		opacity: 0;
		transform: translateY(8px);
		transition: opacity 0.6s ease, transform 0.6s ease;
	}

	.phrase.visible {
		opacity: 1;
		transform: translateY(0);
	}

	.phrase.dissolve {
		opacity: 0 !important;
		transform: translateY(-8px) scale(0.97) !important;
		transition: opacity 1.2s ease, transform 1.2s ease;
	}

	.progress {
		position: absolute;
		bottom: max(6vh, 30px);
		display: flex;
		gap: 8px;
		align-items: center;
	}

	.dot {
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: rgba(244,213,200,0.15);
		transition: background 0.5s ease, transform 0.5s ease, box-shadow 0.5s ease;
	}

	.dot.lit {
		background: rgba(244,213,200,0.75);
		transform: scale(1.4);
		box-shadow: 0 0 6px rgba(244,213,200,0.4);
	}

	.hint {
		position: absolute;
		bottom: max(12vh, 52px);
		font-size: 0.68rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: rgba(240,235,227,0.2);
		animation: hintPulse 3s ease-in-out infinite;
	}

	@keyframes hintPulse {
		0%,100% { opacity: 0.2; }
		50% { opacity: 0.45; }
	}
</style>
