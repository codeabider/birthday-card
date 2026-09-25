<script>
	import {onDestroy, onMount, untrack} from 'svelte';

	let {onReady, initiallyComplete = false, onAutoProceed} = $props();

	// ⚠️  Set the birthday date here (UTC).
	const birthdayTimestamp = new Date('2026-10-01T00:00:00Z').getTime();
	// const birthdayTimestamp = Date.now() + (10 * 1000);
	const completeAtStart = untrack(() => initiallyComplete);

	let unlocked = $state(completeAtStart);
	let unlockNotified = $state(completeAtStart);
	let countdown = $state({days:'00',hours:'00',minutes:'00',seconds:'00'});
	let stars = $state([]);
	let floatingParticles = $state([]);
	let introDone = $state(false);
	let intervalId = null;
	let introTimeout;
	let unlockTimeout;
	let advanceTimeout;

	function scheduleReady() {
		if (unlockNotified) return;
		unlockNotified = true;
		unlocked = true;
		unlockTimeout = setTimeout(() => onReady?.(), 1200);
		advanceTimeout = setTimeout(() => onAutoProceed?.(), 3000);
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
		if (completeAtStart) return;
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
		<p class="tagline">something is coming</p>

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
		animation: glwP 4s ease-in-out infinite;
	}

	@keyframes glwP {
		0%,100% { transform: scale(1); opacity: 0.5; }
		50% { transform: scale(1.8); opacity: 0.9; }
	}

	@media (prefers-reduced-motion: reduce) {
		.countdown,
		.num .digit {
			animation: none;
		}
	}
</style>
