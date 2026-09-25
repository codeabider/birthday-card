let ctx = null;
let master = null;
let echoSend = null;
let loopTimer = null;
let muted = false;

const BEAT = 0.57;
const GAP = 1.0;
const MASTER_VOL = 0.32;

// "Happy Birthday to You" in C — [frequency(Hz), duration(beats)]
const MELODY = [
	[261.63, 0.5], [261.63, 0.5], [293.66, 1], [261.63, 1], [349.23, 1], [329.63, 2],
	[261.63, 0.5], [261.63, 0.5], [293.66, 1], [261.63, 1], [392.0, 1], [349.23, 2],
	[261.63, 0.5], [261.63, 0.5], [523.25, 1], [440.0, 1], [349.23, 1], [329.63, 1], [293.66, 2],
	[466.16, 0.5], [466.16, 0.5], [440.0, 1], [349.23, 1], [392.0, 1], [349.23, 2]
];

function ensureContext() {
	if (typeof window === 'undefined') return null;
	const AC = window.AudioContext || window.webkitAudioContext;
	if (!AC) return null;
	if (!ctx) {
		ctx = new AC();
		master = ctx.createGain();
		master.gain.setValueAtTime(0, ctx.currentTime);
		master.gain.linearRampToValueAtTime(muted ? 0 : MASTER_VOL, ctx.currentTime + 0.5);
		master.connect(ctx.destination);

		// gentle echo into the chime sound — wide, airy, a few taps
		echoSend = ctx.createGain();
		echoSend.gain.value = 0.28;
		const delay = ctx.createDelay(1.5);
		delay.delayTime.value = 0.36;
		const feedback = ctx.createGain();
		feedback.gain.value = 0.38;
		const damp = ctx.createBiquadFilter();
		damp.type = 'lowpass';
		damp.frequency.value = 4200;
		const wet = ctx.createGain();
		wet.gain.value = 0.5;
		echoSend.connect(delay);
		delay.connect(feedback);
		feedback.connect(delay);
		delay.connect(damp);
		damp.connect(wet);
		wet.connect(master);
	}
	return ctx;
}

// small-chime partials — warm fundamentals, softened highs, twinkly stagger
	function playNote(freq, when, dur) {
		if (!ctx || !master || !echoSend) return;
		const PARTIALS = [
			{ ratio: 1.0, gain: 0.6, tail: 0.95 },
			{ ratio: 2.0, gain: 0.7, tail: 0.95 },
			{ ratio: 3.01, gain: 0.8, tail: 1.0 },
			{ ratio: 4.49, gain: 0.42, tail: 0.8 },
			{ ratio: 6.37, gain: 0.22, tail: 0.7 }
		];

		const ring = Math.max(dur * 2.0, 1.1);
		PARTIALS.forEach((p, i) => {
			const startAt = when + i * 0.005;
			const osc = ctx.createOscillator();
			osc.type = 'sine';
			osc.frequency.value = freq * p.ratio;
			const env = ctx.createGain();
			const stopAt = startAt + ring * p.tail + 0.08;
			env.gain.setValueAtTime(0, startAt);
			env.gain.linearRampToValueAtTime(0.4 * p.gain, startAt + 0.004);
			env.gain.exponentialRampToValueAtTime(0.0004, startAt + ring * p.tail);
			osc.connect(env);
			env.connect(master);
			env.connect(echoSend);
			osc.start(startAt);
			osc.stop(stopAt);
		});
	}

function scheduleLoop() {
	if (loopTimer) return;
	const ahead = 0.45;
	let index = 0;
	let nextTime = ctx.currentTime + 0.15;
	loopTimer = setInterval(() => {
		while (nextTime < ctx.currentTime + ahead) {
			if (index >= MELODY.length) {
				index = 0;
				nextTime += GAP;
			}
			const [freq, beats] = MELODY[index];
			const dur = beats * BEAT;
			// an octave-and-a-fifth above the root melody — tiny high crystal chimes
			playNote(freq * 3, nextTime, dur);
			nextTime += dur;
			index++;
		}
	}, 70);
}

export function playBirthdayTune() {
	const ac = ensureContext();
	if (!ac) return;
	if (ac.state === 'suspended' && typeof ac.resume === 'function') ac.resume().catch(() => {});
	scheduleLoop();
}

export function stopBirthdayTune() {
	if (loopTimer) {
		clearInterval(loopTimer);
		loopTimer = null;
	}
	if (ctx) {
		ctx.close().catch(() => {});
		ctx = null;
		master = null;
		echoSend = null;
	}
}

export function setBirthdayMuted(m) {
	muted = m;
	if (ctx && master) master.gain.value = m ? 0 : MASTER_VOL;
}

export function getBirthdayMuted() {
	return muted;
}

export function isBirthdayTuneActive() {
	return !!ctx;
}