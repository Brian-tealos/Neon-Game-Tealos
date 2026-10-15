/**
 * ==============================================================================
 * NEON VOID: ROGUE SURVIVOR - MOTOR COMPLETO INTEGRADO
 * Compatible tanto con servidor local como abriendo directamente index.html (file:///)
 * ==============================================================================
 */

(function () {
    'use strict';

    /* ==========================================================================
       1. MOTOR DE AUDIO PROCEDURAL (WEB AUDIO API)
       ========================================================================== */
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

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(450 * intensity, t);
            filter.frequency.exponentialRampToValueAtTime(40, t + duration);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.35 * Math.min(intensity, 1.5), t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            noise.start(t);
            noise.stop(t + duration);
        }

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

        playEMP() {
            if (!this.soundEnabled || !this.ctx) return;
            const t = this.ctx.currentTime;
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

            this.playExplosion(2.0);
        }

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

        startBGM() {
            if (this.bgmInterval || !this.ctx || !this.musicEnabled) return;
            const bassNotes = [110, 110, 130.81, 110, 146.83, 130.81, 98, 110];
            const tempo = 135;
            const stepDuration = 60 / tempo / 2;

            this.bgmInterval = setInterval(() => {
                if (!this.musicEnabled || !this.ctx || this.ctx.state !== 'running') return;
                const t = this.ctx.currentTime;
                const noteFreq = bassNotes[this.bgmStep % bassNotes.length];

                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const filter = this.ctx.createBiquadFilter();

                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(noteFreq, t);

                filter.type = 'lowpass';
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

                this.bgmStep++;
            }, stepDuration * 1000);
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
            if (this.musicEnabled) this.startBGM();
            else this.stopBGM();
            return this.musicEnabled;
        }
    }

    const sounds = new SoundEngine();

    /* ==========================================================================
       2. MOTOR DE PARTÍCULAS, SACUDIDA Y ESTRELLAS
       ========================================================================== */
    class ParticleEngine {
        constructor() {
            this.particles = [];
            this.shockwaves = [];
            this.floatingTexts = [];
            this.trauma = 0;
            this.shakeX = 0;
            this.shakeY = 0;
            this.shakeAngle = 0;
            this.stars = [];
            this.initStars(160);
        }

        initStars(count) {
            this.stars = [];
            for (let i = 0; i < count; i++) {
                this.stars.push({
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                    size: Math.random() * 2 + 0.5,
                    speed: Math.random() * 0.4 + 0.1,
                    alpha: Math.random() * 0.8 + 0.2,
                    twinkleSpeed: Math.random() * 0.03 + 0.01,
                    color: Math.random() > 0.8 ? '#00f3ff' : (Math.random() > 0.6 ? '#9d4edd' : '#ffffff')
                });
            }
        }

        addTrauma(amount) {
            this.trauma = Math.min(1.0, this.trauma + amount);
        }

        createExplosion(x, y, color = '#ff006e', count = 28, speedMultiplier = 1.0) {
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = (Math.random() * 6 + 2) * speedMultiplier;
                this.particles.push({
                    x, y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    color,
                    size: Math.random() * 3.5 + 1.5,
                    alpha: 1.0,
                    decay: Math.random() * 0.03 + 0.015,
                    glow: true
                });
            }

            this.shockwaves.push({
                x, y,
                radius: 5,
                maxRadius: 40 * speedMultiplier,
                color,
                alpha: 0.9,
                expansionRate: 4 * speedMultiplier
            });
        }

        createThrusterTrail(x, y, angle, color = '#00f3ff') {
            const spread = (Math.random() - 0.5) * 0.5;
            const thrustAngle = angle + Math.PI + spread;
            const speed = Math.random() * 3 + 2;

            this.particles.push({
                x, y,
                vx: Math.cos(thrustAngle) * speed,
                vy: Math.sin(thrustAngle) * speed,
                color,
                size: Math.random() * 2.5 + 1,
                alpha: 0.8,
                decay: 0.06,
                glow: false
            });
        }

        addFloatingText(text, x, y, color = '#ffffff', size = 16, isCrit = false) {
            this.floatingTexts.push({
                text,
                x: x + (Math.random() * 20 - 10),
                y,
                vy: -1.5,
                alpha: 1.0,
                color,
                size: isCrit ? size * 1.3 : size,
                decay: 0.02,
                isCrit
            });
        }

        update(dt) {
            if (this.trauma > 0) {
                const shake = this.trauma * this.trauma;
                const maxOffset = 18;
                this.shakeX = (Math.random() * 2 - 1) * maxOffset * shake;
                this.shakeY = (Math.random() * 2 - 1) * maxOffset * shake;
                this.shakeAngle = (Math.random() * 2 - 1) * 0.05 * shake;
                this.trauma = Math.max(0, this.trauma - 1.2 * dt);
            } else {
                this.shakeX = 0;
                this.shakeY = 0;
                this.shakeAngle = 0;
            }

            for (const star of this.stars) {
                star.y += star.speed;
                star.alpha += Math.sin(Date.now() * star.twinkleSpeed) * 0.01;
                if (star.y > window.innerHeight) {
                    star.y = 0;
                    star.x = Math.random() * window.innerWidth;
                }
            }

            for (let i = this.particles.length - 1; i >= 0; i--) {
                const p = this.particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vx *= 0.96;
                p.vy *= 0.96;
                p.alpha -= p.decay;
                if (p.alpha <= 0) this.particles.splice(i, 1);
            }

            for (let i = this.shockwaves.length - 1; i >= 0; i--) {
                const s = this.shockwaves[i];
                s.radius += s.expansionRate;
                s.alpha -= 0.03;
                if (s.alpha <= 0 || s.radius >= s.maxRadius) this.shockwaves.splice(i, 1);
            }

            for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
                const ft = this.floatingTexts[i];
                ft.y += ft.vy;
                ft.alpha -= ft.decay;
                if (ft.alpha <= 0) this.floatingTexts.splice(i, 1);
            }
        }

        render(ctx) {
            for (const s of this.stars) {
                ctx.fillStyle = s.color;
                ctx.globalAlpha = Math.max(0.1, Math.min(1.0, s.alpha));
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                ctx.fill();
            }

            for (const s of this.shockwaves) {
                ctx.save();
                ctx.strokeStyle = s.color;
                ctx.globalAlpha = s.alpha;
                ctx.lineWidth = 2.5;
                ctx.shadowBlur = 10;
                ctx.shadowColor = s.color;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }

            for (const p of this.particles) {
                ctx.save();
                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = p.color;
                if (p.glow) {
                    ctx.shadowBlur = 8;
                    ctx.shadowColor = p.color;
                }
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            for (const ft of this.floatingTexts) {
                ctx.save();
                ctx.globalAlpha = ft.alpha;
                ctx.font = `${ft.isCrit ? '900' : '700'} ${ft.size}px 'Orbitron', monospace`;
                ctx.fillStyle = ft.color;
                ctx.textAlign = 'center';
                ctx.shadowBlur = ft.isCrit ? 12 : 6;
                ctx.shadowColor = ft.color;
                ctx.fillText(ft.text, ft.x, ft.y);
                ctx.restore();
            }

            ctx.globalAlpha = 1.0;
        }
    }

    /* ==========================================================================
       3. PROYECTILES & PULSO EMP
       ========================================================================== */
    class Bullet {
        constructor({
            x, y, vx, vy, radius = 4, color = '#00f3ff', damage = 25,
            isPlayer = true, pierce = 0, isHoming = false, trail = false
        }) {
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
            this.radius = radius;
            this.color = color;
            this.damage = damage;
            this.isPlayer = isPlayer;
            this.pierce = pierce;
            this.isHoming = isHoming;
            this.trail = trail;
            this.dead = false;
            this.lifeTime = 0;
            this.maxLife = 5.0;
        }

        update(dt, enemies = [], particleEngine = null) {
            this.lifeTime += dt;
            if (this.lifeTime > this.maxLife) {
                this.dead = true;
                return;
            }

            if (this.isHoming && enemies.length > 0) {
                let closest = null;
                let minDist = 600;
                for (const enemy of enemies) {
                    if (enemy.dead) continue;
                    const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
                    if (dist < minDist) {
                        minDist = dist;
                        closest = enemy;
                    }
                }

                if (closest) {
                    const targetAngle = Math.atan2(closest.y - this.y, closest.x - this.x);
                    const currentAngle = Math.atan2(this.vy, this.vx);
                    let diff = targetAngle - currentAngle;
                    while (diff < -Math.PI) diff += Math.PI * 2;
                    while (diff > Math.PI) diff -= Math.PI * 2;

                    const turnSpeed = 6.0 * dt;
                    const newAngle = currentAngle + Math.sign(diff) * Math.min(Math.abs(diff), turnSpeed);
                    const speed = Math.hypot(this.vx, this.vy);
                    this.vx = Math.cos(newAngle) * speed;
                    this.vy = Math.sin(newAngle) * speed;
                }
            }

            this.x += this.vx * dt;
            this.y += this.vy * dt;

            if (this.trail && particleEngine && Math.random() < 0.4) {
                particleEngine.createThrusterTrail(this.x, this.y, Math.atan2(this.vy, this.vx), '#ff006e');
            }

            const margin = 50;
            if (
                this.x < -margin ||
                this.x > window.innerWidth + margin ||
                this.y < -margin ||
                this.y > window.innerHeight + margin
            ) {
                this.dead = true;
            }
        }

        render(ctx) {
            ctx.save();
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(this.x, this.y, Math.max(1, this.radius * 0.4), 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    }

    class EMPWave {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.radius = 10;
            this.maxRadius = Math.max(window.innerWidth, window.innerHeight) * 0.8;
            this.speed = 1200;
            this.damage = 150;
            this.dead = false;
            this.color = '#00f3ff';
        }

        update(dt) {
            this.radius += this.speed * dt;
            if (this.radius >= this.maxRadius) {
                this.dead = true;
            }
        }

        render(ctx) {
            ctx.save();
            const progress = this.radius / this.maxRadius;
            ctx.globalAlpha = Math.max(0, 1 - progress);
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 6 * (1 - progress);
            ctx.shadowBlur = 20;
            ctx.shadowColor = this.color;

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.stroke();

            ctx.restore();
        }
    }

    /* ==========================================================================
       4. ORBES COLECCIONABLES
       ========================================================================== */
    class Collectible {
        constructor(x, y, type = 'xp', value = 15) {
            this.x = x;
            this.y = y;
            this.type = type;
            this.value = value;
            this.radius = type === 'xp' ? 5 : 9;
            this.dead = false;
            this.vx = (Math.random() - 0.5) * 80;
            this.vy = (Math.random() - 0.5) * 80;
            this.bobOffset = Math.random() * Math.PI * 2;

            switch (type) {
                case 'xp': this.color = '#06d6a0'; break;
                case 'shield': this.color = '#00f3ff'; break;
                case 'bomb': this.color = '#ffbe0b'; break;
                case 'overdrive': this.color = '#ff006e'; break;
                default: this.color = '#ffffff';
            }
        }

        update(dt, player) {
            this.x += this.vx * dt;
            this.y += this.vy * dt;
            this.vx *= 0.92;
            this.vy *= 0.92;

            const dist = Math.hypot(player.x - this.x, player.y - this.y);
            const magnetRange = player.magnetRange || 180;

            if (dist < magnetRange) {
                const pullSpeed = 450 * (1 - dist / magnetRange) + 150;
                const angle = Math.atan2(player.y - this.y, player.x - this.x);
                this.x += Math.cos(angle) * pullSpeed * dt;
                this.y += Math.sin(angle) * pullSpeed * dt;
            }
        }

        render(ctx) {
            ctx.save();
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 12;
            ctx.shadowColor = this.color;

            const pulse = Math.sin(Date.now() * 0.006 + this.bobOffset) * 1.5;
            const currentRadius = Math.max(3, this.radius + pulse);

            if (this.type === 'xp') {
                ctx.beginPath();
                ctx.moveTo(this.x, this.y - currentRadius * 1.3);
                ctx.lineTo(this.x + currentRadius, this.y);
                ctx.lineTo(this.x, this.y + currentRadius * 1.3);
                ctx.lineTo(this.x - currentRadius, this.y);
                ctx.closePath();
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(this.x, this.y, currentRadius * 0.45, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        }
    }

    /* ==========================================================================
       5. MAZO DE MEJORAS ROGUELITE
       ========================================================================== */
    const UPGRADE_POOL = [
        {
            id: 'multishot',
            name: 'CAÑÓN MULTI-DISPARO',
            desc: 'Añade cañones frontales en abanico. Dispara proyectiles adicionales por ráfaga.',
            icon: '💥',
            tier: 'ARMAMENTO',
            apply: (player) => {
                player.projectilesPerShot = Math.min(5, player.projectilesPerShot + 1);
                player.spreadAngle = Math.min(0.45, player.spreadAngle + 0.08);
            }
        },
        {
            id: 'homing_missiles',
            name: 'SISTEMA DE MISILES',
            desc: 'Dispara periódicamente micro-misiles teledirigidos que persiguen a los objetivos.',
            icon: '🚀',
            tier: 'ARMAMENTO',
            apply: (player) => {
                player.hasMissiles = true;
                player.missileFireRate = Math.max(0.6, player.missileFireRate * 0.8);
            }
        },
        {
            id: 'fire_rate',
            name: 'ACELERADOR DE IONES',
            desc: 'Incrementa la cadencia de fuego de tus armas principales en un 25%.',
            icon: '⚡',
            tier: 'MEJORA TÁCTICA',
            apply: (player) => {
                player.fireCooldownMax = Math.max(0.08, player.fireCooldownMax * 0.78);
            }
        },
        {
            id: 'plasma_orb',
            name: 'DISPARO DE PLASMA',
            desc: 'Tus proyectiles atraviesan +1 objetivo enemigo e infligen un 30% más de daño.',
            icon: '🔮',
            tier: 'ARMAMENTO',
            apply: (player) => {
                player.bulletPierce += 1;
                player.bulletDamage = Math.round(player.bulletDamage * 1.3);
                player.bulletRadius = Math.min(8, player.bulletRadius + 1.5);
            }
        },
        {
            id: 'drone_escort',
            name: 'DRON SATÉLITE',
            desc: 'Despliega un dron orbital centinela que gira alrededor de tu nave y dispara.',
            icon: '🛸',
            tier: 'ASISTENCIA',
            apply: (player) => {
                player.orbitingDrones += 1;
            }
        },
        {
            id: 'shield_boost',
            name: 'NANO-ESCUDOS V4',
            desc: '+35 Capacidad de Escudo máxima y un 40% más de velocidad de regeneración.',
            icon: '🛡️',
            tier: 'SUPERVIVENCIA',
            apply: (player) => {
                player.maxShield += 35;
                player.shield = player.maxShield;
                player.shieldRegenRate *= 1.4;
            }
        },
        {
            id: 'speed_boost',
            name: 'PROPULSORES CUÁNTICOS',
            desc: '+20% Velocidad de aceleración y reduce el tiempo de recarga del Dash en 30%.',
            icon: '✨',
            tier: 'MOVILIDAD',
            apply: (player) => {
                player.maxSpeed *= 1.2;
                player.acceleration *= 1.25;
                player.dashCooldownMax = Math.max(1.2, player.dashCooldownMax * 0.7);
            }
        },
        {
            id: 'magnet_range',
            name: 'COLECTOR DE GRAVEDAD',
            desc: '+75% Radio de atracción magnética para cristales y orbes de energía.',
            icon: '🧲',
            tier: 'UTILIDAD',
            apply: (player) => {
                player.magnetRange = Math.round(player.magnetRange * 1.75);
            }
        },
        {
            id: 'crit_chance',
            name: 'LENTES DE PRECISIÓN',
            desc: '+20% Probabilidad de impacto crítico (x2.5 daño con efecto cinético).',
            icon: '🎯',
            tier: 'MEJORA TÁCTICA',
            apply: (player) => {
                player.critChance = Math.min(0.75, player.critChance + 0.2);
            }
        },
        {
            id: 'emp_charge',
            name: 'SOBRECARGA DE PULSO',
            desc: '+1 Carga extra de Bomba EMP y repara el 50% de tu casco dañado.',
            icon: '💣',
            tier: 'SUPERVIVENCIA',
            apply: (player) => {
                player.maxBombs = Math.min(5, player.maxBombs + 1);
                player.bombs = player.maxBombs;
                player.health = Math.min(player.maxHealth, player.health + Math.round(player.maxHealth * 0.5));
            }
        }
    ];

    function getRandomUpgrades(count = 3) {
        const shuffled = [...UPGRADE_POOL].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    /* ==========================================================================
       6. JUGADOR
       ========================================================================== */
    class Player {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.vx = 0;
            this.vy = 0;
            this.angle = 0;
            this.radius = 18;

            this.maxHealth = 100;
            this.health = 100;
            this.maxShield = 100;
            this.shield = 100;
            this.shieldRegenRate = 18;
            this.shieldRegenDelay = 2.5;
            this.shieldTimer = 0;

            this.maxSpeed = 360;
            this.acceleration = 1400;
            this.friction = 0.90;

            this.isDashing = false;
            this.dashTimer = 0;
            this.dashDuration = 0.22;
            this.dashSpeed = 900;
            this.dashCooldown = 0;
            this.dashCooldownMax = 2.2;

            this.maxBombs = 2;
            this.bombs = 2;

            this.fireCooldown = 0;
            this.fireCooldownMax = 0.16;
            this.projectilesPerShot = 1;
            this.spreadAngle = 0.12;
            this.bulletDamage = 35;
            this.bulletRadius = 4.5;
            this.bulletPierce = 0;
            this.critChance = 0.10;

            this.hasMissiles = false;
            this.missileTimer = 0;
            this.missileFireRate = 1.3;
            this.orbitingDrones = 0;
            this.droneAngle = 0;
            this.droneFireTimer = 0;
            this.magnetRange = 160;

            this.overdriveTimer = 0;

            this.level = 1;
            this.xp = 0;
            this.xpNeeded = 50;
            this.invulnerableTimer = 0;
        }

        update(dt, input, particleEngine, soundsRef, projectiles, enemies, onLevelUp) {
            if (this.dashCooldown > 0) this.dashCooldown -= dt;

            if (this.isDashing) {
                this.dashTimer -= dt;
                particleEngine.createThrusterTrail(this.x, this.y, this.angle, '#00f3ff');
                if (this.dashTimer <= 0) this.isDashing = false;
            }

            if (!this.isDashing) {
                let moveX = 0;
                let moveY = 0;
                if (input.keys['KeyW'] || input.keys['ArrowUp']) moveY -= 1;
                if (input.keys['KeyS'] || input.keys['ArrowDown']) moveY += 1;
                if (input.keys['KeyA'] || input.keys['ArrowLeft']) moveX -= 1;
                if (input.keys['KeyD'] || input.keys['ArrowRight']) moveX += 1;

                if (moveX !== 0 && moveY !== 0) {
                    const invLen = 1 / Math.SQRT2;
                    moveX *= invLen;
                    moveY *= invLen;
                }

                // Joystick táctil analógico (tiene prioridad si está activo)
                if (input.moveX || input.moveY) {
                    moveX = input.moveX;
                    moveY = input.moveY;
                }

                const currentAcc = this.overdriveTimer > 0 ? this.acceleration * 1.35 : this.acceleration;
                const currentMaxSpeed = this.overdriveTimer > 0 ? this.maxSpeed * 1.35 : this.maxSpeed;

                this.vx += moveX * currentAcc * dt;
                this.vy += moveY * currentAcc * dt;

                this.vx *= Math.pow(this.friction, dt * 60);
                this.vy *= Math.pow(this.friction, dt * 60);

                const currentSpeed = Math.hypot(this.vx, this.vy);
                if (currentSpeed > currentMaxSpeed) {
                    this.vx = (this.vx / currentSpeed) * currentMaxSpeed;
                    this.vy = (this.vy / currentSpeed) * currentMaxSpeed;
                }

                if ((moveX !== 0 || moveY !== 0) && Math.random() < 0.6) {
                    particleEngine.createThrusterTrail(this.x, this.y, this.angle, '#00f3ff');
                }
            }

            this.x += this.vx * dt;
            this.y += this.vy * dt;

            this.x = Math.max(this.radius, Math.min(window.innerWidth - this.radius, this.x));
            this.y = Math.max(this.radius, Math.min(window.innerHeight - this.radius, this.y));

            this.angle = input.aimActive
                ? input.aimAngle
                : Math.atan2(input.mouseY - this.y, input.mouseX - this.x);

            if (this.shieldTimer > 0) {
                this.shieldTimer -= dt;
            } else if (this.shield < this.maxShield) {
                this.shield = Math.min(this.maxShield, this.shield + this.shieldRegenRate * dt);
            }

            if (this.invulnerableTimer > 0) this.invulnerableTimer -= dt;
            if (this.overdriveTimer > 0) this.overdriveTimer -= dt;

            if (this.fireCooldown > 0) this.fireCooldown -= dt;

            const isShooting = input.isMouseDown || input.touchFire;
            if (isShooting && this.fireCooldown <= 0) {
                this.shoot(projectiles, soundsRef);
            }

            if (this.hasMissiles) {
                this.missileTimer += dt;
                if (this.missileTimer >= this.missileFireRate) {
                    this.missileTimer = 0;
                    this.fireMissile(projectiles, soundsRef, enemies);
                }
            }

            if (this.orbitingDrones > 0) {
                this.droneAngle += 2.5 * dt;
                this.droneFireTimer += dt;
                if (this.droneFireTimer >= 0.7) {
                    this.droneFireTimer = 0;
                    this.fireDroneLasers(projectiles, soundsRef, enemies);
                }
            }
        }

        shoot(projectiles, soundsRef) {
            const cd = this.overdriveTimer > 0 ? this.fireCooldownMax * 0.55 : this.fireCooldownMax;
            this.fireCooldown = cd;
            soundsRef.playLaser();

            const count = this.projectilesPerShot;
            const startAngle = this.angle - (this.spreadAngle * (count - 1)) / 2;
            const speed = 820;

            for (let i = 0; i < count; i++) {
                const shotAngle = startAngle + i * this.spreadAngle;
                const isCrit = Math.random() < this.critChance;
                const dmg = isCrit ? Math.round(this.bulletDamage * 2.5) : this.bulletDamage;
                const tipX = this.x + Math.cos(shotAngle) * (this.radius + 6);
                const tipY = this.y + Math.sin(shotAngle) * (this.radius + 6);

                projectiles.push(
                    new Bullet({
                        x: tipX,
                        y: tipY,
                        vx: Math.cos(shotAngle) * speed,
                        vy: Math.sin(shotAngle) * speed,
                        radius: isCrit ? this.bulletRadius * 1.3 : this.bulletRadius,
                        color: isCrit ? '#ffbe0b' : '#00f3ff',
                        damage: dmg,
                        isPlayer: true,
                        pierce: this.bulletPierce
                    })
                );
            }
        }

        fireMissile(projectiles, soundsRef, enemies) {
            if (enemies.length === 0) return;
            soundsRef.playPlasma();
            const offsetAngle = this.angle + (Math.random() - 0.5) * 1.2;
            projectiles.push(
                new Bullet({
                    x: this.x,
                    y: this.y,
                    vx: Math.cos(offsetAngle) * 450,
                    vy: Math.sin(offsetAngle) * 450,
                    radius: 6,
                    color: '#ff006e',
                    damage: Math.round(this.bulletDamage * 2.2),
                    isPlayer: true,
                    isHoming: true,
                    trail: true
                })
            );
        }

        fireDroneLasers(projectiles, soundsRef, enemies) {
            if (enemies.length === 0) return;
            const dist = 55;
            for (let i = 0; i < this.orbitingDrones; i++) {
                const angle = this.droneAngle + (i * Math.PI * 2) / this.orbitingDrones;
                const dx = this.x + Math.cos(angle) * dist;
                const dy = this.y + Math.sin(angle) * dist;

                let closest = null;
                let minDist = 400;
                for (const e of enemies) {
                    const d = Math.hypot(e.x - dx, e.y - dy);
                    if (d < minDist) {
                        minDist = d;
                        closest = e;
                    }
                }

                if (closest) {
                    const aimAngle = Math.atan2(closest.y - dy, closest.x - dx);
                    soundsRef.playLaser(1.4);
                    projectiles.push(
                        new Bullet({
                            x: dx,
                            y: dy,
                            vx: Math.cos(aimAngle) * 750,
                            vy: Math.sin(aimAngle) * 750,
                            radius: 3.5,
                            color: '#9d4edd',
                            damage: Math.round(this.bulletDamage * 0.7),
                            isPlayer: true
                        })
                    );
                }
            }
        }

        triggerDash(particleEngine, soundsRef) {
            if (this.dashCooldown > 0 || this.isDashing) return false;

            this.isDashing = true;
            this.dashTimer = this.dashDuration;
            this.dashCooldown = this.dashCooldownMax;
            this.invulnerableTimer = this.dashDuration + 0.1;

            const currentSpeed = Math.hypot(this.vx, this.vy);
            const dashAngle = currentSpeed > 20 ? Math.atan2(this.vy, this.vx) : this.angle;

            this.vx = Math.cos(dashAngle) * this.dashSpeed;
            this.vy = Math.sin(dashAngle) * this.dashSpeed;

            particleEngine.addTrauma(0.3);
            soundsRef.playDash();
            return true;
        }

        triggerEMP(projectiles, particleEngine, soundsRef) {
            if (this.bombs <= 0) return false;
            this.bombs--;

            projectiles.push(new EMPWave(this.x, this.y));
            particleEngine.addTrauma(0.7);
            soundsRef.playEMP();
            return true;
        }

        takeDamage(amount, particleEngine, soundsRef) {
            if (this.isDashing || this.invulnerableTimer > 0) return false;

            this.shieldTimer = this.shieldRegenDelay;
            this.invulnerableTimer = 0.35;
            particleEngine.addTrauma(0.45);

            if (this.shield > 0) {
                if (this.shield >= amount) {
                    this.shield -= amount;
                    soundsRef.playHit();
                    particleEngine.createExplosion(this.x, this.y, '#00f3ff', 12, 0.6);
                } else {
                    const remaining = amount - this.shield;
                    this.shield = 0;
                    this.health -= remaining;
                    soundsRef.playExplosion(0.8);
                    particleEngine.createExplosion(this.x, this.y, '#ff3366', 22, 1.0);
                }
            } else {
                this.health -= amount;
                soundsRef.playExplosion(1.0);
                particleEngine.createExplosion(this.x, this.y, '#ff3366', 25, 1.2);
            }

            if (this.health <= 0) {
                this.health = 0;
                return true;
            }
            return false;
        }

        gainXP(amount, onLevelUp) {
            this.xp += amount;
            if (this.xp >= this.xpNeeded) {
                this.xp -= this.xpNeeded;
                this.level++;
                this.xpNeeded = Math.round(this.xpNeeded * 1.45);
                if (onLevelUp) onLevelUp(this.level);
            }
        }

        render(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);

            if (this.shield > 0) {
                ctx.save();
                const shieldRatio = this.shield / this.maxShield;
                ctx.strokeStyle = `rgba(0, 243, 255, ${0.4 + shieldRatio * 0.5})`;
                ctx.shadowBlur = 12;
                ctx.shadowColor = '#00f3ff';
                ctx.lineWidth = 2.0;
                ctx.beginPath();
                ctx.arc(0, 0, this.radius + 8, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }

            ctx.fillStyle = '#0a1024';
            ctx.strokeStyle = this.isDashing ? '#ffffff' : (this.overdriveTimer > 0 ? '#ff006e' : '#00f3ff');
            ctx.lineWidth = 2.5;
            ctx.shadowBlur = this.isDashing ? 18 : 10;
            ctx.shadowColor = ctx.strokeStyle;

            ctx.beginPath();
            ctx.moveTo(this.radius + 6, 0);
            ctx.lineTo(-this.radius, this.radius);
            ctx.lineTo(-this.radius * 0.5, 0);
            ctx.lineTo(-this.radius, -this.radius);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 6;
            ctx.shadowColor = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(0, 0, 5, 2.5, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();

            if (this.orbitingDrones > 0) {
                const dist = 55;
                for (let i = 0; i < this.orbitingDrones; i++) {
                    const angle = this.droneAngle + (i * Math.PI * 2) / this.orbitingDrones;
                    const dx = this.x + Math.cos(angle) * dist;
                    const dy = this.y + Math.sin(angle) * dist;

                    ctx.save();
                    ctx.fillStyle = '#9d4edd';
                    ctx.strokeStyle = '#00f3ff';
                    ctx.lineWidth = 1.5;
                    ctx.shadowBlur = 8;
                    ctx.shadowColor = '#9d4edd';

                    ctx.beginPath();
                    ctx.arc(dx, dy, 7, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();

                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(dx, dy, 2.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            }
        }
    }

    /* ==========================================================================
       7. ENEMIGOS Y JEFE TITAN
       ========================================================================== */
    class Enemy {
        constructor({ x, y, type = 'drone', health = 40, speed = 140, radius = 14, color = '#ff006e', scoreValue = 100, xpValue = 15 }) {
            this.x = x;
            this.y = y;
            this.vx = 0;
            this.vy = 0;
            this.type = type;
            this.maxHealth = health;
            this.health = health;
            this.speed = speed;
            this.radius = radius;
            this.color = color;
            this.scoreValue = scoreValue;
            this.xpValue = xpValue;
            this.dead = false;
            this.angle = 0;
            this.shootTimer = Math.random() * 1.5;
            this.flashTimer = 0;
        }

        takeDamage(amount) {
            this.health -= amount;
            this.flashTimer = 0.08;
            if (this.health <= 0) {
                this.dead = true;
                return true;
            }
            return false;
        }

        update(dt, player, projectiles, soundsRef) {
            if (this.flashTimer > 0) this.flashTimer -= dt;

            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const dist = Math.hypot(dx, dy);
            this.angle = Math.atan2(dy, dx);

            switch (this.type) {
                case 'swarmer':
                case 'drone':
                    this.vx = Math.cos(this.angle) * this.speed;
                    this.vy = Math.sin(this.angle) * this.speed;
                    break;

                case 'gunner':
                    if (dist > 320) {
                        this.vx = Math.cos(this.angle) * this.speed;
                        this.vy = Math.sin(this.angle) * this.speed;
                    } else if (dist < 220) {
                        this.vx = -Math.cos(this.angle) * (this.speed * 0.7);
                        this.vy = -Math.sin(this.angle) * (this.speed * 0.7);
                    } else {
                        const tangent = this.angle + Math.PI / 2;
                        this.vx = Math.cos(tangent) * (this.speed * 0.5);
                        this.vy = Math.sin(tangent) * (this.speed * 0.5);
                    }

                    this.shootTimer += dt;
                    if (this.shootTimer >= 2.0) {
                        this.shootTimer = 0;
                        this.fireBullet(projectiles, soundsRef, this.angle, 350, 15);
                    }
                    break;

                case 'cruiser':
                    this.vx = Math.cos(this.angle) * this.speed;
                    this.vy = Math.sin(this.angle) * this.speed;

                    this.shootTimer += dt;
                    if (this.shootTimer >= 2.6) {
                        this.shootTimer = 0;
                        for (let i = -1; i <= 1; i++) {
                            this.fireBullet(projectiles, soundsRef, this.angle + i * 0.25, 300, 20);
                        }
                    }
                    break;
            }

            this.x += this.vx * dt;
            this.y += this.vy * dt;
        }

        fireBullet(projectiles, soundsRef, angle, speed, damage) {
            soundsRef.playLaser(0.7);
            projectiles.push(
                new Bullet({
                    x: this.x,
                    y: this.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    radius: 4.5,
                    color: '#ff3366',
                    damage: damage,
                    isPlayer: false
                })
            );
        }

        render(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);

            ctx.strokeStyle = this.flashTimer > 0 ? '#ffffff' : this.color;
            ctx.fillStyle = this.flashTimer > 0 ? '#ffffff' : '#080c1e';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;

            ctx.beginPath();
            if (this.type === 'swarmer') {
                ctx.moveTo(this.radius, 0);
                ctx.lineTo(-this.radius, this.radius * 0.7);
                ctx.lineTo(-this.radius, -this.radius * 0.7);
            } else if (this.type === 'drone') {
                ctx.moveTo(this.radius, 0);
                ctx.lineTo(0, this.radius);
                ctx.lineTo(-this.radius, 0);
                ctx.lineTo(0, -this.radius);
            } else if (this.type === 'gunner') {
                for (let i = 0; i < 6; i++) {
                    const a = (i * Math.PI) / 3;
                    const px = Math.cos(a) * this.radius;
                    const py = Math.sin(a) * this.radius;
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
            } else if (this.type === 'cruiser') {
                ctx.moveTo(this.radius, 0);
                ctx.lineTo(-this.radius * 0.4, this.radius);
                ctx.lineTo(-this.radius, this.radius * 0.7);
                ctx.lineTo(-this.radius * 0.6, 0);
                ctx.lineTo(-this.radius, -this.radius * 0.7);
                ctx.lineTo(-this.radius * 0.4, -this.radius);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.restore();
        }
    }

    class BossTitan {
        constructor(x, y, wave = 5) {
            this.x = x;
            this.y = y;
            this.vx = 0;
            this.vy = 0;
            this.type = 'boss';
            this.radius = 48;
            this.maxHealth = 1200 + (wave - 5) * 600;
            this.health = this.maxHealth;
            this.scoreValue = 5000;
            this.xpValue = 120;
            this.dead = false;
            this.color = '#ff006e';
            this.name = `DREADNOUGHT MK-${Math.floor(wave / 5)}`;

            this.spiralAngle = 0;
            this.attackTimer = 0;
            this.attackPhase = 0;
            this.tier = Math.max(1, Math.floor(wave / 5)); // 1 = primer jefe
            this.graceTimer = 2.0; // segundos de entrada sin disparar
            this.restTimer = 0;
            this.fireTimer = 0;
            this.ringsFired = 0;
            this.flashTimer = 0;
        }

        takeDamage(amount) {
            this.health -= amount;
            this.flashTimer = 0.08;
            if (this.health <= 0) {
                this.dead = true;
                return true;
            }
            return false;
        }

        update(dt, player, projectiles, soundsRef) {
            if (this.flashTimer > 0) this.flashTimer -= dt;

            const targetX = window.innerWidth / 2;
            const targetY = 180 + Math.sin(Date.now() * 0.002) * 60;
            this.x += (targetX - this.x) * 1.5 * dt;
            this.y += (targetY - this.y) * 1.5 * dt;

            this.spiralAngle += 4.5 * dt;

            // Entrada del jefe: no dispara hasta estar en posición
            if (this.graceTimer > 0) {
                this.graceTimer -= dt;
                return;
            }

            // Respiro breve entre una fase de ataque y la siguiente
            if (this.restTimer > 0) {
                this.restTimer -= dt;
                return;
            }

            this.attackTimer += dt;
            if (this.attackTimer > 4.5) {
                this.attackTimer = 0;
                this.attackPhase = (this.attackPhase + 1) % 3;
                this.fireTimer = 0;
                this.ringsFired = 0;
                this.restTimer = 0.9;
                return;
            }

            // Dificultad según el número de jefe: el primero (tier 1) es el más suave
            const tier = this.tier;
            if (this.fireTimer > 0) this.fireTimer -= dt;

            if (this.attackPhase === 0) {
                // Patrón 1: espiral con ritmo fijo (no depende de los FPS de la pantalla)
                if (this.fireTimer <= 0) {
                    this.fireTimer = Math.max(0.14, 0.26 - 0.03 * (tier - 1));
                    soundsRef.playLaser(0.6);
                    const arms = tier >= 3 ? 3 : 2;
                    const speed = Math.min(260, 190 + 20 * (tier - 1));
                    const dmg = Math.min(18, 12 + 2 * (tier - 1));
                    for (let a = 0; a < arms; a++) {
                        const ang = this.spiralAngle + (a * Math.PI * 2) / arms;
                        projectiles.push(
                            new Bullet({
                                x: this.x,
                                y: this.y,
                                vx: Math.cos(ang) * speed,
                                vy: Math.sin(ang) * speed,
                                radius: 5,
                                color: '#ff006e',
                                damage: dmg,
                                isPlayer: false
                            })
                        );
                    }
                }
            } else if (this.attackPhase === 1) {
                // Patrón 2: anillos expansivos (1 anillo en el primer jefe, 2 desde el segundo)
                const ringTimes = [1.2, 2.8];
                const maxRings = tier >= 2 ? 2 : 1;
                if (this.ringsFired < maxRings && this.attackTimer >= ringTimes[this.ringsFired]) {
                    soundsRef.playPlasma();
                    const totalBullets = Math.min(20, 12 + 2 * (tier - 1));
                    const offset = (this.ringsFired * Math.PI) / totalBullets; // el 2.º anillo deja huecos distintos
                    const speed = Math.min(290, 190 + 25 * (tier - 1));
                    const dmg = Math.min(22, 15 + 2 * (tier - 1));
                    for (let i = 0; i < totalBullets; i++) {
                        const ang = offset + (i * Math.PI * 2) / totalBullets;
                        projectiles.push(
                            new Bullet({
                                x: this.x,
                                y: this.y,
                                vx: Math.cos(ang) * speed,
                                vy: Math.sin(ang) * speed,
                                radius: 6,
                                color: '#9d4edd',
                                damage: dmg,
                                isPlayer: false
                            })
                        );
                    }
                    this.ringsFired++;
                }
            } else if (this.attackPhase === 2) {
                // Patrón 3: disparos apuntados al jugador con algo de dispersión
                if (this.fireTimer <= 0) {
                    this.fireTimer = Math.max(0.3, 0.6 - 0.06 * (tier - 1));
                    soundsRef.playLaser(0.8);
                    const toPlayer = Math.atan2(player.y - this.y, player.x - this.x);
                    const spread = (Math.random() - 0.5) * 0.35;
                    const speed = Math.min(420, 290 + 25 * (tier - 1));
                    const dmg = Math.min(25, 15 + 3 * (tier - 1));
                    projectiles.push(
                        new Bullet({
                            x: this.x,
                            y: this.y,
                            vx: Math.cos(toPlayer + spread) * speed,
                            vy: Math.sin(toPlayer + spread) * speed,
                            radius: 5.5,
                            color: '#ffbe0b',
                            damage: dmg,
                            isPlayer: false
                        })
                    );
                }
            }
        }

        render(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);

            ctx.strokeStyle = this.flashTimer > 0 ? '#ffffff' : this.color;
            ctx.fillStyle = this.flashTimer > 0 ? '#ffffff' : '#0a0d22';
            ctx.lineWidth = 3.5;
            ctx.shadowBlur = 25;
            ctx.shadowColor = this.color;

            ctx.beginPath();
            for (let i = 0; i < 8; i++) {
                const a = (i * Math.PI) / 4 + Math.PI / 8;
                const px = Math.cos(a) * this.radius;
                const py = Math.sin(a) * this.radius;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.save();
            ctx.rotate(this.spiralAngle);
            ctx.strokeStyle = '#00f3ff';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00f3ff';
            ctx.strokeRect(-this.radius * 0.5, -this.radius * 0.5, this.radius, this.radius);
            ctx.restore();

            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#ff006e';
            ctx.beginPath();
            ctx.arc(0, 0, 12, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    }

    /* ==========================================================================
       8. MOTOR PRINCIPAL DEL JUEGO
       ========================================================================== */
    class Game {
        constructor() {
            this.canvas = document.getElementById('game-canvas');
            this.ctx = this.canvas.getContext('2d');

            this.state = 'MENU';
            this.score = 0;
            this.highScore = parseInt(localStorage.getItem('neon_void_highscore') || '0', 10);
            this.kills = 0;
            this.gameTime = 0;

            this.combo = 1.0;
            this.comboTimer = 0;
            this.comboMaxTime = 3.5;

            this.wave = 1;
            this.waveTimer = 0;
            this.waveDuration = 24.0;
            this.spawnTimer = 0;
            this.isBossWave = false;

            this.particles = new ParticleEngine();
            this.player = null;
            this.enemies = [];
            this.projectiles = [];
            this.collectibles = [];
            this.activeBoss = null;

            this.input = {
                keys: {},
                mouseX: window.innerWidth / 2,
                mouseY: window.innerHeight / 2,
                isMouseDown: false
            };

            this.dom = {
                hud: document.getElementById('hud'),
                shieldBar: document.getElementById('shield-bar'),
                shieldText: document.getElementById('shield-text'),
                healthBar: document.getElementById('health-bar'),
                healthText: document.getElementById('health-text'),
                waveDisplay: document.getElementById('wave-display'),
                timeDisplay: document.getElementById('time-display'),
                scoreDisplay: document.getElementById('score-display'),
                comboDisplay: document.getElementById('combo-display'),
                comboTimerFill: document.getElementById('combo-timer-fill'),
                bombCharges: document.getElementById('bomb-charges'),
                dashCooldown: document.getElementById('dash-cooldown'),
                playerLevel: document.getElementById('player-level'),
                xpBar: document.getElementById('xp-bar'),
                bossHealthContainer: document.getElementById('boss-health-container'),
                bossName: document.getElementById('boss-name'),
                bossBarFill: document.getElementById('boss-bar-fill'),
                startScreen: document.getElementById('start-screen'),
                instructionsModal: document.getElementById('instructions-modal'),
                upgradeModal: document.getElementById('upgrade-modal'),
                upgradeOptionsContainer: document.getElementById('upgrade-options-container'),
                gameOverScreen: document.getElementById('game-over-screen'),
                pauseScreen: document.getElementById('pause-screen'),
                menuHighScore: document.getElementById('menu-high-score'),
                finalScore: document.getElementById('final-score'),
                finalWaves: document.getElementById('final-waves'),
                finalKills: document.getElementById('final-kills'),
                finalLevel: document.getElementById('final-level'),
                newRecordLabel: document.getElementById('new-record-label')
            };

            this.lastTime = performance.now();
            this.setupWindowEvents();
            this.updateHighScoreDisplay();
        }

        setupWindowEvents() {
            const resize = () => {
                const isTouch = window.matchMedia('(pointer: coarse)').matches;
            const dpr = Math.min(window.devicePixelRatio || 1, isTouch ? 2 : 3);
                this.canvas.width = window.innerWidth * dpr;
                this.canvas.height = window.innerHeight * dpr;
                this.ctx.resetTransform();
                this.ctx.scale(dpr, dpr);
                if (this.particles) this.particles.initStars(160);
            };
            window.addEventListener('resize', resize);
            resize();

            window.addEventListener('keydown', (e) => {
                this.input.keys[e.code] = true;

                if (e.code === 'Escape') {
                    if (this.state === 'PLAYING') this.pauseGame();
                    else if (this.state === 'PAUSED') this.resumeGame();
                }

                if (e.code === 'Space' && this.state === 'PLAYING') {
                    e.preventDefault();
                    if (this.player) this.player.triggerEMP(this.projectiles, this.particles, sounds);
                }

                if ((e.code === 'ShiftLeft' || e.code === 'ShiftRight') && this.state === 'PLAYING') {
                    if (this.player) this.player.triggerDash(this.particles, sounds);
                }
            });

            window.addEventListener('keyup', (e) => {
                this.input.keys[e.code] = false;
            });

            window.addEventListener('mousemove', (e) => {
                this.input.mouseX = e.clientX;
                this.input.mouseY = e.clientY;
            });

            window.addEventListener('mousedown', (e) => {
                if (e.button === 0) {
                    this.input.isMouseDown = true;
                } else if (e.button === 2) {
                    e.preventDefault();
                    if (this.state === 'PLAYING' && this.player) {
                        this.player.triggerDash(this.particles, sounds);
                    }
                }
            });

            window.addEventListener('mouseup', (e) => {
                if (e.button === 0) this.input.isMouseDown = false;
            });

            window.addEventListener('contextmenu', (e) => e.preventDefault());


        // Los controles táctiles viven en js/mobile.js
        }

        startNewGame() {
            sounds.init();
            sounds.resume();

            this.player = new Player(window.innerWidth / 2, window.innerHeight / 2);
            this.enemies = [];
            this.projectiles = [];
            this.collectibles = [];
            this.activeBoss = null;
            this.particles = new ParticleEngine();

            this.score = 0;
            this.kills = 0;
            this.wave = 1;
            this.waveTimer = 0;
            this.gameTime = 0;
            this.combo = 1.0;
            this.comboTimer = 0;
            this.isBossWave = false;

            this.dom.startScreen.classList.remove('active');
            this.dom.startScreen.classList.add('hidden');
            this.dom.gameOverScreen.classList.add('hidden');
            this.dom.pauseScreen.classList.add('hidden');
            this.dom.upgradeModal.classList.add('hidden');
            this.dom.hud.classList.remove('hidden');

            this.state = 'PLAYING';
            this.lastTime = performance.now();
        }

        update(dt) {
            if (this.state !== 'PLAYING') return;

            this.gameTime += dt;

            if (this.comboTimer > 0) {
                this.comboTimer -= dt;
                if (this.comboTimer <= 0) {
                    this.combo = 1.0;
                }
            }

            this.player.update(
                dt,
                this.input,
                this.particles,
                sounds,
                this.projectiles,
                this.enemies,
                (newLevel) => this.showLevelUpModal(newLevel)
            );

            for (let i = this.projectiles.length - 1; i >= 0; i--) {
                const p = this.projectiles[i];
                if (p instanceof EMPWave) {
                    p.update(dt);
                    for (let j = this.projectiles.length - 1; j >= 0; j--) {
                        const other = this.projectiles[j];
                        if (other !== p && !other.isPlayer) {
                            const dist = Math.hypot(other.x - p.x, other.y - p.y);
                            if (dist <= p.radius) {
                                other.dead = true;
                                this.particles.createExplosion(other.x, other.y, '#00f3ff', 5, 0.4);
                            }
                        }
                    }
                } else {
                    p.update(dt, this.enemies, this.particles);
                }

                if (p.dead) {
                    this.projectiles.splice(i, 1);
                }
            }

            for (let i = this.enemies.length - 1; i >= 0; i--) {
                const enemy = this.enemies[i];
                enemy.update(dt, this.player, this.projectiles, sounds);

                if (enemy.dead) {
                    this.onEnemyDefeated(enemy);
                    this.enemies.splice(i, 1);
                }
            }

            for (let i = this.collectibles.length - 1; i >= 0; i--) {
                const c = this.collectibles[i];
                c.update(dt, this.player);

                const dist = Math.hypot(this.player.x - c.x, this.player.y - c.y);
                if (dist < this.player.radius + c.radius) {
                    this.onPickupCollected(c);
                    this.collectibles.splice(i, 1);
                }
            }

            this.handleCollisions();
            this.updateWaveManager(dt);
            this.particles.update(dt);
            this.updateHUD();
        }

        updateWaveManager(dt) {
            this.waveTimer += dt;

            if (this.wave % 5 === 0 && !this.isBossWave && !this.activeBoss) {
                this.isBossWave = true;
                this.spawnBoss();
                return;
            }

            if (!this.isBossWave && this.waveTimer >= this.waveDuration) {
                this.wave++;
                this.waveTimer = 0;
                this.particles.addFloatingText(`¡OLEADA ${this.wave}!`, window.innerWidth / 2, window.innerHeight / 2 - 80, '#00f3ff', 28, true);
                sounds.playPickup('powerup');
            }

            this.spawnTimer += dt;
            const spawnInterval = Math.max(0.6, 2.2 - this.wave * 0.12) * (this.isBossWave ? 2.2 : 1);

            if (this.spawnTimer >= spawnInterval) {
                this.spawnTimer = 0;
                const maxEnemies = this.isBossWave ? 6 : 10 + this.wave * 3; // menos enemigos extra durante el jefe
                if (this.enemies.length < maxEnemies) {
                    this.spawnEnemy();
                }
            }
        }

        spawnEnemy() {
            const margin = 40;
            let x, y;
            const side = Math.floor(Math.random() * 4);
            if (side === 0) { x = Math.random() * window.innerWidth; y = -margin; }
            else if (side === 1) { x = window.innerWidth + margin; y = Math.random() * window.innerHeight; }
            else if (side === 2) { x = Math.random() * window.innerWidth; y = window.innerHeight + margin; }
            else { x = -margin; y = Math.random() * window.innerHeight; }

            let type = 'drone';
            const rand = Math.random();
            if (this.wave >= 2 && rand < 0.35) type = 'swarmer';
            else if (this.wave >= 3 && rand > 0.65) type = 'gunner';
            else if (this.wave >= 4 && rand > 0.85) type = 'cruiser';

            let hp = 30 + this.wave * 8;
            let speed = 140 + Math.min(60, this.wave * 5);
            let score = 100;
            let xp = 15;
            let color = '#ff006e';
            let radius = 14;

            if (type === 'swarmer') {
                hp = 18 + this.wave * 4;
                speed = 220 + Math.min(80, this.wave * 6);
                score = 60;
                xp = 10;
                color = '#ff3366';
                radius = 10;
            } else if (type === 'gunner') {
                hp = 45 + this.wave * 10;
                speed = 110;
                score = 180;
                xp = 25;
                color = '#ffbe0b';
                radius = 16;
            } else if (type === 'cruiser') {
                hp = 120 + this.wave * 25;
                speed = 85;
                score = 350;
                xp = 45;
                color = '#00f3ff';
                radius = 22;
            }

            this.enemies.push(new Enemy({ x, y, type, health: hp, speed, radius, color, scoreValue: score, xpValue: xp }));
        }

        spawnBoss() {
            sounds.playBossAlarm();
            this.particles.addTrauma(0.8);
            this.particles.addFloatingText('¡ALERTA DE TITÁN DETECTADA!', window.innerWidth / 2, window.innerHeight / 2 - 80, '#ff006e', 32, true);

            this.activeBoss = new BossTitan(window.innerWidth / 2, -100, this.wave);
            this.enemies.push(this.activeBoss);
        }

        handleCollisions() {
            for (const p of this.projectiles) {
                if (!p.isPlayer || p.dead) continue;

                for (const e of this.enemies) {
                    if (e.dead) continue;

                    const dist = Math.hypot(e.x - p.x, e.y - p.y);
                    if (dist < e.radius + p.radius) {
                        const killed = e.takeDamage(p.damage);
                        this.particles.addFloatingText(`-${p.damage}`, e.x, e.y - 10, p.color, 14);

                        if (p.pierce > 0) p.pierce--;
                        else p.dead = true;

                        if (killed) {
                            this.particles.addTrauma(e.type === 'boss' ? 1.0 : 0.2);
                            sounds.playExplosion(e.type === 'boss' ? 2.5 : 0.8);
                        } else {
                            sounds.playHit();
                        }
                        break;
                    }
                }
            }

            for (const p of this.projectiles) {
                if (p.isPlayer || p.dead) continue;

                const dist = Math.hypot(this.player.x - p.x, this.player.y - p.y);
                if (dist < this.player.radius + p.radius) {
                    p.dead = true;
                    const isDead = this.player.takeDamage(p.damage, this.particles, sounds);
                    this.combo = 1.0;
                    this.comboTimer = 0;

                    if (isDead) {
                        this.triggerGameOver();
                        return;
                    }
                }
            }

            for (const e of this.enemies) {
                if (e.dead) continue;

                const dist = Math.hypot(this.player.x - e.x, this.player.y - e.y);
                if (dist < this.player.radius + e.radius) {
                    const contactDmg = e.type === 'boss' ? 40 : 25;
                    const isDead = this.player.takeDamage(contactDmg, this.particles, sounds);
                    this.combo = 1.0;
                    this.comboTimer = 0;

                    if (this.player.isDashing) {
                        e.takeDamage(120);
                    }

                    if (isDead) {
                        this.triggerGameOver();
                        return;
                    }
                }
            }
        }

        onEnemyDefeated(enemy) {
            this.kills++;
            const addedScore = Math.round(enemy.scoreValue * this.combo);
            this.score += addedScore;

            this.combo = Math.min(5.0, +(this.combo + 0.1).toFixed(1));
            this.comboTimer = this.comboMaxTime;

            this.particles.createExplosion(enemy.x, enemy.y, enemy.color, enemy.type === 'boss' ? 80 : 20, enemy.type === 'boss' ? 2.2 : 1.0);

            this.collectibles.push(new Collectible(enemy.x, enemy.y, 'xp', enemy.xpValue));

            const dropChance = Math.random();
            if (enemy.type === 'boss') {
                this.collectibles.push(new Collectible(enemy.x - 25, enemy.y, 'shield', 50));
                this.collectibles.push(new Collectible(enemy.x + 25, enemy.y, 'bomb', 1));
                this.collectibles.push(new Collectible(enemy.x, enemy.y - 25, 'overdrive', 1));
                this.activeBoss = null;
                this.isBossWave = false;
                this.wave++;
                this.waveTimer = 0;
                this.showLevelUpModal(this.player.level);
            } else {
                if (dropChance < 0.05) this.collectibles.push(new Collectible(enemy.x, enemy.y, 'shield', 40));
                else if (dropChance < 0.07) this.collectibles.push(new Collectible(enemy.x, enemy.y, 'bomb', 1));
                else if (dropChance < 0.09) this.collectibles.push(new Collectible(enemy.x, enemy.y, 'overdrive', 1));
            }
        }

        onPickupCollected(c) {
            sounds.playPickup(c.type === 'xp' ? 'gem' : 'powerup');

            switch (c.type) {
                case 'xp':
                    this.player.gainXP(c.value, (newLevel) => this.showLevelUpModal(newLevel));
                    this.particles.addFloatingText(`+${c.value} XP`, c.x, c.y, '#06d6a0', 14);
                    break;
                case 'shield':
                    this.player.shield = Math.min(this.player.maxShield, this.player.shield + 45);
                    this.particles.addFloatingText('+ESCUDO', c.x, c.y, '#00f3ff', 16, true);
                    break;
                case 'bomb':
                    this.player.bombs = Math.min(this.player.maxBombs, this.player.bombs + 1);
                    this.particles.addFloatingText('+PULSO EMP', c.x, c.y, '#ffbe0b', 16, true);
                    break;
                case 'overdrive':
                    this.player.overdriveTimer = 8.0;
                    this.particles.addFloatingText('¡SOBRECARGA!', c.x, c.y, '#ff006e', 20, true);
                    break;
            }
        }

        showLevelUpModal(level) {
            this.state = 'UPGRADE_SELECT';
            sounds.playPickup('powerup');

            const upgrades = getRandomUpgrades(3);
            this.dom.upgradeOptionsContainer.innerHTML = '';

            upgrades.forEach((upg) => {
                const card = document.createElement('div');
                card.className = 'upgrade-item';
                card.innerHTML = `
                    <div class="upgrade-icon">${upg.icon}</div>
                    <div class="upgrade-item-title">${upg.name}</div>
                    <div class="upgrade-item-desc">${upg.desc}</div>
                    <div class="upgrade-tier">${upg.tier}</div>
                `;
                card.addEventListener('click', () => {
                    upg.apply(this.player);
                    this.dom.upgradeModal.classList.add('hidden');
                    this.state = 'PLAYING';
                    this.lastTime = performance.now();
                    sounds.playPickup('powerup');
                });
                this.dom.upgradeOptionsContainer.appendChild(card);
            });

            this.dom.upgradeModal.classList.remove('hidden');
        }

        updateHUD() {
            if (!this.player) return;

            const shieldPct = Math.max(0, (this.player.shield / this.player.maxShield) * 100);
            this.dom.shieldBar.style.width = `${shieldPct}%`;
            this.dom.shieldText.textContent = `${Math.ceil(this.player.shield)}/${this.player.maxShield}`;

            const healthPct = Math.max(0, (this.player.health / this.player.maxHealth) * 100);
            this.dom.healthBar.style.width = `${healthPct}%`;
            this.dom.healthText.textContent = `${Math.ceil(this.player.health)}/${this.player.maxHealth}`;

            this.dom.waveDisplay.textContent = `OLEADA ${this.wave}`;
            const mins = Math.floor(this.gameTime / 60);
            const secs = Math.floor(this.gameTime % 60);
            this.dom.timeDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

            if (this.activeBoss && !this.activeBoss.dead) {
                this.dom.bossHealthContainer.classList.remove('hidden');
                this.dom.bossName.textContent = this.activeBoss.name;
                const bossPct = Math.max(0, (this.activeBoss.health / this.activeBoss.maxHealth) * 100);
                this.dom.bossBarFill.style.width = `${bossPct}%`;
            } else {
                this.dom.bossHealthContainer.classList.add('hidden');
            }

            this.dom.scoreDisplay.textContent = this.score.toLocaleString();
            this.dom.comboDisplay.textContent = `x${this.combo.toFixed(1)}`;
            const comboPct = (this.comboTimer / this.comboMaxTime) * 100;
            this.dom.comboTimerFill.style.width = `${Math.max(0, comboPct)}%`;

            let bombDots = '';
            for (let i = 0; i < this.player.bombs; i++) bombDots += '● ';
            for (let i = this.player.bombs; i < this.player.maxBombs; i++) bombDots += '○ ';
            this.dom.bombCharges.textContent = bombDots.trim();

            const dashCdPct = (this.player.dashCooldown / this.player.dashCooldownMax) * 100;
            this.dom.dashCooldown.style.height = `${Math.max(0, dashCdPct)}%`;

            this.dom.playerLevel.textContent = `NV ${this.player.level}`;
            const xpPct = (this.player.xp / this.player.xpNeeded) * 100;
            this.dom.xpBar.style.width = `${Math.min(100, xpPct)}%`;
        }

        pauseGame() {
            this.state = 'PAUSED';
            this.dom.pauseScreen.classList.remove('hidden');
        }

        resumeGame() {
            this.state = 'PLAYING';
            this.dom.pauseScreen.classList.add('hidden');
            this.lastTime = performance.now();
        }

        triggerGameOver() {
            this.state = 'GAME_OVER';
            sounds.playExplosion(2.0);

            let isNewRecord = false;
            if (this.score > this.highScore) {
                this.highScore = this.score;
                localStorage.setItem('neon_void_highscore', this.highScore.toString());
                isNewRecord = true;
            }

            this.dom.finalScore.textContent = this.score.toLocaleString();
            this.dom.finalWaves.textContent = this.wave.toString();
            this.dom.finalKills.textContent = this.kills.toString();
            this.dom.finalLevel.textContent = this.player.level.toString();
            this.dom.newRecordLabel.textContent = isNewRecord ? '¡SÍ! NUEVO RÉCORD' : 'NO';
            this.dom.newRecordLabel.style.color = isNewRecord ? '#06d6a0' : '#8b9bb4';

            this.dom.hud.classList.add('hidden');
            this.dom.gameOverScreen.classList.remove('hidden');
            this.updateHighScoreDisplay();
        }

        updateHighScoreDisplay() {
            if (this.dom.menuHighScore) {
                this.dom.menuHighScore.textContent = this.highScore.toLocaleString();
            }
        }

        render() {
            this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

            this.ctx.save();
            if (this.particles.shakeX !== 0 || this.particles.shakeY !== 0) {
                this.ctx.translate(this.particles.shakeX, this.particles.shakeY);
                this.ctx.rotate(this.particles.shakeAngle);
            }

            this.particles.render(this.ctx);

            for (const c of this.collectibles) c.render(this.ctx);
            for (const p of this.projectiles) p.render(this.ctx);
            for (const e of this.enemies) e.render(this.ctx);
            if (this.player && this.state !== 'GAME_OVER') this.player.render(this.ctx);

            this.ctx.restore();
        }

        loop(currentTime) {
            const dt = Math.min(0.1, (currentTime - this.lastTime) / 1000);
            this.lastTime = currentTime;

            this.update(dt);
            this.render();

            requestAnimationFrame((t) => this.loop(t));
        }
    }

    /* ==========================================================================
       9. ENLACE DE EVENTOS DEL DOM
       ========================================================================== */
    window.addEventListener('DOMContentLoaded', () => {
        const game = new Game();
        window.__neonGame = game; // lo usa js/mobile.js

        const btnStart = document.getElementById('btn-start');
        const btnHow = document.getElementById('btn-how');
        const btnCloseHow = document.getElementById('btn-close-how');
        const instructionsModal = document.getElementById('instructions-modal');
        const btnRestart = document.getElementById('btn-restart');
        const btnMenu = document.getElementById('btn-menu');
        const btnResume = document.getElementById('btn-resume');
        const btnQuit = document.getElementById('btn-quit');
        const btnToggleSound = document.getElementById('btn-toggle-sound');
        const btnToggleMusic = document.getElementById('btn-toggle-music');

        btnStart.addEventListener('click', () => game.startNewGame());
        btnHow.addEventListener('click', () => instructionsModal.classList.remove('hidden'));
        btnCloseHow.addEventListener('click', () => instructionsModal.classList.add('hidden'));
        btnRestart.addEventListener('click', () => game.startNewGame());

        btnMenu.addEventListener('click', () => {
            game.state = 'MENU';
            game.dom.gameOverScreen.classList.add('hidden');
            game.dom.startScreen.classList.remove('hidden');
            game.dom.startScreen.classList.add('active');
            game.dom.hud.classList.add('hidden');
        });

        btnResume.addEventListener('click', () => game.resumeGame());

        btnQuit.addEventListener('click', () => {
            game.state = 'MENU';
            game.dom.pauseScreen.classList.add('hidden');
            game.dom.startScreen.classList.remove('hidden');
            game.dom.startScreen.classList.add('active');
            game.dom.hud.classList.add('hidden');
        });

        btnToggleSound.addEventListener('click', () => {
            sounds.init();
            const active = sounds.toggleSound();
            btnToggleSound.textContent = active ? '🔊 SONIDO: ON' : '🔇 SONIDO: OFF';
        });

        btnToggleMusic.addEventListener('click', () => {
            sounds.init();
            const active = sounds.toggleMusic();
            btnToggleMusic.textContent = active ? '🎵 BGM: ON' : '🔇 BGM: OFF';
        });

        requestAnimationFrame((t) => game.loop(t));
    });
})();
