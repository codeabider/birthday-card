<script>
	import '../app.css';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { onDestroy, onMount, setContext } from 'svelte';
	import { createFlow, FLOW_CONTEXT, NAVIGATION_CONTEXT } from '$lib/flow.svelte.js';

	let {children} = $props();
	const flow = createFlow();
	setContext(FLOW_CONTEXT, flow);
	setContext(NAVIGATION_CONTEXT, { advance });

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

	const fallerEmojis = ['🎂', '🎁', '🍫', '🍬', '🧁', '🍰', '🍭', '🎉'];
	const fallerConfettiColors = ['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7', '#cc5de8', '#ff922b', '#e64980'];
	let fallerId = 0;
	let fallers = $state([]);
	let fallerTimer = undefined;

	function spawnFaller() {
		const treat = Math.random() < 0.6;
		fallers.push({
			id: ++fallerId,
			kind: treat ? 'treat' : 'confetti',
			x: 3 + Math.random() * 94,
			sway: (Math.random() * 2 - 1) * 10,
			spin: (Math.random() * 2 - 1) * 220,
			dur: 5 + Math.random() * 3.5,
			size: treat ? 18 + Math.random() * 14 : 6 + Math.random() * 6,
			color: treat ? '' : fallerConfettiColors[(Math.random() * fallerConfettiColors.length) | 0],
			shape: treat ? '' : Math.random() < 0.5 ? 'circle' : 'rect',
			emoji: treat ? fallerEmojis[(Math.random() * fallerEmojis.length) | 0] : ''
		});
		if (fallers.length > 40) fallers.splice(0, fallers.length - 40);
	}

	function removeFaller(id) {
		fallers = fallers.filter((f) => f.id !== id);
	}

function scheduleFaller() {
		if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
		fallerTimer = setTimeout(() => {
			if (currentRoute?.id !== 'system') spawnFaller();
			scheduleFaller();
		}, 5000 + Math.random() * 3000);
	}

	$effect(() => {
		if (currentRoute?.id === 'final') flow.markWholeViewed();
	});

	$effect(() => {
		if (currentRoute?.id === 'system') fallers = [];
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

	async function advance() {
		const target = nextRoute;
		if (!target) return;
		navigating = true;
		try {
			await goto(routeUrl(target.path));
		} finally {
			navigating = false;
		}
	}

	onMount(() => {
		window.addEventListener('pointerdown', onPointerDown, true);
		scheduleFaller();
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') window.removeEventListener('pointerdown', onPointerDown, true);
		if (typeof window !== 'undefined') clearTimeout(fallerTimer);
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
	<title>Nemo's special day</title>
</svelte:head>

{@render children()}

{#if fallers.length && currentRoute?.id !== 'system'}
	<div class="faller-layer" aria-hidden="true">
		{#each fallers as f (f.id)}
			{#if f.kind === 'treat'}
				<span
					class="faller treat"
					style="--x:{f.x}vw; --sway:{f.sway}vw; --spin:{f.spin}deg; --dur:{f.dur}s; --size:{f.size}px;"
					onanimationend={() => removeFaller(f.id)}
				>{f.emoji}</span>
			{:else}
				<span
					class="faller confetti {f.shape}"
					style="--x:{f.x}vw; --sway:{f.sway}vw; --spin:{f.spin}deg; --dur:{f.dur}s; --size:{f.size}px; --color:{f.color};"
					onanimationend={() => removeFaller(f.id)}
				></span>
			{/if}
		{/each}
	</div>
{/if}

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
				class="screen-nav-button {nextRoute && canGoForward ? 'wiggle' : ''}"
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
	.faller-layer {
		position: fixed;
		inset: 0;
		z-index: 250;
		pointer-events: none;
		overflow: hidden;
	}

	.faller {
		position: absolute;
		top: 0;
		left: var(--x);
		animation: fall-down var(--dur) linear var(--delay, 0s) forwards;
		will-change: transform, opacity;
	}

	.faller.treat {
		line-height: 1;
		font-size: var(--size);
	}

	.faller.confetti {
		width: var(--size);
		height: var(--size);
		background: var(--color);
		border-radius: 1px;
	}

	.faller.confetti.circle {
		border-radius: 50%;
	}

	@keyframes fall-down {
		0% {
			opacity: 0;
			transform: translate(0, -10vh) rotate(-12deg);
		}
		7%,
		86% {
			opacity: 1;
		}
		100% {
			opacity: 0;
			transform: translate(var(--sway), 110vh) rotate(var(--spin));
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.faller {
			animation: none;
			opacity: 0;
		}
	}

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

	.screen-nav-button.wiggle {
		animation: nav-dance 2.2s ease-in-out infinite;
		box-shadow: 0 0 26px rgba(244, 213, 200, 0.35);
	}

	@keyframes nav-dance {
		0%, 22% {
			transform: rotate(0deg) translateY(0);
		}
		30% {
			transform: rotate(-10deg) translateY(-7px);
		}
		38% {
			transform: rotate(9deg) translateY(-3px) scale(1.06);
		}
		46% {
			transform: rotate(-8deg) translateY(-7px) scale(1.1);
		}
		54% {
			transform: rotate(7deg) translateY(-2px) scale(1.12);
		}
		62% {
			transform: rotate(-6deg) translateY(-5px);
		}
		70% {
			transform: rotate(5deg) translateY(-1px);
		}
		78% {
			transform: rotate(-3deg) translateY(-3px) scale(1.05);
		}
		86% {
			transform: rotate(2deg) translateY(-1px);
		}
		100% {
			transform: rotate(0deg) translateY(0);
		}
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

	@media (prefers-reduced-motion: reduce) {
		.screen-nav-button.wiggle {
			animation: none;
		}
	}
</style>
