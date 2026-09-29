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