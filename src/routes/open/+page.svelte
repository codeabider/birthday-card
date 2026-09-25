<script>
	import Opening from '$lib/components/Opening.svelte';
	import {getFlow} from '$lib/flow.svelte.js';

	const flow = getFlow();
</script>

<Opening onReady={() => flow.complete('open')} />
