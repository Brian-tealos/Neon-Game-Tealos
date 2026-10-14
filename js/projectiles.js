/**
 * Neon Void - Projectiles Engine
 * Maneja proyectiles del jugador y patrones de Bullet-Hell de los enemigos.
 */

export class Bullet {
    constructor({
        x,
        y,
        vx,
        vy,
        radius = 4,
        color = '#00f3ff',
        damage = 25,
        isPlayer = true,
        pierce = 0,
        isHoming = false,
        trail = false
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
        this.maxLife = 5.0; // Segundos antes de disiparse
    }

    update(dt, enemies = [], particleEngine = null) {
        this.lifeTime += dt;
        if (this.lifeTime > this.maxLife) {
            this.dead = true;
            return;
        }

        // Lógica de misil teledirigido para el jugador
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
                
                // Normalizar ángulo entre -PI y PI
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

        // Estela si es misil
        if (this.trail && particleEngine && Math.random() < 0.4) {
            particleEngine.createThrusterTrail(this.x, this.y, Math.atan2(this.vy, this.vx), '#ff006e');
        }

        // Comprobar si sale de la pantalla
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

        // Núcleo blanco brillante para efecto neón
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(1, this.radius * 0.4), 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// Onda expansiva de Pulso EMP
export class EMPWave {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 10;
        this.maxRadius = Math.max(window.innerWidth, window.innerHeight) * 0.8;
        this.speed = 1200; // px/seg
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
