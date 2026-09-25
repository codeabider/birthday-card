<script>
	import {getContext, onDestroy, onMount, untrack} from 'svelte';
	import {NAVIGATION_CONTEXT} from '$lib/flow.svelte.js';

	let {onProgress, initialChoices = {}} = $props();
	const choicesAtStart = untrack(() => initialChoices);
	const nav = getContext(NAVIGATION_CONTEXT);

	const KEYS = ['s0', 's1', 's2', 's3'];
	const hasAllChoices = (value) => KEYS.every((key) => Number.isInteger(value[key]));
	const firstIncompleteStage = (value) => KEYS.findIndex((key) => !Number.isInteger(value[key]));
	let selections = $state({ ...choicesAtStart });
	let stage = $state(Math.max(0, firstIncompleteStage(choicesAtStart)));
	let fadingOut = $state(false);
	let introDone = $state(false);
	let showingResult = $state(hasAllChoices(choicesAtStart));
	let intro = $state(stage === 0 && !showingResult);
	let confetti = $state([]);
	let transitionTimeout;
	let introTimeout;
	let confettiTimers = [];

	const confettiPalette = ['#ff6b9d', '#ffd93d', '#6bcb77', '#4d96ff', '#a06cd5', '#ff8b3d', '#fff1d0'];

	const stages = [
		{
			title: 'how do you want your day to begin?',
			phase: 'morning',
			theme: 'm',
			choices: [
				{icon: '☀️', text: 'Slow morning', sub: 'coffee, soft light, zero rush'},
				{icon: '☕', text: 'Good breakfast', sub: 'fresh coffee and something chocolate-y'},
				{icon: '🌿', text: 'Get outside', sub: 'fresh air with a thermos of cocoa'},
			],
		},
		{
			title: 'what sounds good next?',
			phase: 'next',
			theme: 'n',
			choices: [
				{icon: '🎨', text: 'Something creative', sub: 'make something only you could'},
				{icon: '🗺️', text: 'Somewhere new', sub: 'a place you have never been'},
				{icon: '🛋️', text: 'Absolutely nothing', sub: 'guilt-free, gorgeous nothing'},
			],
		},
		{
			title: 'your afternoon...',
			phase: 'afternoon',
			theme: 'a',
			choices: [
				{icon: '🍰', text: 'Treat time', sub: 'cake, chocolate and everything sweet'},
				{icon: '🏞️', text: 'A little adventure', sub: 'explore with hot chocolate refills'},
				{icon: '🎈', text: 'Lazy sunshine', sub: 'picnic naps and favorite people'},
			],
		},
{
				title: 'your evening...',
				phase: 'evening',
				theme: 'e',
				choices: [
					{icon: '🎉', text: 'A party with lights', sub: 'sparkles, music, happy noise'},
					{icon: '🗝️', text: 'Mystery room escape', sub: 'puzzles, riddles, a secret to unlock'},
					{icon: '🌙', text: 'Quiet and cozy', sub: 'blankets, tea, soft and warm'},
					{icon: '🌟', text: 'Dream about tomorrow', sub: 'smile at the year behind you'},
				],
			},
	];

	function pick(i) {
		if (fadingOut) return;
		const key = `s${stage}`;
		selections[key] = i;
		onProgress?.({ ...selections });

		if (stage < stages.length - 1) {
			fadingOut = true;
			transitionTimeout = setTimeout(() => { stage++; fadingOut = false; showingResult = false; }, 480);
		} else {
			showingResult = true;
			fireConfetti();
		}
	}

	function back() {
		if (fadingOut || stage === 0) return;
		fadingOut = true;
		transitionTimeout = setTimeout(() => { stage--; fadingOut = false; showingResult = false; }, 480);
	}

	function replan() {
		if (fadingOut) return;
		confetti = [];
		showingResult = false;
		stage = 0;
	}

	function fireConfetti() {
		const parts = [];
		const radius = Math.min(Math.min(window.innerWidth, window.innerHeight) * 0.6, 620);
		for (let i = 0; i < 70; i++) {
			const ang = Math.random() * Math.PI * 2;
			const dist = 60 + Math.random() * (radius - 60);
			parts.push({
				dx: Math.cos(ang) * dist,
				dy: Math.sin(ang) * dist,
				rot: (Math.random() - 0.5) * 640,
				dur: (0.8 + Math.random() * 0.7).toFixed(2),
				del: (Math.random() * 0.3).toFixed(2),
				color: confettiPalette[i % confettiPalette.length],
				size: 6 + Math.random() * 8,
				round: Math.random() > 0.5,
			});
		}
		confetti = parts;
		confettiTimers.forEach(clearTimeout);
		confettiTimers = [setTimeout(() => { confetti = []; }, 2200)];
	}

	onMount(() => {
		onProgress?.({ ...selections });
		introTimeout = setTimeout(() => { introDone = true; }, 300);
	});

	onDestroy(() => {
		transitionTimeout && clearTimeout(transitionTimeout);
		introTimeout && clearTimeout(introTimeout);
		confettiTimers.forEach(clearTimeout);
	});

	let currentStage = $derived(stages[stage]);
	let hasSelection = $derived(selections[`s${stage}`] !== undefined);

	let planText = $derived.by(() => {
		const sel = (idx) => stages[idx].choices[selections[`s${idx}`]];
		const parts = [];
		for (let idx = 0; idx < stages.length; idx++) {
			if (selections[`s${idx}`] !== undefined) parts.push(sel(idx));
		}
		if (parts.length !== stages.length) return '';
		return `a ${parts[0].text} wake-up, then ${parts[1].text.toLowerCase()}, a ${parts[2].text.toLowerCase()} afternoon, ending with ${parts[3].text.toLowerCase()}.`;
	});
</script>

<div class="choose" class:fadeout={fadingOut}>
	<span class="sun"></span>
	<span class="cloud c1"></span>
	<span class="cloud c2"></span>
	<span class="cloud c3"></span>
	<span class="sparkle s1">✦</span>
	<span class="sparkle s2">✦</span>
	<span class="sparkle s3">✧</span>
	<span class="balloon b1">🎈</span>
	<span class="balloon b2">🎈</span>

	{#if !showingResult}
		{#if intro}
			<div class="content {introDone ? 'show' : ''}">
				<p class="tag">before we begin</p>
				<h2 class="question intro-line">okay. it's your day.</h2>
				<p class="intro-sub">let's build it — a morning, an afternoon, an evening. all yours.</p>
				<button class="start-btn" onclick={() => { intro = false; }}>let's go ✨</button>
			</div>
		{:else}
			<div class="content {introDone ? 'show' : ''}">
			<div class="steps">
				{#each stages as _, i}
					<span class="step {i <= stage ? 'done' : ''}"></span>
				{/each}
			</div>

			<p class="tag">{currentStage.phase} · step {stage + 1} of {stages.length}</p>
			<h2 class="question">{currentStage.title}</h2>

			<div class="options theme-{currentStage.theme}">
				{#each currentStage.choices as ch, i}
					<button
						class="option"
						class:selected={hasSelection && selections[`s${stage}`] === i}
						onclick={() => pick(i)}
						aria-label={ch.text}
					>
						<span class="opt-icon">{ch.icon}</span>
						<span class="opt-body">
							<span class="opt-text">{ch.text}</span>
							<span class="opt-sub">{ch.sub}</span>
						</span>
						<span class="opt-check">✓</span>
					</button>
				{/each}
			</div>

			<div class="nav-row">
				{#if stage > 0}
					<button class="nav-btn" onclick={back}>← back</button>
				{/if}
			</div>
		</div>
		{/if}
	{:else}
		<div class="result show">
			<p class="result-kicker">all planned &heartsuit;</p>
			<h2 class="result-title">your birthday, your way</h2>

			<div class="day-card">
				{#each stages as s, idx}
					{#if selections[`s${idx}`] !== undefined}
						<div class="day-row" style="--i:{idx};">
							<span class="row-emoji">{s.choices[selections[`s${idx}`]].icon}</span>
							<span class="row-body">
								<span class="row-phase">{s.phase}</span>
								<span class="row-text">{s.choices[selections[`s${idx}`]].text}</span>
							</span>
						</div>
					{/if}
				{/each}

				<div class="cake-pop">🎂</div>
				{#if confetti.length}
					{#each confetti as pt}
						<span
							class="confetti"
							class:round={pt.round}
							style="--dx:{pt.dx}px;--dy:{pt.dy}px;--rot:{pt.rot}deg;--dur:{pt.dur}s;--del:{pt.del}s;--size:{pt.size}px;--col:{pt.color};"
						></span>
					{/each}
				{/if}
			</div>

			{#if planText}
				<p class="plan-line">{planText}</p>
			{/if}

			<p class="wish-line">psst — I wish I could be right there with you ✨</p>

			{#if planText}
				<button class="go-btn" onclick={() => nav?.advance?.()}>that sounds like a good day →</button>
			{/if}

			{#if planText}
				<button class="replan-btn" onclick={replan}>↺ replan my day</button>
			{/if}
		</div>
	{/if}
</div>

<style>
	.choose {
		position: fixed; inset: 0;
		display: flex; align-items: center; justify-content: center;
		background:
			radial-gradient(90% 70% at 15% 0%, #fff6da 0%, rgba(255,246,218,0) 60%),
			linear-gradient(180deg, #aee1ff 0%, #d8efff 38%, #ffeecb 72%, #ffd9a8 100%);
		padding: max(2.5rem, env(safe-area-inset-top)) 1.5rem max(120px, env(safe-area-inset-bottom)) 1.5rem;
		overflow-y: auto;
		transition: opacity 0.48s ease;
	}

	.fadeout { opacity: 0; pointer-events: none; }

	.sun {
		position: absolute; top: -70px; right: -70px;
		width: 210px; height: 210px; border-radius: 50%;
		background: radial-gradient(circle at 32% 32%, #fff8d8 0%, #ffd766 48%, #ffb347 100%);
		box-shadow: 0 0 80px 30px rgba(255,214,102,0.55);
		pointer-events: none;
	}

	.cloud {
		position: absolute; height: 28px; border-radius: 999px;
		background: rgba(255,255,255,0.75);
		box-shadow: inset 0 -6px 12px rgba(255,224,168,0.35);
		animation: cloudDrift linear infinite;
		pointer-events: none;
	}
	.cloud::before, .cloud::after {
		content: ''; position: absolute; border-radius: 50%; background: inherit;
	}
	.cloud::before { width: 42px; height: 42px; top: -20px; left: 22px; }
	.cloud::after { width: 30px; height: 30px; top: -12px; left: 70px; }
	.c1 { width: 150px; top: 12%; animation-duration: 34s; }
	.c2 { width: 100px; top: 30%; animation-duration: 26s; animation-delay: -8s; opacity: 0.6; }
	.c3 { width: 120px; top: 6%; animation-duration: 40s; animation-delay: -18s; opacity: 0.8; }

	@keyframes cloudDrift {
		from { transform: translateX(-140vw); }
		to { transform: translateX(140vw); }
	}

	.sparkle {
		position: absolute; color: #ffcf55; font-size: 1.2rem;
		text-shadow: 0 0 10px rgba(255,207,85,0.8);
		animation: tw 2.6s ease-in-out infinite;
		pointer-events: none;
	}
	.s1 { top: 18%; left: 8%; animation-delay: 0s; }
	.s2 { top: 26%; right: 12%; animation-delay: 0.8s; font-size: 0.9rem; color: #ff9db0; }
	.s3 { bottom: 20%; left: 12%; animation-delay: 1.4s; font-size: 1rem; }

	@keyframes tw {
		0%, 100% { opacity: 0.25; transform: scale(0.7); }
		50% { opacity: 1; transform: scale(1.15); }
	}

	.balloon {
		position: absolute; font-size: 2.2rem; opacity: 0.75;
		animation: rise 12s ease-in infinite;
		pointer-events: none;
	}
	.b1 { left: 16%; animation-delay: 0s; }
	.b2 { right: 18%; animation-delay: -6s; font-size: 1.8rem; }

	@keyframes rise {
		0% { transform: translateY(20vh) rotate(-4deg); opacity: 0; }
		8% { opacity: 0.8; }
		92% { opacity: 0.8; }
		100% { transform: translateY(-112vh) rotate(5deg); opacity: 0; }
	}

	.content, .result {
		position: relative; z-index: 3;
		max-width: min(440px, 92vw);
		width: 100%;
		text-align: center;
		display: flex; flex-direction: column; align-items: center; gap: 1.2rem;
		opacity: 0; transform: translateY(12px);
		transition: opacity 0.55s ease, transform 0.55s ease;
	}

	.content.show, .result.show { opacity: 1; transform: translateY(0); }

	.steps { display: flex; gap: 0.45rem; }

	.step {
		width: 26px; height: 7px; border-radius: 999px;
		background: rgba(91,59,110,0.18);
		transition: background 0.4s ease;
	}
	.step.done { background: #ff8b5e; }

	.tag {
		font-size: 0.68rem; letter-spacing: 0.22em; text-transform: uppercase;
		color: rgba(91,59,110,0.55);
	}

	.question {
		font-size: clamp(1.5rem, 6.4vw, 2.1rem);
		color: #5b3b6e; line-height: 1.25;
		text-shadow: 0 2px 0 rgba(255,255,255,0.25);
	}

	.intro-line { animation: rowIn 0.8s ease 0.15s backwards; }

	.intro-sub {
		font-size: 1.05rem; line-height: 1.7;
		color: rgba(91,59,110,0.75);
		animation: rowIn 0.8s ease 0.4s backwards;
		max-width: 30ch;
	}

	@keyframes rowIn {
		from { opacity: 0; transform: translateY(16px); }
		to { opacity: 1; transform: translateY(0); }
	}

	.start-btn {
		margin-top: 0.6rem;
		border: none; border-radius: 100px;
		padding: 1rem 2.2rem;
		background: linear-gradient(135deg, #5b3b6e, #8a3a72);
		color: #fff; font-weight: 600; font-size: 1.05rem;
		box-shadow: 0 14px 30px rgba(91,59,110,0.35);
		transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
		animation: rowIn 0.7s ease 0.7s backwards;
	}

	.start-btn:hover { transform: translateY(-3px) scale(1.03); box-shadow: 0 18px 36px rgba(91,59,110,0.45); }
	.start-btn:active { transform: translateY(0) scale(0.97); }

	.options { display: flex; flex-direction: column; gap: 0.7rem; width: 100%; margin-top: 0.3rem; }

	.option {
		display: flex; align-items: center; gap: 0.9rem;
		padding: 0.9rem 1rem; border-radius: 18px;
		background: rgba(255,255,255,0.82);
		border: 2px solid rgba(91,59,110,0);
		box-shadow: 0 8px 22px rgba(91,59,110,0.14);
		color: #5b3b6e; font-size: 1rem;
		transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease, background 0.3s ease, border-color 0.3s ease;
		text-align: left;
	}

	.option:hover {
		transform: translateY(-3px);
		box-shadow: 0 14px 30px rgba(91,59,110,0.2);
	}

	.option:active { transform: translateY(0) scale(0.98); }

	.opt-icon { font-size: 1.9rem; line-height: 1; filter: drop-shadow(0 3px 6px rgba(91,59,110,0.25)); }

	.opt-body { display: flex; flex-direction: column; gap: 0.1rem; flex: 1; }

	.opt-text { font-weight: 600; color: #4a2f5e; }

	.opt-sub { font-size: 0.78rem; color: rgba(91,59,110,0.55); }

	.opt-check {
		width: 24px; height: 24px; border-radius: 50%;
		border: 2px solid rgba(91,59,110,0.15);
		color: #fff; font-size: 0.85rem; line-height: 1;
		display: flex; align-items: center; justify-content: center;
		opacity: 0; transform: scale(0.5);
		transition: opacity 0.25s ease, transform 0.25s ease;
	}

	.option.selected { transform: translateY(-3px); }

	.theme-m .option.selected {
		background: linear-gradient(135deg, #ffd66b, #ffb35c);
		border-color: #ff9d47;
	}
	.theme-n .option.selected {
		background: linear-gradient(135deg, #b8a2ff, #8d7bff);
		border-color: #7d63f4;
	}
	.theme-a .option.selected {
		background: linear-gradient(135deg, #7de0b4, #55c98f);
		border-color: #3fb67f;
	}
	.theme-e .option.selected {
		background: linear-gradient(135deg, #7ac4ff, #5a9bff);
		border-color: #4a86f0;
	}

	.option.selected .opt-text,
	.option.selected .opt-sub { color: #fff; }

	.option.selected .opt-sub { opacity: 0.85; }

	.option.selected .opt-check {
		opacity: 1; transform: scale(1);
		border-color: rgba(255,255,255,0.6);
	}

	.nav-row { display: flex; gap: 0.8rem; margin-top: 0.4rem; min-height: 2rem; }

	.nav-btn {
		font-size: 0.68rem; letter-spacing: 0.18em; text-transform: uppercase;
		color: rgba(91,59,110,0.5); padding: 0.6rem 1.3rem; border-radius: 100px;
		border: 2px solid rgba(91,59,110,0.18); background: rgba(255,255,255,0.5);
	}

	.nav-btn:hover { color: #5b3b6e; border-color: rgba(91,59,110,0.4); }

	.result-kicker {
		font-size: 0.7rem; letter-spacing: 0.24em; text-transform: uppercase;
		color: rgba(91,59,110,0.55);
	}

	.result-title {
		font-size: clamp(1.6rem, 7vw, 2.4rem);
		color: #4a2f5e; line-height: 1.2;
	}

	.day-card {
		position: relative;
		width: 100%;
		text-align: left;
		border-radius: 24px;
		background: rgba(255,255,255,0.85);
		box-shadow: 0 18px 44px rgba(91,59,110,0.18);
		padding: 1.3rem 1.4rem;
		display: flex; flex-direction: column; gap: 0.85rem;
	}

	.day-row {
		display: flex; align-items: center; gap: 0.85rem;
		opacity: 0; transform: translateY(14px);
		animation: rowIn 0.6s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
		animation-delay: calc(var(--i) * 0.28s);
	}

	@keyframes rowIn {
		to { opacity: 1; transform: translateY(0); }
	}

	.row-emoji { font-size: 1.7rem; filter: drop-shadow(0 3px 6px rgba(91,59,110,0.25)); }

	.row-body { display: flex; flex-direction: column; gap: 0.05rem; }

	.row-phase {
		font-size: 0.62rem; letter-spacing: 0.2em; text-transform: uppercase;
		color: rgba(91,59,110,0.5);
	}

	.row-text { font-weight: 600; color: #4a2f5e; }

	.cake-pop {
		align-self: center;
		font-size: 2.6rem; line-height: 1;
		margin-top: 0.2rem;
		position: relative; z-index: 2;
		opacity: 0;
		animation: cakePop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 1.25s forwards;
	}

	@keyframes cakePop {
		0% { opacity: 0; transform: scale(0); }
		65% { transform: scale(1.3); }
		100% { opacity: 1; transform: scale(1); }
	}

	.confetti {
		position: absolute; left: 50%; top: 50%;
		width: var(--size); height: var(--size);
		margin: calc(var(--size) / -2) 0 0 calc(var(--size) / -2);
		background: var(--col);
		border-radius: 3px;
		opacity: 0;
		animation: confettiFly var(--dur) cubic-bezier(0.16, 0.84, 0.44, 1) var(--del) forwards;
		z-index: 3;
	}

	.confetti.round { border-radius: 50%; }

	@keyframes confettiFly {
		0% { opacity: 0; transform: translate(0, 0) scale(0.2) rotate(0deg); }
		12% { opacity: 1; }
		100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(1) rotate(var(--rot)); }
	}

	.plan-line {
		font-size: 0.95rem; line-height: 1.6;
		color: #6b4a7e;
		opacity: 0; animation: rowIn 0.8s ease 1.3s forwards;
	}

	.wish-line {
		font-family: 'Playfair Display', Georgia, serif; font-style: italic;
		font-size: 0.95rem; color: rgba(91,59,110,0.7);
		animation: rowIn 1s ease 1.7s forwards;
		opacity: 0;
	}

	.go-btn {
		border: none; border-radius: 100px;
		padding: 1.05rem 2rem;
		background: linear-gradient(135deg, #5b3b6e, #8a3a72);
		color: #fff; font-weight: 600; font-size: 1.05rem;
		box-shadow: 0 14px 30px rgba(91,59,110,0.35);
		grid-column: 1 / -1;
		opacity: 0;
		animation: rowIn 0.8s ease 2.3s forwards;
		transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
	}

	.go-btn:hover { transform: translateY(-3px) scale(1.03); box-shadow: 0 18px 36px rgba(91,59,110,0.45); }
	.go-btn:active { transform: translateY(0) scale(0.97); }

	.replan-btn {
		border: 2px solid rgba(91,59,110,0.25); border-radius: 100px;
		padding: 0.8rem 1.6rem;
		background: rgba(255,255,255,0.55);
		color: #5b3b6e; font-weight: 600; font-size: 0.9rem;
		opacity: 0;
		animation: rowIn 0.8s ease 2.6s forwards;
		transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease, background 0.3s ease;
	}

	.replan-btn:hover { transform: translateY(-2px); background: rgba(255,255,255,0.85); box-shadow: 0 10px 22px rgba(91,59,110,0.2); }
	.replan-btn:active { transform: translateY(0) scale(0.97); }

	@media (prefers-reduced-motion: reduce) {
		.cloud, .sparkle, .balloon, .sun { animation: none !important; }
		.cloud { opacity: 0.5; }
		.balloon { opacity: 0.3; }
		.option { transition: none; }
		.option:hover { transform: none; }
		.day-row, .cake-pop, .plan-line, .wish-line,
		.intro-line, .intro-sub, .start-btn, .go-btn, .replan-btn { animation: none !important; opacity: 1; }
		.confetti { animation: none !important; opacity: 0; }
	}
</style>