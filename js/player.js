/**
 * Neon Void - Player Ship Class
 * Manejo de navegación por inercia, armas, escudos, dash y satélites de combate.
 */

import { Bullet, EMPWave } from './projectiles.js';

export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.angle = 0;
        this.radius = 18;

        // Salud y Escudos
        this.maxHealth = 100;
        this.health = 100;
        this.maxShield = 100;
        this.shield = 100;
        this.shieldRegenRate = 18; // Puntos por segundo
        this.shieldRegenDelay = 2.5; // Segundos de espera tras recibir daño
        this.shieldTimer = 0;

        // Físicas y Movilidad
        this.maxSpeed = 360;
        this.acceleration = 1400;
        this.friction = 0.90;

        // Dash de evasión
        this.isDashing = false;
        this.dashTimer = 0;
        this.dashDuration = 0.22;
        this.dashSpeed = 900;
        this.dashCooldown = 0;
        this.dashCooldownMax = 2.2;

        // Bombas EMP
        this.maxBombs = 2;
        this.bombs = 2;

        // Armamento Principal
        this.fireCooldown = 0;
        this.fireCooldownMax = 0.16;
        this.projectilesPerShot = 1;
        this.spreadAngle = 0.12;
        this.bulletDamage = 35;
        this.bulletRadius = 4.5;
        this.bulletPierce = 0;
        this.critChance = 0.10;

        // Mejoras avanzadas
        this.hasMissiles = false;
        this.missileTimer = 0;
        this.missileFireRate = 1.3;
        this.orbitingDrones = 0;
        this.droneAngle = 0;
        this.droneFireTimer = 0;
        this.magnetRange = 160;

        // Buffs temporales
        this.overdriveTimer = 0;

        // Progresión y Experiencia
        this.level = 1;
        this.xp = 0;
        this.xpNeeded = 50;

        this.invulnerableTimer = 0;
    }

    update(dt, input, particleEngine, sounds, projectiles, enemies, onLevelUp) {
        // 1. Dash y Enfriamiento
        if (this.dashCooldown > 0) {
            this.dashCooldown -= dt;
        }

        if (this.isDashing) {
            this.dashTimer -= dt;
            // Estela continua durante el dash
            particleEngine.createThrusterTrail(this.x, this.y, this.angle, '#00f3ff');
            if (this.dashTimer <= 0) {
                this.isDashing = false;
            }
        }

        // 2. Movimiento (WASD / Flechas)
        if (!this.isDashing) {
            let moveX = 0;
            let moveY = 0;
            if (input.keys['KeyW'] || input.keys['ArrowUp']) moveY -= 1;
            if (input.keys['KeyS'] || input.keys['ArrowDown']) moveY += 1;
            if (input.keys['KeyA'] || input.keys['ArrowLeft']) moveX -= 1;
            if (input.keys['KeyD'] || input.keys['ArrowRight']) moveX += 1;

            if (moveX !== 0 && moveY !== 0) {
                // Normalizar diagonal
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

            // Fricción
            this.vx *= Math.pow(this.friction, dt * 60);
            this.vy *= Math.pow(this.friction, dt * 60);

            // Limitar velocidad
            const currentSpeed = Math.hypot(this.vx, this.vy);
            if (currentSpeed > currentMaxSpeed) {
                this.vx = (this.vx / currentSpeed) * currentMaxSpeed;
                this.vy = (this.vy / currentSpeed) * currentMaxSpeed;
            }

            // Estela del motor si hay aceleración
            if ((moveX !== 0 || moveY !== 0) && Math.random() < 0.6) {
                particleEngine.createThrusterTrail(this.x, this.y, this.angle, '#00f3ff');
            }
        }

        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Mantener dentro de los bordes de la pantalla
        this.x = Math.max(this.radius, Math.min(window.innerWidth - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(window.innerHeight - this.radius, this.y));

        // 3. Rotación hacia el puntero del ratón
        this.angle = input.aimActive
                ? input.aimAngle
                : Math.atan2(input.mouseY - this.y, input.mouseX - this.x);

        // 4. Regeneración del Escudo
        if (this.shieldTimer > 0) {
            this.shieldTimer -= dt;
        } else if (this.shield < this.maxShield) {
            this.shield = Math.min(this.maxShield, this.shield + this.shieldRegenRate * dt);
        }

        // 5. Invulnerabilidad temporal
        if (this.invulnerableTimer > 0) {
            this.invulnerableTimer -= dt;
        }

        // 6. Contador de sobrecarga
        if (this.overdriveTimer > 0) {
            this.overdriveTimer -= dt;
        }

        // 7. Disparo principal
        if (this.fireCooldown > 0) {
            this.fireCooldown -= dt;
        }

        const isShooting = input.isMouseDown || input.keys['SpaceAuto'] || input.touchFire;
        if (isShooting && this.fireCooldown <= 0) {
            this.shoot(projectiles, sounds);
        }

        // 8. Misiles automáticos si tiene la mejora
        if (this.hasMissiles) {
            this.missileTimer += dt;
            if (this.missileTimer >= this.missileFireRate) {
                this.missileTimer = 0;
                this.fireMissile(projectiles, sounds, enemies);
            }
        }

        // 9. Drones orbitales
        if (this.orbitingDrones > 0) {
            this.droneAngle += 2.5 * dt;
            this.droneFireTimer += dt;
            if (this.droneFireTimer >= 0.7) {
                this.droneFireTimer = 0;
                this.fireDroneLasers(projectiles, sounds, enemies);
            }
        }
    }

    shoot(projectiles, sounds) {
        const cd = this.overdriveTimer > 0 ? this.fireCooldownMax * 0.55 : this.fireCooldownMax;
        this.fireCooldown = cd;

        sounds.playLaser();

        const count = this.projectilesPerShot;
        const startAngle = this.angle - (this.spreadAngle * (count - 1)) / 2;
        const speed = 820;

        for (let i = 0; i < count; i++) {
            const shotAngle = startAngle + i * this.spreadAngle;
            const isCrit = Math.random() < this.critChance;
            const dmg = isCrit ? Math.round(this.bulletDamage * 2.5) : this.bulletDamage;

            // Posición inicial en la punta de la nave
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

    fireMissile(projectiles, sounds, enemies) {
        if (enemies.length === 0) return;
        sounds.playPlasma();

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

    fireDroneLasers(projectiles, sounds, enemies) {
        if (enemies.length === 0) return;
        const dist = 55;
        for (let i = 0; i < this.orbitingDrones; i++) {
            const angle = this.droneAngle + (i * Math.PI * 2) / this.orbitingDrones;
            const dx = this.x + Math.cos(angle) * dist;
            const dy = this.y + Math.sin(angle) * dist;

            // Buscar enemigo más cercano al dron
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
                sounds.playLaser(1.4);
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

    triggerDash(particleEngine, sounds) {
        if (this.dashCooldown > 0 || this.isDashing) return false;

        this.isDashing = true;
        this.dashTimer = this.dashDuration;
        this.dashCooldown = this.dashCooldownMax;
        this.invulnerableTimer = this.dashDuration + 0.1;

        // Impulso hacia el ángulo que apunta o movimiento actual
        const currentSpeed = Math.hypot(this.vx, this.vy);
        const dashAngle = currentSpeed > 20 ? Math.atan2(this.vy, this.vx) : this.angle;

        this.vx = Math.cos(dashAngle) * this.dashSpeed;
        this.vy = Math.sin(dashAngle) * this.dashSpeed;

        particleEngine.addTrauma(0.3);
        sounds.playDash();
        return true;
    }

    triggerEMP(projectiles, particleEngine, sounds) {
        if (this.bombs <= 0) return false;
        this.bombs--;

        projectiles.push(new EMPWave(this.x, this.y));
        particleEngine.addTrauma(0.7);
        sounds.playEMP();
        return true;
    }

    takeDamage(amount, particleEngine, sounds) {
        if (this.isDashing || this.invulnerableTimer > 0) return false;

        this.shieldTimer = this.shieldRegenDelay;
        this.invulnerableTimer = 0.35; // Breve periodo de gracia para evitar multi-hits instantáneos
        particleEngine.addTrauma(0.45);

        // Absorción de daño: primero el escudo, luego el casco
        if (this.shield > 0) {
            if (this.shield >= amount) {
                this.shield -= amount;
                sounds.playHit();
                particleEngine.createExplosion(this.x, this.y, '#00f3ff', 12, 0.6);
            } else {
                const remaining = amount - this.shield;
                this.shield = 0;
                this.health -= remaining;
                sounds.playExplosion(0.8);
                particleEngine.createExplosion(this.x, this.y, '#ff3366', 22, 1.0);
            }
        } else {
            this.health -= amount;
            sounds.playExplosion(1.0);
            particleEngine.createExplosion(this.x, this.y, '#ff3366', 25, 1.2);
        }

        if (this.health <= 0) {
            this.health = 0;
            return true; // Muerto
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

        // 1. Escudo de energía brillante si está activo
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

        // 2. Nave Espacial (Geometría Neón Afilada)
        ctx.fillStyle = '#0a1024';
        ctx.strokeStyle = this.isDashing ? '#ffffff' : (this.overdriveTimer > 0 ? '#ff006e' : '#00f3ff');
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = this.isDashing ? 18 : 10;
        ctx.shadowColor = ctx.strokeStyle;

        ctx.beginPath();
        // Punta delantera
        ctx.moveTo(this.radius + 6, 0);
        // Ala derecha
        ctx.lineTo(-this.radius, this.radius);
        // Hendidura de motor
        ctx.lineTo(-this.radius * 0.5, 0);
        // Ala izquierda
        ctx.lineTo(-this.radius, -this.radius);
        ctx.closePath();

        ctx.fill();
        ctx.stroke();

        // Cabina con brillo cian / blanco
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(0, 0, 5, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // 3. Drones orbitales
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
