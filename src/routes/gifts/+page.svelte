<script>
	import Gifts from '$lib/components/Gifts.svelte';
	import {getFlow} from '$lib/flow.svelte.js';

	const flow = getFlow();
</script>

<Gifts
	initialFeeling={flow.giftIndex}
	initiallyRevealed={flow.giftRevealed}
	onProgress={(index, revealed) => flow.setGift(index, revealed)}
/>
