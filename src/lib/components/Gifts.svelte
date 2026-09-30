<script>
	import {onDestroy, onMount, untrack} from 'svelte';
	import {card, fill} from '$lib/config/card.svelte.js';

	let {onProgress, initialFeeling = null, initiallyRevealed = false} = $props();
	const feelingAtStart = untrack(() => initialFeeling);
	const revealedAtStart = untrack(() => initiallyRevealed);

	const feelings = $derived(card.gifts.map((g) => ({ ...g, text: fill(g.text), title: fill(g.title), body: fill(g.body), vibe: fill(g.vibe), hint: fill(g.hint), interactiveLabel: fill(g.interactiveLabel), wish: fill(g.wish) })));
	const screenCopy = $derived(card.settings.giftsScreen);

	const embers = [
		{left: '8%', rise: 140, drift: -18, edur: 9, delay: 0},
		{left: '26%', rise: 90, drift: 14, edur: 7, delay: 2.2},
		{left: '51%', rise: 120, drift: -10, edur: 8.4, delay: 1.1},
		{left: '69%', rise: 105, drift: 20, edur: 7.6, delay: 3},
		{left: '85%', rise: 130, drift: -14, edur: 9.4, delay: 0.6},
		{left: '94%', rise: 80, drift: 8, edur: 6.8, delay: 4.4},
	];

	const stars = Array.from({length: 40}, (_, i) => ({
		x: (i * 61) % 100,
		y: (i * 47) % 100,
		dur: 3 + (i % 8),
		del: (i % 11) * 0.6,
	}));

	const hasInitialFeeling = Number.isInteger(feelingAtStart) && Boolean(feelings[feelingAtStart]);
	let step = $state(hasInitialFeeling ? 'open' : 'feeling');
	let pickedFeeling = $state(hasInitialFeeling ? feelings[feelingAtStart] : null);
	let feelingIdx = $state(hasInitialFeeling ? feelingAtStart : 0);
	let flipped = $state(false);
	let pressed = $state(false);
	let glowBursts = $state([]);
	let placements = $state([]);
	let introDone = $state(hasInitialFeeling);
	let revealTimers = [];
	let burstTimeout;
	let introTimeout;

	const burstGlow = () => {
		const particles = Array.from({length: 18}, () => ({
			angle: Math.random() * 360,
			dur: 0.6 + Math.random() * 0.7,
			dist: 26 + Math.random() * 52,
		}));
		glowBursts = particles;
		burstTimeout = setTimeout(() => { glowBursts = []; }, 1400);
	}

	const completeReveal = () => {
		flipped = true;
		onProgress?.(feelingIdx, true);
	}

	const pickFeeling = (idx) => {
		revealTimers.forEach(clearTimeout);
		feelingIdx = idx;
		pickedFeeling = feelings[idx];
		step = 'open';
		flipped = false;
		pressed = false;
		onProgress?.(idx, false);
		if (pickedFeeling.kind !== 'interactive') {
			burstGlow();
			revealTimers.push(setTimeout(completeReveal, 1200));
		}
	}

	const pickRandom = () => {
		let rIdx;
		do { rIdx = Math.floor(Math.random() * feelings.length); } while (rIdx === feelingIdx && feelings.length > 1);
		pickFeeling(rIdx);
	}

	const pressStar = () => {
		if (pressed) return;
		pressed = true;
		burstGlow();
		revealTimers.push(setTimeout(completeReveal, 600));
	}

	const reset = () => {
		revealTimers.forEach(clearTimeout);
		step = 'feeling';
		flipped = false;
		pressed = false;
		pickedFeeling = null;
		introDone = true;
		onProgress?.(null, false);
	}

	onMount(() => {
		placements = feelings.map((_, i) => ({
			x: 18 + (i % 3) * 33 + Math.random() * 5,
			y: 4 + Math.floor(i / 3) * 33 + Math.random() * 12,
			tilt: (Math.random() * 8 - 4).toFixed(1),
			w: 74 + (i % 4) * 10,
		}));
		if (hasInitialFeeling) {
			if (revealedAtStart) {
				onProgress?.(feelingAtStart, true);
				flipped = true;
				if (pickedFeeling.kind !== 'interactive') burstGlow();
			} else {
				onProgress?.(feelingAtStart, false);
				if (pickedFeeling.kind !== 'interactive') {
					revealTimers.push(setTimeout(completeReveal, 1200));
				}
			}
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
	{#each stars as st}
		<span class="star" style="--sx:{st.x}%;--sy:{st.y}%;--sdur:{st.dur}s;--sdel:{st.del}s;"></span>
	{/each}

	{#each glowBursts as gb, bi}
		<span class="glow-burst" style="--angle:{gb.angle}deg;--dist:{gb.dist}px;--ddur:{gb.dur}s;animation-delay:{bi*0.04}s;"></span>
	{/each}

	{#each embers as em}
		<span class="ember" style="left:{em.left}%;--rise:{em.rise}px;--drift:{em.drift}px;--edur:{em.edur}s;animation-delay:{em.delay}s;"></span>
	{/each}

	{#if step === 'feeling'}
		<div class="content {introDone ? 'show' : ''}">
			<p class="tagline">{screenCopy.tagline}</p>
			<p class="sub">{screenCopy.sub}</p>

			<div class="boxes">
				{#if placements.length}
					{#each feelings as f, i}
						<button
							class="gbox"
							style="--accent:{f.accent};left:{placements[i].x}%;top:{placements[i].y}%;--bw:{placements[i].w}px;--tw:{placements[i].tilt}deg;"
							onclick={(e) => { e.stopPropagation(); pickFeeling(i); }}
							aria-label={`open ${f.text}`}
						>
							<span class="lid"></span>
							<span class="ribbon-r"></span>
							<span class="ribbon-l"></span>
							<span class="bow">
								<span class="bow-s"></span>
							</span>
							<span class="gb-emoji">{f.emoji}</span>
							<span class="hangtag">{f.hint}</span>
						</button>
					{/each}
				{/if}
			</div>

			<button class="surprise-btn" onclick={(e) => { e.stopPropagation(); if (introDone) pickRandom(); }}><span class="sub">{screenCopy.surprise}</span></button>
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
			<p class="vibe-text">{pickedFeeling.vibe}</p>

			{#if flipped}
				{#if pickedFeeling.kind === 'quote'}
					<blockquote class="quote-body">{pickedFeeling.body}</blockquote>
				{:else}
					<p class="body">{pickedFeeling.body}</p>
				{/if}

				<div class="actions">
					<button class="go-back" onclick={reset}>{screenCopy.openAnother}</button>
				</div>

				<p class="next-hint">{screenCopy.nextHint}</p>
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
			radial-gradient(ellipse at 50% 18%, rgba(176,104,48,0.16) 0%, transparent 55%),
			radial-gradient(ellipse at 12% 88%, rgba(122,31,43,0.14) 0%, transparent 52%),
			radial-gradient(ellipse at 90% 80%, rgba(90,58,30,0.18) 0%, transparent 48%),
			linear-gradient(180deg, #170d12 0%, #120a12 55%, #0d0705 100%);
		padding: max(2rem, env(safe-area-inset-top)) 1.5rem max(6vh, env(safe-area-inset-bottom), 32px) 1.5rem;
		overflow-y: auto;
	}

	.star {
		position: absolute; left: var(--sx); top: var(--sy);
		width: 2px; height: 2px; border-radius: 50%;
		background: rgba(246,217,173,0.7);
		animation: twinkle var(--sdur) ease-in-out infinite var(--sdel);
	}

	@keyframes twinkle {
		0%,100% { opacity: 0.12; }
		50% { opacity: 0.5; }
	}

	.ember {
		position: absolute; bottom: -4px;
		width: 3px; height: 3px; border-radius: 50%;
		background: rgba(255,200,130,0.5);
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
		max-width: min(460px, 92vw); width: 100%; text-align: center;
		display: flex; flex-direction: column; align-items: center; gap: 1.4rem;
		opacity: 0; transform: translateY(10px);
		transition: opacity 0.6s ease, transform 0.6s ease;
	}

	.content.show { opacity: 1; transform: translateY(0); }

	.tagline {
		font-family: 'Playfair Display', Georgia, serif;
		font-size: clamp(1.5rem, 6vw, 2.1rem); color: #f6d9ad;
		letter-spacing: 0.02em;
	}

	.sub {
		font-size: 0.6rem; letter-spacing: 0.2em; text-transform: uppercase;
		color: rgba(246,217,173,0.32);
	}

	/* Scattered boxes */
	.boxes {
		position: relative;
		width: min(88vw, 460px);
		height: clamp(300px, 46vh, 480px);
		margin: 0.4rem auto 0;
		perspective: 900px;
	}

	.gbox {
		position: absolute;
		left: 0; top: 0;
		transform: translate(-50%, -50%) rotate(var(--tw, 0deg));
		width: var(--bw, 100px);
		height: calc(var(--bw, 100px) * 1.12);
		padding: 0;
		border: 1px solid rgba(246,217,173,0.16);
		border-radius: 12px;
		background:
			radial-gradient(circle at 30% 20%, rgba(255,255,255,0.09), transparent 45%),
			linear-gradient(180deg, color-mix(in srgb, var(--accent) 82%, #fff 18%) 0%, var(--accent) 58%, color-mix(in srgb, var(--accent) 78%, #000 22%) 100%);
		box-shadow: 0 14px 26px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.16);
		cursor: pointer;
		animation: boxDrop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both;
		transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
		touch-action: manipulation;
	}

	.gbox:nth-child(3n) { animation-delay: 0.05s; }
	.gbox:nth-child(2n) { animation-delay: 0.1s; }
	.gbox:nth-child(5n) { animation-delay: 0.16s; }

	@keyframes boxDrop {
		from { opacity: 0; transform: translate(-50%, -50%) translateY(-26px) rotateX(46deg) scale(0.85); }
		to { opacity: 1; transform: translate(-50%, -50%) rotate(var(--tw, 0deg)) scale(1); }
	}

	.gbox:hover, .gbox:focus-visible { transform: translate(-50%, calc(-50% - 6px)) rotate(var(--tw, 0deg)) scale(1.03); box-shadow: 0 22px 34px rgba(0,0,0,0.55), 0 0 26px color-mix(in srgb, var(--accent) 65%, transparent); outline: none; }
	.gbox:active { transform: translate(-50%, -50%) rotate(var(--tw, 0deg)) scale(0.95); transition-duration: 0.1s; }

	/* lid */
	.lid {
		position: absolute; left: -5%; right: -5%; top: -7%;
		height: 30%;
		border-radius: 9px;
		background: linear-gradient(180deg, color-mix(in srgb, var(--accent) 78%, #fff 22%) 0%, var(--accent) 90%);
		box-shadow: inset 0 1px 0 rgba(255,255,255,0.22), 0 6px 12px rgba(0,0,0,0.3);
	}

	/* ribbons */
	.ribbon-r, .ribbon-l {
		position: absolute; top: -12%; width: 22%; height: 122%;
	}

	.ribbon-r { left: 40%; transform: rotate(16deg); background: rgba(24,14,8,0.55); }
	.ribbon-l { right: 40%; transform: rotate(-16deg); background: rgba(24,14,8,0.55); }

	.bow {
		position: absolute; top: -17%; left: 50%;
		width: 30px; height: 30px; margin-left: -15px;
		display: flex; align-items: center; justify-content: center;
	}

	.bow-s {
		width: 100%; height: 100%;
		border-radius: 50% 50% 8% 8%;
		background: radial-gradient(circle at 35% 30%, #3a2010, #1c1008 65%);
		box-shadow: 0 4px 8px rgba(0,0,0,0.5);
	}

	.gb-emoji {
		position: absolute; top: 30%; left: 50%;
		transform: translateX(-50%);
		font-size: 1.25rem; line-height: 1;
		filter: drop-shadow(0 2px 6px rgba(0,0,0,0.5));
	}

	.hangtag {
		position: absolute; bottom: 8px; left: 50%;
		transform: translateX(-50%);
		white-space: normal;
		width: calc(100% - 12px);
		padding: 0.32rem 0.4rem;
		display: flex; align-items: center; justify-content: center;
		border-radius: 4px;
		font-size: 0.5rem; line-height: 1.4; letter-spacing: 0.08em; text-transform: uppercase;
		text-align: center;
		color: #fcecd2;
		background: rgba(18,10,6,0.82);
		border: 1px solid rgba(246,217,173,0.14);
		overflow: visible;
	}

	.surprise-btn {
		margin-top: 0.4rem; font-size: 0.65rem; letter-spacing: 0.2em; text-transform: uppercase;
		color: rgba(248,232,200,0.35); background: transparent; border: none; cursor: pointer;
		transition: color 0.3s ease, text-shadow 0.3s ease;
	}

	.surprise-btn:hover { color: rgba(246,217,173,0.75); text-shadow: 0 0 14px rgba(246,217,173,0.4); }

	/* Payload — unchanged affordances */
	.payload {
		text-align: center; max-width: min(380px, 85vw); width: 100%;
		display: flex; flex-direction: column; align-items: center; gap: 1.1rem;
		opacity: 0; transform: translateY(10px);
		animation: cardIn 0.7s ease 0.05s forwards;
	}

	@keyframes cardIn { to { opacity: 1; transform: translateY(0); } }

	.vibe-text {
		font-size: 0.62rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: rgba(246,217,173,0.45);
	}

	.gift-head { min-height: 76px; display: flex; align-items: center; justify-content: center; }

	.tile {
		font-size: 2.5rem; line-height: 1;
		filter: drop-shadow(0 4px 16px rgba(246,217,173,0.4));
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
		font-family: 'Playfair Display', Georgia, serif;
		font-weight: 400;
		font-size: clamp(1.5rem, 6vw, 2.1rem);
		line-height: 1.25;
		color: #f6d9ad;
		letter-spacing: 0.02em;
	}

	.quote-body {
		font-size: clamp(1rem, 4.2vw, 1.2rem); line-height: 1.8;
		color: rgba(246,217,173,0.88);
		opacity: 0; animation: bodyIn 0.9s ease 0.25s forwards;
	}

	.body {
		font-size: clamp(1rem, 4.2vw, 1.2rem); line-height: 1.8;
		color: rgba(246,217,173,0.88); opacity: 0; animation: bodyIn 0.9s ease 0.25s forwards;
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
		color: rgba(248,232,200,0.28); padding: 0.7rem 1.2rem; border-radius: 100px;
		border: 1px solid rgba(246,217,173,0.12); background: transparent;
		transition: color 0.3s ease, border-color 0.3s ease;
	}

	.go-back:hover { color: rgba(248,232,200,0.6); border-color: rgba(246,217,173,0.25); }

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
		background: rgba(246,217,173,0.7);
		animation: burstOut var(--ddur, 0.9s) ease-out forwards;
	}

	@keyframes burstOut {
		to {
			transform: translate(-50%, -50%) rotate(var(--angle, 0deg)) translateY(calc(-1 * var(--dist, 30px))) scale(0);
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.gbox { animation: none; transition: none; }
		.gbox:hover, .gbox:focus-visible { transform: none; box-shadow: 0 14px 26px rgba(0,0,0,0.45); }
		.payload, .tile, .star-btn .star-emoji, .quote-body, .body, .next-hint, .vibe-text { animation: none; opacity: 1; }
		.star-emoji, .loader, .ring-burst, .star { animation: none !important; }
		.glow-burst { animation: none !important; opacity: 0; }
		.ember { display: none; }
	}
</style>