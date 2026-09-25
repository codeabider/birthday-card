<script>
	import {onMount} from 'svelte';
	import {getFlow} from '$lib/flow.svelte.js';

	let revealing = $state(false);
	let linesOut = $state(0);
	let sparklesArr = $state([]);

	const flow = getFlow();

	function closingText() {
		const ch = flow.choices;
		const ready = ['s0', 's1', 's2', 's3'].every((key) => Number.isInteger(ch[key]));
		const fallback = "now go have chocolate and coffee \u2014 you've earned them";
		if (!ready) return fallback;
		const morning = ch.s0, next = ch.s1, afternoon = ch.s2, evening = ch.s3;
		if (evening === 1) return 'may the mystery room be breezy and the escape extra quick \u2014 chocolate to celebrate afterward, obviously';
		if (evening === 0) return 'dance like the candles might never melt \u2014 and refill the mug when it cools';
		if (next === 1 || afternoon === 1) return 'go claim every adventure \u2014 a thermos of cocoa in one hand, courage in the other';
		if (next === 2) return 'may the nothing be luxurious, the coffee slow, and the chocolate endless';
		if (afternoon === 0) return 'more chocolate than a person technically needs \u2014 and you have earned every single piece';
		if (morning === 1) return 'a beautiful breakfast and a full mug \u2014 the whole year should start like this';
		if (evening === 2) return 'blankets warm, mug close, world quiet \u2014 a perfect way to end the day';
		if (evening === 3) return 'wake up smiling \u2014 tomorrow is already going to be good';
		return fallback;
	}

	let closer = closingText();

	function dayTheme() {
		const ch = flow.choices;
		if (!['s0', 's1', 's2', 's3'].every((key) => Number.isInteger(ch[key]))) return 'warm';
		const evening = ch.s3;
		return ['party', 'mystery', 'cozy', 'dream'][evening] || 'warm';
	}

	let theme = $derived(dayTheme());

	const themeEmoji = {
		warm: ['☕', '🍫'],
		party: ['🥳', '🎉'],
		mystery: ['🕵️', '🔎'],
		cozy: ['🧸', '🕯️'],
		dream: ['🌠', '✨'],
	};

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
		setTimeout(() => { linesOut = 4; }, 3800);
	});

	const lines = [
		'happy birthday.',
		'may this year bring you everything',
		'you deserve and more',
		'you\'ve earned it',
		closer,
	];
</script>

<div class="final theme-{theme}">
	<span class="orb orb-1"></span>
	<span class="orb orb-2"></span>

	{#each sparklesArr as sp}
		<span class="sp" style="--x:{sp.x}%;--y:{sp.y}%;width:{sp.sz}px;height:{sp.sz}px;--delay:{sp.del}s;--dur:{sp.dur}s;"></span>
	{/each}

	<div class="center {revealing ? 'show' : ''}">
		{#if linesOut >= 1}<p class="l1">{lines[0]}</p>{/if}
		{#if linesOut >= 2}<p class="l2 fadein">{lines[1]}<br/>{lines[2]}</p>{/if}
		{#if linesOut >= 3}<p class="l3 fadein">{lines[3]}</p>{/if}
		{#if linesOut >= 4}<p class="l4 fadein">{lines[4]}</p>{/if}

		<div class="heart" aria-hidden="true">
			<span class="side treat-left">{themeEmoji[theme][0]}</span>
			<span class="side treat-right">{themeEmoji[theme][1]}</span>
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

	@media (prefers-reduced-motion: reduce) {
		.sp, .orb, .heart, .side { animation: none !important; }
	}

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
	.l4 { font-size: clamp(0.9rem,3.6vw,1.05rem); color: rgba(240,235,227,0.55); font-style: italic; }

	.heart { position: relative; margin-top: 1.5rem; animation: hltPulse 2.6s ease-in-out infinite; opacity: 0; transition: opacity 1s ease 0.4s; }
	.center.show .heart { opacity: 1; }

	.side {
		position: absolute; top: 50%; transform: translateY(-50%);
		font-size: 1.05rem;
		animation: sideBob 2.6s ease-in-out infinite;
	}
	.treat-left { right: calc(100% + 10px); }
	.treat-right { left: calc(100% + 10px); animation-delay: 0.5s; }

	@keyframes sideBob {
		0%, 100% { transform: translateY(calc(-50% - 3px)); }
		50% { transform: translateY(calc(-50% + 3px)); }
	}

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

	.theme-party .orb-1 { background: radial-gradient(circle, rgba(255,196,86,0.11) 0%, transparent 70%); }
	.theme-party .orb-2 { background: radial-gradient(circle, rgba(255,140,160,0.08) 0%, transparent 66%); }
	.theme-party .sp { background: rgba(255,214,120,0.75); }
	.theme-party .l1 { color: #ffd98a; }

	.theme-mystery .orb-1 { background: radial-gradient(circle, rgba(150,120,255,0.12) 0%, transparent 70%); }
	.theme-mystery .orb-2 { background: radial-gradient(circle, rgba(110,80,220,0.1) 0%, transparent 66%); }
	.theme-mystery .sp { background: rgba(190,170,255,0.75); }
	.theme-mystery .l1 { color: #dcc9ff; }

	.theme-cozy .orb-1 { background: radial-gradient(circle, rgba(244,190,150,0.12) 0%, transparent 70%); }
	.theme-cozy .orb-2 { background: radial-gradient(circle, rgba(210,170,130,0.09) 0%, transparent 66%); }
	.theme-cozy .sp { background: rgba(255,214,180,0.8); }
	.theme-cozy .l1 { color: #ffd2a8; }

	.theme-dream .orb-1 { background: radial-gradient(circle, rgba(140,190,255,0.12) 0%, transparent 70%); }
	.theme-dream .orb-2 { background: radial-gradient(circle, rgba(160,130,255,0.1) 0%, transparent 66%); }
	.theme-dream .sp { background: rgba(200,215,255,0.75); }
	.theme-dream .l1 { color: #cfe0ff; }

	.center { position: relative; z-index: 3; }
</style>
