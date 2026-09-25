<script>
	import ChooseYourDay from '$lib/components/ChooseYourDay.svelte';
	import {getFlow} from '$lib/flow.svelte.js';

	const flow = getFlow();
	const initialChoices = Object.fromEntries(
		Object.entries(flow.choices).filter(([key, value]) => ['s0', 's1', 's2', 's3'].includes(key) && Number.isInteger(value) && value >= 0 && value < 4),
	);
</script>

<ChooseYourDay {initialChoices} onProgress={(value) => flow.setChoices(value)} />
