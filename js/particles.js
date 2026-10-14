/**
 * Neon Void - Particle, Camera Shake & Background Starfield Engine
 */

export class ParticleEngine {
    constructor() {
        this.particles = [];
        this.shockwaves = [];
        this.floatingTexts = [];
        this.trauma = 0; // 0 a 1
        this.shakeX = 0;
        this.shakeY = 0;
        this.shakeAngle = 0;

        // Fondo de estrellas dinámicas en capas parallax
        this.stars = [];
        this.initStars(150);
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

    // Crea un estallido de chispas neón
    createExplosion(x, y, color = '#ff006e', count = 30, speedMultiplier = 1.0) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = (Math.random() * 6 + 2) * speedMultiplier;
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color,
                size: Math.random() * 3.5 + 1.5,
                alpha: 1.0,
                decay: Math.random() * 0.03 + 0.015,
                glow: true
            });
        }

        // Anillo de onda expansiva
        this.shockwaves.push({
            x,
            y,
            radius: 5,
            maxRadius: 40 * speedMultiplier,
            color,
            alpha: 0.9,
            expansionRate: 4 * speedMultiplier
        });
    }

    // Partículas de estela de motor de la nave
    createThrusterTrail(x, y, angle, color = '#00f3ff') {
        const spread = (Math.random() - 0.5) * 0.5;
        const thrustAngle = angle + Math.PI + spread;
        const speed = Math.random() * 3 + 2;

        this.particles.push({
            x,
            y,
            vx: Math.cos(thrustAngle) * speed,
            vy: Math.sin(thrustAngle) * speed,
            color,
            size: Math.random() * 2.5 + 1,
            alpha: 0.8,
            decay: 0.06,
            glow: false
        });
    }

    // Texto flotante de daño o combo
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
        // Actualizar sacudida de pantalla con decaimiento cuadrático
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

        // Fondo de estrellas
        for (const star of this.stars) {
            star.y += star.speed;
            star.alpha += Math.sin(Date.now() * star.twinkleSpeed) * 0.01;
            if (star.y > window.innerHeight) {
                star.y = 0;
                star.x = Math.random() * window.innerWidth;
            }
        }

        // Partículas
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.96; // Fricción
            p.vy *= 0.96;
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Ondas expansivas
        for (let i = this.shockwaves.length - 1; i >= 0; i--) {
            const s = this.shockwaves[i];
            s.radius += s.expansionRate;
            s.alpha -= 0.03;

            if (s.alpha <= 0 || s.radius >= s.maxRadius) {
                this.shockwaves.splice(i, 1);
            }
        }

        // Textos flotantes
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.y += ft.vy;
            ft.alpha -= ft.decay;

            if (ft.alpha <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }
    }

    render(ctx) {
        // 1. Dibujar estrellas en el fondo
        for (const s of this.stars) {
            ctx.fillStyle = s.color;
            ctx.globalAlpha = Math.max(0.1, Math.min(1.0, s.alpha));
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();
        }

        // 2. Ondas expansivas
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

        // 3. Partículas con resplandor neón
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

        // 4. Textos flotantes
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
