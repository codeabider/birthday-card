<script>
	import {onDestroy, onMount, untrack} from 'svelte';

	let {onReady, initiallyComplete = false, onAutoProceed} = $props();

	// ⚠️  Set the birthday date here (UTC).
	const birthdayTimestamp = new Date('2026-10-01T00:00:00Z').getTime();
	// const birthdayTimestamp = Date.now() + (5 * 1000); // test timer — never commit!
	const completeAtStart = untrack(() => initiallyComplete);

	let unlocked = $state(completeAtStart);
	let unlockNotified = $state(completeAtStart);
	let countdown = $state({days:'00',hours:'00',minutes:'00',seconds:'00'});
	let timeLeft = $state(0);
	let totalMs = 0;
	let stars = $state([]);
	let floatingParticles = $state([]);
	let burst = $state([]);
	const burstPalette = ['#ff6b9d','#ffb347','#7ae0ff','#9b7bff','#7dffb0','#f4d5c8','#ff477e'];
	let introDone = $state(false);
	let intervalId = null;
	let introTimeout;
	let unlockTimeout;
	let advanceTimeout;

	let frac = $derived(totalMs > 0 ? Math.min(timeLeft / totalMs, 1) : 0);
	let glowDur = $derived(`${(1.2 + 2.8 * frac).toFixed(2)}s`);
	let taglineText = $derived(
		timeLeft >= 864e5
			? 'something is coming'
			: timeLeft >= 36e5
				? 'get ready'
				: 'almost here'
	);

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
		makeBurst();
		unlockTimeout = setTimeout(() => onReady?.(), 1200);
		advanceTimeout = setTimeout(() => onAutoProceed?.(), 3000);
	}

	function countUp() {
		const left = birthdayTimestamp - Date.now();
		timeLeft = Math.max(left, 0);
		if (left <= 0) {
			intervalId && clearInterval(intervalId);
			intervalId = null;
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

	onMount(() => {
		stars = Array.from({length: 90}, () => ({
			x: Math.random()*100, y: Math.random()*100,
			sz: 1+Math.random()*2.5,
			dl: (Math.random()*4).toFixed(2),
			dr: (3+Math.random()*6).toFixed(2),
		}));

		floatingParticles = Array.from({length: 10}, () => ({
			x: Math.random()*100,
			dl: (Math.random()*3).toFixed(2),
			dr: (5+Math.random()*8).toFixed(2),
		}));

		introTimeout = setTimeout(() => { introDone = true; }, 500);
		if (completeAtStart) { totalMs = 1; timeLeft = 0; makeBurst(); return; }
		totalMs = Math.max(birthdayTimestamp - Date.now(), 1);
		countUp();
		if (!unlocked) intervalId = setInterval(countUp, 1000);
	});

	onDestroy(() => {
		intervalId && clearInterval(intervalId);
		introTimeout && clearTimeout(introTimeout);
		unlockTimeout && clearTimeout(unlockTimeout);
		advanceTimeout && clearTimeout(advanceTimeout);
	});
</script>

{#if !unlocked}
<div class="gate" role="status">
	{#each stars as st}
		<span class="star" style="--x:{st.x}%;--y:{st.y}%;width:{st.sz}px;height:{st.sz}px;--delay:{st.dl}s;--dur:{st.dr}s;"></span>
	{/each}

	{#each floatingParticles as fp}
		<span class="floater" style="--x:{fp.x}%;--delay:{fp.dl}s;--dur:{fp.dr}s;"></span>
	{/each}

	<div class="content {introDone ? 'show' : ''}">
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
	<span class="burst-flash"></span>
	{#each stars as st}
		<span class="star" style="--x:{st.x}%;--y:{st.y}%;width:{st.sz}px;height:{st.sz}px;--delay:{st.dl}s;--dur:{st.dr}s;"></span>
	{/each}

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
		background: radial-gradient(ellipse at 50% 40%, #1e1230 0%, #0a0812 75%);
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

	.floater {
		position: absolute; left: var(--x); top: 110%;
		width: 3px; height: 3px;
		background: rgba(255,218,197,0.15); border-radius: 50%;
		animation: flu var(--dur) ease-out infinite var(--delay);
	}

	@keyframes flu {
		0% { transform: translateY(0); opacity: 0.3; }
		60% { opacity: 0.12; }
		100% { transform: translateY(-120vh); opacity: 0; }
	}

	.content {
		position: relative; z-index: 2; text-align: center;
		display: flex; flex-direction: column; align-items: center; gap: 1.5rem;
		opacity: 0; transform: translateY(12px);
		transition: opacity 1.4s ease, transform 1.4s ease;
	}

	.content.show { opacity: 1; transform: translateY(0); }

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
		font-size: clamp(1.6rem,7vw,2.4rem); color: #f4d5c8;
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
		background: linear-gradient(180deg, rgba(30,18,48,0.85), rgba(12,8,22,0.85));
		border: 1px solid rgba(244,213,200,0.16);
		box-shadow: 0 8px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(244,213,200,0.07);
	}

	.num {
		font-weight: 300; font-size: clamp(1.6rem,6.5vw,2.2rem);
		color: rgba(244,213,200,0.92); letter-spacing: 0.06em;
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
		position: absolute; top: 40%; left: 50%;
		width: 120px; height: 120px;
		margin: -60px 0 0 -60px;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(244,200,180,0.07) 0%, transparent 70%);
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
		.glow {
			animation: none;
		}
		.burst, .burst-flash { opacity: 0; }
	}
</style>
