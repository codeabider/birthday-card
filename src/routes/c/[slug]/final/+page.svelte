<script>
	import {goto} from '$app/navigation';
	import {base} from '$app/paths';
	import {page} from '$app/state';
	import RetroReel from '$lib/components/RetroReel.svelte';
	import BirthdayMusic from '$lib/components/BirthdayMusic.svelte';
	import {persona} from '$lib/persona.svelte.js';
	import {getFlow} from '$lib/flow.svelte.js';
	import {finaleWishes, themeEmoji} from '$lib/config/finale.svelte.js';
	import {card} from '$lib/config/card.svelte.js';

	const flow = getFlow();

	let reelDone = $state(false);

	const wishes = $derived(finaleWishes(flow.choices));
	const treats = $derived(themeEmoji(flow.choices));

	const restart = () => {
		flow.reset();
		goto(`${base}/c/${page.params.slug}`);
	};
</script>

<RetroReel
	name={persona.display}
	{wishes}
	treatLeft={treats.treatLeft}
	treatRight={treats.treatRight}
	photoUrl={card.photoUrl}
	onReady={() => {
		flow.complete('final');
		reelDone = true;
	}}
	onRestart={restart}
/>

{#if reelDone}
	<BirthdayMusic />
{/if}
