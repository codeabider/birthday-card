<script>
	import {onDestroy, onMount} from 'svelte';

	let showText = $state(false);
	let particlesVisible = $state(false);
	let {onReady} = $props();
	let particleTimeout;
	let readyTimeout;

	onMount(() => {
		particleTimeout = setTimeout(() => { particlesVisible = true; }, 400);
		readyTimeout = setTimeout(() => {
			showText = true;
			onReady?.();
		}, 1200);
	});

	onDestroy(() => {
		particleTimeout && clearTimeout(particleTimeout);
		readyTimeout && clearTimeout(readyTimeout);
	});

	const particles = Array.from({length: 22}, (_, i) => ({
		x: (i * 41) % 100,
		delay: (i * 0.35).toFixed(1),
		dur: 5 + (i % 7),
		size: 2 + (i % 3) * 0.7,
	}));
</script>

<div class="opening">
	{#each particles as p}
		<span
			class="particle {particlesVisible ? 'visible' : ''}"
			style="--x:{p.x}%;--delay:{p.delay}s;--dur:{p.dur}s;width:{p.size}px;height:{p.size}px;"
		></span>
	{/each}

	<div class="content {showText ? 'show' : ''}">
		<p class="subtitle">hey.</p>
		<p class="body">I made something for you.</p>
	</div>

	<div class="tap-hint {showText ? 'show' : ''}">
		<span class="tap-circle"></span>
		<span class="tap-text">take a moment</span>
	</div>
</div>

<style>
	.opening {
		position: fixed;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		background: radial-gradient(ellipse at 50% 40%, #261838 0%, #0e0b16 75%);
		z-index: 10;
	}

	.particle {
		position: absolute;
		left: var(--x);
		top: 110%;
		background: rgba(255, 218, 197, 0.2);
		border-radius: 50%;
		opacity: 0;
	}

	.particle.visible {
		animation: float var(--dur) ease-in infinite var(--delay);
	}

	@keyframes float {
		0% { transform: translateY(0) scale(1); opacity: 0.45; }
		60% { opacity: 0.25; }
		100% { transform: translateY(-120vh) scale(0.3); opacity: 0; }
	}

	.content {
		text-align: center;
		opacity: 0;
		transform: translateY(14px);
		transition: opacity 1.6s ease, transform 1.6s ease;
	}

	.show {
		opacity: 1;
		transform: translateY(0);
	}

	.subtitle {
		font-family: 'Playfair Display', Georgia, serif;
		font-style: italic;
		font-size: 2rem;
		color: #f4d5c8;
		margin-bottom: 0.5rem;
	}

	.body {
		font-size: 0.95rem;
		color: rgba(240, 235, 227, 0.5);
		letter-spacing: 0.06em;
	}

	.tap-hint {
		position: absolute;
		bottom: max(14vh, 56px);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.7rem;
		opacity: 0;
		transition: opacity 1s ease;
	}

	.tap-circle {
		width: 40px;
		height: 40px;
		border: 1.5px solid rgba(244, 213, 200, 0.18);
		border-radius: 50%;
		animation: breathing 3s ease-in-out infinite;
	}

	@keyframes breathing {
		0%,100% { transform: scale(1); border-color: rgba(244,213,200,0.15); }
		50% { transform: scale(1.18); border-color: rgba(244,213,200,0.35); }
	}

	.tap-text {
		font-size: 0.65rem;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: rgba(240, 235, 227, 0.22);
	}
</style>
