<script>
	import {onDestroy, onMount} from 'svelte';
	import {getFlow} from '$lib/flow.svelte.js';

	let revealing = $state(false);
	let linesOut = $state(0);
	let sparklesArr = $state([]);
	let falling = $state([]);

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

	const themeEmoji = {
		warm: ['☕', '🍫'],
		party: ['🥳', '🎉'],
		mystery: ['🕵️', '🔎'],
		cozy: ['🧸', '🕯️'],
		dream: ['🌠', '✨'],
	};

	function dayTheme() {
		const ch = flow.choices;
		if (!['s0', 's1', 's2', 's3'].every((key) => Number.isInteger(ch[key]))) return 'warm';
		return ['party', 'mystery', 'cozy', 'dream'][ch.s3] || 'warm';
	}

	let theme = $derived(dayTheme());

	const titleWords = [
		{ text: 'happy', gold: false },
		{ text: 'birthday', gold: false },
		{ text: 'Namita.', gold: true },
	];

	const lines = [
		'may this year bring you everything',
		'you deserve and more',
		"and you've earned it",
		closingText(),
	];

	let timers = [];

	onMount(() => {
		sparklesArr = Array.from({length: 46}, () => ({
			x: Math.random() * 100,
			y: Math.random() * 100,
			sz: 1.5 + Math.random() * 3,
			del: (Math.random() * 3).toFixed(2),
			dur: (4 + Math.random() * 6).toFixed(2),
		}));

		falling = Array.from({length: 26}, () => ({
			x: Math.random() * 100,
			del: (1.5 + Math.random() * 4).toFixed(2),
			dur: (6 + Math.random() * 8).toFixed(2),
			sz: 3 + Math.random() * 4,
		}));

		timers = [
			setTimeout(() => { revealing = true; }, 300),
			setTimeout(() => { linesOut = 1; }, 1900),
			setTimeout(() => { linesOut = 2; }, 2700),
			setTimeout(() => { linesOut = 3; }, 3500),
			setTimeout(() => { linesOut = 4; }, 4200),
		];
	});

	onDestroy(() => {
		timers.forEach(clearTimeout);
	});
</script>

<div class="final theme-{theme}">
	<span class="aurora au1"></span>
	<span class="aurora au2"></span>

	<svg class="warmth {revealing ? 'show' : ''}" viewBox="0 0 200 200" aria-hidden="true">
		<circle cx="100" cy="100" r={40 + linesOut * 8} fill="none" stroke="rgba(244,200,180,0.15)" stroke-width="0.5"></circle>
		<circle cx="100" cy="100" r={70 + linesOut * 10} fill="none" stroke="rgba(244,200,180,0.08)" stroke-width="0.3"></circle>
	</svg>

	<div class="orb-wrap">
		<span class="orb {revealing ? 'big' : ''}"></span>
		<svg class="ring" viewBox="0 0 200 200" aria-hidden="true">
			<circle class="ring-a" cx="100" cy="100" r="62" fill="none" stroke="rgba(244,213,200,0.22)" stroke-width="0.8" stroke-dasharray="1.5 7"></circle>
			<circle class="ring-b" cx="100" cy="100" r="80" fill="none" stroke="rgba(200,150,120,0.14)" stroke-width="1" stroke-dasharray="14 18"></circle>
			<circle class="summit" cx="100" cy="100" r="52" fill="none" stroke="rgba(255,214,120,0.35)" stroke-width="0.6" stroke-dasharray="1 5"></circle>
		</svg>
	</div>

	{#each sparklesArr as sp}
		<span class="sp" style="--x:{sp.x}%;--y:{sp.y}%;width:{sp.sz}px;height:{sp.sz}px;--delay:{sp.del}s;--dur:{sp.dur}s;"></span>
	{/each}

	{#each falling as fl}
		<span class="sparkle" style="--x:{fl.x}%;width:{fl.sz}px;--delay:{fl.del}s;--dur:{fl.dur}s;"></span>
	{/each}

	<span class="shoot shoot-1" aria-hidden="true"></span>
	<span class="shoot shoot-2" aria-hidden="true"></span>

	<div class="center {revealing ? 'show' : ''}">
		<h1 class="title show">
			{#each titleWords as w, i}
				<span class="tword {w.gold ? 'gold' : ''}" style="--d:{0.5 + 0.7 * i}s;">{w.text}</span>
			{/each}
		</h1>

		{#if linesOut >= 1}
			<div class="festoon" aria-hidden="true">
				<span class="rule"></span>
				<span class="diamond">✦</span>
				<span class="rule"></span>
			</div>
		{/if}

		{#if linesOut >= 1}
			<div class="wishes">
				<p class="wish" style="--d:0s;">{lines[0]}<br/>{lines[1]}</p>
				{#if linesOut >= 2}<p class="wish" style="--d:0.35s;">{lines[2]}</p>{/if}
				{#if linesOut >= 2}<p class="wish last" style="--d:0.7s;">{lines[3]}</p>{/if}
			</div>
		{/if}

		{#if linesOut >= 3}
			<div class="heart-wrap show" aria-hidden="true">
				<span class="halo"></span>
				<span class="side treat-left">{themeEmoji[theme][0]}</span>
				<span class="side treat-right">{themeEmoji[theme][1]}</span>
				<svg width="30" height="28" viewBox="0 0 28 26" fill="none">
					<path d="M14 24.5C14 24.5 2 16.5 2 9.5C2 5.5 5 3 8.5 3C10.8 3 13 4.5 14 6.5C15 4.5 17.2 3 19.5 3C23 3 26 5.5 26 9.5C26 16.5 14 24.5 14 24.5Z" fill="rgba(244,200,180,0.45)" />
				</svg>
			</div>
		{/if}

		{#if linesOut >= 4}<p class="end-mark">✦ that's everything</p>{/if}
	</div>
</div>

<style>
	.final {
		position: fixed;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background:
			radial-gradient(ellipse at 50% 32%, rgba(206,126,64,0.26) 0%, transparent 60%),
			radial-gradient(ellipse at 50% 110%, rgba(120,58,60,0.22) 0%, transparent 55%),
			linear-gradient(180deg, #2a1a10 0%, #160e08 70%, #0f0803 100%);
		overflow: hidden;
	}

	.aurora {
		position: absolute;
		border-radius: 50%;
		filter: blur(70px);
		pointer-events: none;
	}

	.au1 {
		width: 62vmin;
		height: 62vmin;
		top: -18vmin;
		left: -12vmin;
		background: radial-gradient(circle, rgba(238,208,164,0.18) 0%, rgba(200,140,90,0.06) 55%, transparent 62%);
		animation: au1 11s ease-in-out infinite alternate;
	}

	.au2 {
		width: 70vmin;
		height: 70vmin;
		bottom: -22vmin;
		right: -16vmin;
		background: radial-gradient(circle, rgba(140,110,180,0.12) 0%, transparent 62%);
		animation: au2 14s ease-in-out infinite alternate;
	}

	@keyframes au1 {
		0%, 100% { transform: translate(0, 0) scale(1); }
		50% { transform: translate(9vmin, 5vmin) scale(1.15); }
	}

	@keyframes au2 {
		0%, 100% { transform: translate(0, 0) scale(1.1); }
		50% { transform: translate(-10vmin, -6vmin) scale(0.95); }
	}

	.warmth {
		position: absolute;
		width: min(500px, 94vw);
		height: min(500px, 94vw);
		top: 50%;
		left: 50%;
		transform: translate(-50%, -58%);
		opacity: 0;
		transition: opacity 2s ease;
	}

	.warmth.show {
		opacity: 1;
	}

	.orb-wrap {
		position: absolute;
		top: 22%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: min(160px, 38vw);
		height: min(160px, 38vw);
		pointer-events: none;
	}

	.orb {
		position: absolute;
		top: 50%;
		left: 50%;
		width: min(62px, 15vw);
		height: min(62px, 15vw);
		border-radius: 50%;
		transform: translate(-50%, -50%);
		background: radial-gradient(circle at 32% 32%, #f7dfb4 0%, #d8a36e 50%, #a9744f 100%);
		box-shadow: 0 0 34px 10px rgba(230,178,120,0.28), 0 0 90px 20px rgba(200,140,90,0.14);
		transition: transform 2s ease, box-shadow 2s ease;
	}

	.orb.big {
		transform: translate(-50%, -50%) scale(1.55);
		box-shadow: 0 0 52px 20px rgba(235,180,120,0.4), 0 0 120px 40px rgba(200,140,90,0.18);
	}

	.ring {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		opacity: 0;
		transform: rotate(-18deg);
		animation: ringFade 2.4s ease forwards 0.6s;
	}

	@keyframes ringFade {
		to { opacity: 1; }
	}

	.ring-a,
	.ring-b,
	.summit {
		transform-origin: 100px 100px;
	}

	.ring-a {
		animation: spinCw 24s linear infinite;
	}

	.ring-b {
		animation: spinCcw 32s linear infinite;
	}

	.summit {
		animation: spinCw 14s linear infinite;
	}

	@keyframes spinCw {
		to { transform: rotate(360deg); }
	}

	@keyframes spinCcw {
		to { transform: rotate(-360deg); }
	}

	.sp {
		position: absolute;
		left: var(--x);
		top: var(--y);
		border-radius: 50%;
		background: rgba(244,213,200,0.6);
		animation: twk var(--dur) ease-in-out infinite var(--delay);
	}

	@keyframes twk { 0%,100% { opacity: 0.12; } 50% { opacity: 0.4; } }

	.sparkle {
		position: absolute;
		left: var(--x);
		width: var(--sz);
		height: calc(var(--sz) / 2);
		background: rgba(255,228,210,0.35);
		border-radius: 50%;
		animation: driftDown var(--dur) ease-out forwards calc(var(--delay) + 2s);
		opacity: 0;
	}

	@keyframes driftDown {
		0% { transform: translateY(0); opacity: 0; }
		15% { opacity: 0.6; }
		70% { opacity: 0.3; }
		100% { transform: translateY(110vh); opacity: 0; }
	}

	.shoot {
		position: absolute;
		width: 130px;
		height: 1.5px;
		border-radius: 2px;
		background: linear-gradient(90deg, rgba(255,255,255,0.75), transparent);
		opacity: 0;
		pointer-events: none;
	}

	.shoot-1 {
		top: 16%;
		left: 68%;
		transform: rotate(-38deg);
		animation: shootFly 7s ease-in-out infinite 2.5s;
	}

	.shoot-2 {
		top: 58%;
		left: 14%;
		transform: rotate(-42deg);
		animation: shootFly2 9s ease-in-out infinite 6s;
	}

	@keyframes shootFly {
		0% { opacity: 0; transform: translate(0, 0) rotate(-38deg); }
		3% { opacity: 0.8; }
		10% { opacity: 0; transform: translate(-42vw, 32vh) rotate(-38deg); }
		100% { opacity: 0; transform: translate(-42vw, 32vh) rotate(-38deg); }
	}

	@keyframes shootFly2 {
		0% { opacity: 0; transform: translate(0, 0) rotate(-42deg); }
		3% { opacity: 0.7; }
		10% { opacity: 0; transform: translate(-40vw, 30vh) rotate(-42deg); }
		100% { opacity: 0; transform: translate(-40vw, 30vh) rotate(-42deg); }
	}

	.center {
		position: relative;
		z-index: 2;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.6rem;
		margin-top: clamp(56px, 16vh, 200px);
		min-height: clamp(440px, 64vh, 640px);
		padding-bottom: max(8vh, env(safe-area-inset-bottom), 40px);
		opacity: 0;
		transition: opacity 1.6s ease;
	}

	.center.show {
		opacity: 1;
	}

	.center::before {
		content: '';
		position: absolute;
		inset: -10% -14%;
		z-index: -1;
		border-radius: 50%;
		background: radial-gradient(ellipse at center, rgba(10, 8, 16, 0.62), transparent 70%);
		filter: blur(30px);
	}

	.title {
		display: inline-block;
		font-size: clamp(2.4rem, 9vw, 3.6rem);
		line-height: 1.3;
	}

	.tword {
		display: inline-block;
		margin-right: 0.32em;
		color: #ffead9;
		text-shadow: 0 2px 22px rgba(8, 6, 14, 0.7);
		opacity: 0;
		transform: translateY(22px) scale(0.95);
		animation: twordIn 1.35s cubic-bezier(0.22, 0.61, 0.36, 1) forwards var(--d);
	}

	.tword.gold {
		margin-right: 0;
		text-shadow: none;
		background: linear-gradient(90deg, #ffe6c2, #fbd09b, #f4b870, #ffe6c2);
		background-size: 220% auto;
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		animation: twordIn 1.35s cubic-bezier(0.22, 0.61, 0.36, 1) forwards var(--d),
			shimmer 5s linear infinite;
	}

	@keyframes twordIn {
		to { opacity: 1; transform: translateY(0) scale(1); }
	}

	@keyframes shimmer {
		to { background-position: -220% center; }
	}

	.festoon {
		display: flex;
		align-items: center;
		gap: 0.8rem;
		opacity: 0;
		animation: festoonIn 1.2s ease forwards;
	}

	@keyframes festoonIn {
		to { opacity: 1; }
	}

	.rule {
		width: clamp(40px, 14vw, 110px);
		height: 1px;
		background: linear-gradient(90deg, transparent, rgba(244,213,200,0.5), transparent);
		transform: scaleX(0);
		animation: ruleIn 1.1s ease forwards 0.4s;
	}

	@keyframes ruleIn {
		to { transform: scaleX(1); }
	}

	.diamond {
		color: rgba(244,213,200,0.75);
		font-size: 0.85rem;
		animation: dSpin 8s ease-in-out infinite;
	}

	@keyframes dSpin {
		0%, 100% { transform: rotate(0deg); }
		50% { transform: rotate(180deg); }
	}

	.wishes {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		align-items: center;
	}

	.wish {
		font-size: clamp(1.05rem, 4vw, 1.3rem);
		font-family: 'Playfair Display', Georgia, serif;
		font-style: italic;
		color: rgba(250, 234, 222, 0.85);
		text-shadow: 0 1px 16px rgba(8, 6, 14, 0.55);
		line-height: 1.7;
		opacity: 0;
		transform: translateY(10px);
		animation: wishAppear 1.2s ease forwards var(--d);
	}

	.wish.last {
		color: rgba(246, 217, 173, 0.95);
		margin-top: 0.4rem;
	}

	@keyframes wishAppear {
		to { opacity: 1; transform: translateY(0); }
	}

	.heart-wrap {
		position: relative;
		opacity: 0;
		transform: translateY(6px);
		transition: opacity 1.4s ease, transform 1.4s ease;
	}

	.heart-wrap.show {
		opacity: 1;
		transform: translateY(0);
		animation: heartPulse 2.6s ease-in-out infinite 0.4s;
	}

	.heart-wrap .halo {
		position: absolute;
		inset: -10px;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(244,200,180,0.28) 0%, transparent 68%);
		animation: haloPulse 2.6s ease-in-out infinite;
	}

	@keyframes heartPulse {
		0%,100% { transform: scale(1); }
		50% { transform: scale(1.1); }
	}

	@keyframes haloPulse {
		0%,100% { opacity: 0.4; }
		50% { opacity: 0.9; }
	}

	.heart-wrap > svg {
		position: relative;
		z-index: 1;
	}

	.side {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		font-size: 1.05rem;
		z-index: 2;
		animation: sideBob 2.6s ease-in-out infinite;
	}

	.treat-left { right: calc(100% + 12px); }
	.treat-right { left: calc(100% + 12px); animation-delay: 0.5s; }

	@keyframes sideBob {
		0%, 100% { transform: translateY(calc(-50% - 3px)); }
		50% { transform: translateY(calc(-50% + 3px)); }
	}

	.end-mark {
		margin-top: 1.4rem;
		font-size: 0.6rem;
		letter-spacing: 0.3em;
		text-transform: uppercase;
		color: rgba(246,217,173,0.4);
		opacity: 0;
		animation: wishAppear 0.9s ease 0.6s forwards;
	}

	@media (prefers-reduced-motion: reduce) {
		.sp, .aurora, .warmth, .heart-wrap, .heart-wrap .halo, .side, .tword, .tword.gold, .diamond, .ring, .ring-a, .ring-b, .summit, .shoot, .sparkle, .end-mark {
			animation: none !important;
			opacity: 1;
		}
		.orb, .orb.big { transform: translate(-50%, -50%) scale(1.3); }
		.center, .center.show { opacity: 1; }
		.sparkle, .shoot { opacity: 0 !important; visibility: hidden; }
	}
</style>