<script>
	import { onDestroy, onMount } from 'svelte';
	import { card } from '$lib/config/card.svelte.js';

	const DEFAULT_WISHES = [
		'you’ve shared some parts of yourself already',
		'they’re the kind of parts people are lucky to know',
		'and the parts still left to show are the best kind of gift',
		'and a whole year that’s kinder to you than you expect. happy birthday.',
	];

	let { name = 'you', wishes = DEFAULT_WISHES, treatLeft = '🌞', treatRight = '🧡', photoUrl = '', onReady, onFinish, onRestart } = $props();

	const TITLE_MS = 4000;
	const SHOT_MS = 33000;
	const END_MS = 6000;

	const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '/');
	const SONG_SRC = `${BASE}songs/retro.mp3`;
	// A card's own uploaded photo wins; otherwise fall back to the bundled
	// static/reel-photos cutout, then to the generated placeholder scene.
	const CANDS = $derived(
		photoUrl ? [photoUrl] : [1].map((n) => `${BASE}reel-photos/${String(n).padStart(2, '0')}.png`)
	);
	const ALTS = $derived(
		photoUrl ? [] : [1].map((n) => `${BASE}reel-photos/${String(n).padStart(2, '0')}.jpg`)
	);

	const copy = $derived(card.settings.reel);

	const EMOJIS = ['🌸', '🌺', '🌷', '🌼', '🏵️', '🌸', '🌺', '🌻'];
	const PAL = [
		['#ffd166', '#ff6b9d'],
		['#6bc3ff', '#9b6bff'],
		['#ff6b9d', '#ffb347'],
		['#7dffb0', '#6bc3ff'],
	];

	const FLOWERS = [
		{ e: '🌸', l: 6, t: 4, s: 1.5, del: 0.0, dur: 1.1 },
		{ e: '🌺', l: 16, t: 7, s: 1.2, del: 0.3, dur: 1.3 },
		{ e: '🌷', l: 8, t: 14, s: 1.1, del: 0.6, dur: 1.0 },
		{ e: '🌼', l: 19, t: 16, s: 1.4, del: 0.4, dur: 1.2 },
		{ e: '🌼', l: 78, t: 4, s: 1.4, del: 0.2, dur: 1.15 },
		{ e: '🌸', l: 88, t: 8, s: 1.2, del: 0.5, dur: 1.35 },
		{ e: '🏵️', l: 80, t: 15, s: 1.1, del: 0.7, dur: 1.05 },
		{ e: '🌺', l: 90, t: 17, s: 1.5, del: 0.3, dur: 1.25 },
		{ e: '🌷', l: 7, t: 78, s: 1.5, del: 0.4, dur: 1.2 },
		{ e: '🌸', l: 17, t: 82, s: 1.1, del: 0.7, dur: 1.0 },
		{ e: '🌼', l: 9, t: 90, s: 1.3, del: 0.2, dur: 1.3 },
		{ e: '🌺', l: 18, t: 90, s: 1.2, del: 0.5, dur: 1.1 },
		{ e: '🌺', l: 80, t: 80, s: 1.5, del: 0.1, dur: 1.25 },
		{ e: '🌼', l: 90, t: 84, s: 1.2, del: 0.4, dur: 1.05 },
		{ e: '🌸', l: 82, t: 91, s: 1.1, del: 0.6, dur: 1.35 },
		{ e: '🌷', l: 92, t: 92, s: 1.4, del: 0.3, dur: 1.15 },
	];

	const BALLOONS = [
		{ x: 5, s: 2.0, d: 6.7, y: -80 },
		{ x: 14, s: 1.6, d: 7.2, y: -88 },
		{ x: 23, s: 2.3, d: 6.6, y: -74 },
		{ x: 32, s: 1.5, d: 7.8, y: -91 },
		{ x: 41, s: 1.9, d: 7.0, y: -82 },
		{ x: 50, s: 1.4, d: 8.2, y: -93 },
		{ x: 59, s: 2.1, d: 6.8, y: -78 },
		{ x: 68, s: 1.6, d: 7.5, y: -89 },
		{ x: 77, s: 2.2, d: 6.9, y: -76 },
		{ x: 86, s: 1.5, d: 8.0, y: -90 },
		{ x: 93, s: 1.9, d: 7.3, y: -84 },
		{ x: 46, s: 1.8, d: 8.4, y: -70 },
	];

	const flashMsg = `⚡ Happy Birthday, ${name} ⚡`;

	let phase = $state('boot');
	let seg = $state(-1);
	let transOpen = $state(false);
	let transType = $state(0);
	let songBroken = $state(false);
	let timecode = $state('');
	let timers = [];
	let clockTimer = 0;
	let sfx = null;
	let song = null;
	let ended = false;
	let available = [];
	let failed = $state([]);
	let probed = false;

	const NUM_SEGS = 2 + CANDS.length;

	const probe = () => {
		if (probed || typeof window === 'undefined') return;
		probed = true;
		let pending = CANDS.length;
		const resolve = (i, src) => {
			if (available[i] === undefined && src) available[i] = src;
			if (--pending === 0) done();
		};
		CANDS.forEach((src, i) => {
			const im = new Image();
			im.onload = () => resolve(i, src);
			im.onerror = () => {
				const alt = new Image();
				alt.onload = () => resolve(i, ALTS[i]);
				alt.onerror = () => resolve(i, null);
				alt.src = ALTS[i];
			};
			im.src = src;
		});
	}

	const done = () => {};

	const shotFor = () => {
		if (available.length === 0) return { fk: true };
		return { fk: false, file: available[0] };
	}

	const clickSfx = () => {
		if (!sfx || !sfx.state || sfx.state !== 'running') return;
		try {
			const t0 = sfx.currentTime;
			const buf = sfx.createBuffer(1, Math.floor(sfx.sampleRate * 0.045), sfx.sampleRate);
			const d = buf.getChannelData(0);
			for (let i = 0; i < d.length; i++) {
				const env = 1 - i / d.length;
				d[i] = (Math.random() * 2 - 1) * env * env;
			}
			const src = sfx.createBufferSource();
			src.buffer = buf;
			const g = sfx.createGain();
			g.gain.value = 0.32;
			const f = sfx.createBiquadFilter();
			f.type = 'highpass';
			f.frequency.value = 1200;
			src.connect(f).connect(g).connect(sfx.destination);
			src.start(t0);
		} catch {}
	}

	const chimeSfx = () => {
		if (!sfx || !sfx.state || sfx.state !== 'running') return;
		try {
			const t0 = sfx.currentTime;
			[880, 1108, 1318].forEach((freq, i) => {
				const osc = sfx.createOscillator();
				const g = sfx.createGain();
				osc.type = 'sine';
				osc.frequency.value = freq;
				g.gain.setValueAtTime(0, t0);
				g.gain.linearRampToValueAtTime(0.16, t0 + 0.015 + i * 0.05);
				g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.8 + i * 0.05);
				osc.connect(g).connect(sfx.destination);
				osc.start(t0);
				osc.stop(t0 + 1);
			});
		} catch {}
	}

	const start = () => {
		if (phase !== 'boot' || typeof window === 'undefined') return;
		probe();
		try {
			sfx = new (window.AudioContext || window.webkitAudioContext)();
			sfx.resume();
		} catch {}
		song = new Audio(SONG_SRC);
		song.volume = 0.6;
		song.addEventListener('error', () => {
			songBroken = true;
		});
		const p = song.play();
		if (p) p.catch(() => {
			songBroken = true;
		});
		phase = 'playing';
		seg = 0;
		clickSfx();
		chimeSfx();
		clockTimer = window.setInterval(() => {
			const n = new Date();
			const p2 = (x) => String(x).padStart(2, '0');
			timecode = `${p2(n.getDate())}/${p2(n.getMonth() + 1)}/${String(n.getFullYear()).slice(2)} ${p2(n.getHours())}:${p2(n.getMinutes())}:${p2(n.getSeconds())}`;
		}, 1000);
		schedule(curMs());
	}

	const curMs = () => {
		if (seg === 0) return TITLE_MS;
		if (seg === NUM_SEGS - 1) return END_MS;
		return SHOT_MS;
	}

	const advanceCut = () => {
		if (phase !== 'playing' || ended) return;
		const next = seg + 1;
		if (next >= NUM_SEGS) {
			finish();
			return;
		}
		seg = next;
		transOpen = true;
		transType = (transType + 1) % 6;
		clickSfx();
		schedule(curMs());
	}

	const schedule = (ms) => {
		timers.push(window.setTimeout(advanceCut, ms));
	}

	const finish = () => {
		if (ended) return;
		ended = true;
		try { song?.pause?.(); } catch {}
		phase = 'ending';
		timers.push(
			window.setTimeout(() => {
				phase = 'done';
				onReady?.();
				window.setTimeout(() => onFinish?.(), 900);
			}, 400)
		);
	}

	const skip = () => {
		if (ended) return;
		if (phase === 'boot') {
			start();
			finish();
			return;
		}
		finish();
	}

	onMount(() => probe());

	onDestroy(() => {
		timers.forEach((t) => clearTimeout(t));
		if (clockTimer) clearInterval(clockTimer);
		try { song?.pause?.(); } catch {}
		if (sfx && sfx.state === 'running') sfx.close().catch(() => {});
	});
</script>

<div class="reel" role="region" aria-label="retro birthday reel">
	{#key seg}
		{#if seg === 0 && phase === 'playing'}
			<div class="title-card">
				<div class="sunburst" aria-hidden="true"></div>
				<p class="cap gold big">Happy Birthday,</p>
				<p class="cap magenta sub">{name}</p>
				<span class="clipart-star">✦</span>
			</div>
		{:else if seg === NUM_SEGS - 1}
			<div class="end-card">
				<h1 class="msg-title">
					<span class="tword">Happy</span>
					<span class="tword">Birthday,</span>
					<span class="tword gold">{name}</span>
				</h1>

				<div class="festoon" aria-hidden="true">
					<span class="rule"></span>
					<span class="diamond">✦</span>
					<span class="rule"></span>
				</div>

				<div class="wishes">
					<p class="wish">{wishes[0]}<br/>{wishes[1]}</p>
					<p class="wish">{wishes[2]}</p>
					<p class="wish last">{wishes[3]}</p>
				</div>

				<div class="heart-wrap" aria-hidden="true">
					<span class="halo"></span>
					<span class="side treat-left">{treatLeft}</span>
					<span class="side treat-right">{treatRight}</span>
					<svg width="30" height="28" viewBox="0 0 28 26" fill="none">
						<path d="M14 24.5C14 24.5 2 16.5 2 9.5C2 5.5 5 3 8.5 3C10.8 3 13 4.5 14 6.5C15 4.5 17.2 3 19.5 3C23 3 26 5.5 26 9.5C26 16.5 14 24.5 14 24.5Z" fill="rgba(244,200,180,0.45)" />
					</svg>
				</div>

				<p class="end-mark">{copy.endMark}</p>

				{#if onRestart}
					<button class="restart-btn" type="button" onclick={onRestart} aria-label="Start the whole experience over">↺ from the top</button>
				{/if}
			</div>
		{:else if seg > 0 && seg < NUM_SEGS - 1 && phase === 'playing'}
			<div class="shot">
				<div class="photo-box {seg === 1 ? 'in' : ''}">
					{#if shotFor().fk || failed.includes(seg - 1)}
						<div class="fallback" style="--c1:{PAL[(seg - 1) % 4][0]}; --c2:{PAL[(seg - 1) % 4][1]};" aria-hidden="true">
							<span class="fb-emoji">{EMOJIS[(seg - 1) % EMOJIS.length]}</span>
						</div>
					{:else}
						<img
							class="ph"
							src={shotFor().file}
							alt=""
							draggable="false"
							onerror={() => {
								if (!failed.includes(seg - 1)) failed = [...failed, seg - 1];
							}}
						/>
					{/if}
				</div>

				<div class="egg {seg === 1 ? 'in' : ''}" aria-hidden="true">
					<span class="e-body {seg === 1 ? 'in' : ''}"></span>
					<span class="e-crack {seg === 1 ? 'in' : ''}"></span>
					<span class="e-half e-l {seg === 1 ? 'in' : ''}"></span>
					<span class="e-half e-r {seg === 1 ? 'in' : ''}"></span>
				</div>

				<div class="cake-wrap {seg === 1 ? 'in' : ''}" aria-hidden="true">
					<div class="cake">🎂</div>
				</div>

				<div class="balloons" aria-hidden="true">
					{#each BALLOONS as b}
						<span
							class="balloon"
							style="--bx:{b.x}%; --bs:{b.s}rem; --bd:{b.d}s; --by:{b.y}vh;"
						><span class="balloon-bob">🎈</span></span>
					{/each}
				</div>

				<div class="corner-cam" aria-hidden="true">
					<div class="cam-body">
						<span class="cam-grip"></span>
						<span class="cam-lens"></span>
						<span class="cam-led"></span>
						<span class="cam-flash"></span>
					</div>
				</div>

				<div class="side-fx" aria-hidden="true">
					{#each FLOWERS as f}
						<span
							class="flower"
							style="--fl:{f.l}%; --ft:{f.t}%; --fs:{f.s}rem; --fd:{f.del}s; --fdur:{f.dur}s;"
						>{f.e}</span>
					{/each}
				</div>
			</div>
		{/if}
	{/key}

	{#if phase === 'playing' && seg > 0 && seg < NUM_SEGS - 1}
		<h2 class="flashmsg">{flashMsg}</h2>
	{/if}

	{#if transOpen}
		{#key transType}
			<div class="trans t{transType}" onanimationend={() => (transOpen = false)}></div>
		{/key}
	{/if}

	<div class="sparkles" aria-hidden="true">
		{#each Array(14) as _, i}
			<span class="sp" style="--sx:{6 + ((i * 7) % 88)}%; --sy:{8 + ((i * 13) % 80)}%; --sd:{i % 5}.5s; --st:{0.3 + ((i * 0.37) % 1.6)}s;">{i % 2 ? '✧' : '✦'}</span>
		{/each}
	</div>

	<div class="petals" aria-hidden="true">
		{#each Array(6) as _, i}
			<span class="pt" style="--px:{3 + ((i * 17) % 92)}%; --pd:{6 + i}s; --ptd:{-((i * 3) % 6)}s; --ps:{5 + (i % 3) * 3}px;"></span>
		{/each}
	</div>

	<div class="flyers" aria-hidden="true">
		{#each Array(4) as _, i}
			<span class="music" style="--md:{5 + (i % 3) * 2.6}s; --mt:{i * 3.3}s; --mx:{8 + i * 22}%; --ms:{0.9 + (i % 2) * 0.5}rem;">{i % 2 ? '🎵' : '♪'}</span>
		{/each}
	</div>

	<div class="glitch-bars" aria-hidden="true">
		<span class="gb1"></span>
		<span class="gb2"></span>
	</div>

	<div class="hud hud-rec"><span class="recdot"></span> REC</div>
	<div class="hud hud-time">{timecode || '--/--/-- --:--:--'}</div>


	<div class="tape-frame" aria-hidden="true"></div>
	<div class="grain" aria-hidden="true"></div>
	<div class="grain-b" aria-hidden="true"></div>
	<div class="vignette" aria-hidden="true"></div>
	<div class="scanlines" aria-hidden="true"></div>

	{#if phase === 'boot'}
		<button class="boot" type="button" onclick={start}>
			<span class="btn-arrow">▶</span>
			<span class="btn-txt">{copy.pressPlay}</span>
			<span class="btn-hint">{copy.bootHint}</span>
			{#if songBroken}
				<span class="btn-hint small">{copy.songMissing}</span>
			{/if}
		</button>
	{/if}

	{#if phase === 'playing' || phase === 'ending'}
		<button class="skip" type="button" onclick={skip}>{copy.skip}</button>
	{/if}
</div>

<style>
	.reel {
		position: fixed;
		inset: 0;
		overflow: hidden;
		background: #0a0704;
		font-family: Impact, 'Arial Black', 'Franklin Gothic Bold', sans-serif;
		user-select: none;
		filter: saturate(0.86) contrast(1.08);
		animation: filmFlicker 6s linear infinite;
	}

	@keyframes filmFlicker {
		0%, 100% { filter: saturate(0.86) contrast(1.08) blur(0px) brightness(1); }
		93% { filter: saturate(0.87) contrast(1.05) blur(0.2px); }
		95% { filter: saturate(0.6) contrast(1.18) blur(1.6px) brightness(1.12); }
		96.5% { filter: saturate(0.9) contrast(1.05) blur(0.3px); }
		98% { filter: saturate(0.75) contrast(1.12) blur(1.1px); }
	}

	.title-card,
	.end-card {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		justify-content: safe center;
		gap: 1.2rem;
		text-align: center;
		padding: 2rem;
		overflow-y: auto;
		overscroll-behavior: contain;
		background:
			radial-gradient(circle at 50% 30%, rgba(255, 180, 90, 0.25), transparent 55%),
			radial-gradient(circle at 15% 85%, rgba(255, 90, 157, 0.28), transparent 50%),
			linear-gradient(160deg, #2a0a3a 0%, #4a0a3a 100%);
	}

	.title-card::before {
		content: '';
		position: absolute;
		inset: 2%;
		border: 3px solid rgba(255, 214, 166, 0.35);
		box-shadow: inset 0 0 60px rgba(255, 90, 157, 0.25);
	}

	.end-card {
		gap: 1.4rem;
		background:
			radial-gradient(ellipse at 50% 42%, rgba(255, 180, 120, 0.1) 0%, transparent 46%),
			radial-gradient(ellipse at 50% 118%, rgba(120, 140, 210, 0.1) 0%, transparent 55%),
			linear-gradient(180deg, #0a0704 0%, #16070e 55%, #1a0810 100%);
	}

	.end-card::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 50%;
		background: radial-gradient(ellipse at center, rgba(12, 6, 8, 0.82), transparent 72%);
		filter: blur(28px);
	}

	.msg-title {
		position: relative;
		margin: 0;
		font-family: 'Playfair Display', Georgia, serif;
		font-size: clamp(2.4rem, 9vw, 3.6rem);
		line-height: 1.3;
	}

	.tword {
		display: inline-block;
		margin-right: 0.32em;
		color: #ffead9;
		text-shadow: 0 2px 22px rgba(6, 8, 18, 0.8);
		opacity: 0;
		transform: translateY(22px) scale(0.95);
		animation: twordIn 1.35s cubic-bezier(0.22, 0.61, 0.36, 1) forwards var(--d, 0.5s);
	}

	.tword:nth-child(2) { --d: 1.2s; }
	.tword:nth-child(3) { --d: 1.9s; }

	.tword.gold {
		margin-right: 0;
		text-shadow: none;
		background: linear-gradient(90deg, #ffe6c2, #fbd09b, #f4b870, #ffe6c2);
		background-size: 220% auto;
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		animation: twordIn 1.35s cubic-bezier(0.22, 0.61, 0.36, 1) forwards var(--d, 1.9s),
			shimmer 5s linear infinite;
	}

	@keyframes twordIn {
		to { opacity: 1; transform: translateY(0) scale(1); }
	}

	@keyframes shimmer {
		to { background-position: -220% center; }
	}

	.festoon {
		position: relative;
		display: flex;
		align-items: center;
		gap: 0.8rem;
		opacity: 0;
		animation: festoonIn 1.2s ease 2.3s forwards;
	}

	@keyframes festoonIn {
		to { opacity: 1; }
	}

	.rule {
		width: clamp(40px, 14vw, 110px);
		height: 1px;
		background: linear-gradient(90deg, transparent, rgba(244, 213, 200, 0.5), transparent);
		transform: scaleX(0);
		animation: ruleIn 1.1s ease forwards 2.7s;
	}

	@keyframes ruleIn {
		to { transform: scaleX(1); }
	}

	.diamond {
		color: rgba(244, 213, 200, 0.75);
		font-size: 0.85rem;
		animation: dSpin 8s ease-in-out 2.7s infinite;
	}

	@keyframes dSpin {
		0%, 100% { transform: rotate(0deg); }
		50% { transform: rotate(180deg); }
	}

	.wishes {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		align-items: center;
	}

	.wish {
		margin: 0;
		font-size: clamp(1.05rem, 4vw, 1.3rem);
		font-family: 'Playfair Display', Georgia, serif;
		font-style: italic;
		color: rgba(252, 238, 224, 0.85);
		text-shadow: 0 1px 16px rgba(6, 8, 18, 0.7);
		line-height: 1.7;
		opacity: 0;
		transform: translateY(10px);
		animation: wishAppear 1.2s ease forwards var(--d, 2.9s);
	}

	.wish:nth-of-type(2) { --d: 3.25s; }
	.wish:nth-of-type(3) { --d: 3.6s; }

	.wish.last {
		color: rgba(255, 221, 178, 0.95);
		margin-top: 0.4rem;
	}

	@keyframes wishAppear {
		to { opacity: 1; transform: translateY(0); }
	}

	.heart-wrap {
		position: relative;
		opacity: 0;
		transform: translateY(6px);
		animation: heartIn 1.4s ease 4.2s forwards, heartPulse 2.6s ease-in-out 4.6s infinite;
	}

	.heart-wrap .halo {
		position: absolute;
		inset: -10px;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(244, 200, 180, 0.28) 0%, transparent 68%);
		animation: haloPulseH 2.6s ease-in-out 4.6s infinite;
	}

	@keyframes heartIn {
		to { opacity: 1; transform: translateY(0); }
	}

	@keyframes heartPulse {
		0%, 100% { transform: scale(1); }
		50% { transform: scale(1.1); }
	}

	@keyframes haloPulseH {
		0%, 100% { opacity: 0.4; }
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
		animation: sideBob 2.6s ease-in-out 4.6s infinite;
	}

	.treat-left { right: calc(100% + 12px); }
	.treat-right { left: calc(100% + 12px); animation-delay: 5.1s; }

	@keyframes sideBob {
		0%, 100% { transform: translateY(calc(-50% - 3px)); }
		50% { transform: translateY(calc(-50% + 3px)); }
	}

	.end-mark {
		position: relative;
		margin: 0;
		font-size: 0.6rem;
		letter-spacing: 0.3em;
		text-transform: uppercase;
		color: rgba(255, 221, 178, 0.45);
		opacity: 0;
		animation: wishAppear 0.9s ease 4.6s forwards;
	}

	.restart-btn {
		position: relative;
		margin: 0;
		font-size: 0.6rem;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: rgba(255, 221, 178, 0.55);
		padding: 0.7rem 1.4rem;
		border-radius: 100px;
		border: 1px solid rgba(255, 221, 178, 0.18);
		background: rgba(10, 7, 4, 0.35);
		backdrop-filter: blur(8px);
		cursor: pointer;
		opacity: 0;
		animation: wishAppear 0.9s ease 4.9s forwards;
		transition: color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
	}

	.restart-btn:hover,
	.restart-btn:focus-visible {
		color: rgba(255, 232, 206, 0.92);
		border-color: rgba(255, 221, 178, 0.42);
		box-shadow: 0 0 22px rgba(255, 190, 130, 0.22);
	}

	.sunburst {
		position: absolute;
		inset: -40%;
		background: repeating-conic-gradient(from 0deg, rgba(255, 214, 166, 0.22) 0deg 8deg, transparent 8deg 18deg);
		animation: sunspin 18s linear infinite;
	}

	@keyframes sunspin {
		to { transform: rotate(360deg); }
	}

	.clipart-star {
		position: absolute;
		font-size: 3rem;
		color: #ffd166;
		top: 16%;
		animation: wob 1.4s ease-in-out infinite;
	}

	@keyframes wob {
		0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
		50% { transform: translateY(-12px) rotate(18deg) scale(1.25); }
	}

	.shot {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		overflow: hidden;
		background: radial-gradient(circle at 50% 40%, #ffe6f0 0%, #ffc0d6 58%, #ff9dbe 100%);
		filter: saturate(0.9) contrast(1.05) blur(0.55px);
	}

	.photo-box {
		position: absolute;
		left: 50%;
		bottom: 10vh;
		transform: translate(-50%, 55%);
		z-index: 1;
		filter: drop-shadow(0 14px 26px rgba(0, 0, 0, 0.5));
	}

	.photo-box.in {
		animation: riseOnce 5s cubic-bezier(0.18, 0.7, 0.28, 1) 4.3s both;
	}

	@keyframes riseOnce {
		from { transform: translate(-50%, 125%); }
		to { transform: translate(-50%, 55%); }
	}

	.photo-box .ph {
		display: block;
		width: auto;
		height: auto;
		max-width: 100.8vw;
		max-height: 91.2vh;
		object-fit: contain;
	}

	.photo-box .fallback {
		position: relative;
		width: min(74vw, 300px);
		height: min(48vh, 300px);
		display: grid;
		place-items: center;
		border-radius: 14px;
		box-shadow: 0 14px 34px rgba(0, 0, 0, 0.55), 0 0 0 4px rgba(255, 209, 102, 0.55);
		background: linear-gradient(140deg, var(--c1), #2a1020 48%, var(--c2));
	}

	.photo-box .fallback::after {
		content: '';
		position: absolute;
		inset: 0;
		border: 9px solid rgba(255, 214, 166, 0.12);
	}

	.fb-emoji {
		font-size: clamp(3rem, 14vw, 4.5rem);
		filter: drop-shadow(0 10px 24px rgba(0, 0, 0, 0.5));
		animation: fbBob 2.2s ease-in-out infinite;
	}

	@keyframes fbBob {
		0%, 100% { transform: translateY(0) rotate(-4deg); }
		50% { transform: translateY(-16px) rotate(5deg); }
	}

	.egg {
		position: absolute;
		left: 50%;
		top: 10vh;
		width: 69vmin;
		height: 87vmin;
		margin-left: -34.5vmin;
		z-index: 4;
		pointer-events: none;
	}

	.egg.in {
		animation: eggDrop 4.3s ease-in both;
	}

	@keyframes eggDrop {
		0% { transform: translateY(-6vh) scale(0.1); opacity: 0; }
		4% { opacity: 1; }
		10% { transform: translateY(0) scale(0.1); opacity: 1; }
		26% { transform: translateY(0) scale(1); opacity: 1; }
		81% { transform: translateY(0) scale(1); opacity: 1; }
		100% { transform: translateY(calc(100vh - 87vmin - 10vh)) scale(1); opacity: 1; }
	}

	.e-body,
	.e-half {
		position: absolute;
		inset: 0;
		background:
			radial-gradient(circle at 28% 38%, rgba(122, 74, 42, 0.28) 0 2px, transparent 2.6px),
			radial-gradient(circle at 62% 24%, rgba(122, 74, 42, 0.26) 0 2px, transparent 2.6px),
			radial-gradient(circle at 70% 56%, rgba(122, 74, 42, 0.22) 0 2px, transparent 2.6px),
			radial-gradient(circle at 40% 68%, rgba(122, 74, 42, 0.26) 0 2px, transparent 2.6px),
			radial-gradient(circle at 24% 18%, rgba(255, 255, 255, 0.55) 0 3px, transparent 3.6px),
			radial-gradient(circle at 58% 44%, rgba(255, 255, 255, 0.4) 0 3px, transparent 3.6px),
			radial-gradient(circle at 78% 12%, rgba(255, 255, 255, 0.45) 0 3.5px, transparent 4.2px),
			radial-gradient(circle at 30% 88%, rgba(255, 255, 255, 0.42) 0 3px, transparent 3.6px),
			linear-gradient(160deg, #fff4da 0%, #ffe3b0 55%, #e8c48a 100%);
		border-radius: 50% / 62% 62% 40% 40%;
		box-shadow: inset -14px -20px 40px rgba(122, 74, 42, 0.22);
	}

	.e-body.in {
		animation: eggBodyFade 0.3s ease 4.3s forwards;
	}

	@keyframes eggBodyFade {
		to { opacity: 0; }
	}

	.e-crack {
		position: absolute;
		left: 50%;
		top: 1%;
		bottom: 1%;
		width: 14px;
		transform: translateX(-50%);
		background: rgba(94, 59, 31, 0.9);
		box-shadow: 0 0 10px rgba(94, 59, 31, 0.6);
		clip-path: polygon(
			36% 0, 66% 0, 74% 9%, 40% 18%, 74% 27%, 46% 37%,
			70% 48%, 40% 59%, 68% 70%, 46% 81%, 70% 90%, 40% 100%,
			60% 100%, 30% 90%, 56% 81%, 30% 70%, 58% 59%, 32% 48%,
			60% 37%, 34% 27%, 62% 18%, 30% 9%
		);
		opacity: 0;
	}

	.e-crack.in {
		animation: crackIn 0.25s ease-out 4.1s forwards, crackFade 0.3s ease 4.5s forwards;
	}

	@keyframes crackIn {
		from { opacity: 0; filter: brightness(2.2); }
		to { opacity: 1; filter: brightness(1); }
	}

	@keyframes crackFade {
		to { opacity: 0; }
	}

	.e-l { clip-path: inset(0 50% 0 0); border-right: 3px solid #f6e3c0; }
	.e-r { clip-path: inset(0 0 0 50%); border-left: 3px solid #f6e3c0; }

	.e-l.in { animation: eggSplitL 2s cubic-bezier(0.3, 0.65, 0.25, 0.9) 4.3s forwards; }
	.e-r.in { animation: eggSplitR 2s cubic-bezier(0.3, 0.65, 0.25, 0.9) 4.3s forwards; }

	@keyframes eggSplitL {
		to { transform: translate(-40vw, 0) rotate(-16deg); }
	}

	@keyframes eggSplitR {
		to { transform: translate(40vw, 0) rotate(16deg); }
	}

	.cake-wrap {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 8px;
		height: 30%;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		z-index: 6;
		pointer-events: none;
	}

	.cake-wrap.in {
		animation: cakeFly 1.4s cubic-bezier(0.25, 0.4, 0.35, 1) 6.4s both;
	}

	@keyframes cakeFly {
		from { transform: translateY(-120vh); }
		72% { transform: translateY(3vh); }
		86% { transform: translateY(-1vh); }
		100% { transform: translateY(0); }
	}

	.cake {
		position: relative;
		font-size: min(34vw, 150px);
		line-height: 1;
		filter: drop-shadow(0 16px 26px rgba(0, 0, 0, 0.55))
			drop-shadow(0 0 26px rgba(255, 170, 210, 0.6));
		animation: cakeGlow 1.6s ease-in-out infinite alternate;
	}

	@keyframes cakeGlow {
		from { filter: drop-shadow(0 16px 26px rgba(0, 0, 0, 0.55)) drop-shadow(0 0 18px rgba(255, 170, 210, 0.45)); }
		to { filter: drop-shadow(0 16px 26px rgba(0, 0, 0, 0.55)) drop-shadow(0 0 34px rgba(255, 170, 210, 0.85)); }
	}

	.side-fx {
		position: absolute;
		inset: 0;
		z-index: 3;
		pointer-events: none;
	}

	.flower {
		position: absolute;
		left: var(--fl);
		top: var(--ft);
		font-size: var(--fs);
		transform-origin: center;
		filter: drop-shadow(0 5px 10px rgba(0, 0, 0, 0.45));
		animation: bloom var(--fdur) ease-in-out var(--fd) infinite;
	}

	@keyframes bloom {
		0%, 100% { transform: scale(1) rotate(-3deg); }
		50% { transform: scale(1.28) rotate(3deg); }
	}

	.balloons {
		position: absolute;
		inset: 0;
		z-index: 2;
		pointer-events: none;
		overflow: hidden;
	}

	.balloon {
		position: absolute;
		left: var(--bx);
		bottom: 0;
		font-size: calc(var(--bs) * 2.7);
		transform: translateY(110vh);
		opacity: 0;
		filter: drop-shadow(0 10px 16px rgba(0, 0, 0, 0.28));
		animation: balloonRise 3.4s cubic-bezier(0.22, 0.62, 0.3, 1) var(--bd) forwards;
	}

	.balloon-bob {
		display: block;
		animation: balloonFloat 3s ease-in-out calc(var(--bd) + 3.4s) infinite;
	}

	@keyframes balloonFloat {
		0%, 100% { transform: translateY(0) rotate(-2deg); }
		50% { transform: translateY(-12px) rotate(2deg); }
	}

	@keyframes balloonRise {
		0% { transform: translateY(110vh) rotate(-6deg); opacity: 0; }
		14% { opacity: 1; }
		100% { transform: translateY(var(--by)) rotate(4deg); opacity: 1; }
	}

	.flashmsg {
		position: absolute;
		top: max(185px, calc(env(safe-area-inset-top) + 54px));
		left: 0;
		right: 0;
		z-index: 26;
		margin: 0;
		text-align: center;
		font-size: clamp(1.1rem, 5.5vw, 1.7rem);
		letter-spacing: 0.12em;
		color: #ffd166;
		font-style: italic;
		-webkit-text-stroke: 0.6px rgba(0, 0, 0, 0.5);
		text-shadow: 0 0 14px rgba(255, 209, 102, 0.85), 2px 2px 0 #000;
		animation: flashIn 0.5s ease both, flashBlink 1.4s steps(1) 0.45s infinite;
	}

	@keyframes flashIn {
		from { opacity: 0; transform: translateY(-8px) scale(0.9); }
		to { opacity: 1; transform: none; }
	}

	@keyframes flashBlink {
		0%, 38%, 100% { opacity: 1; }
		20% { opacity: 0.15; }
	}

	.cap {
		position: absolute;
		top: auto;
		bottom: 7%;
		left: 0;
		right: 0;
		text-align: center;
		font-size: clamp(1.7rem, 8vw, 3rem);
		font-style: italic;
		letter-spacing: 0.04em;
		line-height: 1;
		padding: 0.3rem 0.5rem;
		text-transform: uppercase;
		-webkit-text-stroke: 1.2px rgba(0, 0, 0, 0.6);
		text-shadow:
			2px 2px 0 #000, -2px 2px 0 #000, 2px -2px 0 #000, -2px -2px 0 #000,
			0 8px 20px rgba(0, 0, 0, 0.7);
		animation: capPop 0.9s cubic-bezier(0.2, 1.6, 0.35, 1) both;
	}

	@keyframes capPop {
		0% { transform: scale(0.1) rotate(-8deg); opacity: 0; }
		100% { transform: scale(1) rotate(0deg); opacity: 1; }
	}

	.cap.big { font-size: clamp(2.6rem, 13vw, 5.5rem); }

	.title-card .cap {
		position: static;
		text-transform: none;
		animation: capPop 0.9s cubic-bezier(0.2, 1.6, 0.35, 1) both;
	}

	.title-card .cap.gold.big {
		margin-top: 10vh;
	}

	.cap.sub { top: auto; bottom: 16%; font-size: clamp(2rem, 10vw, 3.4rem); }
	.cap.small { font-size: clamp(1.1rem, 4.5vw, 1.6rem); }

	.cap.gold { color: #ffd166; }
	.cap.cyan { color: #6be8ff; }
	.cap.magenta { color: #ff6bc4; }
	.cap.green { color: #6bff8f; }

	.trans {
		position: absolute;
		inset: 0;
		z-index: 30;
		pointer-events: none;
	}

	.t0 {
		background: repeating-conic-gradient(from 0deg, #fff 0deg 14deg, #ffd166 14deg 28deg);
		animation: rays .7s ease-out forwards;
	}

	@keyframes rays {
		from { transform: scale(0.05) rotate(0deg); opacity: 1; }
		55% { opacity: 1; }
		to { transform: scale(2.4) rotate(70deg); opacity: 0; }
	}

	.t1 {
		background: linear-gradient(105deg, transparent 30%, rgba(255, 255, 255, 0.95) 50%, transparent 70%);
		animation: swoosh .75s ease-in-out forwards;
	}

	@keyframes swoosh {
		from { transform: translateX(-130%) skewX(-14deg); opacity: 1; }
		to { transform: translateX(130%) skewX(-14deg); opacity: 0; }
	}

	.t2 {
		background: radial-gradient(circle, transparent 0 36%, #000 38% 100%);
		animation: irisKid .6s ease-out forwards;
	}

	@keyframes irisKid {
		from { clip-path: circle(140% at 50% 50%); opacity: 1; }
		to { clip-path: circle(42% at 50% 50%); opacity: 0.92; }
	}

	.t3 {
		background: repeating-linear-gradient(0deg,
			#000 0 2px, #fff 2px 4px, #6be8ff 4px 6px, #000 6px 8px, #ff6b9d 8px 10px);
		animation: stat .55s steps(4) forwards;
	}

	@keyframes stat {
		0% { opacity: 1; }
		100% { opacity: 0; }
	}

	.t4 {
		background: repeating-conic-gradient(from 0deg, #000 0deg 7deg, #ffd166 7deg 14deg, #6be8ff 14deg 21deg);
		animation: spiral .8s cubic-bezier(.35, .8, .4, 1) forwards;
	}

	@keyframes spiral {
		from { transform: scale(3.2) rotate(0deg); opacity: 1; }
		70% { opacity: 1; }
		to { transform: scale(.15) rotate(-560deg); opacity: 0; }
	}

	.t5 {
		background: radial-gradient(circle, #fff, #ffd166);
		clip-path: polygon(50% 0%, 61% 34%, 98% 35%, 68% 55%, 79% 91%, 50% 70%, 21% 91%, 32% 55%, 2% 35%, 39% 34%);
		transform-origin: 50% 50%;
		animation: starFlash .75s ease-out forwards;
	}

	@keyframes starFlash {
		from { transform: rotate(0deg) scale(.05); opacity: 1; }
		60% { opacity: 1; }
		to { transform: rotate(150deg) scale(1.55); opacity: 0; }
	}

	.sparkles { position: absolute; inset: 0; z-index: 0; pointer-events: none; }

	.sp {
		position: absolute;
		left: var(--sx);
		top: var(--sy);
		color: #fff;
		font-size: calc(0.6rem + (var(--st) * 0.4rem));
		text-shadow: 0 0 6px rgba(255, 255, 255, 0.9);
		animation: twinkle var(--sd) ease-in-out infinite var(--st);
	}

	.sp:nth-child(even) { color: #6be8ff; }

	@keyframes twinkle {
		0%, 100% { opacity: 0.12; transform: scale(0.5) rotate(0deg); }
		50% { opacity: 1; transform: scale(1.3) rotate(45deg); }
	}

	.petals { position: absolute; inset: 0; z-index: 0; pointer-events: none; }

	.pt {
		position: absolute;
		top: -6%;
		left: var(--px);
		width: var(--ps);
		height: calc(var(--ps) * 1.2);
		border-radius: 80% 20% 80% 20%;
		background: radial-gradient(circle at 35% 30%, #ffb3c8, #ff6b9d 70%);
		opacity: 0.75;
		animation: petalFall var(--pd) linear infinite var(--ptd);
	}

	@keyframes petalFall {
		0% { transform: translateY(-6vh) rotate(0deg); opacity: 0; }
		8% { opacity: 0.8; }
		100% { transform: translateY(112vh) rotate(300deg); opacity: 0.15; }
	}

	.flyers { position: absolute; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }

	@keyframes flyAcross {
		0% { transform: translateX(-12vw) translateY(0) rotate(-18deg); opacity: 0; }
		6% { opacity: 0.9; }
		35% { transform: translateX(32vw) translateY(-8px) rotate(9deg); opacity: 0.9; }
		60% { transform: translateX(62vw) translateY(5px) rotate(-11deg); }
		85% { transform: translateX(96vw) translateY(-4px) rotate(7deg); opacity: 0.9; }
		100% { transform: translateX(118vw) translateY(2px) rotate(12deg); opacity: 0; }
	}

	.music {
		position: absolute;
		top: var(--mt);
		left: var(--mx);
		font-size: var(--ms);
		color: #ffd166;
		opacity: 0;
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
		animation: musicFloat var(--md) ease-in-out var(--mt) infinite;
	}

	@keyframes musicFloat {
		0%, 100% { transform: translate(0, 10px) rotate(-10deg); opacity: 0; }
		18% { opacity: 0.85; }
		50% { transform: translate(-7px, -20px) rotate(12deg); opacity: 0.55; }
		72% { transform: translate(6px, -6px) rotate(-6deg); opacity: 0.7; }
	}

	.glitch-bars { position: absolute; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }

	.gb1,
	.gb2 {
		position: absolute;
		height: 4px;
		width: 100%;
		opacity: 0;
	}

	.gb1 { background: linear-gradient(90deg, #ff6b9d, #6bc3ff); top: 22%; animation: glidel 6s steps(1) infinite 1.2s; }
	.gb2 { background: linear-gradient(90deg, #7dffb0, #ffe156); top: 68%; animation: glidel 9s steps(1) infinite 0.4s; }

	@keyframes glidel {
		0%, 88%, 100% { opacity: 0; transform: translateX(0); }
		90% { opacity: 0.85; transform: translateX(-6%); }
		94% { opacity: 0.85; transform: translateX(5%); }
		96% { opacity: 0; }
	}

	.hud {
		position: absolute;
		z-index: 30;
		font-family: 'Courier New', monospace;
		font-size: 0.78rem;
		color: #ff5a5a;
		letter-spacing: 0.08em;
	}

	.hud-rec {
		top: max(14px, env(safe-area-inset-top));
		left: max(14px, env(safe-area-inset-left));
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.recdot {
		width: 9px;
		height: 9px;
		border-radius: 50%;
		background: #ff2b2b;
		box-shadow: 0 0 8px #ff2b2b;
		animation: blink 1s steps(1) infinite;
	}

	@keyframes blink { 50% { opacity: 0.1; } }

	.hud-time {
		bottom: max(16px, env(safe-area-inset-bottom));
		right: max(16px, env(safe-area-inset-right));
		color: rgba(255, 90, 90, 0.85);
	}

	.corner-cam {
		position: absolute;
		left: max(20px, env(safe-area-inset-left));
		bottom: max(20px, env(safe-area-inset-bottom));
		z-index: 5;
		pointer-events: none;
		opacity: 0;
		transform: scale(0.5);
		animation: camIn 0.7s cubic-bezier(0.2, 1.5, 0.4, 1) 9.3s both,
			camSway 6s ease-in-out 9.3s infinite alternate;
	}

	@keyframes camIn {
		from { opacity: 0; transform: scale(0.5) rotate(-8deg); }
		to { opacity: 1; transform: scale(1) rotate(0deg); }
	}

	@keyframes camSway {
		from { transform: rotate(-2.5deg) translateY(0); }
		to { transform: rotate(2.5deg) translateY(-4px); }
	}

	.cam-body {
		position: relative;
		width: 78px;
		height: 54px;
		border-radius: 9px;
		background: linear-gradient(160deg, #4a4a56 0%, #26262e 55%, #17171c 100%);
		border: 1px solid rgba(255, 255, 255, 0.14);
		box-shadow: 0 10px 22px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.18);
	}

	.cam-grip {
		position: absolute;
		top: -7px;
		left: 8px;
		width: 26px;
		height: 8px;
		border-radius: 3px 3px 0 0;
		background: linear-gradient(#585866, #30303a);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
	}

	.cam-lens {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 30px;
		height: 30px;
		margin: -15px 0 0 -15px;
		border-radius: 50%;
		background: radial-gradient(circle at 34% 30%, #9fe8ff 0 12%, #2b6ea8 42%, #0d1b2e 100%);
		box-shadow: 0 0 0 3px #0b0b10, 0 0 0 4px rgba(255, 255, 255, 0.22), 0 4px 10px rgba(0, 0, 0, 0.6);
	}

	.cam-lens::after {
		content: '';
		position: absolute;
		top: 5px;
		left: 7px;
		width: 9px;
		height: 6px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.75);
		transform: rotate(-24deg);
	}

	.cam-led {
		position: absolute;
		top: 7px;
		right: 8px;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #ff2b2b;
		box-shadow: 0 0 7px #ff2b2b;
		animation: camBlink 1.1s steps(1) infinite;
	}

	@keyframes camBlink { 50% { opacity: 0.15; } }

	.cam-flash {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 210px;
		height: 210px;
		margin: -105px 0 0 -105px;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(255, 255, 255, 0.95) 0 12%, rgba(255, 240, 210, 0.55) 30%, transparent 68%);
		opacity: 0;
		animation: camFlash 3.6s ease-out infinite;
	}

	@keyframes camFlash {
		0%, 82% { opacity: 0; transform: scale(0.6); }
		86% { opacity: 1; transform: scale(1); }
		96% { opacity: 0; transform: scale(1.35); }
		100% { opacity: 0; transform: scale(1.35); }
	}

	.tape-frame {
		position: absolute;
		inset: 0;
		z-index: 22;
		pointer-events: none;
		box-shadow: inset 0 0 0 12px rgba(0, 0, 0, 0.35), inset 0 0 120px rgba(0, 0, 0, 0.55);
	}

	.grain {
		position: absolute;
		inset: 0;
		z-index: 23;
		pointer-events: none;
		opacity: 0.2;
		background-image: url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='160'%20height='160'%3E%3Cfilter%20id='n'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='0.85'%20numOctaves='3'/%3E%3C/filter%3E%3Crect%20width='160'%20height='160'%20filter='url(%23n)'%20opacity='0.6'/%3E%3C/svg%3E");
		animation: grainjump 0.3s steps(6) infinite;
	}

	.grain-b {
		position: absolute;
		inset: 0;
		z-index: 24;
		pointer-events: none;
		opacity: 0.14;
		background-image: url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='230'%20height='230'%3E%3Cfilter%20id='nb'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='0.36'%20numOctaves='2'/%3E%3C/filter%3E%3Crect%20width='230'%20height='230'%20filter='url(%23nb)'%20opacity='0.5'/%3E%3C/svg%3E");
		animation: grainjumpB 0.9s steps(5) infinite;
	}

	@keyframes grainjump {
		0% { transform: translate(0, 0); }
		25% { transform: translate(-2%, 1%); }
		50% { transform: translate(2%, -1%); }
		75% { transform: translate(-1%, -2%); }
		100% { transform: translate(1%, 2%); }
	}

	@keyframes grainjumpB {
		0% { transform: translate(0, 0) scale(1); }
		33% { transform: translate(3%, -1%) scale(1.04); }
		66% { transform: translate(-3%, 2%) scale(0.97); }
		100% { transform: translate(1%, -2%) scale(1.02); }
	}

	.vignette {
		position: absolute;
		inset: 0;
		z-index: 26;
		pointer-events: none;
		background:
			radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0, 0, 0, 0.42) 76%, rgba(0, 0, 0, 0.68) 100%),
			linear-gradient(180deg, rgba(0, 0, 0, 0.34) 0%, transparent 11%, transparent 89%, rgba(0, 0, 0, 0.4) 100%);
	}

	.scanlines {
		position: absolute;
		inset: 0;
		z-index: 25;
		pointer-events: none;
		overflow: hidden;
		opacity: 0.16;
		background: repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.07) 0 1px, rgba(0, 0, 0, 0.24) 1px 2px, transparent 2px 4px);
	}

	.scanlines::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		height: 9%;
		background: linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.07), transparent);
		animation: scanband 7s linear infinite;
	}

	@keyframes scanband {
		0% { top: -12%; }
		100% { top: 112%; }
	}

	.boot {
		position: absolute;
		inset: 0;
		z-index: 40;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		padding: 2rem;
		border: 0;
		background:
			radial-gradient(circle at 50% 42%, rgba(255, 120, 80, 0.12), transparent 60%),
			#0c0810;
		color: #f4d5c8;
		cursor: pointer;
	}

	.boot::after {
		content: 'TAPE ● [SANITIZED]';
		position: absolute;
		top: max(56px, calc(env(safe-area-inset-top) + 48px));
		left: 0; right: 0;
		text-align: center;
		font-family: 'Courier New', monospace;
		font-size: 0.6rem;
		letter-spacing: 0.35em;
		color: rgba(244, 213, 200, 0.16);
	}

	.btn-arrow {
		font-size: 3.6rem;
		line-height: 1;
		color: #ffd166;
		text-shadow: 0 0 22px rgba(255, 209, 102, 0.8);
		animation: blink 1.2s steps(2) infinite;
	}

	.btn-txt {
		font-size: clamp(1.6rem, 9vw, 3rem);
		letter-spacing: 0.18em;
		color: #ff6b9d;
		-webkit-text-stroke: 1px rgba(0, 0, 0, 0.5);
		text-shadow: 3px 3px 0 #000;
		font-style: italic;
	}

	.btn-hint {
		font-family: 'Courier New', monospace;
		font-style: normal;
		font-size: 0.85rem;
		letter-spacing: 0.08em;
		color: rgba(244, 213, 200, 0.55);
	}

	.btn-hint.small { font-size: 0.7rem; color: rgba(255, 209, 102, 0.5); }

	.skip {
		position: absolute;
		z-index: 45;
		top: max(14px, env(safe-area-inset-top));
		right: max(14px, env(safe-area-inset-right));
		padding: 0.5rem 0.8rem;
		border: 1px solid rgba(244, 213, 200, 0.3);
		border-radius: 999px;
		background: rgba(0, 0, 0, 0.45);
		color: rgba(244, 213, 200, 0.8);
		font-family: inherit;
		font-size: 0.8rem;
		letter-spacing: 0.08em;
		touch-action: manipulation;
	}

	@keyframes glowPulse {
		0%, 100% { box-shadow: 0 0 0 rgba(255, 209, 102, 0); }
		50% { box-shadow: 0 0 18px rgba(255, 209, 102, 0.45); }
	}

	@media (prefers-reduced-motion: reduce) {
		.photo-box, .photo-box .ph, .photo-box .fallback, .egg, .e-body, .e-crack, .e-l, .e-r,
		.cake, .cake-wrap, .flower, .balloon, .balloon-bob, .flashmsg, .sunburst, .clipart-star, .fb-emoji,
		.cap, .sp, .pt, .music, .corner-cam, .cam-led, .cam-flash, .grain, .grain-b, .vignette, .scanlines, .gb1, .gb2,
		.reel, .scanlines::after {
			animation: none !important;
		}
		.tword, .tword.gold, .diamond, .heart-wrap, .heart-wrap .halo, .side,
		.wish, .end-mark, .restart-btn {
			animation: none !important;
			opacity: 1;
		}
		.rule { transform: scaleX(1); }
		.trans { animation-duration: 0.01s !important; }
	}
</style>