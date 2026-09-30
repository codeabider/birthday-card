export const persona = $state({
	name: 'Namita',
	display: 'Namita',
	possessive: 'Namita\u2019s',
});

export const initPersona = () => {
	if (typeof window === 'undefined') return;
	const raw = new URLSearchParams(window.location.search).get('for');
	const trimmed = raw ? raw.trim() : '';
	if (!trimmed) return;
	const name =
		trimmed === trimmed.toLowerCase() ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1) : trimmed;
	persona.name = name;
	persona.display = name;
	persona.possessive = `${name}\u2019s`;
}

// Used by the card store so a loaded card's name flows through to every
// component that already reads `persona`.
export const setPersonaName = (name) => {
	const trimmed = (name || '').trim();
	if (!trimmed) return;
	persona.name = trimmed;
	persona.display = trimmed;
	persona.possessive = `${trimmed}\u2019s`;
}