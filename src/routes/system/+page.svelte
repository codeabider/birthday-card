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
			color: '#c9b8a8',
			glowColor: 'rgba(201,184,168,0.3)',
			rings: false,
			text: 'closest to the warmth you give so freely — quick and bright, always moving toward what matters',
		},
		{
			id: 'venus',
			name: 'Venus',
			orbitRadius: 96,
			orbitSpeed: 48,
			size: 25,
			color: '#e8c4a0',
			glowColor: 'rgba(232,196,160,0.35)',
			rings: false,
			text: 'the brightest one there is — your beauty has nothing to do with mirrors and everything to do with presence',
		},
		{
			id: 'earth',
			name: 'Earth',
			orbitRadius: 124,
			orbitSpeed: 64,
			size: 28,
			color: '#8ab4a0',
			glowColor: 'rgba(138,180,160,0.3)',
			rings: false,
			text: 'home feels like wherever you are — even across distance, you make every mile feel smaller than it should',
		},
		{
			id: 'mars',
			name: 'Mars',
			orbitRadius: 154,
			orbitSpeed: 80,
			size: 23,
			color: '#c47a6a',
			glowColor: 'rgba(196,122,106,0.3)',
			rings: false,
			text: 'red and restless — you carry a fire most people never get to see up close',
		},
		{
			id: 'jupiter',
			name: 'Jupiter',
			orbitRadius: 196,
			orbitSpeed: 120,
			size: 43,
			color: '#d4a87c',
			glowColor: 'rgba(212,168,124,0.3)',
			rings: false,
			text: 'the biggest heart of all — how much room you make for people who need it',
		},
		{
			id: 'saturn',
			name: 'Saturn',
			orbitRadius: 240,
			orbitSpeed: 160,
			size: 38,
			color: '#d8c090',
			glowColor: 'rgba(216,192,144,0.3)',
			rings: true,
			text: 'elegant in everything — your rings of grace turn even the simplest moments into something worth looking at longer',
		},
		{
			id: 'uranus',
			name: 'Uranus',
			orbitRadius: 284,
			orbitSpeed: 200,
			size: 30,
			color: '#9ab8c8',
			glowColor: 'rgba(154,184,200,0.3)',
			rings: false,
			text: 'tilted on your own axis — you do things your way and there is no one else who could do them like that',
		},
		{
			id: 'neptune',
			name: 'Neptune',
			orbitRadius: 324,
			orbitSpeed: 240,
			size: 29,
			color: '#7a8ab8',
			glowColor: 'rgba(122,138,184,0.3)',
			rings: false,
			text: 'the farthest one and still the brightest — depth runs so much deeper than anyone gives you credit for',
		},
	];
	const moon = {
		id: 'moon',
		name: 'Moon',
		size: 13,
		color: '#d4ccc0',
		glowColor: 'rgba(212,204,192,0.3)',
		text: 'you have your own phases and every single one is beautiful — even the quiet parts that you hide from everyone else',
	};
	const sun = {
		id: 'sun',
		name: 'Sun',
		size: 58,
		color: '#f5c97a',
		glowColor: 'rgba(245,201,122,0.5)',
		text: 'everything orbits around you — and honestly, looking at how much light you put into the world, that makes perfect sense',
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
