import { browser } from '$app/environment';
import { getContext } from 'svelte';

export const SECRET_KEY = 'birthday-preview-2026';

export const FLOW_CONTEXT = Symbol('birthday-card-flow');
export const NAVIGATION_CONTEXT = Symbol('birthday-card-navigation');

export const FLOW_ROUTES = [
	{ id: 'gate', path: '/', label: 'Timer' },
	{ id: 'greet', path: '/greet', label: 'Greeting' },
	{ id: 'system', path: '/system', label: 'Solar System' },
	{ id: 'choose', path: '/choose', label: 'Choose Your Day' },
	{ id: 'gifts', path: '/gifts', label: 'Gift' },
	{ id: 'final', path: '/final', label: 'Final' },
];

export const createFlow = () => {
	let completed = $state([]);
	let exploredBodies = $state([]);
	let choices = $state({});
	let giftIndex = $state(null);
	let giftRevealed = $state(false);
	let giftEverOpened = $state(false);
	let wholeViewed = $state(false);
	let restarting = $state(false);

	const hydrate = () => {
		if (!browser) return;
		try {
			const url = new URL(window.location.href);
			if (url.searchParams.get('key') === SECRET_KEY) wholeViewed = true;
			if (url.searchParams.has('key')) {
				url.searchParams.delete('key');
				history.replaceState(null, '', url.pathname + url.hash);
			}
		} catch {
			return;
		}
	}

	const markWholeViewed = () => {
		if (wholeViewed || restarting) return;
		wholeViewed = true;
	}

	const onGate = () => {
		restarting = false;
	}

	const reset = () => {
		restarting = true;
		completed = [];
		exploredBodies = [];
		choices = {};
		giftIndex = null;
		giftRevealed = false;
		giftEverOpened = false;
		wholeViewed = false;
	}

	const complete = (id) => {
		if (!completed.includes(id)) completed = [...completed, id];
	}

	const setExploredBodies = (ids) => {
		exploredBodies = [...new Set(ids)];
		completed = exploredBodies.length >= 4
			? [...new Set([...completed, 'system'])]
			: completed.filter((id) => id !== 'system');
	}

	const setChoices = (value) => {
		choices = { ...value };
		const completeChoices = ['s0', 's1', 's2', 's3'].every((key) => Number.isInteger(choices[key]));
		completed = completeChoices
			? [...new Set([...completed, 'choose'])]
			: completed.filter((id) => id !== 'choose');
	}

	const setGift = (index, isRevealed) => {
		giftIndex = Number.isInteger(index) ? index : null;
		giftRevealed = isRevealed === true;
		if (giftRevealed) giftEverOpened = true;
		completed = giftEverOpened
			? [...new Set([...completed, 'gifts'])]
			: completed.filter((id) => id !== 'gifts');
	}

	return {
		routes: FLOW_ROUTES,
		get completed() { return completed; },
		get exploredBodies() { return exploredBodies; },
		get choices() { return choices; },
		get giftIndex() { return giftIndex; },
		get giftRevealed() { return giftRevealed; },
		get wholeViewed() { return wholeViewed; },
		hydrate,
		markWholeViewed,
		onGate,
		reset,
		complete,
		setExploredBodies,
		setChoices,
		setGift,
		isComplete(id) { return completed.includes(id); },
	};
}

export const getFlow = () => {
	return getContext(FLOW_CONTEXT);
}