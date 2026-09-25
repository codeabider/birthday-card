<script>
	import {onDestroy, onMount, untrack} from 'svelte';

	let {onProgress, initialChoices = {}} = $props();
	const choicesAtStart = untrack(() => initialChoices);

	const hasAllChoices = (value) => ['s0', 's1', 's2'].every((key) => Number.isInteger(value[key]));
	const firstIncompleteStage = (value) => ['s0', 's1', 's2'].findIndex((key) => !Number.isInteger(value[key]));
	let selections = $state({ ...choicesAtStart });
	let stage = $state(Math.max(0, firstIncompleteStage(choicesAtStart)));
	let fadingOut = $state(false);
	let introDone = $state(false);
	let showingResult = $state(hasAllChoices(choicesAtStart));
	let transitionTimeout;
	let introTimeout;

	const stages = [
		{
			title: 'how does the morning go?',
			choices: [
				{text: 'slow and cozy', icon: '~ ', vibe: 'you wake up and take your time — no rush, just warmth'},
				{text: 'bright and energetic', icon: '/\\', vibe: 'you get up ready for the day — the world can keep up now'},
				{text: 'somewhere in between', icon: '_ ', vibe: 'a gentle start that finds its rhythm as it goes'},
			],
		},
		{
			title: 'what happens by afternoon?',
			choices: [
				{text: 'something creative', icon: '✦ ', vibe: 'you make something or think about something no one else thought of'},
				{text: 'something social', icon: '∞ ', vibe: 'people show up and energy shifts because you are there'},
				{text: 'something quiet', icon: '○ ', vibe: 'you steal a little time just for you — well earned'},
			],
		},
		{
			title: 'how does it end?',
			choices: [
				{text: 'with celebration', icon: '✧ ', vibe: 'there are lights, there is noise, there is joy'},
				{text: 'with reflection', icon: '◌ ', vibe: 'you look back at the year and smile at how far you came'},
				{text: 'looking forward', icon: '→ ', vibe: 'tomorrow starts today and you already know it will be good'},
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
			transitionTimeout = setTimeout(() => { stage++; fadingOut = false; showingResult = false; }, 500);
		} else {
			showingResult = true;
		}
	}

	function back() {
		if (fadingOut || stage === 0) return;
		fadingOut = true;
		transitionTimeout = setTimeout(() => { stage--; fadingOut = false; showingResult = false; }, 500);
	}

	onMount(() => {
		onProgress?.({ ...selections });
		introTimeout = setTimeout(() => { introDone = true; }, 400);
	});

	onDestroy(() => {
		transitionTimeout && clearTimeout(transitionTimeout);
		introTimeout && clearTimeout(introTimeout);
	});

	let currentStage = $derived(stages[stage]);
	let hasSelection = $derived(selections[`s${stage}`] !== undefined);
	let selectedChoice = $derived(selections[`s${stage}`] !== undefined ? currentStage.choices[selections[`s${stage}`]] : null);

	function generateItinerary() {
		let parts = [];
		stages.forEach((s, idx) => {
			const sel = selections[`s${idx}`];
			if (sel !== undefined && s.choices[sel]) {
				parts.push(`${s.choices[sel].icon} ${s.choices[sel].vibe}`);
			}
		});
		return parts.join('  —  ');
	}
</script>

<div class="choose" class:fadeout={fadingOut}>
	{#if !showingResult}
		<div class="content {introDone ? 'show' : ''}">
			<p class="tag">{stage + 1} / {stages.length}</p>

			<h2 class="question">{currentStage.title}</h2>

			<div class="options">
				{#each currentStage.choices as ch, i}
					<button
						class="option"
						class:selected={hasSelection && selections[`s${stage}`] === i}
						onclick={() => pick(i)}
						aria-label={ch.text}
					>
						<span class="opt-icon">{ch.icon}</span>
						<span class="opt-text">{ch.text}</span>
					</button>
				{/each}
			</div>

			{#if selectedChoice}
				<p class="vibe-line">{selectedChoice.vibe}</p>
			{/if}

			<div class="nav-row">
				{#if stage > 0}
					<button class="nav-btn" onclick={back}>← back</button>
				{/if}
			</div>
		</div>
	{:else}
		<div class="result {hasSelection ? 'show' : ''}">
			<p class="tagline">your day looks like this</p>

			<div class="itinerary">
				{#each stages as s, idx}
					{#if selections[`s${idx}`] !== undefined}
						<div class="itin-item">
							<span class="itin-phase">{['morning', 'afternoon', 'evening'][idx]}</span>
							<p class="itin-text">{s.choices[selections[`s${idx}`]].vibe}</p>
						</div>
					{/if}
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.choose {
		position: fixed; inset: 0;
		display: flex; align-items: center; justify-content: center;
		background: radial-gradient(ellipse at 50% 40%, #1e1230 0%, #0a0812 75%);
		padding: max(2rem, env(safe-area-inset-top)) 1.5rem max(4vh, env(safe-area-inset-bottom), 24px) 1.5rem;
		overflow-y: auto;
		transition: opacity 0.5s ease;
	}

	.fadeout { opacity: 0; pointer-events: none; }

	.content, .result {
		max-width: min(420px, 90vw);
		width: 100%;
		text-align: center;
		display: flex; flex-direction: column; align-items: center; gap: 1.5rem;
		opacity: 0; transform: translateY(10px);
		transition: opacity 0.6s ease, transform 0.6s ease;
	}

	.content.show, .result.show { opacity: 1; transform: translateY(0); }

	.tag {
		font-size: 0.6rem; letter-spacing: 0.2em; text-transform: uppercase;
		color: rgba(240,235,227,0.2);
	}

	.question {
		font-size: clamp(1.3rem,5.5vw,1.8rem); color: #f4d5c8; line-height: 1.4;
	}

	.options { display: flex; flex-direction: column; gap: 0.6rem; width: 100%; }

	.option {
		display: flex; align-items: center; gap: 0.8rem;
		padding: 1rem 1.4rem; border-radius: 12px;
		background: rgba(244,213,200,0.04);
		border: 1px solid rgba(244,213,200,0.08);
		color: rgba(240,235,227,0.5); font-size: 1rem;
		transition: all 0.3s ease; text-align: left;
	}

	.option:hover { background: rgba(244,213,200,0.08); }

	.option.selected {
		background: rgba(244,213,200,0.08);
		border-color: rgba(244,213,200,0.2);
		color: #f4d5c8;
	}

	.opt-icon { font-size: 1.4rem; min-width: 1.5rem; text-align: center; }
	.opt-text { letter-spacing: 0.02em; }

	.vibe-line {
		font-size: 0.9rem; color: rgba(240,235,227,0.3); line-height: 1.6;
		animation: wishIn 0.6s ease forwards;
	}

	@keyframes wishIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

	.nav-row { display: flex; gap: 0.8rem; margin-top: 0.5rem; }

	.nav-btn {
		font-size: 0.65rem; letter-spacing: 0.18em; text-transform: uppercase;
		color: rgba(240,235,227,0.2); padding: 0.6rem 1.2rem; border-radius: 100px;
		border: 1px solid rgba(244,213,200,0.06); background: transparent;
	}

	.nav-btn:hover { color: rgba(240,235,227,0.4); border-color: rgba(244,213,200,0.15); }

	.tagline {
		font-family: 'Playfair Display', Georgia, serif; font-style: italic;
		font-size: clamp(1.4rem,6vw,2rem); color: #f4d5c8;
	}

	.itinerary { display: flex; flex-direction: column; gap: 1rem; width: 100%; text-align: left; margin-top: 0.5rem; }

	.itin-item {
		padding: 1rem; border-radius: 12px;
		background: rgba(244,213,200,0.03); border: 1px solid rgba(244,213,200,0.06);
	}

	.itin-phase {
		font-size: 0.6rem; letter-spacing: 0.2em; text-transform: uppercase;
		color: rgba(240,235,227,0.2); display: block; margin-bottom: 0.3rem;
	}

	.itin-text { font-size: 0.95rem; color: rgba(240,235,227,0.5); line-height: 1.6; }
</style>
