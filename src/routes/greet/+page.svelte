<script>
	import BirthdayReveal from '$lib/components/BirthdayReveal.svelte';
	import BirthdayMusic from '$lib/components/BirthdayMusic.svelte';
	import {getFlow} from '$lib/flow.svelte.js';

	const flow = getFlow();
</script>

<BirthdayReveal onReady={() => flow.complete('greet')} />
<BirthdayMusic />
