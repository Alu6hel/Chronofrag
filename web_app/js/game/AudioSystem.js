/**
 * Chronofrag Synthesized WebAudio System
 * 100% offline, zero external audio asset dependencies.
 * Synthesizes dynamic weapon sounds, time-dilation warps, kinetic impacts, and monster speech.
 */
class ChronoAudioSystem {
    constructor() {
        this.ctx = null;
        this.initialized = false;
        this.isMuted = false;
    }

    setMuted(muted) {
        this.isMuted = muted;
    }

    init() {
        if (this.initialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.initialized = true;
        } catch (e) {
            console.warn("WebAudio not supported", e);
        }
    }

    ensureContext() {
        if (!this.initialized) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        return (this.ctx && !this.isMuted);
    }

    // Gunshot: Punchy transient + noise burst + metallic decay
    playGunshot(weaponType = "rifle") {
        if (!this.ensureContext()) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Sub bass thump
        osc.type = "sawtooth";
        const startFreq = weaponType === "cannon" ? 220 : weaponType === "pistol" ? 440 : 320;
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);

        gain.gain.setValueAtTime(0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.2);

        // Noise crack
        const bufferSize = this.ctx.sampleRate * 0.1;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = "highpass";
        noiseFilter.frequency.setValueAtTime(1000, now);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.5, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);

        noise.start(now);
    }

    // Time Dilation Pulse: Deep dimensional whoosh
    playTimeWarp() {
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.exponentialRampToValueAtTime(360, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.25);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.25);
    }

    // Kinetic Hard Speed-Block: Heavy non-Newtonian thud
    playKineticBlock() {
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(20, now + 0.35);

        gain.gain.setValueAtTime(0.9, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.35);
    }

    // Satirical Monster Voice: Synthetic gargled speech formant
    playMonsterSpeech() {
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        [150, 220, 180, 260].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = now + idx * 0.08;

            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(freq, t);
            osc.frequency.linearRampToValueAtTime(freq * 0.8, t + 0.07);

            gain.gain.setValueAtTime(0.2, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.07);
        });
    }

    // "The Bugged" Glitch stutter
    playGlitchSnap() {
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "square";
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.setValueAtTime(400, now + 0.03);
        osc.frequency.setValueAtTime(1800, now + 0.06);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.1);
    }

    // Power unlock / activation chime
    playPowerChime() {
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = now + i * 0.09;

            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, t);

            gain.gain.setValueAtTime(0.35, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.4);
        });
    }

    // Juicy Hit Marker / Impact Sound: high transient click + deep bass thud
    playHitImpact(isCrit = false) {
        if (!this.ensureContext()) return;
        const now = this.ctx.currentTime;

        // Punchy sub thud
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = isCrit ? "sawtooth" : "triangle";
        const startFreq = isCrit ? 260 : 180;
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + (isCrit ? 0.16 : 0.1));

        gain.gain.setValueAtTime(isCrit ? 0.8 : 0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + (isCrit ? 0.16 : 0.1));

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);

        // Sharp high-frequency click
        const clickOsc = this.ctx.createOscillator();
        const clickGain = this.ctx.createGain();
        clickOsc.type = "sine";
        clickOsc.frequency.setValueAtTime(isCrit ? 2400 : 1600, now);
        clickOsc.frequency.exponentialRampToValueAtTime(600, now + 0.04);

        clickGain.gain.setValueAtTime(isCrit ? 0.6 : 0.35, now);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        clickOsc.connect(clickGain);
        clickGain.connect(this.ctx.destination);
        clickOsc.start(now);
        clickOsc.stop(now + 0.04);
    }

    // Player Hurt: Heavy impact + redout groan
    playPlayerHurt() {
        if (!this.ensureContext()) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(25, now + 0.3);

        gain.gain.setValueAtTime(0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        const filter = this.ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(450, now);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.3);
    }

    // Procedural Footstep: Tailored to surface (cobblestone, wood, metal)
    playFootstep(surfaceType = "cobblestone") {
        if (!this.ensureContext()) return;
        const now = this.ctx.currentTime;

        // Filtered noise pulse
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.06);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        if (surfaceType === "metal") {
            filter.type = "bandpass";
            filter.frequency.setValueAtTime(1200 + (Math.random() * 200 - 100), now);
            filter.Q.setValueAtTime(4.0, now);
            gain.gain.setValueAtTime(0.25, now);
        } else if (surfaceType === "wood") {
            filter.type = "lowpass";
            filter.frequency.setValueAtTime(400 + (Math.random() * 100 - 50), now);
            gain.gain.setValueAtTime(0.3, now);
        } else {
            // Cobblestone / stone
            filter.type = "bandpass";
            filter.frequency.setValueAtTime(600 + (Math.random() * 150 - 75), now);
            filter.Q.setValueAtTime(1.8, now);
            gain.gain.setValueAtTime(0.22, now);
        }

        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(now);

        // Low thud for body weight
        const thud = this.ctx.createOscillator();
        const thudGain = this.ctx.createGain();
        thud.type = "sine";
        thud.frequency.setValueAtTime(75, now);
        thud.frequency.exponentialRampToValueAtTime(25, now + 0.05);

        thudGain.gain.setValueAtTime(0.25, now);
        thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        thud.connect(thudGain);
        thudGain.connect(this.ctx.destination);

        thud.start(now);
        thud.stop(now + 0.05);
    }

    // Jump Landing Thud
    playJumpLand() {
        if (!this.ensureContext()) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(20, now + 0.2);

        gain.gain.setValueAtTime(0.65, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
    }

    // Hard Wall Spark / Ricochet Ping
    playWallRicochet() {
        if (!this.ensureContext()) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        const freq = 1800 + Math.random() * 1200;
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.4, now + 0.12);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
    }

    // Heavy Explosion: Grenades, Chrono Cannon impact
    playExplosion() {
        if (!this.ensureContext()) return;
        const now = this.ctx.currentTime;

        // Sub bass drop
        const sub = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        sub.type = "sawtooth";
        sub.frequency.setValueAtTime(120, now);
        sub.frequency.exponentialRampToValueAtTime(18, now + 0.6);

        subGain.gain.setValueAtTime(1.0, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        sub.connect(subGain);
        subGain.connect(this.ctx.destination);
        sub.start(now);
        sub.stop(now + 0.6);

        // Heavy roaring noise
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.5);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(500, now);
        filter.frequency.exponentialRampToValueAtTime(80, now + 0.5);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.8, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);

        noise.start(now);
    }

    // Title Ambient Stasis Drone
    startTitleDrone() {
        if (!this.ensureContext()) return;
        if (this.titleDroneNode) return;

        try {
            const now = this.ctx.currentTime;
            this.titleDroneGain = this.ctx.createGain();
            this.titleDroneGain.gain.setValueAtTime(0.001, now);
            this.titleDroneGain.gain.exponentialRampToValueAtTime(0.22, now + 1.5);

            // Sub bass root stasis drone (55Hz A1)
            const osc = this.ctx.createOscillator();
            osc.type = "sine";
            osc.frequency.setValueAtTime(55, now);

            // Low Harmonic (110Hz A2)
            const osc2 = this.ctx.createOscillator();
            osc2.type = "sawtooth";
            osc2.frequency.setValueAtTime(110, now);

            const filter = this.ctx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.setValueAtTime(160, now);

            const filterLfo = this.ctx.createOscillator();
            filterLfo.frequency.setValueAtTime(0.18, now);
            const lfoGain = this.ctx.createGain();
            lfoGain.gain.setValueAtTime(50, now);
            filterLfo.connect(lfoGain);
            lfoGain.connect(filter.frequency);

            osc.connect(this.titleDroneGain);
            osc2.connect(filter);
            filter.connect(this.titleDroneGain);
            this.titleDroneGain.connect(this.ctx.destination);

            osc.start(now);
            osc2.start(now);
            filterLfo.start(now);

            this.titleDroneNode = { osc, osc2, filterLfo, gain: this.titleDroneGain };
        } catch (e) {
            console.warn("Drone audio error", e);
        }
    }

    stopTitleDrone() {
        if (!this.titleDroneNode || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            this.titleDroneNode.gain.gain.setValueAtTime(this.titleDroneNode.gain.gain.value, now);
            this.titleDroneNode.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
            setTimeout(() => {
                try {
                    if (this.titleDroneNode) {
                        this.titleDroneNode.osc.stop();
                        this.titleDroneNode.osc2.stop();
                        this.titleDroneNode.filterLfo.stop();
                        this.titleDroneNode = null;
                    }
                } catch (e) {}
            }, 900);
        } catch (e) {
            this.titleDroneNode = null;
        }
    }

    // Menu Click SFX
    playMenuClick() {
        if (!this.ensureContext()) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1760, now + 0.04);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
    }

    // Weapon Cock / Stasis Breach SFX on Campaign Start
    playWeaponCock() {
        if (!this.ensureContext()) return;
        const now = this.ctx.currentTime;

        // Slide racking metallic transient
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(740, now + 0.08);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);

        // Click-lock
        setTimeout(() => {
            if (!this.ctx) return;
            const t2 = this.ctx.currentTime;
            const osc2 = this.ctx.createOscillator();
            const gain2 = this.ctx.createGain();
            osc2.type = "square";
            osc2.frequency.setValueAtTime(540, t2);
            gain2.gain.setValueAtTime(0.5, t2);
            gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.07);
            osc2.connect(gain2);
            gain2.connect(this.ctx.destination);
            osc2.start(t2);
            osc2.stop(t2 + 0.07);
        }, 120);
    }

    // Heavy Spaceship Airlock Pneumatic Depressurization (Planet Arrival Cutscene)
    playAirlockOpen() {
        if (!this.ensureContext()) return;
        const now = this.ctx.currentTime;

        // Sub rumble
        const sub = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        sub.type = "sawtooth";
        sub.frequency.setValueAtTime(80, now);
        sub.frequency.exponentialRampToValueAtTime(32, now + 1.8);
        subGain.gain.setValueAtTime(0.5, now);
        subGain.gain.exponentialRampToValueAtTime(0.01, now + 1.8);
        sub.connect(subGain);
        subGain.connect(this.ctx.destination);
        sub.start(now);
        sub.stop(now + 1.8);

        // High air steam hiss
        const bufferSize = this.ctx.sampleRate * 2.0;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.9));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(1400, now);
        filter.frequency.exponentialRampToValueAtTime(400, now + 1.8);
        filter.Q.value = 2.5;

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.4, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 1.8);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);
        noise.start(now);
    }

    // Kinetic Laser Barrier Pulse Warning
    playLaserTrip() {
        if (!this.ensureContext()) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(440, now + 0.08);
        osc.frequency.setValueAtTime(880, now + 0.16);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
    }
}

window.ChronoAudio = new ChronoAudioSystem();
