<script>
	import SolarSystem from '$lib/components/SolarSystem.svelte';
	import {getFlow} from '$lib/flow.svelte.js';
	import {card, fill} from '$lib/config/card.svelte.js';
	import {MOON_VISUALS, SUN_VISUALS} from '$lib/config/defaults.js';

	const flow = getFlow();
	const planets = $derived(card.planets);
	const moon = $derived({id: 'moon', ...MOON_VISUALS, ...card.settings.system.moon});
	const sun = $derived({id: 'sun', ...SUN_VISUALS, text: fill(card.settings.system.sun.text)});
	const bodyIds = $derived(new Set([...planets.map((planet) => planet.id), sun.id, moon.id]));
	const initialExploredIds = $derived(flow.exploredBodies.filter((id) => bodyIds.has(id)));
	const exploreGoal = $derived(card.settings.system.exploreGoal);
</script>

<SolarSystem
	{planets}
	{moon}
	{sun}
	{initialExploredIds}
	{exploreGoal}
	onProgress={(ids) => flow.setExploredBodies(ids)}
/>