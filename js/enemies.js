/**
 * Neon Void - Enemies & Bosses Engine
 * Inteligencia artificial, patrones de ataque Bullet-Hell y comportamientos de oleada.
 */

import { Bullet } from './projectiles.js';
import { Collectible } from './powerups.js';

export class Enemy {
    constructor({
        x,
        y,
        type = 'drone',
        health = 40,
        speed = 140,
        radius = 14,
        color = '#ff006e',
        scoreValue = 100,
        xpValue = 15
    }) {
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
        this.flashTimer = 0; // Efecto blanco al recibir daño
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

    update(dt, player, projectiles, sounds) {
        if (this.flashTimer > 0) this.flashTimer -= dt;

        // Vector hacia el jugador
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.hypot(dx, dy);
        this.angle = Math.atan2(dy, dx);

        switch (this.type) {
            case 'swarmer':
                // Carga directa rápida
                this.vx = Math.cos(this.angle) * this.speed;
                this.vy = Math.sin(this.angle) * this.speed;
                break;

            case 'drone':
                // Persecución estándar
                this.vx = Math.cos(this.angle) * this.speed;
                this.vy = Math.sin(this.angle) * this.speed;
                break;

            case 'gunner':
                // Mantiene distancia media y dispara
                if (dist > 320) {
                    this.vx = Math.cos(this.angle) * this.speed;
                    this.vy = Math.sin(this.angle) * this.speed;
                } else if (dist < 220) {
                    // Retrocede
                    this.vx = -Math.cos(this.angle) * (this.speed * 0.7);
                    this.vy = -Math.sin(this.angle) * (this.speed * 0.7);
                } else {
                    // Orbita ligeramente
                    const tangent = this.angle + Math.PI / 2;
                    this.vx = Math.cos(tangent) * (this.speed * 0.5);
                    this.vy = Math.sin(tangent) * (this.speed * 0.5);
                }

                // Disparo de bala apuntada
                this.shootTimer += dt;
                if (this.shootTimer >= 2.0) {
                    this.shootTimer = 0;
                    this.fireBullet(projectiles, sounds, this.angle, 350, 15);
                }
                break;

            case 'cruiser':
                // Movimiento lento y amenazante
                this.vx = Math.cos(this.angle) * this.speed;
                this.vy = Math.sin(this.angle) * this.speed;

                // Disparo triple en abanico
                this.shootTimer += dt;
                if (this.shootTimer >= 2.6) {
                    this.shootTimer = 0;
                    for (let i = -1; i <= 1; i++) {
                        this.fireBullet(projectiles, sounds, this.angle + i * 0.25, 300, 20);
                    }
                }
                break;
        }

        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }

    fireBullet(projectiles, sounds, angle, speed, damage) {
        sounds.playLaser(0.7);
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
            // Triángulo afilado pequeño
            ctx.moveTo(this.radius, 0);
            ctx.lineTo(-this.radius, this.radius * 0.7);
            ctx.lineTo(-this.radius, -this.radius * 0.7);
        } else if (this.type === 'drone') {
            // Rombo
            ctx.moveTo(this.radius, 0);
            ctx.lineTo(0, this.radius);
            ctx.lineTo(-this.radius, 0);
            ctx.lineTo(0, -this.radius);
        } else if (this.type === 'gunner') {
            // Hexágono tecnológico
            for (let i = 0; i < 6; i++) {
                const a = (i * Math.PI) / 3;
                const px = Math.cos(a) * this.radius;
                const py = Math.sin(a) * this.radius;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
        } else if (this.type === 'cruiser') {
            // Nave acorazada pesada
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

/**
 * JEFE DREADNOUGHT TITAN
 * Patrones radiales, espirales Bullet-Hell y barra de salud superior.
 */
export class BossTitan {
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
        this.attackPhase = 0; // 0: Espiral, 1: Anillo radial, 2: Ráfaga dirigida
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

    update(dt, player, projectiles, sounds) {
        if (this.flashTimer > 0) this.flashTimer -= dt;

        // Movimiento flotante imponente hacia el centro superior
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
                sounds.playLaser(0.6);
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
                sounds.playPlasma();
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
                sounds.playLaser(0.8);
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

        // Núcleo octogonal imponente
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

        // Anillo de energía giratorio interno
        ctx.save();
        ctx.rotate(this.spiralAngle);
        ctx.strokeStyle = '#00f3ff';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00f3ff';
        ctx.strokeRect(-this.radius * 0.5, -this.radius * 0.5, this.radius, this.radius);
        ctx.restore();

        // Núcleo de reactor central pulsante
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff006e';
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
