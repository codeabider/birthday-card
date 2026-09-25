<script>
	import SolarSystem from '$lib/components/SolarSystem.svelte';
	import {getFlow} from '$lib/flow.svelte.js';

	const flow = getFlow();
const planets = [
		{
			id: 'mercury',
			name: 'Mercury',
			orbitRadius: 72,
			orbitSpeed: 32,
			size: 18,
			color: '#8a5a3b',
			glowColor: 'rgba(138,90,59,0.35)',
			rings: false,
			text: 'the first bean of the day — quick and bright, always the one to get things started',
		},
		{
			id: 'venus',
			name: 'Venus',
			orbitRadius: 96,
			orbitSpeed: 48,
			size: 25,
			color: '#e6c9a8',
			glowColor: 'rgba(230,201,168,0.35)',
			rings: false,
			text: 'the brightest one there is — like the foam on a perfect latte, you make everything around you lighter',
		},
		{
			id: 'earth',
			name: 'Earth',
			orbitRadius: 124,
			orbitSpeed: 64,
			size: 28,
			color: '#a9744f',
			glowColor: 'rgba(169,116,79,0.35)',
			rings: false,
			text: 'home feels like wherever you are — even across distance, you turn any room into a warm corner with cocoa ready',
		},
		{
			id: 'mars',
			name: 'Mars',
			orbitRadius: 154,
			orbitSpeed: 80,
			size: 23,
			color: '#c65d3b',
			glowColor: 'rgba(198,93,59,0.35)',
			rings: false,
			text: 'red and restless — a little chili heat in your chocolate. you carry a fire most people never see up close',
		},
		{
			id: 'jupiter',
			name: 'Jupiter',
			orbitRadius: 196,
			orbitSpeed: 120,
			size: 43,
			color: '#8d6a4a',
			glowColor: 'rgba(141,106,74,0.35)',
			rings: false,
			text: 'the biggest heart of all — so many layers of warmth, like the richest mocha you keep saving for the good days',
		},
		{
			id: 'saturn',
			name: 'Saturn',
			orbitRadius: 240,
			orbitSpeed: 160,
			size: 38,
			color: '#e3b98f',
			glowColor: 'rgba(227,185,143,0.35)',
			rings: true,
			text: 'elegant in everything — your rings are like the swirl a spoon leaves in hot chocolate, grace you barely notice',
		},
		{
			id: 'uranus',
			name: 'Uranus',
			orbitRadius: 284,
			orbitSpeed: 200,
			size: 30,
			color: '#b09ac4',
			glowColor: 'rgba(176,154,196,0.35)',
			rings: false,
			text: 'tilted on your own axis — grape and cocoa both, you do things your way and nobody could do them like that',
		},
		{
			id: 'neptune',
			name: 'Neptune',
			orbitRadius: 324,
			orbitSpeed: 240,
			size: 29,
			color: '#8068a8',
			glowColor: 'rgba(128,104,168,0.4)',
			rings: false,
			text: 'the farthest one and still the brightest — dark and deep like 90% cocoa, richer than anyone gives you credit for',
		},
	];
	const moon = {
		id: 'moon',
		name: 'Moon',
		size: 13,
		color: '#f0e0c8',
		glowColor: 'rgba(240,224,200,0.35)',
		text: 'you have your own phases and every single one is beautiful — even the quiet parts, like the pause before a perfect cup',
	};
	const sun = {
		id: 'sun',
		name: 'Sun',
		size: 58,
		color: '#f5c97a',
		glowColor: 'rgba(245,201,122,0.5)',
		text: 'everything orbits around you — the main ingredient that makes the whole cup worth it, and honestly it always has been',
	};
	const bodyIds = new Set([...planets.map((planet) => planet.id), sun.id, moon.id]);
	const initialExploredIds = flow.exploredBodies.filter((id) => bodyIds.has(id));
</script>

<SolarSystem
	{planets}
	{moon}
	{sun}
	{initialExploredIds}
	onProgress={(ids) => flow.setExploredBodies(ids)}
/>
