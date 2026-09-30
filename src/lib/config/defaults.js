// Every piece of configurable content for a birthday card lives here.
//
// This object is the fallback for any card that has not been saved in Supabase,
// which means the app keeps working exactly as it did before the admin existed.
// It is also the schema the admin editor writes against, so adding a field here
// and surfacing it in /admin is all that is needed to make it configurable.

export const DEFAULT_CARD = {
	slug: '',
	name: 'Namita',
	birthdayAt: '2026-10-01T00:00:00+05:30',
	photoPath: '',
	planets: [
		{
			id: 'mercury',
			name: 'Mercury',
			text: 'the messenger of this system: pre-auths, claim queries, the follow-ups nobody else wants to own. you are genuinely, unreasonably good at them, and there’s no pretending you don’t enjoy the moment a claim finally clears.'
		},
		{
			id: 'venus',
			name: 'Venus',
			text: 'the brightest one here, and it isn’t close: patients settle into the chair and calm down before you’ve said a word. you do that without trying, which is not a small thing to be good at.'
		},
		{
			id: 'earth',
			name: 'Earth',
			text: 'you have a way of making conversations just run and run: a nervous patient leaves talking about something else entirely, and the hours quietly turn into the best part of the day.'
		},
		{
			id: 'mars',
			name: 'Mars',
			text: 'fire and independence: somewhere in you there is a version of this where the clinic, the chair and the schedule are all yours. you don’t circle around anyone, and you’re in no hurry to start.'
		},
		{
			id: 'jupiter',
			name: 'Jupiter',
			text: 'the biggest one here, and it’s fair: you make an absolutely ordinary appointment feel like the most important thing in that person’s year, and somehow it usually is.'
		},
		{
			id: 'saturn',
			name: 'Saturn',
			text: 'the ringed one, still mostly unexplored: you keep working through the layers — what you love, what you tolerate, what you’d actually build. the answers come late, and every one of them is worth the wait.'
		},
		{
			id: 'uranus',
			name: 'Uranus',
			text: 'the sideways one: the neat plan said one thing and you did another, and it suited you. you carved this out on your own terms, which is exactly why it fits.'
		},
		{
			id: 'neptune',
			name: 'Neptune',
			text: 'the farthest one, still the deepest mystery: you know exactly what a steady salary, a covered birthday and a team beside you are worth. nobody who loves you is pretending that isn’t real.'
		}
	],
	gifts: [
		{
			id: 'gift-exhale',
			text: 'a long exhale',
			emoji: '🍵',
			hint: 'breathe',
			vibe: 'for the days work takes everything',
			accent: '#33658a',
			kind: 'quote',
			title: 'a little peace, on tap',
			body: 'for the days work empties your tank and you still keep going after them. this one asks for nothing back: no effort, no performing, no being “on”. just a real exhale, and it’s completely allowed.'
		},
		{
			id: 'gift-laugh',
			text: 'a guaranteed laugh',
			emoji: '🤭',
			hint: 'doctor’s orders',
			vibe: 'medically approved silliness',
			accent: '#c26a3a',
			kind: 'playful',
			title: 'a signed prescription',
			body: 'you have spent months telling people to relax in a chair, and you are very good at it. consider this a signed, official note for at least one properly silly, snort-out-loud day every single week. dentist’s orders.'
		},
		{
			id: 'gift-busy',
			text: 'for the busier days',
			emoji: '🧡',
			hint: 'you, on the hard days',
			vibe: 'noticed, and appreciated',
			accent: '#8a4f63',
			kind: 'message',
			title: 'proof you’re appreciated',
			body: 'you make time for the people in your corner even when work has already taken most of you. that isn’t small, and it’s one of the best things about you: nobody in your life has to wonder where they stand.'
		},
		{
			id: 'gift-draft',
			text: 'for the parts not yet shared',
			emoji: '🔭',
			hint: 'still undiscovered',
			vibe: 'no rush at all',
			accent: '#5a4f8a',
			kind: 'visual',
			title: 'for the version still in draft',
			body: 'there’s a version of you that only comes out in your own time — the one who sets the hours, answers to nobody, owns the chair. and there’s no rush. the slow reveal is half the charm, and it’s going to be worth the wait.'
		},
		{
			id: 'gift-random',
			text: 'for the random moments',
			emoji: '📲',
			hint: 'for the 10pm forwards',
			vibe: 'reels, thoughts, tiny things',
			accent: '#2f6b5e',
			kind: 'playful',
			title: 'for no reason at all',
			body: 'random things always seem to land with you: reels, tiny observations, thoughts that matter to almost nobody. you have a way of receiving small stuff that makes it feel important, and people notice that.'
		},
		{
			id: 'gift-star',
			text: 'press the star',
			emoji: '⭐',
			hint: 'press the star for your wish',
			vibe: 'a tiny star, all yours',
			accent: '#a8842a',
			kind: 'interactive',
			title: 'your own star',
			interactiveLabel: 'press for your wish',
			body: 'there, it’s done. keep that one. something good is already making its way to you this year.'
		},
		{
			id: 'gift-year',
			text: 'the year ahead',
			emoji: '🌅',
			hint: 'all that’s left for you',
			vibe: 'for the good year coming',
			accent: '#7a3a5e',
			kind: 'quote',
			title: 'for the whole year ahead',
			body: 'may this year give you fewer exhausted days, more genuinely good ones, and an answer you’re happy with — whichever way it goes. you’ve got this one coming for you, {name}.'
		},
		{
			id: 'gift-bite',
			text: 'the last bite',
			emoji: '🍪',
			hint: 'save the craving for last',
			vibe: 'they saved a seat for you',
			accent: '#7a4a26',
			kind: 'playful',
			title: 'save the best for last',
			body: 'you save the best for last, and this year is set up exactly that way: the good stuff is still on its way, and it’s been saved all along for you.'
		}
	],
	settings: {
		gate: {
			// The mug fills across this window before the birthday.
			spanDays: 7,
			// Tagline is picked by how much time is left.
			taglines: {
				early: 'something warm is brewing',
				hours: 'get ready',
				minutes: 'almost here'
			},
			timeUp: 'it’s your time'
		},
		greet: {
			wishLines: [
				'today is about you',
				'and all the light you carry',
				'into another year'
			]
		},
		system: {
			// The moon and sun are structural — they are always present, so their
			// copy is edited here rather than in the planets list.
			moon: {
				name: 'Moon',
				text: 'you have phases: tired ones, bright ones, everything in between, and all of them make sense. you get to go dim sometimes and brilliant right after.'
			},
			sun: {
				name: 'Sun',
				text: 'the centre of this whole little universe: everything else just circles you. happy birthday, {name}.'
			},
			cardKicker: 'a piece of you',
			dismiss: 'tap anywhere to continue ◌',
			// Shown at the top, indexed by how many bodies have been explored.
			hints: [
				'tap a planet: each one knows something about you',
				'a few more to go...',
				'the system is awake!'
			],
			// How many bodies must be explored before the route counts as complete.
			exploreGoal: 4
		},
		giftsScreen: {
			tagline: 'a few things worth noticing',
			sub: 'small things, wrapped up. tap one.',
			surprise: 'surprise me',
			openAnother: '← open another gift',
			nextHint: 'ready when you are: one last thing waits ✨'
		},
		planner: {
			intro: {
				tag: 'before you begin',
				question: 'okay. it’s your day.',
				sub: 'you build it: a morning, an afternoon, an evening. all yours, no wrong answers.',
				start: 'start planning ✨'
			},
			// The four stages keep this shape: the personalised closing line
			// branches on these exact choice indices, so stages and their choice
			// counts are not add/remove in the admin — only their text is editable.
			stages: [
				{
					phase: 'morning',
					theme: 'm',
					title: 'how do you want your day to begin?',
					choices: [
						{ icon: '☀️', text: 'Slow morning', sub: 'coffee, soft light, nobody waiting on you' },
						{ icon: '☕', text: 'Good breakfast', sub: 'fresh coffee and something chocolate-y' },
						{ icon: '🌿', text: 'Get outside', sub: 'fresh air with a thermos of cocoa' },
						{ icon: '💌', text: 'Presents in bed', sub: 'cards and gifts before the day goes anywhere' },
						{ icon: '🛌', text: 'Sleep in', sub: 'phone on silent, to-dos politely ignored' }
					]
				},
				{
					phase: 'next',
					theme: 'n',
					title: 'what sounds good next?',
					choices: [
						{ icon: '🎨', text: 'Make something', sub: 'paint, bake, craft, whatever your hands want' },
						{ icon: '🗺️', text: 'Somewhere new', sub: 'a corner of the city you’ve never given a real look' },
						{ icon: '🛋️', text: 'Absolutely nothing', sub: 'guilt-free, gorgeous, perfectly empty' },
						{ icon: '📚', text: 'Book & a blanket', sub: 'words, warmth, nothing to follow up on' },
						{ icon: '📸', text: 'Memory hunt', sub: 'favourite corners, candid shots, the day on film' }
					]
				},
				{
					phase: 'afternoon',
					theme: 'a',
					title: 'your afternoon...',
					choices: [
						{ icon: '🍰', text: 'Treat time', sub: 'cake, chocolate and everything sweet' },
						{ icon: '🏞️', text: 'A little adventure', sub: 'explore with hot chocolate refills' },
						{ icon: '🎈', text: 'Lazy sunshine', sub: 'picnic naps and favorite people' },
						{ icon: '🍿', text: 'Cozy matinee', sub: 'blanket, snacks, a film you keep rewatching' },
						{ icon: '🧁', text: 'Bake something silly', sub: 'loud music, flour everywhere, better than store-bought' }
					]
				},
				{
					phase: 'evening',
					theme: 'e',
					title: 'your evening...',
					choices: [
						{ icon: '🎉', text: 'Something sparkly', sub: 'lights, music, loud happy noise' },
						{ icon: '🗝️', text: 'Mystery hour', sub: 'a puzzle, a riddle, something to solve' },
						{ icon: '🌙', text: 'Quiet & cosy', sub: 'blankets, a warm drink, slow and soft' },
						{ icon: '🌟', text: 'Dream about tomorrow', sub: 'wink at the year you’re building for' },
						{ icon: '🥂', text: 'Dinner, your call', sub: 'favourite place or favourite order, no compromises' },
						{ icon: '📵', text: 'Unplug before bed', sub: 'screens off, wind down, soft and dark' }
					]
				}
			],
			result: {
				kicker: 'all planned ♥',
				title: 'your birthday, your way',
				wish: 'psst! I wish I could be right there with you ✨',
				go: 'that sounds like a good day →',
				replan: '↺ replan my day'
			},
			// {m0}..{m3} are the four chosen option labels.
			planTemplate: 'a {m0} wake-up, then {m1}, a {m2} afternoon, ending with {m3}.',
			result: {
				kicker: 'all planned &heartsuit;',
				title: 'your birthday, your way',
				wish: 'psst! I wish I could be right there with you ✨',
				cta: 'that sounds like a good day →',
				replan: '↺ replan my day'
			}
		},
		finale: {
			// The first three are fixed; the fourth is chosen by the closing rules.
			wishes: [
				'you’ve shared some parts of yourself already',
				'they’re the kind of parts people are lucky to know',
				'and the parts still left to show are the best kind of gift'
			],
			closing: {
				fallback: 'and a whole year that’s kinder to you than you expect. happy birthday.',
				// Evaluated top to bottom; first match wins, then the fallback.
				// `when` must all match. `whenAny` needs only one to match.
				rules: [
					{ when: { evening: 1 }, text: 'may the mystery be fun and the answer quick, and may you get to celebrate it loudly. happy birthday.' },
					{ when: { evening: 0 }, text: 'dance like nobody’s counting, and let this year keep giving you reasons to. happy birthday.' },
					{ whenAny: [{ next: 1 }, { afternoon: 1 }], text: 'go take that adventure: may every small detour this year be worth it. happy birthday.' },
					{ when: { next: 2 }, text: 'may the nothing be luxurious and exactly what you needed. happy birthday.' },
					{ when: { afternoon: 0 }, text: 'may this year save you plenty of sweet treats, and plenty of reasons to deserve them. happy birthday.' },
					{ when: { morning: 1 }, text: 'may your mornings keep starting slow, and yours. happy birthday.' },
					{ when: { evening: 2 }, text: 'blankets warm, world quiet, and the whole year gentle with you. happy birthday.' },
					{ when: { evening: 3 }, text: 'may you keep dreaming easy: tomorrow is already holding something good. happy birthday.' }
				]
			},
			// Decorative emoji pairs beside the closing text, picked by the
			// planner's final stage choice.
			themes: {
				warm: ['🌞', '🧡'],
				party: ['🥳', '🎉'],
				mystery: ['🗝️', '🔎'],
				cozy: ['🧸', '🕯️'],
				dream: ['🌠', '✨']
			}
		},
		reel: {
			pressPlay: 'PRESS PLAY',
			bootHint: 'a tiny video, badly edited, with love',
			songMissing: '(no song file yet — clicking sfx only)',
			skip: 'skip ▸▸',
			endMark: '✦ that’s everything'
		}
	}
};

// ---------------------------------------------------------------------------
// Visual properties for solar-system bodies.
//
// Orbit radius and speed follow the body's POSITION in the list, so adding,
// removing or reordering never leaves a gap. Size, colour, rings and surface
// follow the body's id, so a new planet added in the admin still looks right.
// ---------------------------------------------------------------------------

export const ORBIT_RADII = [78, 110, 144, 180, 218, 268, 312, 349];
export const ORBIT_SPEEDS = [32, 48, 64, 80, 120, 160, 200, 240];

// Used for planets whose id is not in BODY_VISUALS (i.e. one you added).
export const FALLBACK_PALETTE = [
	{ color: '#9a8b7a', glowColor: 'rgba(154,139,122,0.35)' },
	{ color: '#e6c9a8', glowColor: 'rgba(230,201,168,0.35)' },
	{ color: '#3f86bf', glowColor: 'rgba(63,134,191,0.35)' },
	{ color: '#c65d3b', glowColor: 'rgba(198,93,59,0.35)' },
	{ color: '#8d6a4a', glowColor: 'rgba(141,106,74,0.35)' },
	{ color: '#e3b98f', glowColor: 'rgba(227,185,143,0.35)' },
	{ color: '#a7dbe0', glowColor: 'rgba(167,219,224,0.35)' },
	{ color: '#4a6fd0', glowColor: 'rgba(74,111,208,0.4)' }
];

export const FALLBACK_SIZES = [9, 12, 14, 16, 18, 20, 22, 24];

export const BODY_VISUALS = {
	mercury: { size: 8.4, color: '#9a8b7a', glowColor: 'rgba(154,139,122,0.35)', rings: false },
	venus: { size: 13.2, color: '#e6c9a8', glowColor: 'rgba(230,201,168,0.35)', rings: false },
	earth: {
		size: 14.4,
		color: '#3f86bf',
		glowColor: 'rgba(63,134,191,0.35)',
		rings: false,
		surface: 'radial-gradient(circle at 50% 120%, rgba(0,0,0,0.35) 0%, transparent 55%), radial-gradient(circle at 32% 32%, rgba(255,255,255,0.45) 0%, transparent 42%), radial-gradient(circle at 68% 55%, #3f9b57 0 22%, transparent 36%), radial-gradient(circle at 32% 74%, #43995a 0 15%, transparent 28%), #3f86bf'
	},
	mars: { size: 9.6, color: '#c65d3b', glowColor: 'rgba(198,93,59,0.35)', rings: false },
	jupiter: {
		size: 24,
		color: '#8d6a4a',
		glowColor: 'rgba(141,106,74,0.35)',
		rings: false,
		surface: 'radial-gradient(circle at 50% 120%, rgba(0,0,0,0.35) 0%, transparent 55%), radial-gradient(circle at 32% 32%, rgba(255,255,255,0.4) 0%, transparent 45%), repeating-linear-gradient(180deg, #cdaa80 0 8px, #8d6a4a 8px 16px)'
	},
	saturn: { size: 20.4, color: '#e3b98f', glowColor: 'rgba(227,185,143,0.35)', rings: true },
	uranus: { size: 18, color: '#a7dbe0', glowColor: 'rgba(167,219,224,0.35)', rings: false },
	neptune: { size: 17, color: '#4a6fd0', glowColor: 'rgba(74,111,208,0.4)', rings: false }
};

export const MOON_VISUALS = { size: 7.2, color: '#f0e0c8', glowColor: 'rgba(240,224,200,0.35)' };
export const SUN_VISUALS = { size: 40, color: '#f5c97a', glowColor: 'rgba(245,201,122,0.5)' };

// Fill in every visual property a body needs, deriving anything unknown.
export const withVisuals = (body, index) => {
	const known = BODY_VISUALS[body.id];
	const fallback = FALLBACK_PALETTE[index % FALLBACK_PALETTE.length];
	const visuals = known ?? {
		size: FALLBACK_SIZES[index % FALLBACK_SIZES.length],
		color: fallback.color,
		glowColor: fallback.glowColor,
		rings: false
	};
	return {
		...body,
		orbitRadius: ORBIT_RADII[Math.min(index, ORBIT_RADII.length - 1)],
		orbitSpeed: ORBIT_SPEEDS[Math.min(index, ORBIT_SPEEDS.length - 1)],
		size: visuals.size,
		color: visuals.color,
		glowColor: visuals.glowColor,
		rings: visuals.rings ?? false,
		...(visuals.surface ? { surface: visuals.surface } : {})
	};
};
