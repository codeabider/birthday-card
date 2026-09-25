<script>
	import '../app.css';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { onDestroy, onMount, setContext } from 'svelte';
	import { createFlow, FLOW_CONTEXT } from '$lib/flow.svelte.js';

	let {children} = $props();
	const flow = createFlow();
	setContext(FLOW_CONTEXT, flow);

	let navigating = $state(false);
	let previousUserSelect = '';
	let path = $derived.by(() => {
		const trailing = page.url.pathname.replace(/\/+$/, '') || '/';
		if (!base || base === '/') return trailing;
		if (trailing === base) return '/';
		if (!trailing.startsWith(base + '/')) return trailing;
		return trailing.slice(base.length) || '/';
	});
	let routeUrl = (r) => (base ? base + r : r);
	let routeIndex = $derived(flow.routes.findIndex((route) => route.path === path));
	let currentRoute = $derived(flow.routes[routeIndex]);
	let previousRoute = $derived(flow.routes[routeIndex - 1]);
	let nextRoute = $derived(flow.routes[routeIndex + 1]);
	let canGoBack = $derived(routeIndex > 1 && !navigating);
	let canGoForward = $derived(Boolean(currentRoute && nextRoute && (flow.wholeViewed || flow.isComplete(currentRoute.id)) && !navigating));

	const confettiColors = ['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7', '#cc5de8', '#ff922b', '#e64980'];
	let burstId = 0;
	let particles = $state([]);

	function burstConfetti(clientX, clientY) {
		const next = [];
		for (let i = 0; i < 56; i++) {
			const angle = (Math.PI * 2 * i) / 56 + (Math.random() - 0.5) * 0.4;
			const speed = 70 + Math.random() * 220;
			next.push({
				id: ++burstId,
				x: clientX,
				y: clientY,
				dx: Math.cos(angle) * speed,
				dy: Math.sin(angle) * speed - 30,
				rot: (Math.random() * 2 - 1) * 540,
				dur: 600 + Math.random() * 450,
				delay: Math.random() * 90,
				size: 5 + Math.random() * 6,
				color: confettiColors[(Math.random() * confettiColors.length) | 0],
				shape: Math.random() < 0.45 ? 'circle' : 'rect'
			});
		}
		particles.push(...next);
		if (particles.length > 480) particles.splice(0, particles.length - 480);
	}

	function removeParticle(id) {
		particles = particles.filter((p) => p.id !== id);
	}

	function onPointerDown(event) {
		if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
		burstConfetti(event.clientX, event.clientY);
	}

	$effect(() => {
		if (currentRoute?.id === 'final') flow.markWholeViewed();
	});

	async function goBack() {
		if (!canGoBack || !previousRoute) return;
		navigating = true;
		try {
			await goto(routeUrl(previousRoute.path));
		} finally {
			navigating = false;
		}
	}

	async function goForward() {
		if (!canGoForward || !nextRoute) return;
		navigating = true;
		try {
			await goto(routeUrl(nextRoute.path), {replaceState: routeIndex === 0});
		} finally {
			navigating = false;
		}
	}

	onMount(() => {
		window.addEventListener('pointerdown', onPointerDown, true);
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') window.removeEventListener('pointerdown', onPointerDown, true);
	});

	onMount(() => {
		flow.hydrate();
		if (routeIndex !== 0) goto(routeUrl('/'), {replaceState: true});
		previousUserSelect = document.body.style.userSelect;
		document.body.style.userSelect = 'none';
	});

	onDestroy(() => {
		if (typeof document !== 'undefined') document.body.style.userSelect = previousUserSelect;
	});
</script>

<svelte:head>
	<meta name="robots" content="noindex, nofollow" />
	<title>For You</title>
</svelte:head>

{@render children()}

{#if particles.length}
	<div class="confetti-layer" aria-hidden="true">
		{#each particles as p (p.id)}
			<span
				class="confetti-piece {p.shape}"
				style="--x:{p.x}px; --y:{p.y}px; --dx:{p.dx}px; --dy:{p.dy}px; --rot:{p.rot}deg; --dur:{p.dur}ms; --delay:{p.delay}ms; --size:{p.size}px; --color:{p.color};"
				onanimationend={() => removeParticle(p.id)}
			></span>
		{/each}
	</div>
{/if}

{#if currentRoute}
	<nav class="screen-nav" aria-label="Screen navigation">
		<button
			type="button"
			class="screen-nav-button"
			disabled={!canGoBack}
			onclick={goBack}
			aria-label={canGoBack && previousRoute ? `Previous: ${previousRoute.label}` : 'Previous unavailable'}
			title={canGoBack && previousRoute ? `Previous: ${previousRoute.label}` : 'Previous unavailable'}
		>
			<svg viewBox="0 0 24 24" aria-hidden="true">
				<path d="M15 5 8 12l7 7" />
			</svg>
		</button>

		{#if nextRoute}
			<button
				type="button"
				class="screen-nav-button"
				disabled={!canGoForward}
				onclick={goForward}
				aria-label={canGoForward ? `Next: ${nextRoute.label}` : `Complete ${currentRoute.label} to continue`}
				title={canGoForward ? `Next: ${nextRoute.label}` : `Complete ${currentRoute.label} to continue`}
			>
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<path d="m9 5 7 7-7 7" />
				</svg>
			</button>
		{/if}
	</nav>
{/if}

<style>
	.confetti-layer {
		position: fixed;
		inset: 0;
		z-index: 400;
		pointer-events: none;
		overflow: hidden;
	}

	.confetti-piece {
		position: absolute;
		left: var(--x);
		top: var(--y);
		width: var(--size);
		height: var(--size);
		background: var(--color);
		animation: confetti-burst var(--dur) cubic-bezier(0.16, 0.6, 0.32, 0.94) var(--delay) forwards;
		will-change: transform, opacity;
	}

	.confetti-piece.circle {
		border-radius: 50%;
	}

	.confetti-piece.rect {
		border-radius: 1px;
	}

	@keyframes confetti-burst {
		0% {
			opacity: 1;
			transform: translate(-50%, -50%) rotate(0deg);
		}
		100% {
			opacity: 0;
			transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) rotate(var(--rot));
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.confetti-piece {
			animation: none;
			opacity: 0;
		}
	}

	.screen-nav {
		position: fixed;
		right: max(18px, env(safe-area-inset-right));
		bottom: max(18px, env(safe-area-inset-bottom));
		z-index: 300;
		display: flex;
		gap: 0.65rem;
	}

	.screen-nav-button {
		display: grid;
		width: 48px;
		height: 48px;
		place-items: center;
		padding: 0;
		border: 1px solid rgba(244,213,200,0.28);
		border-radius: 50%;
		background: rgba(10,8,18,0.68);
		box-shadow: 0 0 24px rgba(244,213,200,0.1);
		backdrop-filter: blur(10px);
		color: #f4d5c8;
		transition: opacity 0.25s ease, transform 0.25s ease, border-color 0.25s ease, background 0.25s ease;
		touch-action: manipulation;
	}

	.screen-nav-button svg {
		width: 21px;
		height: 21px;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.8;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.screen-nav-button:hover:not(:disabled),
	.screen-nav-button:focus-visible:not(:disabled) {
		transform: translateY(-2px);
		border-color: rgba(244,213,200,0.55);
		background: rgba(28,20,38,0.88);
	}

	.screen-nav-button:disabled {
		opacity: 0.24;
		cursor: not-allowed;
	}
</style>
