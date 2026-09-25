<script>
	import {onDestroy, onMount, untrack} from 'svelte';

	let {onProgress, initialFeeling = null, initiallyRevealed = false} = $props();
	const feelingAtStart = untrack(() => initialFeeling);
	const revealedAtStart = untrack(() => initiallyRevealed);

	const feelings = [
		{
			text: 'Something lovely',
			emoji: '🫧',
			vibe: 'a quiet truth, saved just for you',
			kind: 'quote',
			title: 'a gentle reminder',
			body: 'you are allowed to take up space. you always have been.',
		},
		{
			text: 'Something delicious',
			emoji: '🍫',
			vibe: 'a taste of the year ahead',
			kind: 'playful',
			title: 'a perfect blend',
			body: 'your day is one part dark chocolate, one part slow coffee, and the rest is all you. honestly, that ratio is perfect.',
		},
		{
			text: 'A little encouragement',
			emoji: '🪔',
			vibe: 'small words, honest strength',
			kind: 'message',
			title: 'truth for today',
			body: 'the things you survive become the things you understand. and that makes you rare.',
		},
		{
			text: 'Make me laugh',
			emoji: '🪐',
			vibe: 'okay, science time',
			kind: 'playful',
			title: 'a scientific fact',
			body: 'plutonium glows in the dark — and so does your screen if you look closely. you are currently holding glow. congratulations.',
		},
		{
			text: 'Something peaceful',
			emoji: '⭐',
			vibe: 'a tiny star, all yours',
			kind: 'interactive',
			title: 'your own star',
			interactiveLabel: 'press for your wish',
			body: 'there — it’s done. something good is already on its way this year.',
		},
		{
			text: 'Surprise me',
			emoji: '🎁',
			vibe: 'you chose the mystery door',
			kind: 'visual',
			title: 'a wish for your year',
			body: 'may this year hand you a few days you will look back on and grin about, for no reason at all.',
		},
	];

	const embers = [
		{left: '12%', rise: 140, drift: -18, edur: 9, delay: 0},
		{left: '28%', rise: 90, drift: 14, edur: 7, delay: 2.2},
		{left: '53%', rise: 120, drift: -10, edur: 8.4, delay: 1.1},
		{left: '71%', rise: 105, drift: 20, edur: 7.6, delay: 3},
		{left: '86%', rise: 130, drift: -14, edur: 9.4, delay: 0.6},
		{left: '93%', rise: 80, drift: 8, edur: 6.8, delay: 4.4},
	];

	const hasInitialFeeling = Number.isInteger(feelingAtStart) && Boolean(feelings[feelingAtStart]);
	let step = $state(hasInitialFeeling ? (revealedAtStart ? 'open' : 'vibe') : 'feeling');
	let pickedFeeling = $state(hasInitialFeeling ? feelings[feelingAtStart] : null);
	let feelingIdx = $state(hasInitialFeeling ? feelingAtStart : 0);
	let flipped = $state(hasInitialFeeling && revealedAtStart);
	let pressed = $state(hasInitialFeeling && revealedAtStart);
	let glowBursts = $state([]);
	let introDone = $state(hasInitialFeeling);
	let revealTimers = [];
	let burstTimeout;
	let introTimeout;

	function burstGlow() {
		const particles = Array.from({length: 14}, () => ({
			angle: Math.random()*360,
			dur: 0.6 + Math.random()*0.6,
			dist: 22 + Math.random()*42,
		}));
		glowBursts = particles;
		burstTimeout = setTimeout(() => { glowBursts = []; }, 1400);
	}

	function completeReveal() {
		flipped = true;
		onProgress?.(feelingIdx, true);
	}

	function pickFeeling(idx) {
		revealTimers.forEach(clearTimeout);
		feelingIdx = idx;
		pickedFeeling = feelings[idx];
		step = 'vibe';
		flipped = false;
		pressed = false;
		onProgress?.(idx, false);
	}

	function pickRandom() {
		let rIdx;
		do { rIdx = Math.floor(Math.random()*feelings.length); } while (rIdx === feelingIdx && feelings.length > 1);
		pickFeeling(rIdx);
	}

	function feelThis() {
		step = 'open';
		flipped = false;
		pressed = false;
		if (pickedFeeling.kind === 'interactive') return;
		revealTimers.push(setTimeout(completeReveal, 1100));
	}

	function pressStar() {
		if (pressed) return;
		pressed = true;
		burstGlow();
		revealTimers.push(setTimeout(completeReveal, 600));
	}

	function reset() {
		revealTimers.forEach(clearTimeout);
		step = 'feeling';
		flipped = false;
		pressed = false;
		pickedFeeling = null;
		introDone = true;
		onProgress?.(null, false);
	}

	onMount(() => {
		if (hasInitialFeeling && revealedAtStart) {
			onProgress?.(feelingAtStart, true);
			if (pickedFeeling.kind !== 'interactive') burstGlow();
		} else if (hasInitialFeeling) {
			onProgress?.(feelingAtStart, false);
		} else {
			introTimeout = setTimeout(() => { introDone = true; }, 400);
		}
	});

	onDestroy(() => {
		revealTimers.forEach(clearTimeout);
		burstTimeout && clearTimeout(burstTimeout);
		introTimeout && clearTimeout(introTimeout);
	});
</script>

<div class="gifts">
	{#each glowBursts as gb, bi}
		<span class="glow-burst" style="--angle:{gb.angle}deg;--dist:{gb.dist}px;animation-delay:{bi*0.05}s;"></span>
	{/each}

	{#each embers as em}
		<span class="ember" style="left:{em.left}%;--rise:{em.rise}px;--drift:{em.drift}px;--edur:{em.edur}s;animation-delay:{em.delay}s;"></span>
	{/each}

	{#if step === 'feeling'}
		<div class="content {introDone ? 'show' : ''}">
			<p class="tagline">how are you feeling?</p>
			<p class="sub">pick one</p>
			<div class="feelings">
				{#each feelings as f, i}
					<button class="fbtn" onclick={(e) => { e.stopPropagation(); pickFeeling(i); }} aria-label={f.text}>
						<span class="fb-emoji">{f.emoji}</span>
						<span>{f.text}</span>
					</button>
				{/each}
			</div>
			<button class="surprise-btn" onclick={(e) => { e.stopPropagation(); if (introDone) pickRandom(); }}><span class="sub">let fate decide</span></button>
		</div>
	{:else if step === 'vibe'}
		<div class="vibe-card show">
			<p class="vibe-text">“{pickedFeeling.vibe}”</p>
			<button class="feel-btn" onclick={feelThis}>feel this →</button>
			<button class="go-back" onclick={reset}>← different feeling</button>
		</div>
	{:else}
		<div class="payload show">
			{#if glowBursts.length}
				<span class="ring-burst" aria-hidden="true"></span>
			{/if}

			<div class="gift-head">
				{#if pickedFeeling.kind === 'interactive' && !pressed}
					<button class="star-btn" onclick={pressStar} aria-label="press to open your wish">
						<span class="star-emoji">⭐</span>
						<span class="press-label">{pickedFeeling.interactiveLabel}</span>
					</button>
				{:else}
					<span class="tile">{pickedFeeling.emoji}</span>
				{/if}
			</div>

			<p class="tag">{pickedFeeling.title}</p>

			{#if flipped}
				{#if pickedFeeling.kind === 'quote'}
					<blockquote class="quote-body">{pickedFeeling.body}</blockquote>
				{:else}
					<p class="body">{pickedFeeling.body}</p>
				{/if}

				<div class="actions">
					<button class="go-back" onclick={reset}>← open another</button>
				</div>

				<p class="next-hint">ready when you are — one last thing waits ✨</p>
			{:else}
				<div class="loader"></div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.gifts {
		position: fixed; inset: 0;
		display: flex; align-items: center; justify-content: center;
		background:
			radial-gradient(ellipse at 50% 32%, rgba(176,104,48,0.24) 0%, transparent 62%),
			radial-gradient(ellipse at 18% 82%, rgba(122,52,64,0.16) 0%, transparent 55%),
			radial-gradient(ellipse at 88% 78%, rgba(90,58,30,0.2) 0%, transparent 50%),
			linear-gradient(180deg, #2a1a10 0%, #150d07 70%, #100902 100%);
		padding: max(2rem, env(safe-area-inset-top)) 1.5rem max(6vh, env(safe-area-inset-bottom), 32px) 1.5rem;
		overflow-y: auto;
	}

	.ember {
		position: absolute; bottom: -4px;
		width: 3px; height: 3px; border-radius: 50%;
		background: rgba(255,200,130,0.55);
		filter: blur(0.5px);
		animation: emberRise var(--edur, 8s) ease-in infinite;
	}

	@keyframes emberRise {
		0% { transform: translate(0,0); opacity: 0; }
		8% { opacity: 0.75; }
		70% { opacity: 0.5; }
		100% { transform: translate(var(--drift, 0px), calc(-1 * var(--rise, 120px))); opacity: 0; }
	}

	.content {
		max-width: min(420px,90vw); width: 100%; text-align: center;
		display: flex; flex-direction: column; align-items: center; gap: 1.5rem;
		opacity: 0; transform: translateY(10px);
		transition: opacity 0.6s ease, transform 0.6s ease;
	}

	.content.show { opacity: 1; transform: translateY(0); }

	.tagline {
		font-family: 'Playfair Display', Georgia, serif; font-style: italic;
		font-size: clamp(1.4rem,6vw,2rem); color: #f6d9ad;
	}

	.sub {
		font-size: 0.6rem; letter-spacing: 0.2em; text-transform: uppercase;
		color: rgba(246,217,173,0.18);
	}

	.feelings { display: flex; flex-direction: column; gap: 0.5rem; width: 100%; }

	.fbtn {
		width: 100%; padding: 0.9rem 1.2rem; text-align: left; border-radius: 14px;
		background: rgba(246,217,173,0.04); border: 1px solid rgba(246,217,173,0.1);
		color: rgba(248,232,200,0.55); font-size: 0.95rem; letter-spacing: 0.02em;
		display: flex; align-items: center; gap: 0.8rem;
		transition: all 0.3s ease;
	}

	.fbtn:hover { background: rgba(246,217,173,0.08); color: rgba(248,232,200,0.78); transform: translateY(-2px); }
	.fbtn:active { transform: scale(0.98); }

	.fb-emoji { font-size: 1.2rem; filter: drop-shadow(0 2px 6px rgba(246,217,173,0.3)); }

	.vibe-card {
		max-width: min(400px, 86vw); width: 100%; text-align: center;
		display: flex; flex-direction: column; align-items: center; gap: 1.6rem;
		opacity: 0; transform: translateY(10px);
		animation: cardIn 0.6s ease 0.1s forwards;
	}

	@keyframes cardIn { to { opacity: 1; transform: translateY(0); } }

	.vibe-text {
		font-family: 'Playfair Display', Georgia, serif; font-style: italic;
		font-size: clamp(1.2rem, 5vw, 1.6rem); line-height: 1.6; color: #f6d9ad;
	}

	.feel-btn {
		border: none; border-radius: 100px;
		padding: 1rem 2.4rem;
		background: linear-gradient(135deg, #7a4a26, #a45f30);
		color: #fff; font-weight: 600; font-size: 1.05rem;
		box-shadow: 0 14px 30px rgba(0,0,0,0.4), 0 0 26px rgba(255,190,120,0.22);
		transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
	}

	.feel-btn:hover { transform: translateY(-3px) scale(1.03); }
	.feel-btn:active { transform: translateY(0) scale(0.97); }

	.payload {
		text-align: center; max-width: min(380px,85vw); width: 100%;
		display: flex; flex-direction: column; align-items: center; gap: 1.3rem;
		opacity: 0; transform: translateY(10px);
		animation: cardIn 0.7s ease 0.05s forwards;
	}

	.gift-head { min-height: 76px; display: flex; align-items: center; justify-content: center; }

	.tile {
		font-size: 2.4rem; line-height: 1;
		filter: drop-shadow(0 4px 14px rgba(246,217,173,0.35));
		animation: tileIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both;
	}

	@keyframes tileIn {
		from { opacity: 0; transform: scale(0.4) rotate(-14deg); }
		to { opacity: 1; transform: scale(1) rotate(0deg); }
	}

	.star-btn {
		display: flex; flex-direction: column; align-items: center; gap: 0.6rem;
		background: transparent; border: none; cursor: pointer; padding: 0.4rem;
	}

	.star-emoji {
		font-size: 3rem; line-height: 1;
		filter: drop-shadow(0 0 18px rgba(255,200,110,0.55));
		animation: starPulse 2.2s ease-in-out infinite;
	}

	.star-btn:hover .star-emoji, .star-btn:active .star-emoji {
		transform: scale(1.18) rotate(8deg);
		filter: drop-shadow(0 0 26px rgba(255,210,120,0.85));
		transition: transform 0.2s ease, filter 0.2s ease;
	}

	@keyframes starPulse {
		0%, 100% { transform: scale(1); }
		50% { transform: scale(1.12); }
	}

	.press-label {
		font-size: 0.7rem; letter-spacing: 0.2em; text-transform: uppercase;
		color: rgba(246,217,173,0.55);
	}

	.tag {
		font-size: 0.55rem; letter-spacing: 0.24em; text-transform: uppercase;
		color: rgba(248,232,200,0.25);
	}

	.quote-body {
		font-family: 'Playfair Display', Georgia, serif; font-style: italic;
		font-size: clamp(1.15rem, 4.6vw, 1.45rem); line-height: 1.8;
		color: rgba(246,217,173,0.9);
		opacity: 0; animation: bodyIn 0.9s ease 0.25s forwards;
	}

	.body {
		font-size: clamp(1rem,4vw,1.15rem); line-height: 1.8;
		color: rgba(248,232,200,0.6); opacity: 0; animation: bodyIn 0.9s ease 0.25s forwards;
	}

	@keyframes bodyIn { to { opacity: 1; } }

	.actions { margin-top: 0.4rem; display: flex; gap: 1rem; align-items: center; justify-content: center; }

	.next-hint {
		font-size: 0.72rem; letter-spacing: 0.14em;
		color: rgba(246,217,173,0.4);
		opacity: 0; animation: bodyIn 1s ease 0.9s forwards;
	}

	.go-back {
		font-size: 0.6rem; letter-spacing: 0.18em; text-transform: uppercase;
		color: rgba(248,232,200,0.25); padding: 0.7rem 1.2rem; border-radius: 100px;
		border: 1px solid rgba(246,217,173,0.1); background: transparent;
		transition: color 0.3s ease, border-color 0.3s ease;
	}

	.go-back:hover { color: rgba(248,232,200,0.55); border-color: rgba(246,217,173,0.22); }

	.loader {
		width: 8px; height: 8px; border-radius: 50%;
		background: rgba(246,217,173,0.35);
		animation: loadPulse 1.2s ease-in-out infinite;
	}

	@keyframes loadPulse { 0%,100% { transform: scale(1); opacity: 0.3; } 50% { transform: scale(1.8); opacity: 0.7; } }

	.ring-burst {
		position: absolute; left: 50%; top: 50%;
		width: 120px; height: 120px; margin: -60px 0 0 -60px;
		border-radius: 50%;
		border: 1px solid rgba(246,217,173,0.45);
		animation: ringGrow 0.9s ease-out forwards;
		pointer-events: none;
	}

	@keyframes ringGrow {
		from { transform: scale(0.2); opacity: 0.9; }
		to { transform: scale(1.6); opacity: 0; }
	}

	.glow-burst {
		position: absolute; left: 50%; top: 50%;
		width: 3px; height: 3px; border-radius: 50%;
		background: rgba(246,217,173,0.65);
		animation: burstOut var(--dur, 0.9s) ease-out forwards;
	}

	@keyframes burstOut {
		to {
			transform: translate(-50%, -50%) rotate(var(--angle, 0deg)) translateY(calc(-1 * var(--dist, 30px))) scale(0);
			opacity: 0;
		}
	}

	.surprise-btn {
		margin-top: 1rem; font-size: 0.65rem; letter-spacing: 0.2em; text-transform: uppercase;
		color: rgba(248,232,200,0.25); background: transparent; border: none; cursor: pointer;
		transition: color 0.3s ease;
	}
	.surprise-btn:hover { color: rgba(246,217,173,0.55); }

	@media (prefers-reduced-motion: reduce) {
		.fbtn, .feel-btn { transition: none; }
		.fbtn:hover, .feel-btn:hover { transform: none; }
		.vibe-card, .payload, .tile, .star-btn .star-emoji, .quote-body, .body, .next-hint { animation: none; opacity: 1; }
		.star-emoji, .loader, .ring-burst { animation: none !important; }
		.star-btn .star-emoji { transform: none; }
		.glow-burst { animation: none !important; opacity: 0; }
		.ember { display: none; }
	}
</style>