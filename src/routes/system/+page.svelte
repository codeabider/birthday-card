<script>
	import SolarSystem from '$lib/components/SolarSystem.svelte';
	import {getFlow} from '$lib/flow.svelte.js';

	const flow = getFlow();
const planets = [
		{
			id: 'mercury',
			name: 'Mercury',
			orbitRadius: 78,
			orbitSpeed: 32,
			size: 8.4,
			color: '#9a8b7a',
			glowColor: 'rgba(154,139,122,0.35)',
			rings: false,
			text: 'the messenger of this system: you collect the tiny things, the reels and stray thoughts nobody else thinks twice about, and you make them feel worth keeping.',
		},
		{
			id: 'venus',
			name: 'Venus',
			orbitRadius: 110,
			orbitSpeed: 48,
			size: 13.2,
			color: '#e6c9a8',
			glowColor: 'rgba(230,201,168,0.35)',
			rings: false,
			text: 'the brightest one here, and it isn\u2019t close: wherever you go, the space around you seems to pick up a little extra light.',
		},
		{
			id: 'earth',
			name: 'Earth',
			orbitRadius: 144,
			orbitSpeed: 64,
			size: 14.4,
			color: '#3f86bf',
			glowColor: 'rgba(63,134,191,0.35)',
			surface: 'radial-gradient(circle at 50% 120%, rgba(0,0,0,0.35) 0%, transparent 55%), radial-gradient(circle at 32% 32%, rgba(255,255,255,0.45) 0%, transparent 42%), radial-gradient(circle at 68% 55%, #3f9b57 0 22%, transparent 36%), radial-gradient(circle at 32% 74%, #43995a 0 15%, transparent 28%), #3f86bf',
			rings: false,
			text: 'you have a way of making conversations just run and run: the hours quietly slip away, and somewhere in there the talking turns into the best part of the day.',
		},
		{
			id: 'mars',
			name: 'Mars',
			orbitRadius: 180,
			orbitSpeed: 80,
			size: 9.6,
			color: '#c65d3b',
			glowColor: 'rgba(198,93,59,0.35)',
			rings: false,
			text: 'fire and independence: you run your whole own life and you don\u2019t circle around anyone. it\u2019s a rare, quiet power.',
		},
		{
			id: 'jupiter',
			name: 'Jupiter',
			orbitRadius: 218,
			orbitSpeed: 120,
			size: 24,
			color: '#8d6a4a',
			glowColor: 'rgba(141,106,74,0.35)',
			surface: 'radial-gradient(circle at 50% 120%, rgba(0,0,0,0.35) 0%, transparent 55%), radial-gradient(circle at 32% 32%, rgba(255,255,255,0.4) 0%, transparent 45%), repeating-linear-gradient(180deg, #cdaa80 0 8px, #8d6a4a 8px 16px)',
			rings: false,
			text: 'the biggest one here, and it\u2019s fair: you can make an absolutely ordinary day feel more interesting just by being part of it.',
		},
		{
			id: 'saturn',
			name: 'Saturn',
			orbitRadius: 268,
			orbitSpeed: 160,
			size: 20.4,
			color: '#e3b98f',
			glowColor: 'rgba(227,185,143,0.35)',
			rings: true,
			text: 'the ringed one, still mostly unexplored: whole layers of you keep revealing themselves over time, and the best part is that they keep coming.',
		},
		{
			id: 'uranus',
			name: 'Uranus',
			orbitRadius: 312,
			orbitSpeed: 200,
			size: 18,
			color: '#a7dbe0',
			glowColor: 'rgba(167,219,224,0.35)',
			rings: false,
			text: 'the sideways one: you took the usual plan and gently turned it on its head. it suits you, carving your own lane like it was always meant to be yours.',
		},
		{
			id: 'neptune',
			name: 'Neptune',
			orbitRadius: 349,
			orbitSpeed: 240,
			size: 17,
			color: '#4a6fd0',
			glowColor: 'rgba(74,111,208,0.4)',
			rings: false,
			text: 'the farthest one, still the deepest mystery: you keep good things close, and getting to know them at your own pace is part of what makes you interesting.',
		},
	];
	const moon = {
		id: 'moon',
		name: 'Moon',
		size: 7.2,
		color: '#f0e0c8',
		glowColor: 'rgba(240,224,200,0.35)',
		text: 'you have phases: tired ones, bright ones, everything in between, and all of them make sense. you get to go dim sometimes and brilliant right after.',
	};
	const sun = {
		id: 'sun',
		name: 'Sun',
		size: 40,
		color: '#f5c97a',
		glowColor: 'rgba(245,201,122,0.5)',
		text: 'the centre of this whole little universe: everything else just circles you. happy birthday, Namita.',
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
