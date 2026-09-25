<script>
	import BirthdayGate from '$lib/components/BirthdayGate.svelte';
	import {getFlow} from '$lib/flow.svelte.js';

	const flow = getFlow();
</script>

<BirthdayGate
	initiallyComplete={flow.isComplete('gate')}
	onReady={() => flow.complete('gate')}
/>
