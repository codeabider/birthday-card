<script>
	import {onDestroy, onMount, tick, untrack} from 'svelte';

	let {planets, moon, sun, onProgress, initialExploredIds = []} = $props();
	const initialIds = untrack(() => initialExploredIds);
	const initialPlanets = untrack(() => planets);
	const initialMoon = untrack(() => moon);
	const initialSun = untrack(() => sun);
	const stars = Array.from({length: 120}, (_, i) => ({
		x: (i * 73) % 100,
		y: (i * 37) % 100,
		duration: 4 + (i % 9),
		delay: (i % 12) * 0.5,
		opacity: 0.05 + (i % 4) * 0.04,
	}));

	let scale = $state(1);
	let selectedBody = $state(null);
	let showingCard = $state(false);
	let containerRef = $state(null);
	let cardOverlayRef = $state(null);
	let prefersReducedMotion = $state(false);
	let exploredIds = $state(new Set(initialIds));
	let mediaQuery;
	let cardTimers = [];
	const bodyIds = new Set([...initialPlanets.map((planet) => planet.id), initialSun.id, initialMoon.id]);

	function handleMotionPreference(event) {
		prefersReducedMotion = event.matches;
	}

	function clearCardTimers() {
		cardTimers.forEach(clearTimeout);
		cardTimers = [];
	}

	onMount(async () => {
		mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		prefersReducedMotion = mediaQuery.matches;
		mediaQuery.addEventListener('change', handleMotionPreference);

		onProgress?.(exploredIds);

		await tick();

		const viewW = window.innerWidth;
		const viewH = window.innerHeight;
		const shortest = Math.min(viewW, viewH);
		const orbitMax = 339;
		const fitScale = (shortest / 2 - 8) / orbitMax;
		scale = Math.min(fitScale, 1.35);
	});

	onDestroy(() => {
		mediaQuery?.removeEventListener('change', handleMotionPreference);
		clearCardTimers();
	});

	function handleTap(body) {
		if (!body || selectedBody === body.id) return;
		clearCardTimers();
		selectedBody = body;
		if (bodyIds.has(body.id)) {
			exploredIds = new Set([...exploredIds, body.id]);
			onProgress?.(exploredIds);
		}
		showingCard = false;
		cardTimers.push(setTimeout(async () => {
			showingCard = true;
			await tick();
			cardOverlayRef?.focus();
		}, 500));
	}

	function dismiss() {
		if (selectedBody === null) return;
		clearCardTimers();
		const selectedId = selectedBody.id;
		showingCard = false;
		cardTimers.push(setTimeout(() => {
			if (selectedBody?.id === selectedId) selectedBody = null;
		}, 400));
	}
</script>

<div class="system" bind:this={containerRef}>
	<!-- Background stars -->
	{#each stars as star}
		<span class="bg-star" style="--sx:{star.x}vw;--sy:{star.y}vh;--sdur:{star.duration}s;--sdel:{star.delay}s;--sop:{star.opacity};"></span>
	{/each}

	<!-- Orbit system, scaled -->
	<div class="orbit-system" style="transform: scale({scale});">

		<!-- Sun at center -->
		<button
			class="sun-body"
			aria-label={`Sun. ${sun.text}`}
			onclick={() => handleTap(sun)}
			style="width:{sun.size}px;height:{sun.size}px;"
		>
			<div class="sun-core"></div>
			<div class="sun-corona"></div>
		</button>

		<!-- Planets -->
		{#each planets as planet}
			<div
				class="orbit-body"
				style="--radius:{planet.orbitRadius}px;--speed:{planet.orbitSpeed}s;"
				role="presentation"
			>
				<button
					class="planet-body"
					aria-label={`${planet.name}. ${planet.text}`}
					onclick={() => handleTap(planet)}
					style="width:{planet.size}px;height:{planet.size}px;"
				>
					<span class="planet-surface" style="--col:{planet.color};--glow:{planet.glowColor};"></span>
					{#if planet.rings}
						<span class="planet-ring"></span>
					{/if}
				</button>

				<!-- Moon orbits Earth -->
				{#if planet.id === 'earth'}
					<div class="moon-orbit" style="--speed:12s;">
						<button
							class="moon-body"
							aria-label={`Moon. ${moon.text}`}
							onclick={() => handleTap(moon)}
							style="width:{moon.size}px;height:{moon.size}px;"
						>
							<span class="planet-surface" style="--col:{moon.color};--glow:{moon.glowColor};"></span>
						</button>
					</div>
				{/if}
			</div>
		{/each}
	</div>

	<!-- Hint text -->
	<p class="hint" class:hide={selectedBody !== null}>
		{exploredIds.size === 0
			? 'See what they say about you...'
			: exploredIds.size < 4
				? 'tap a few more to continue...'
				: 'the system is awake!'}
	</p>

	<!-- Planet detail card overlay -->
	<button
		bind:this={cardOverlayRef}
		class="card-overlay"
		class:open={showingCard}
		disabled={!showingCard}
		aria-hidden={!showingCard}
		onkeydown={(e) => { if (e.key === 'Escape') dismiss(); }}
		aria-label={selectedBody ? `Close ${selectedBody.name} details` : 'Close details'}
		onclick={dismiss}
	>
		<span class="card-inner" role="status">
			{#if selectedBody}
				<div class="card-orb" style="--col:{selectedBody.color};--glow:{selectedBody.glowColor};width:{selectedBody.size * 1.6}px;height:{selectedBody.size * 1.6}px;">
					{#if selectedBody.id === 'sun'}
						<div class="sun-core small"></div>
					{/if}
				</div>

				<h2 class="card-title">{selectedBody.name}</h2>
				<p class="card-text">{selectedBody.text}</p>
			{/if}

			<span class="card-dismiss">tap anywhere to continue ◌</span>
		</span>
	</button>
</div>

<style>
	.system {
		position: fixed;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #0a0812;
		overflow: hidden;
	}

	.bg-star {
		position: absolute;
		left: var(--sx);
		top: var(--sy);
		width: 1.5px;
		height: 1.5px;
		background: #f4d5c8;
		border-radius: 50%;
		opacity: var(--sop);
		animation: starTwinkle var(--sdur) ease-in-out infinite var(--sdel);
	}

	@keyframes starTwinkle {
		0%,100% { opacity: var(--sop); transform: scale(1); }
		50% { opacity: calc(var(--sop) * 3); transform: scale(1.5); }
	}

	.orbit-system {
		position: relative;
		width: 720px;
		height: 720px;
		transform-origin: center center;
	}

	/* Sun at center */
	.sun-body {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 80px;
		height: 80px;
		border-radius: 50%;
		z-index: 10;
		padding: 0;
	}

	.sun-core {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background: radial-gradient(circle at 35% 35%, #ffe8b4 0%, #f5c97a 30%, #e0a040 70%, #c48020 100%);
		box-shadow: 0 0 30px 6px rgba(245,201,122,0.5), 0 0 60px 20px rgba(245,201,122,0.2);
	}

	.sun-corona {
		position: absolute;
		top: -30%;
		left: -30%;
		width: 160%;
		height: 160%;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(245,201,122,0.18) 0%, transparent 70%);
		animation: coronaPulse 3s ease-in-out infinite;
	}

	@keyframes coronaPulse {
		0%,100% { transform: scale(1); opacity: 0.5; }
		50% { transform: scale(1.12); opacity: 0.8; }
	}

	/* Orbit spinner containers */
	.orbit-body {
		position: absolute;
		top: 50%;
		left: 50%;
		width: calc(var(--radius) * 2);
		height: calc(var(--radius) * 2);
		margin-top: calc(var(--radius) * -1);
		margin-left: calc(var(--radius) * -1);
		border-radius: 50%;
		animation: orbitSpin var(--speed) linear infinite;
		pointer-events: none;
	}

	@keyframes orbitSpin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	/* Planet positioned at top of orbit ring */
	.planet-body {
		position: absolute;
		top: 0;
		left: 50%;
		transform: translate(-50%, -50%);
		border-radius: 50%;
		z-index: 5;
		padding: 0;
		pointer-events: auto;
		touch-action: manipulation;
	}

	.planet-surface {
		display: block;
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background: radial-gradient(circle at 32% 32%, #fff6 0%, var(--col) 40%, color-mix(in srgb, var(--col) 70%, #000) 100%);
		box-shadow: 0 0 16px 4px var(--glow);
	}

	/* Saturn's rings */
	.planet-ring {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 160%;
		height: 30%;
		margin-top: -15%;
		margin-left: -80%;
		border-radius: 50%;
		border: 2px solid rgba(232,212,170,0.4);
		transform: rotate(-20deg);
	}

	/* Moon orbit around Earth */
	.moon-orbit {
		position: absolute;
		top: 0;
		left: 50%;
		width: 50px;
		height: 50px;
		margin-top: -25px;
		margin-left: -25px;
		animation: orbitSpin var(--speed) linear infinite;
	}

	.moon-body {
		position: absolute;
		top: 10%;
		left: 50%;
		transform: translateX(-50%);
		border-radius: 50%;
		z-index: 6;
		padding: 0;
		pointer-events: auto;
		touch-action: manipulation;
	}

	/* Hint */
	.hint {
		position: absolute;
		top: max(calc(env(safe-area-inset-top) + 12px), 28px);
		left: 50%;
		z-index: 20;
		transform: translateX(-50%);
		padding: 0.75rem 1.1rem;
		border: 1px solid rgba(240,235,227,0.24);
		border-radius: 999px;
		background: rgba(10,8,18,0.72);
		box-shadow: 0 0 24px rgba(244,213,200,0.1);
		backdrop-filter: blur(8px);
		font-size: 0.78rem;
		font-weight: 400;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		white-space: nowrap;
		color: rgba(244,213,200,0.92);
		animation: hintPulse 3s ease-in-out infinite;
		transition: opacity 0.6s ease;
		pointer-events: none;
	}

	.hint.hide {
		opacity: 0;
		animation: none;
	}

	/* Card overlay */
	.card-overlay {
		position: fixed;
		inset: 0;
		background: rgba(10,8,18,0);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
		transition: background 0.5s ease;
		pointer-events: none;
	}

	.card-overlay.open {
		background: rgba(10,8,18,0.92);
		pointer-events: auto;
	}

	.card-inner {
		text-align: center;
		max-width: min(360px, 85vw);
		transform: scale(0.9) translateY(12px);
		opacity: 0;
		transition: transform 0.5s ease, opacity 0.5s ease;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		padding-bottom: max(6vh, env(safe-area-inset-bottom), 30px);
	}

	.card-overlay.open .card-inner {
		transform: scale(1) translateY(0);
		opacity: 1;
	}

	.card-orb {
		border-radius: 50%;
		background: radial-gradient(circle at 32% 32%, #fff6 0%, var(--col) 40%, color-mix(in srgb, var(--col) 60%, #111) 100%);
		box-shadow: 0 0 40px 12px var(--glow), 0 0 80px 24px var(--glow);
		transition: transform 0.5s ease;
	}

	.sun-core.small {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background: radial-gradient(circle at 35% 35%, #ffe8b4, #f5c97a 35%, #e0a040 65%, #c48020);
	}

	.card-title {
		font-size: 1.8rem;
		color: #f4d5c8;
		text-transform: capitalize;
	}

	.card-text {
		font-size: 1.05rem;
		line-height: 1.7;
		color: rgba(240,235,227,0.6);
	}

	.card-dismiss {
		margin-top: 1.5rem;
		font-size: 0.72rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: rgba(244,213,200,0.78);
		text-shadow: 0 0 12px rgba(244,213,200,0.25);
	}

	@keyframes hintPulse {
		0%,100% { opacity: 0.72; }
		50% { opacity: 1; }
	}

	@media (prefers-reduced-motion: reduce) {
		.orbit-body, .moon-orbit { animation: none !important; }
		.bg-star { animation: none !important; opacity: 0.15 !important; }
		.sun-corona { animation: none !important; }
	}
</style>
