<script>
	import '../app.css';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onDestroy, onMount, setContext } from 'svelte';
	import { createFlow, FLOW_CONTEXT } from '$lib/flow.svelte.js';

	let {children} = $props();
	const flow = createFlow();
	setContext(FLOW_CONTEXT, flow);

	let navigating = $state(false);
	let previousUserSelect = '';
	let path = $derived(page.url.pathname.replace(/\/+$/, '') || '/');
	let routeIndex = $derived(flow.routes.findIndex((route) => route.path === path));
	let currentRoute = $derived(flow.routes[routeIndex]);
	let previousRoute = $derived(flow.routes[routeIndex - 1]);
	let nextRoute = $derived(flow.routes[routeIndex + 1]);
	let canGoBack = $derived(routeIndex > 1 && !navigating);
	let canGoForward = $derived(Boolean(currentRoute && nextRoute && flow.isComplete(currentRoute.id) && !navigating));

	async function goBack() {
		if (!canGoBack || !previousRoute) return;
		navigating = true;
		try {
			await goto(previousRoute.path);
		} finally {
			navigating = false;
		}
	}

	async function goForward() {
		if (!canGoForward || !nextRoute) return;
		navigating = true;
		try {
			await goto(nextRoute.path, {replaceState: routeIndex === 0});
		} finally {
			navigating = false;
		}
	}

	onMount(() => {
		previousUserSelect = document.body.style.userSelect;
		document.body.style.userSelect = 'none';
	});

	onDestroy(() => {
		if (typeof document !== 'undefined') document.body.style.userSelect = previousUserSelect;
	});
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" />
	<meta name="robots" content="noindex, nofollow" />
	<title>For You</title>
</svelte:head>

{@render children()}

{#if currentRoute}
	<nav class="screen-nav" aria-label="Screen navigation">
		<button
			type="button"
			class="screen-nav-button"
			disabled={!canGoBack}
			onclick={goBack}
			aria-label={previousRoute ? `Previous: ${previousRoute.label}` : 'Previous screen'}
			title={previousRoute ? `Previous: ${previousRoute.label}` : 'Previous screen'}
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
				aria-label={`Next: ${nextRoute.label}`}
				title={`Next: ${nextRoute.label}`}
			>
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<path d="m9 5 7 7-7 7" />
				</svg>
			</button>
		{/if}
	</nav>
{/if}

<style>
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
