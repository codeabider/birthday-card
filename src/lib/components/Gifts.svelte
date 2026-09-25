<script>
	import {onDestroy, onMount, untrack} from 'svelte';

	let {onProgress, initialFeeling = null, initiallyRevealed = false} = $props();
	const feelingAtStart = untrack(() => initialFeeling);
	const revealedAtStart = untrack(() => initiallyRevealed);

	const feelings = [
		{text: 'I want something lovely', gift: {title: 'a gentle reminder', body: 'you are allowed to take up space. you always have been.'}},
		{text: 'I need a little encouragement', gift: {title: 'truth for today', body: 'the things you survive become the things you understand. and that makes you rare.'}},
		{text: 'Make me laugh', gift: {title: 'a scientific fact', body: 'plutonium glows. so does your screen right now. you are in the presence of glow.'}},
		{text: 'I want something peaceful', gift: {title: 'stillness', body: 'nothing has to happen for the next minute, and the world will keep spinning without help.'}},
		{text: 'Surprise me', gift: {title: 'a prediction', body: 'three months from now you will think back to today and smile.'}},
	];
	const hasInitialFeeling = Number.isInteger(feelingAtStart) && Boolean(feelings[feelingAtStart]);
	let step = $state(hasInitialFeeling ? 'reveal' : 'feeling');
	let pickedFeeling = $state(hasInitialFeeling ? feelings[feelingAtStart] : null);
	let feelingIdx = $state(hasInitialFeeling ? feelingAtStart : 0);
	let revealing = $state(hasInitialFeeling && revealedAtStart);
	let revealed = $state(hasInitialFeeling && revealedAtStart);
	let fadingOut = $state(false);
	let introDone = $state(hasInitialFeeling);
	let glowBursts = $state([]);
	let revealTimers = [];
	let burstTimeout;
	let introTimeout;
	let resetTimeout;

	function burstGlow() {
		const particles = Array.from({length: 18}, () => ({
			angle: Math.random()*360,
			dur: 0.6 + Math.random()*0.6,
			dist: 20 + Math.random()*40,
		}));
		glowBursts = particles;
		burstTimeout = setTimeout(() => { glowBursts = []; }, 1400);
		return particles;
	}

	function pickFeeling(idx) {
		if (fadingOut) return;
		revealTimers.forEach(clearTimeout);
		feelingIdx = idx;
		pickedFeeling = feelings[idx];
		step = 'reveal';
		revealing = false;
		revealed = false;
		onProgress?.(idx, false);
		revealTimers = [
			setTimeout(() => { revealing = true; }, 300),
			setTimeout(() => { revealed = true; burstGlow(); onProgress?.(idx, true); }, 1200),
		];
	}

	function pickRandom() {
		let rIdx;
		do { rIdx = Math.floor(Math.random()*feelings.length); } while (rIdx === feelingIdx && feelings.length > 1);
		pickFeeling(rIdx);
	}

	function reset() {
		if (fadingOut) return;
		fadingOut = true;
		revealTimers.forEach(clearTimeout);
		resetTimeout = setTimeout(() => {
			step = 'feeling';
			revealing = false;
			revealed = false;
			pickedFeeling = null;
			fadingOut = false;
			introDone = true;
			onProgress?.(null, false);
		}, 500);
	}

	onMount(() => {
		if (hasInitialFeeling) {
			onProgress?.(feelingAtStart, revealedAtStart);
			if (revealedAtStart) burstGlow();
		} else {
			introTimeout = setTimeout(() => { introDone = true; }, 400);
		}
	});

	onDestroy(() => {
		revealTimers.forEach(clearTimeout);
		burstTimeout && clearTimeout(burstTimeout);
		introTimeout && clearTimeout(introTimeout);
		resetTimeout && clearTimeout(resetTimeout);
	});
</script>

<div class="gifts" class:fadeout={fadingOut}>
	{#each glowBursts as gb, bi}
		<span class="glow-burst" style="--angle:{gb.angle}deg;--dist:{gb.dist}px;animation-delay:{bi*0.04}s;"></span>
	{/each}

	{#if step === 'feeling'}
		<div class="content {introDone ? 'show' : ''}">
			<p class="tagline">how are you feeling?</p>
			<p class="sub">pick one</p>
			<div class="feelings">
				{#each feelings as f, i}
					<button class="fbtn" onclick={(e) => { e.stopPropagation(); pickFeeling(i); }} aria-label={f.text}>
						<span>{f.text}</span>
					</button>
				{/each}
			</div>
			<button class="surprise-btn" onclick={(e) => { e.stopPropagation(); if (introDone) pickRandom(); }}><span class="sub">let fate decide</span></button>
		</div>
	{:else}
		<div class="payload {revealing ? 'show' : ''}">
			<p class="tag">{pickedFeeling.gift.title}</p>

			{#if revealed}
				<p class="body">{pickedFeeling.gift.body}</p>

				<div class="actions">
					<button class="go-back" onclick={reset}>← pick another</button>
				</div>
			{:else}
				<div class="loader"></div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.gifts {
		position: fixed; inset: 0;
		display: flex; align-items: center; justify-content: center; flex-direction: column;
		background: radial-gradient(ellipse at 50% 40%, #1e1230 0%, #0a0812 75%);
		padding: max(2rem, env(safe-area-inset-top)) 1.5rem max(6vh, env(safe-area-inset-bottom), 32px) 1.5rem;
		overflow-y: auto;
		transition: opacity 0.5s ease;
	}

	.fadeout { opacity: 0; pointer-events: none; }

	.content {
		max-width: min(420px,90vw); width: 100%; text-align: center;
		display: flex; flex-direction: column; align-items: center; gap: 1.5rem;
		opacity: 0; transform: translateY(10px);
		transition: opacity 0.6s ease, transform 0.6s ease;
	}

	.content.show { opacity: 1; transform: translateY(0); }

	.tagline {
		font-family: 'Playfair Display', Georgia, serif; font-style: italic;
		font-size: clamp(1.4rem,6vw,2rem); color: #f4d5c8;
	}

	.sub {
		font-size: 0.6rem; letter-spacing: 0.2em; text-transform: uppercase;
		color: rgba(240,235,227,0.18);
	}

	.feelings { display: flex; flex-direction: column; gap: 0.5rem; width: 100%; }

	.fbtn {
		width: 100%; padding: 1rem 1.4rem; text-align: left; border-radius: 12px;
		background: rgba(244,213,200,0.03); border: 1px solid rgba(244,213,200,0.07);
		color: rgba(240,235,227,0.45); font-size: 0.95rem; letter-spacing: 0.02em;
		transition: all 0.3s ease;
	}

	.fbtn:hover { background: rgba(244,213,200,0.07); color: rgba(240,235,227,0.65); }

	.payload {
		text-align: center; max-width: min(380px,85vw); width: 100%;
		opacity: 0; transform: scale(0.94) translateY(8px);
		display: flex; flex-direction: column; align-items: center; gap: 1.5rem;
		transition: opacity 0.7s ease, transform 0.7s ease;
	}

	.payload.show { opacity: 1; transform: scale(1) translateY(0); }

	.tag {
		font-size: 0.55rem; letter-spacing: 0.24em; text-transform: uppercase;
		color: rgba(240,235,227,0.18);
	}

	.body {
		font-size: clamp(1rem,4vw,1.15rem); line-height: 1.8;
		color: rgba(240,235,227,0.55); opacity: 0; animation: bodyIn 0.8s ease 0.3s forwards;
	}

	@keyframes bodyIn { to { opacity: 1; } }

	.actions { margin-top: 0.5rem; display: flex; gap: 1rem; align-items: center; justify-content: center; }

	.go-back {
		font-size: 0.6rem; letter-spacing: 0.18em; text-transform: uppercase;
		color: rgba(240,235,227,0.15); padding: 0.7rem 1.2rem; border-radius: 100px;
		border: 1px solid rgba(244,213,200,0.06); background: transparent;
		transition: color 0.3s ease, border-color 0.3s ease;
	}

	.go-back:hover { color: rgba(240,235,227,0.35); border-color: rgba(244,213,200,0.15); }

	.loader {
		width: 8px; height: 8px; border-radius: 50%;
		background: rgba(244,213,200,0.3);
		animation: loadPulse 1.2s ease-in-out infinite;
	}

	@keyframes loadPulse { 0%,100% { transform: scale(1); opacity: 0.3; } 50% { transform: scale(1.8); opacity: 0.7; } }

	.glow-burst {
		position: absolute; left: 50%; top: 40%;
		width: 3px; height: 3px; border-radius: 50%;
		background: rgba(244,213,200,0.7);
		animation: burstOut var(--dur, 1s) ease-out forwards;
	}

	@keyframes burstOut {
		to {
			transform: translate(-50%, -50%) rotate(var(--angle, 0deg)) translateY(calc(-1 * var(--dist, 30px))) scale(0);
			opacity: 0;
		}
	}

	.surprise-btn {
		margin-top: 1rem; font-size: 0.65rem; letter-spacing: 0.2em; text-transform: uppercase;
		color: rgba(240,235,227,0.18); background: transparent; border: none; cursor: pointer;
		transition: color 0.3s ease;
	}
	.surprise-btn:hover { color: rgba(244,213,200,0.5); }
</style>
