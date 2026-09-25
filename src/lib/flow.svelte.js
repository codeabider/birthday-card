import { browser } from '$app/environment';
import { getContext } from 'svelte';

const PROGRESS_KEY = 'birthday-card-flow-v1';
const UNLOCK_KEY = 'birthday-card-unlocked-v1';
const PLAN_KEY = 'birthday-card-plan-v1';

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

export function createFlow() {
	let completed = $state([]);
	let exploredBodies = $state([]);
	let choices = $state({});
	let giftIndex = $state(null);
	let giftRevealed = $state(false);
	let wholeViewed = $state(false);

	function hydrate() {
		if (!browser) return;
		try {
			const savedPlan = sessionStorage.getItem(PLAN_KEY);
			if (savedPlan) {
				const parsed = JSON.parse(savedPlan);
				if (parsed && ['s0', 's1', 's2', 's3'].every((key) => Number.isInteger(parsed[key]))) {
					choices = { ...parsed };
				}
			}
			sessionStorage.removeItem(PROGRESS_KEY);
			wholeViewed = sessionStorage.getItem(UNLOCK_KEY) === '1';
		} catch {
			return;
		}
	}

	function markWholeViewed() {
		if (wholeViewed) return;
		wholeViewed = true;
		if (!browser) return;
		try {
			sessionStorage.setItem(UNLOCK_KEY, '1');
		} catch {
			return;
		}
	}

	function complete(id) {
		if (!completed.includes(id)) completed = [...completed, id];
	}

	function setExploredBodies(ids) {
		exploredBodies = [...new Set(ids)];
		completed = exploredBodies.length >= 4
			? [...new Set([...completed, 'system'])]
			: completed.filter((id) => id !== 'system');
	}

	function setChoices(value) {
		choices = { ...value };
		try {
			if (!browser) throw new Error('no browser');
			sessionStorage.setItem(PLAN_KEY, JSON.stringify(choices));
		} catch {
			// non-fatal: plan just won't survive a reload
		}
		const completeChoices = ['s0', 's1', 's2', 's3'].every((key) => Number.isInteger(choices[key]));
		completed = completeChoices
			? [...new Set([...completed, 'choose'])]
			: completed.filter((id) => id !== 'choose');
	}

	function setGift(index, isRevealed) {
		giftIndex = Number.isInteger(index) ? index : null;
		giftRevealed = isRevealed === true;
		completed = giftRevealed
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
		complete,
		setExploredBodies,
		setChoices,
		setGift,
		isComplete(id) { return completed.includes(id); },
	};
}

export function getFlow() {
	return getContext(FLOW_CONTEXT);
}