import { browser } from '$app/environment';
import { getContext } from 'svelte';

const STORAGE_KEY = 'birthday-card-flow-v1';

export const FLOW_CONTEXT = Symbol('birthday-card-flow');

export const FLOW_ROUTES = [
	{ id: 'gate', path: '/', label: 'Timer' },
	{ id: 'open', path: '/open', label: 'Opening' },
	{ id: 'greet', path: '/greet', label: 'Greeting' },
	{ id: 'system', path: '/system', label: 'Solar System' },
	{ id: 'choose', path: '/choose', label: 'Choose Your Day' },
	{ id: 'gifts', path: '/gifts', label: 'Gift' },
	{ id: 'final', path: '/final', label: 'Final' },
];

function loadState() {
	if (!browser) return null;

	try {
		const value = sessionStorage.getItem(STORAGE_KEY);
		return value ? JSON.parse(value) : null;
	} catch {
		return null;
	}
}

export function createFlow() {
	let completed = $state([]);
	let solarIds = $state([]);
	let choices = $state({});
	let giftIndex = $state(null);
	let giftRevealed = $state(false);
	let hydrated = $state(false);

	function persist() {
		if (!browser) return;
		sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ completed, solarIds, choices, giftIndex, giftRevealed }));
	}

	function hydrate() {
		const saved = loadState();
		if (saved) {
			completed = Array.isArray(saved.completed) ? saved.completed : [];
			solarIds = Array.isArray(saved.solarIds) ? saved.solarIds : [];
			choices = saved.choices && typeof saved.choices === 'object' ? saved.choices : {};
			giftIndex = Number.isInteger(saved.giftIndex) ? saved.giftIndex : null;
			giftRevealed = saved.giftRevealed === true;
		}
		hydrated = true;
	}

	function complete(id) {
		if (!completed.includes(id)) {
			completed = [...completed, id];
			persist();
		}
	}

	function setSolarIds(ids) {
		solarIds = [...new Set(ids)];
		if (solarIds.length >= 4) completed = [...new Set([...completed, 'system'])];
		persist();
	}

	function setChoices(value) {
		choices = { ...value };
		const completeChoices = ['s0', 's1', 's2'].every((key) => Number.isInteger(choices[key]));
		if (completeChoices) completed = [...new Set([...completed, 'choose'])];
		persist();
	}

	function setGift(index, isRevealed) {
		giftIndex = Number.isInteger(index) ? index : null;
		giftRevealed = isRevealed === true;
		if (giftRevealed) completed = [...new Set([...completed, 'gifts'])];
		persist();
	}

	if (browser) hydrate();

	return {
		routes: FLOW_ROUTES,
		get completed() { return completed; },
		get solarIds() { return solarIds; },
		get choices() { return choices; },
		get giftIndex() { return giftIndex; },
		get giftRevealed() { return giftRevealed; },
		get hydrated() { return hydrated; },
		complete,
		setSolarIds,
		setChoices,
		setGift,
		isComplete(id) { return completed.includes(id); },
	};
}

export function getFlow() {
	return getContext(FLOW_CONTEXT);
}
