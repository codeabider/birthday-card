<script>
	import {onDestroy, onMount, untrack} from 'svelte';

	let {onReady, initiallyComplete = false, onAutoProceed} = $props();

	// ⚠️  Set the birthday date here (UTC). 01 Oct 2026 00:00 IST = 30 Sep 2026 18:30 UTC.
	const birthdayTimestamp = new Date('2026-10-01T00:00:00+05:30').getTime();
	// const birthdayTimestamp = Date.now() + (5 * 1000); // test timer — never commit! (LOCAL TEST)
	const completeAtStart = untrack(() => initiallyComplete);

	let unlocked = $state(completeAtStart);
	let unlockNotified = $state(completeAtStart);
	let countdown = $state({days:'00',hours:'00',minutes:'00',seconds:'00'});
	let timeLeft = $state(0);
	let totalMs = 0;
	let stars = $state([]);
	let burst = $state([]);
	const burstPalette = ['#ff6b9d','#ffb347','#7ae0ff','#9b7bff','#7dffb0','#f4d5c8','#ff477e'];
	let introDone = $state(false);
	let intervalId = null;
	let introTimeout;
	let unlockTimeout;
	let advanceTimeout;
	let rafId = 0;

	let frac = $state(1);
	let hot = $state(false);
	let glowDur = $state('2.00s');
	let liquidPct = $state('16.000vh');
	let taglineText = $state('something warm is brewing');

	function makeBurst() {
		const parts = [];
		const count = 110;
		const radius = Math.min(Math.min(window.innerWidth, window.innerHeight) * 0.55, 580);
		for (let i = 0; i < count; i++) {
			const ang = Math.random() * Math.PI * 2;
			const dist = 80 + Math.random() * (radius - 80);
			parts.push({
				dx: Math.cos(ang) * dist,
				dy: Math.sin(ang) * dist,
				rot: (Math.random() - 0.5) * 720,
				dur: (0.9 + Math.random() * 0.9).toFixed(2),
				del: (Math.random() * 0.25).toFixed(2),
				color: burstPalette[i % burstPalette.length],
				size: 6 + Math.random() * 9,
				round: Math.random() > 0.45,
			});
		}
		burst = parts;
	}

	function scheduleReady() {
		if (unlockNotified) return;
		unlockNotified = true;
		unlocked = true;
		if (typeof cancelAnimationFrame === 'function' && rafId) cancelAnimationFrame(rafId);
		rafId = 0;
		frac = 0;
		hot = false;
		liquidPct = '80.000vh';
		makeBurst();
		unlockTimeout = setTimeout(() => onReady?.(), 1200);
		startDrain();
		advanceTimeout = setTimeout(() => onAutoProceed?.(), 5300);
	}

	function countUp() {
		const left = birthdayTimestamp - Date.now();
		timeLeft = Math.max(left, 0);
		if (left <= 0) {
			intervalId && clearInterval(intervalId);
			intervalId = null;
			frac = 0;
			hot = false;
			liquidPct = '80.000vh';
			countdown = {days:'00',hours:'00',minutes:'00',seconds:'00'};
			scheduleReady();
			return;
		}
		const d = Math.floor(left / 864e5);
		const h = Math.floor((left % 864e5) / 36e5);
		const m = Math.floor((left % 36e5) / 6e4);
		const s = Math.floor((left % 6e4) / 1e3);
		countdown = {
			days: String(d).padStart(2,'0'),
			hours: String(h).padStart(2,'0'),
			minutes: String(m).padStart(2,'0'),
			seconds: String(s).padStart(2,'0'),
		};
	}

	function tickFill() {
		const left = Math.max(birthdayTimestamp - Date.now(), 0);
		const span = Math.max(totalMs, 1);
		frac = Math.min(left / span, 1);
		hot = frac < 0.2;
		liquidPct = `${Math.max(80 * (1 - frac), 16).toFixed(3)}vh`;
		glowDur = `${(1.2 + 2.8 * frac).toFixed(2)}s`;
		taglineText =
			left >= 864e5
				? 'something warm is brewing'
				: left >= 36e5
					? 'get ready'
					: 'almost here';
		if (left > 0 && !unlocked && typeof requestAnimationFrame === 'function') {
			rafId = requestAnimationFrame(tickFill);
		}
	}

	function startDrain() {
		if (typeof requestAnimationFrame !== 'function') return;
		const t0 = performance.now();
		const DRAIN_MS = 4800;
		function step(now) {
			const t = Math.min((now - t0) / DRAIN_MS, 1);
			liquidPct = `${(80 - 70 * t).toFixed(3)}vh`;
			if (t < 1) rafId = requestAnimationFrame(step);
		}
		rafId = requestAnimationFrame(step);
	}

	onMount(() => {
		stars = Array.from({length: 90}, () => ({
			x: Math.random()*100, y: Math.random()*100,
			sz: 1+Math.random()*2.5,
			dl: (Math.random()*4).toFixed(2),
			dr: (3+Math.random()*6).toFixed(2),
		}));

		introTimeout = setTimeout(() => { introDone = true; }, 500);
		if (completeAtStart) { totalMs = 1; timeLeft = 0; liquidPct = '80.000vh'; makeBurst(); return; }
		totalMs = Math.max(birthdayTimestamp - Date.now(), 1);
		countUp();
		if (!unlocked) intervalId = setInterval(countUp, 1000);
		if (typeof requestAnimationFrame === 'function') rafId = requestAnimationFrame(tickFill);
	});

	onDestroy(() => {
		intervalId && clearInterval(intervalId);
		if (typeof cancelAnimationFrame === 'function' && rafId) cancelAnimationFrame(rafId);
		introTimeout && clearTimeout(introTimeout);
		unlockTimeout && clearTimeout(unlockTimeout);
		advanceTimeout && clearTimeout(advanceTimeout);
	});
</script>

{#if !unlocked}
<div class="gate {hot ? 'hot' : ''}" role="status" aria-label="a mug of coffee held close — froth on top, warm brew below">
	<div class="scene" aria-hidden="true">
		<div class="space">
			{#each stars as st}
				<span class="star" style="--x:{st.x}%;--y:{st.y}%;width:{st.sz}px;height:{st.sz}px;--delay:{st.dl}s;--dur:{st.dr}s;"></span>
			{/each}
		</div>
		<div class="mug">
			<div class="liquid" style="height:{liquidPct};">
				<div class="froth"></div>
				<div class="coffee"><span class="sheen"></span></div>
			</div>
		</div>
	</div>

	<div class="content lock {introDone ? 'show' : ''}">
		<p class="tagline">{#key taglineText}<span class="tag-swap">{taglineText}</span>{/key}</p>

		<div class="countdown">
			<div class="unit">
				<div class="num">{#key countdown.days}<span class="digit">{countdown.days}</span>{/key}</div>
				<span class="lab">days</span>
			</div>
			<div class="unit">
				<div class="num">{#key countdown.hours}<span class="digit">{countdown.hours}</span>{/key}</div>
				<span class="lab">hours</span>
			</div>
			<div class="unit">
				<div class="num">{#key countdown.minutes}<span class="digit">{countdown.minutes}</span>{/key}</div>
				<span class="lab">min</span>
			</div>
			<div class="unit">
				<div class="num">{#key countdown.seconds}<span class="digit">{countdown.seconds}</span>{/key}</div>
				<span class="lab">sec</span>
			</div>
		</div>

	</div>

	<div class="glow" style="--pdur:{glowDur};"></div>
</div>
{:else}
<div class="gate unlock-out">
	<div class="scene" aria-hidden="true">
		<div class="space">
			{#each stars as st}
				<span class="star" style="--x:{st.x}%;--y:{st.y}%;width:{st.sz}px;height:{st.sz}px;--delay:{st.dl}s;--dur:{st.dr}s;"></span>
			{/each}
		</div>
		<div class="mug">
			<div class="liquid" style="height:{liquidPct};">
				<div class="froth"></div>
				<div class="coffee"><span class="sheen"></span></div>
			</div>
		</div>
	</div>

	<span class="burst-flash"></span>

	{#each burst as pt}
		<span
			class="burst"
			class:round={pt.round}
			style="--dx:{pt.dx}px;--dy:{pt.dy}px;--rot:{pt.rot}deg;--dur:{pt.dur}s;--del:{pt.del}s;--size:{pt.size}px;--col:{pt.color};"
		></span>
	{/each}

	<div class="content show">
		<p class="tagline time-up">it's time</p>
	</div>
</div>
{/if}

<style>
	.gate {
		position: fixed; inset: 0;
		display: flex; align-items: center; justify-content: center;
		background:
			radial-gradient(ellipse at 50% 22%, rgba(255,214,160,0.06), transparent 44%),
			linear-gradient(180deg, #07060c 0%, #0b0913 45%, #0f0b12 100%);
		overflow: hidden;
	}

	.gate::after {
		content: '';
		position: absolute; inset: 0;
		box-shadow: inset 0 0 110px rgba(0,0,0,0.5);
		pointer-events: none;
		z-index: 4;
	}

	.scene { position: absolute; inset: 0; }

	.space {
		position: absolute; left: 0; right: 0; top: 0; height: 30%;
		overflow: hidden;
	}

	.star {
		position: absolute; left: var(--x); top: var(--y);
		border-radius: 50%; background: rgba(244,213,200,0.8);
		animation: twk var(--dur) ease-in-out infinite var(--delay);
	}

	@keyframes twk {
		0%,100% { opacity: 0.15; }
		50% { opacity: 0.45; }
	}

	.mug {
		position: absolute; inset: 0;
		transform-origin: 50% 100%;
		animation: mugSlosh 5.5s ease-in-out infinite;
		will-change: transform;
	}

	.liquid {
		position: absolute; left: -5%; right: -5%; bottom: -5%;
	}

	@keyframes mugSlosh {
		0%   { transform: rotate(0deg); }
		18%  { transform: rotate(-1.4deg); }
		38%  { transform: rotate(1.1deg); }
		55%  { transform: rotate(-0.7deg); }
		70%  { transform: rotate(0.5deg); }
		82%  { transform: rotate(-0.2deg); }
		100% { transform: rotate(0deg); }
	}

	.froth {
		position: absolute; left: 0; right: 0; top: 0; height: 20%;
		background: linear-gradient(180deg, #f6e7cb 0%, #eed9b4 40%, #e2c595 100%);
		box-shadow: inset 0 14px 20px rgba(120,80,40,0.16), inset 0 -8px 16px rgba(90,55,25,0.18);
	}

	.froth::before {
		content: '';
		position: absolute; left: -40px; right: -40px; top: -7px; height: 26px;
		background:
			radial-gradient(circle at 24px 20px, #f6e7cb 0 9px, transparent 9.5px),
			radial-gradient(circle at 68px 26px, #ecd6b0 0 12px, transparent 12.5px),
			radial-gradient(circle at 112px 20px, #f6e7cb 0 8px, transparent 8.5px),
			radial-gradient(circle at 156px 24px, #e9d3ab 0 11px, transparent 11.5px),
			radial-gradient(circle at 200px 20px, #f6e7cb 0 9px, transparent 9.5px);
		background-repeat: repeat-x;
		background-size: 224px 36px;
		will-change: background-position, transform;
		animation: foamWave 5.5s ease-in-out infinite;
	}

	@keyframes foamWave {
		0%   { background-position-x: 0;     transform: translateY(0)    rotate(-0.6deg); }
		30%  { background-position-x: 12px;  transform: translateY(-2px) rotate(0deg); }
		50%  { background-position-x: 20px;  transform: translateY(-3px) rotate(0.7deg); }
		70%  { background-position-x: 10px;  transform: translateY(-2px) rotate(0.4deg); }
		100% { background-position-x: 0;     transform: translateY(0)    rotate(-0.6deg); }
	}

	.coffee {
		position: absolute; left: 0; right: 0; top: 20%; bottom: 0;
		background:
			radial-gradient(ellipse at 50% 6%, rgba(140,80,40,0.35), transparent 36%),
			radial-gradient(ellipse at 22% 38%, rgba(235,215,182,0.11), transparent 28%),
			radial-gradient(ellipse at 76% 20%, rgba(235,215,182,0.09), transparent 26%),
			radial-gradient(ellipse at 16% 92%, rgba(0,0,0,0.55), transparent 52%),
			radial-gradient(ellipse at 84% 94%, rgba(0,0,0,0.5), transparent 52%),
			linear-gradient(180deg, #2e1706 0%, #201001 38%, #150a02 70%, #0d0601 100%);
		box-shadow: inset 0 -26px 42px rgba(0,0,0,0.5);
	}

	.coffee::before {
		content: '';
		position: absolute; left: 0; right: 0; top: 0; height: 4px;
		background: linear-gradient(180deg, rgba(120,82,44,0.8), rgba(120,82,44,0));
	}

	.coffee .sheen {
		position: absolute; left: 0; right: 0; top: -2px; height: 30px;
		background: radial-gradient(ellipse at 50% 0%, rgba(255,214,160,0.3), transparent 62%);
		filter: blur(3px);
		animation: sheenGlint 6s ease-in-out infinite;
	}

	@keyframes sheenGlint {
		0%,100% { opacity: 0.4; transform: translateX(-2.5%) scaleX(0.98); }
		50% { opacity: 0.8; transform: translateX(2.5%) scaleX(1.02); }
	}

	.hot .mug { animation-duration: 3.4s; }
	.hot .froth::before { animation-duration: 3.4s; }
	.hot .coffee .sheen { animation-duration: 2.4s; }

	.content {
		position: relative; z-index: 2; text-align: center;
		display: flex; flex-direction: column; align-items: center; gap: 1.5rem;
		opacity: 0; transform: translateY(12px);
		transition: opacity 1.4s ease, transform 1.4s ease;
	}

	.content.lock {
		position: absolute; left: 0; right: 0; top: 0; height: 30%;
		justify-content: center;
	}

	.content.show { opacity: 1; transform: translateY(0); }

	.content::before {
		content: '';
		position: absolute;
		inset: -30% -10%;
		z-index: -1;
		border-radius: 50%;
		background: radial-gradient(ellipse at center, rgba(10,7,14,0.55), transparent 72%);
		filter: blur(16px);
	}

	.burst-flash {
		position: absolute;
		left: 50%;
		top: 50%;
		width: 40px;
		height: 40px;
		margin: -20px 0 0 -20px;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(255,240,200,0.95) 0%, rgba(255,190,120,0.3) 45%, rgba(255,190,120,0) 70%);
		transform: scale(0);
		animation: bloom 0.9s ease-out forwards;
		z-index: 2;
		pointer-events: none;
	}

	@keyframes bloom {
		0% { transform: scale(0); opacity: 1; }
		100% { transform: scale(22); opacity: 0; }
	}

	.burst {
		position: absolute;
		left: 50%;
		top: 50%;
		width: var(--size);
		height: var(--size);
		margin: calc(var(--size) / -2) 0 0 calc(var(--size) / -2);
		background: var(--col);
		opacity: 0;
		animation: burstOut var(--dur) cubic-bezier(0.16, 0.84, 0.44, 1) var(--del) forwards;
		z-index: 3;
		pointer-events: none;
	}

	.burst.round { border-radius: 50%; }

	@keyframes burstOut {
		0% { opacity: 0; transform: translate(0, 0) scale(0.2) rotate(0deg); }
		12% { opacity: 1; }
		100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(1) rotate(var(--rot)); }
	}

	.tagline.time-up {
		animation: timePulse 1.5s ease-in-out infinite;
		text-shadow: 0 0 22px rgba(255,214,150,0.55), 0 0 60px rgba(255,214,150,0.25);
	}

	@keyframes timePulse {
		0%, 100% { transform: scale(1); }
		50% { transform: scale(1.07); }
	}

	.tagline {
		font-family: 'Playfair Display', Georgia, serif; font-style: italic;
		font-size: clamp(1.6rem,7vw,2.4rem); color: #f8e0c0;
		text-shadow: 0 2px 18px rgba(20,8,3,0.6);
	}

	.tag-swap {
		display: inline-block;
		animation: tagSwap 0.9s ease both;
	}

	@keyframes tagSwap {
		0% { opacity: 0; transform: translateY(7px) scale(0.96); filter: blur(3px); }
		100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
	}

	.countdown {
		display: flex; gap: clamp(0.7rem,4vw,1.4rem); justify-content: center;
		animation: count-bob 3.2s ease-in-out infinite;
	}

	.unit {
		display: flex; flex-direction: column; align-items: center; gap: 0.4rem;
		min-width: clamp(40px,11vw,56px);
		padding: 0.8rem 0.35rem 0.7rem;
		border-radius: 14px;
		background: linear-gradient(180deg, rgba(28,17,10,0.78), rgba(16,9,5,0.78));
		border: 1px solid rgba(244,213,200,0.16);
		box-shadow: 0 8px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(244,213,200,0.07);
	}

	.num {
		font-weight: 300; font-size: clamp(1.6rem,6.5vw,2.2rem);
		color: rgba(248,224,192,0.92); letter-spacing: 0.06em;
		perspective: 300px;
	}

	.num .digit {
		display: inline-block;
		animation: flip-in 0.55s cubic-bezier(0.2, 0.7, 0.3, 1) both;
		transform-origin: center bottom;
	}

	.lab {
		font-size: 0.6rem; letter-spacing: 0.2em; text-transform: uppercase;
		color: rgba(240,235,227,0.3);
	}

	@keyframes flip-in {
		0% { transform: rotateX(-90deg); opacity: 0; }
		55% { opacity: 1; transform: rotateX(14deg); }
		80% { transform: rotateX(-7deg); }
		100% { transform: rotateX(0deg); opacity: 1; }
	}

	@keyframes count-bob {
		0%, 100% { transform: translateY(0); filter: drop-shadow(0 0 6px rgba(244,213,200,0.05)); }
		50% { transform: translateY(-5px); filter: drop-shadow(0 10px 26px rgba(244,213,200,0.18)); }
	}

	.glow {
		position: absolute; top: 24%; left: 50%;
		width: 150px; height: 150px;
		margin: -75px 0 0 -75px;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(255,214,160,0.1) 0%, transparent 70%);
		animation: glwP var(--pdur, 4s) ease-in-out infinite;
	}

	@keyframes glwP {
		0%,100% { transform: scale(1); opacity: 0.5; }
		50% { transform: scale(1.8); opacity: 0.9; }
	}

	@media (prefers-reduced-motion: reduce) {
		.countdown,
		.num .digit,
		.tag-swap,
		.tagline.time-up,
		.burst-flash,
		.burst,
		.star,
		.glow,
		.mug,
		.froth,
		.froth::before,
		.coffee .sheen {
			animation: none;
		}
		.burst, .burst-flash { opacity: 0; }
	}
</style>
