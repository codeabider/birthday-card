<script>
	import { onMount } from 'svelte';

	let starsReady = $state(false);
	let bands = [];

	const motesDef = [
		{ mx: -70, rise: 110, dl: 0.2, du: 7.0 },
		{ mx: -28, rise: 150, dl: 2.1, du: 7.4 },
		{ mx: 18, rise: 120, dl: 1.1, du: 6.8 },
		{ mx: 58, rise: 90, dl: 3.2, du: 7.6 },
		{ mx: 86, rise: 130, dl: 0.7, du: 6.4 },
		{ mx: -52, rise: 80, dl: 4.0, du: 6.2 },
	];

	onMount(() => {
		if (typeof window === 'undefined') return;
		const scale = Math.max(0.7, Math.min(1.3, Math.min(window.innerWidth, window.innerHeight) / 340));
		const rand = (a, b) => a + Math.random() * (b - a);
		const defs = [
			{ n: 9, rmin: 112, rmax: 150, sz: [2.6, 4.6], o: [0.55, 0.95], blur: [0, 0.8] },
			{ n: 14, rmin: 158, rmax: 208, sz: [1.8, 3.4], o: [0.35, 0.8], blur: [0.4, 1.8] },
			{ n: 20, rmin: 214, rmax: 288, sz: [1.2, 2.5], o: [0.2, 0.55], blur: [1, 3.2] },
		];
		bands = defs.map((d, bi) => ({
			dur: [9, 14, 24][bi],
			stars: Array.from({ length: d.n }, () => ({
				a: Math.random() * 360,
				r: (rand(d.rmin, d.rmax) * scale).toFixed(1),
				sz: rand(d.sz[0], d.sz[1]).toFixed(1),
				o: rand(d.o[0], d.o[1]).toFixed(2),
				b: rand(d.blur[0], d.blur[1]).toFixed(1),
				tw: rand(2.6, 5.2).toFixed(1),
				dl: rand(0, 5).toFixed(1),
				gold: Math.random() < 0.22,
			}))
		}));
		starsReady = true;
	});
</script>

<div class="dusk">
	<div class="dawn">
		<span class="veil vx1"></span>
		<span class="veil vx2"></span>
		<span class="sky-glow"></span>

		<div class="sun-wrap">
			<span class="halo"></span>
			<span class="corona"></span>
			<span class="core"></span>

			{#if starsReady}
				{#each bands as band, bi}
					<div class="orb-band band-{bi}" style="--bdur:{band.dur}s;">
						{#each band.stars as st}
							<span
								class="orb-star {st.gold ? 'gold' : ''}"
								style="--a:{st.a}deg;--r:{st.r}px;--sz:{st.sz}px;--o:{st.o};--blur:{st.b}px;--tw:{st.tw}s;--dl:{st.dl}s;"
							></span>
						{/each}
					</div>
				{/each}
			{/if}

			{#each motesDef as m}
				<span class="mote" style="--mx:{m.mx}px;--rise:{m.rise}px;--mdl:{m.dl}s;--mdu:{m.du}s;"></span>
			{/each}
		</div>
	</div>
</div>

<style>
	.dusk {
		position: fixed;
		inset: 0;
		overflow: hidden;
		background:
			radial-gradient(ellipse at 50% 42%, rgba(255, 180, 120, 0.1) 0%, transparent 46%),
			radial-gradient(ellipse at 50% 118%, rgba(120, 140, 210, 0.1) 0%, transparent 55%),
			linear-gradient(180deg, #060a15 0%, #0a1122 55%, #0d1526 100%);
	}

	.dawn {
		position: absolute;
		inset: 0;
		animation: dawn 3.5s ease-out both;
	}

	@keyframes dawn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	/* soft peach light veils */
	.veil {
		position: absolute;
		width: 60vmax;
		height: 32vmax;
		filter: blur(60px);
		opacity: 0.12;
		pointer-events: none;
	}

	.vx1 {
		top: -10vmax;
		left: -18vmax;
		background: radial-gradient(ellipse, rgba(255, 201, 158, 0.65), transparent 60%);
		animation: veilA 16s ease-in-out infinite;
	}

	.vx2 {
		bottom: -14vmax;
		right: -16vmax;
		background: radial-gradient(ellipse, rgba(255, 186, 140, 0.55), transparent 60%);
		animation: veilB 20s ease-in-out infinite;
	}

	@keyframes veilA {
		0%, 100% { transform: translate(0, 0) scale(1); }
		50% { transform: translate(6vmax, 3vmax) scale(1.12); }
	}

	@keyframes veilB {
		0%, 100% { transform: translate(0, 0) scale(1.05); }
		50% { transform: translate(-5vmax, -3vmax) scale(0.94); }
	}

	.sky-glow {
		position: absolute;
		left: 50%;
		bottom: -16vmax;
		width: 120vmax;
		height: 60vmax;
		transform: translateX(-50%);
		background: radial-gradient(ellipse, rgba(255, 190, 140, 0.16), rgba(255, 190, 140, 0.06) 45%, transparent 65%);
		filter: blur(20px);
		animation: glowBreathe 8s ease-in-out infinite;
	}

	@keyframes glowBreathe {
		0%, 100% { opacity: 0.45; }
		50% { opacity: 0.75; }
	}

	/* the sun */
	.sun-wrap {
		position: absolute;
		top: 15%;
		left: 50%;
	}

	.halo {
		position: absolute;
		left: 0;
		top: 0;
		width: 44vmin;
		height: 44vmin;
		transform: translate(-50%, -50%);
		border-radius: 50%;
		background: radial-gradient(circle, rgba(255, 190, 130, 0.24) 0%, rgba(255, 170, 110, 0.09) 38%, transparent 62%);
		filter: blur(34px);
		animation: haloPulse 8s ease-in-out infinite;
	}

	@keyframes haloPulse {
		0%, 100% { transform: translate(-50%, -50%) scale(1); }
		50% { transform: translate(-50%, -50%) scale(1.1); }
	}

	.corona {
		position: absolute;
		left: 0;
		top: 0;
		width: min(108px, 31vw);
		height: min(108px, 31vw);
		transform: translate(-50%, -50%);
		border-radius: 50%;
		background: radial-gradient(circle, rgba(255, 240, 210, 0.9) 0%, rgba(255, 205, 150, 0.45) 34%, rgba(255, 170, 110, 0.16) 55%, transparent 72%);
		filter: blur(5px);
		animation: coronaB 8s ease-in-out infinite;
	}

	@keyframes coronaB {
		0%, 100% { transform: translate(-50%, -50%) scale(1); }
		50% { transform: translate(-50%, -50%) scale(1.05); }
	}

	.core {
		position: absolute;
		left: 0;
		top: 0;
		width: min(46px, 13vw);
		height: min(46px, 13vw);
		transform: translate(-50%, -50%);
		border-radius: 50%;
		background: radial-gradient(circle at 36% 32%, #fff3dd 0%, #ffd9a8 45%, #f4ad70 78%, #e08e52 100%);
		box-shadow:
			0 0 40px 14px rgba(255, 196, 130, 0.5),
			0 0 120px 40px rgba(255, 170, 110, 0.26);
		animation: coreB 8s ease-in-out infinite;
	}

	@keyframes coreB {
		0%, 100% { transform: translate(-50%, -50%) scale(1); }
		50% { transform: translate(-50%, -50%) scale(1.07); }
	}

	/* drifting warm stars */
	.orb-band {
		position: absolute;
		left: 0;
		top: 0;
		width: 0;
		height: 0;
		animation: spin var(--bdur) linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.orb-star {
		position: absolute;
		left: 0;
		top: 0;
		width: var(--sz);
		height: var(--sz);
		border-radius: 50%;
		background: radial-gradient(circle, rgba(255, 222, 186, 1) 0%, rgba(255, 196, 150, 0.6) 100%);
		opacity: var(--o);
		filter: blur(var(--blur));
		transform: rotate(var(--a)) translateX(var(--r));
		animation: twk var(--tw) ease-in-out infinite var(--dl);
	}

	.orb-star.gold {
		background: radial-gradient(circle, #ffe9c8 0%, rgba(255, 196, 120, 0.7) 100%);
	}

	@keyframes twk {
		0%, 100% { opacity: calc(var(--o) * 0.35); }
		50% { opacity: var(--o); }
	}

	/* rising light motes */
	.mote {
		position: absolute;
		left: 50%;
		top: 50%;
		width: 2.5px;
		height: 2.5px;
		margin: -1.25px 0 0 -1.25px;
		border-radius: 50%;
		background: rgba(255, 214, 170, 0.8);
		filter: blur(0.4px);
		opacity: 0;
		animation: moteFloat var(--mdu) ease-out infinite;
		animation-delay: var(--mdl);
	}

	@keyframes moteFloat {
		0% { transform: translate(var(--mx, 0px), 10px) scale(0.7); opacity: 0; }
		15% { opacity: 0.85; }
		100% { transform: translate(calc(var(--mx, 0px) * -0.3), calc(-1 * var(--rise, 90px))) scale(0.5); opacity: 0; }
	}

	@media (prefers-reduced-motion: reduce) {
		.dawn { animation: none; }
		.veil, .sky-glow, .halo, .corona, .core, .orb-band, .orb-star, .mote {
			animation: none !important;
		}
	}
</style>