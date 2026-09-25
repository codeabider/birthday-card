<script>
	import BirthdayGate from '$lib/components/BirthdayGate.svelte';
	import {getFlow, NAVIGATION_CONTEXT} from '$lib/flow.svelte.js';
	import {getContext} from 'svelte';

	const flow = getFlow();
	const {advance} = getContext(NAVIGATION_CONTEXT);
</script>

<BirthdayGate
	initiallyComplete={flow.isComplete('gate')}
	onReady={() => flow.complete('gate')}
	onAutoProceed={advance}
/>
