<script>
	import { onDestroy, onMount } from 'svelte';
	import {
		playBirthdayTune,
		stopBirthdayTune,
		setBirthdayMuted,
		getBirthdayMuted,
		isBirthdayTuneActive
	} from '../birthdayTune.js';

	let muted = $state(getBirthdayMuted());
	let resumeHandler = () => playBirthdayTune();

	function toggle() {
		muted = !muted;
		setBirthdayMuted(muted);
		if (!muted) playBirthdayTune();
	}

	onMount(() => {
		if (typeof window === 'undefined') return;
		playBirthdayTune();
		window.addEventListener('pointerdown', resumeHandler);
		window.addEventListener('keydown', resumeHandler);
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('pointerdown', resumeHandler);
			window.removeEventListener('keydown', resumeHandler);
		}
		stopBirthdayTune();
	});
</script>

<button
	class="music-toggle"
	type="button"
	aria-label={muted ? 'Play the birthday tune' : 'Mute the birthday tune'}
	title={muted ? 'Play tune' : 'Mute tune'}
	onclick={toggle}
>
	{#if muted}
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path d="M11 5 6 9H2v6h4l5 4zM22 9l-6 6M16 9l6 6" />
		</svg>
	{:else}
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path d="M9 18V5l12-2v13" />
			<circle cx="6" cy="18" r="3" />
			<circle cx="18" cy="16" r="3" />
		</svg>
	{/if}
	<span class="sr-hint">♪ happy birthday</span>
</button>

<style>
	.music-toggle {
		position: fixed;
		left: max(18px, env(safe-area-inset-left));
		bottom: max(18px, env(safe-area-inset-bottom));
		z-index: 300;
		display: grid;
		width: 48px;
		height: 48px;
		place-items: center;
		padding: 0;
		border: 1px solid rgba(244, 213, 200, 0.28);
		border-radius: 50%;
		background: rgba(10, 8, 18, 0.68);
		box-shadow: 0 0 24px rgba(244, 213, 200, 0.1);
		backdrop-filter: blur(10px);
		color: #f4d5c8;
		transition: transform 0.25s ease, border-color 0.25s ease, background 0.25s ease, opacity 0.25s ease;
		touch-action: manipulation;
	}

	.music-toggle svg {
		width: 21px;
		height: 21px;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.8;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.music-toggle:hover,
	.music-toggle:focus-visible {
		transform: translateY(-2px);
		border-color: rgba(244, 213, 200, 0.55);
		background: rgba(28, 20, 38, 0.88);
	}

	.music-toggle:active {
		transform: scale(0.92);
	}

	.sr-hint {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
	}

	@media (prefers-reduced-motion: reduce) {
		.music-toggle {
			transition: none;
		}
	}
</style>