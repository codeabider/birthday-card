<script>
	import {page} from '$app/state';
	import {loadCard, cardState} from '$lib/config/card.svelte.js';

	let {children} = $props();

	const slug = $derived(page.params.slug);

	$effect(() => {
		loadCard(slug);
	});
</script>

{#if cardState.status === 'loading' || cardState.status === 'idle'}
	<div class="boot">
		<p class="boot-mark">·</p>
		<p class="boot-text">opening your card…</p>
	</div>
{:else if cardState.status === 'missing'}
	<div class="boot">
		<p class="boot-mark">·</p>
		<p class="boot-text">that card doesn’t exist (yet).</p>
	</div>
{:else}
	{@render children()}
{/if}

<style>
	.boot {
		position: fixed;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.9rem;
		background: #1b1420;
		color: #f6e9dc;
		font-family: var(--font-body);
		text-align: center;
		padding: 2rem;
	}
	.boot-mark {
		margin: 0;
		font-size: 2.4rem;
		color: #e9b6c8;
		animation: pulse 1.6s ease-in-out infinite;
	}
	.boot-text {
		margin: 0;
		font-size: 0.95rem;
		letter-spacing: 0.02em;
		opacity: 0.82;
	}
	@keyframes pulse {
		0%, 100% { opacity: 0.35; transform: scale(0.9); }
		50% { opacity: 1; transform: scale(1.1); }
	}
</style>