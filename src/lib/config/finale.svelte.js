import { card, fill } from './card.svelte.js';

// The four planner stages, flattened into the names the closing rules match on.
const choiceKeys = (ch) => ({
	morning: ch.s0,
	next: ch.s1,
	afternoon: ch.s2,
	evening: ch.s3
});

const ruleMatches = (rule, picks) => {
	if (rule.when) {
		return Object.entries(rule.when).every(([key, value]) => picks[key] === value);
	}
	if (Array.isArray(rule.whenAny)) {
		return rule.whenAny.some((cond) => Object.entries(cond).every(([key, value]) => picks[key] === value));
	}
	return false;
};

const isComplete = (ch) => ['s0', 's1', 's2', 's3'].every((key) => Number.isInteger(ch[key]));

// The personalised closing line. Rules are evaluated top to bottom, first match
// wins, then the fallback. Order matters and is preserved from the admin.
export const closingText = (choices) => {
	const { closing } = card.settings.finale;
	if (!isComplete(choices)) return fill(closing.fallback);
	const picks = choiceKeys(choices);
	for (const rule of closing.rules) {
		if (ruleMatches(rule, picks)) return fill(rule.text);
	}
	return fill(closing.fallback);
};

// Decorative emoji pair, driven by the final planner stage.
export const dayTheme = (choices) => {
	if (!isComplete(choices)) return 'warm';
	return ['party', 'mystery', 'cozy', 'dream'][choices.s3] || 'warm';
};

export const themeEmoji = (choices) => {
	const { themes } = card.settings.finale;
	const pair = themes[dayTheme(choices)] || themes.warm || ['🌞', '🧡'];
	return { treatLeft: pair[0], treatRight: pair[1] };
};

export const finaleWishes = (choices) => [
	...card.settings.finale.wishes.map(fill),
	closingText(choices)
];

// {m0}..{m3} in the planner's plan template are the four chosen option labels.
export const buildPlan = (stages, selections, template) => {
	const labels = [];
	for (let i = 0; i < stages.length; i++) {
		const choice = stages[i].choices?.[selections[`s${i}`]];
		if (!choice) return '';
		labels.push(choice.text);
	}
	return template
		.replaceAll('{m0}', labels[0])
		.replaceAll('{m1}', labels[1]?.toLowerCase() ?? '')
		.replaceAll('{m2}', labels[2]?.toLowerCase() ?? '')
		.replaceAll('{m3}', labels[3]?.toLowerCase() ?? '');
};
