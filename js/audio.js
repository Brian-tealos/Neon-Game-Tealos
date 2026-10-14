/**
 * Neon Void - Procedural Web Audio Engine
 * Genera efectos de sonido y música retro sintetizada dinámicamente sin archivos externos.
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.soundEnabled = true;
        this.musicEnabled = true;
        this.bgmInterval = null;
        this.bgmStep = 0;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            this.ctx = new AudioContext();
            this.initialized = true;
            if (this.musicEnabled) {
                this.startBGM();
            }
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // Disparo láser clásico
    playLaser(pitch = 1.0) {
        if (!this.soundEnabled || !this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(850 * pitch, t);
        osc.frequency.exponentialRampToValueAtTime(80, t + 0.12);

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.13);
    }

    // Disparo de plasma pesado o misil
    playPlasma() {
        if (!this.soundEnabled || !this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, t);
        osc.frequency.exponentialRampToValueAtTime(60, t + 0.22);

        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.23);
    }

    // Explosión procedural sintetizada con ruido blanco
    playExplosion(intensity = 1.0) {
        if (!this.soundEnabled || !this.ctx) return;
        const t = this.ctx.currentTime;
        const duration = 0.35 * Math.min(intensity, 2.0);
        const bufferSize = Math.floor(this.ctx.sampleRate * duration);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        // Filtro pasabajos para dar sensación de estruendo espacial
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450 * intensity, t);
        filter.frequency.exponentialRampToValueAtTime(40, t + duration);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.4 * Math.min(intensity, 1.5), t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(t);
        noise.stop(t + duration);
    }

    // Impacto / Chispa en el escudo
    playHit() {
        if (!this.soundEnabled || !this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(260, t);
        osc.frequency.exponentialRampToValueAtTime(90, t + 0.08);

        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.09);
    }

    // Dash / Impulso supersónico
    playDash() {
        if (!this.soundEnabled || !this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(750, t + 0.18);

        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.19);
    }

    // Bomba EMP masiva
    playEMP() {
        if (!this.soundEnabled || !this.ctx) return;
        const t = this.ctx.currentTime;
        
        // Frecuencia sinusoidal descendente masiva
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.exponentialRampToValueAtTime(30, t + 0.8);

        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.85);

        // Explosión secundaria
        this.playExplosion(2.0);
    }

    // Recogida de orbe o subida de nivel
    playPickup(type = 'gem') {
        if (!this.soundEnabled || !this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        if (type === 'gem') {
            osc.frequency.setValueAtTime(520, t);
            osc.frequency.exponentialRampToValueAtTime(980, t + 0.1);
        } else {
            // Powerup mayor
            osc.frequency.setValueAtTime(440, t);
            osc.frequency.setValueAtTime(660, t + 0.08);
            osc.frequency.exponentialRampToValueAtTime(1100, t + 0.2);
        }

        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + (type === 'gem' ? 0.1 : 0.22));

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + (type === 'gem' ? 0.11 : 0.23));
    }

    // Alerta de Jefe
    playBossAlarm() {
        if (!this.soundEnabled || !this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, t);
        osc.frequency.setValueAtTime(240, t + 0.2);
        osc.frequency.setValueAtTime(180, t + 0.4);
        osc.frequency.setValueAtTime(240, t + 0.6);

        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.9);
    }

    // Música de Fondo Synthwave Procedural
    startBGM() {
        if (this.bgmInterval || !this.ctx || !this.musicEnabled) return;
        
        // Secuencia de notas de bajo synth cyberpunk (escalas de La menor / Dórico)
        const bassNotes = [110, 110, 130.81, 110, 146.83, 130.81, 98, 110]; // A2, C3, D3, G2
        const tempo = 135; // BPM
        const stepDuration = 60 / tempo / 2; // Corcheas (16th notes/eighth notes)

        this.bgmInterval = setInterval(() => {
            if (!this.musicEnabled || !this.ctx || this.ctx.state !== 'running') return;
            
            const t = this.ctx.currentTime;
            const noteFreq = bassNotes[this.bgmStep % bassNotes.length];
            
            // Sintetizador de bajo
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(noteFreq, t);

            filter.type = 'lowpass';
            // Variación rítmica del filtro de corte
            const cutoff = (this.bgmStep % 4 === 0) ? 900 : 450;
            filter.frequency.setValueAtTime(cutoff, t);
            filter.frequency.exponentialRampToValueAtTime(120, t + stepDuration * 0.9);

            gain.gain.setValueAtTime(0.08, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + stepDuration * 0.9);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + stepDuration * 0.95);

            // Hi-hat sintetizado en contratiempos
            if (this.bgmStep % 2 === 1) {
                this.playHiHat(t);
            }

            this.bgmStep++;
        }, stepDuration * 1000);
    }

    playHiHat(t) {
        if (!this.ctx) return;
        const dur = 0.04;
        const bufferSize = Math.floor(this.ctx.sampleRate * dur);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.5;

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(7000, t);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.03, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(t);
        noise.stop(t + dur);
    }

    stopBGM() {
        if (this.bgmInterval) {
            clearInterval(this.bgmInterval);
            this.bgmInterval = null;
        }
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        return this.soundEnabled;
    }

    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        if (this.musicEnabled) {
            this.startBGM();
        } else {
            this.stopBGM();
        }
        return this.musicEnabled;
    }
}

export const sounds = new SoundEngine();
