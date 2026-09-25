<script>
	import {onMount} from 'svelte';

	let revealing = $state(false);
	let linesOut = $state(0);
	let sparklesArr = $state([]);

	onMount(() => {
		sparklesArr = Array.from({length: 40}, () => ({
			x: Math.random() * 100,
			y: Math.random() * 100,
			sz: 2 + Math.random() * 3,
			del: (Math.random() * 3).toFixed(2),
			dur: (4 + Math.random() * 6).toFixed(2),
		}));

		setTimeout(() => { revealing = true; }, 300);
		setTimeout(() => { linesOut = 1; }, 1500);
		setTimeout(() => { linesOut = 2; }, 2400);
		setTimeout(() => { linesOut = 3; }, 3100);
	});

	const lines = [
		'happy birthday.',
		'may this year bring you everything',
		'you deserve and more',
		'you\'ve earned it',
	];
</script>

<div class="final">
	<span class="orb orb-1"></span>
	<span class="orb orb-2"></span>

	{#each sparklesArr as sp}
		<span class="sp" style="--x:{sp.x}%;--y:{sp.y}%;width:{sp.sz}px;height:{sp.sz}px;--delay:{sp.del}s;--dur:{sp.dur}s;"></span>
	{/each}

	<div class="center {revealing ? 'show' : ''}">
		{#if linesOut >= 1}<p class="l1">{lines[0]}</p>{/if}
		{#if linesOut >= 2}<p class="l2 fadein">{lines[1]}<br/>{lines[2]}</p>{/if}
		{#if linesOut >= 3}<p class="l3 fadein">{lines[3]}</p>{/if}

		<div class="heart" aria-hidden="true">
			<svg width="24" height="22" viewBox="0 0 28 26" fill="none" aria-hidden="true">
				<path d="M14 24.5C14 24.5 2 16.5 2 9.5C2 5.5 5 3 8.5 3C10.8 3 13 4.5 14 6.5C15 4.5 17.2 3 19.5 3C23 3 26 5.5 26 9.5C26 16.5 14 24.5 14 24.5Z" fill="rgba(244,200,180,0.25)" />
			</svg>
		</div>
	</div>
</div>

<style>
	.final {
		position: fixed; inset: 0;
		display: flex; align-items: center; justify-content: center;
		background: radial-gradient(ellipse at 50% 35%, #1e1230 0%, #0a0812 60%, #060410 100%);
	}

	.sp {
		position: absolute; left: var(--x); top: var(--y);
		border-radius: 50%; background: rgba(244,213,200,0.6);
		animation: twk var(--dur) ease-in-out infinite var(--delay);
	}

	@keyframes twk { 0%,100% { opacity: 0.12; } 50% { opacity: 0.35; } }

	.center {
		text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1rem;
		opacity: 0; transform: translateY(12px);
		transition: opacity 1.6s ease, transform 1.6s ease;
		padding-bottom: max(8vh, env(safe-area-inset-bottom), 40px);
	}

	.center.show { opacity: 1; transform: translateY(0); }

	.fadein { animation: inUp 0.7s ease forwards; }

	@keyframes inUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

	.l1 { font-size: clamp(2rem,8vw,3.2rem); color: #f4d5c8; line-height: 1.25; margin-bottom: 0.5rem; }
	.l2 { font-size: clamp(0.9rem,3.6vw,1.1rem); color: rgba(240,235,227,0.45); line-height: 1.7; margin-bottom: 0.3rem; }
	.l3 { font-size: clamp(1rem,4vw,1.2rem); color: rgba(244,213,200,0.35); letter-spacing: 0.08em; }

	.heart { margin-top: 1.5rem; animation: hltPulse 2.6s ease-in-out infinite; opacity: 0; transition: opacity 1s ease 0.4s; }
	.center.show .heart { opacity: 1; }

	@keyframes hltPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.12); } }

	.orb {
		position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%);
		border-radius: 50%; pointer-events: none;
	}
	.orb-1 {
		width: 260px; height: 260px;
		background: radial-gradient(circle, rgba(244,200,180,0.06) 0%, transparent 70%);
		animation: orbPulse 4.5s ease-in-out infinite;
	}
	.orb-2 {
		width: 420px; height: 420px;
		background: radial-gradient(circle, rgba(180,140,220,0.04) 0%, transparent 65%);
		animation: orbPulse 6s ease-in-out infinite 1.2s;
	}

	@keyframes orbPulse {
		0%,100% { opacity: 0.3; transform: translate(-50%, -50%) scale(0.85); }
		50% { opacity: 0.7; transform: translate(-50%, -50%) scale(1.25); }
	}

	.center { position: relative; z-index: 3; }
</style>
