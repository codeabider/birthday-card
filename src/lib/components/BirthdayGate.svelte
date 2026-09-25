<script>
	import {onDestroy, onMount, untrack} from 'svelte';

	let {onReady, initiallyComplete = false, skipCountdown = false} = $props();

	// ⚠️  Set the birthday date here (UTC).
	const birthdayTimestamp = new Date('2026-12-31T00:00:00Z').getTime();
	// const birthdayTimestamp = Date.now() + (10 * 1000);
	const completeAtStart = untrack(() => initiallyComplete);

	let devOverride = $state(false);
	let unlocked = $state(completeAtStart);
	let unlockNotified = $state(completeAtStart);
	let countdown = $state({days:'00',hours:'00',minutes:'00',seconds:'00'});
	let stars = $state([]);
	let floatingParticles = $state([]);
	let introDone = $state(false);
	let intervalId = null;
	let unlockTimeout;

	function scheduleReady() {
		if (unlockNotified) return;
		unlockNotified = true;
		unlocked = true;
		unlockTimeout = setTimeout(() => onReady?.(), 1200);
	}

	function countUp() {
		const left = birthdayTimestamp - Date.now();
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

	function skipToBirthday() {
		if (devOverride || completeAtStart) return;
		devOverride = true;
		intervalId && clearInterval(intervalId);
		intervalId = null;
		scheduleReady();
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

		setTimeout(() => { introDone = true; }, 500);
		if (completeAtStart || skipCountdown) {
			if (skipCountdown && !completeAtStart) skipToBirthday();
			return;
		}
		countUp();
		if (!unlocked) intervalId = setInterval(countUp, 1000);
	});

	onDestroy(() => {
		intervalId && clearInterval(intervalId);
		unlockTimeout && clearTimeout(unlockTimeout);
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
		<p class="tagline">something is coming</p>

		<div class="countdown">
			<div class="unit"><span class="num">{countdown.days}</span><span class="lab">days</span></div>
			<div class="unit"><span class="num">{countdown.hours}</span><span class="lab">hours</span></div>
			<div class="unit"><span class="num">{countdown.minutes}</span><span class="lab">min</span></div>
			<div class="unit"><span class="num">{countdown.seconds}</span><span class="lab">sec</span></div>
		</div>

		<button class="whisper" onclick={skipToBirthday}>tap to skip</button>
	</div>

	<div class="glow"></div>
</div>
{:else}
<div class="gate unlock-out">
	{#each stars as st}
		<span class="star" style="--x:{st.x}%;--y:{st.y}%;width:{st.sz}px;height:{st.sz}px;--delay:{st.dl}s;--dur:{st.dr}s;"></span>
	{/each}
	<div class="content show">
		<p class="tagline">it's time</p>
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

	.unlock-out { animation: gFade 1.2s ease forwards; }

	@keyframes gFade { to { opacity: 0; pointer-events: none; } }

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

	.tagline {
		font-family: 'Playfair Display', Georgia, serif; font-style: italic;
		font-size: clamp(1.6rem,7vw,2.4rem); color: #f4d5c8;
	}

	.countdown {
		display: flex; gap: clamp(0.8rem,4vw,1.6rem); justify-content: center;
	}

	.unit {
		display: flex; flex-direction: column; align-items: center; gap: 0.3rem;
		min-width: clamp(36px,10vw,52px);
	}

	.num {
		font-weight: 300; font-size: clamp(1.6rem,6.5vw,2.2rem);
		color: rgba(244,213,200,0.9); letter-spacing: 0.06em;
	}

	.lab {
		font-size: 0.6rem; letter-spacing: 0.2em; text-transform: uppercase;
		color: rgba(240,235,227,0.25);
	}

	.whisper {
		font-size: 0.6rem; letter-spacing: 0.18em; text-transform: uppercase;
		color: rgba(240,235,227,0.18); background: transparent; border: none; cursor: pointer;
		font-family: inherit; padding: 0;
	}
	.whisper:hover { color: rgba(240,235,227,0.35); }

	.glow {
		position: absolute; top: 40%; left: 50%;
		width: 120px; height: 120px;
		margin: -60px 0 0 -60px;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(244,200,180,0.07) 0%, transparent 70%);
		animation: glwP 4s ease-in-out infinite;
	}

	@keyframes glwP {
		0%,100% { transform: scale(1); opacity: 0.5; }
		50% { transform: scale(1.8); opacity: 0.9; }
	}
</style>
