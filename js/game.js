/**
 * Neon Void - Master Game Engine
 * Ciclo principal de juego (Game Loop), detección de colisiones, director de oleadas y HUD.
 */

import { Player } from './player.js';
import { ParticleEngine } from './particles.js';
import { Enemy, BossTitan } from './enemies.js';
import { Collectible } from './powerups.js';
import { EMPWave } from './projectiles.js';
import { getRandomUpgrades } from './upgrades.js';
import { sounds } from './audio.js';

export class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Estado del Juego
        this.state = 'MENU'; // 'MENU', 'PLAYING', 'UPGRADE_SELECT', 'PAUSED', 'GAME_OVER'
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('neon_void_highscore') || '0', 10);
        this.kills = 0;
        this.gameTime = 0;

        // Combo
        this.combo = 1.0;
        this.comboTimer = 0;
        this.comboMaxTime = 3.5;

        // Director de Oleadas
        this.wave = 1;
        this.waveTimer = 0;
        this.waveDuration = 24.0; // Segundos por oleada
        this.spawnTimer = 0;
        this.isBossWave = false;

        // Entidades
        this.particles = new ParticleEngine();
        this.player = null;
        this.enemies = [];
        this.projectiles = [];
        this.collectibles = [];
        this.activeBoss = null;

        // Control de Entradas (Input)
        this.input = {
            keys: {},
            mouseX: window.innerWidth / 2,
            mouseY: window.innerHeight / 2,
            isMouseDown: false
        };

        // Cache de Elementos del DOM (HUD)
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
            if (this.particles) this.particles.initStars(150);
        };
        window.addEventListener('resize', resize);
        resize();

        // Teclado
        window.addEventListener('keydown', (e) => {
            this.input.keys[e.code] = true;

            // Pausa con ESC
            if (e.code === 'Escape') {
                if (this.state === 'PLAYING') this.pauseGame();
                else if (this.state === 'PAUSED') this.resumeGame();
            }

            // Bomba EMP con Espacio
            if (e.code === 'Space' && this.state === 'PLAYING') {
                e.preventDefault();
                if (this.player) this.player.triggerEMP(this.projectiles, this.particles, sounds);
            }

            // Dash con Shift
            if ((e.code === 'ShiftLeft' || e.code === 'ShiftRight') && this.state === 'PLAYING') {
                if (this.player) this.player.triggerDash(this.particles, sounds);
            }
        });

        window.addEventListener('keyup', (e) => {
            this.input.keys[e.code] = false;
        });

        // Ratón
        window.addEventListener('mousemove', (e) => {
            this.input.mouseX = e.clientX;
            this.input.mouseY = e.clientY;
        });

        window.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                this.input.isMouseDown = true;
            } else if (e.button === 2) {
                // Click derecho activa Dash
                e.preventDefault();
                if (this.state === 'PLAYING' && this.player) {
                    this.player.triggerDash(this.particles, sounds);
                }
            }
        });

        window.addEventListener('mouseup', (e) => {
            if (e.button === 0) this.input.isMouseDown = false;
        });

        window.addEventListener('contextmenu', (e) => {
            e.preventDefault(); // Prevenir menú contextual del navegador
        });


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

        // UI
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

        // 1. Combo Decay
        if (this.comboTimer > 0) {
            this.comboTimer -= dt;
            if (this.comboTimer <= 0) {
                this.combo = 1.0;
            }
        }

        // 2. Jugador
        this.player.update(
            dt,
            this.input,
            this.particles,
            sounds,
            this.projectiles,
            this.enemies,
            (newLevel) => this.showLevelUpModal(newLevel)
        );

        // 3. Proyectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            if (p instanceof EMPWave) {
                p.update(dt);
                // La onda EMP elimina proyectiles enemigos y daña enemigos
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

        // 4. Enemigos
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(dt, this.player, this.projectiles, sounds);

            if (enemy.dead) {
                this.onEnemyDefeated(enemy);
                this.enemies.splice(i, 1);
            }
        }

        // 5. Coleccionables (Orbes / Gemas)
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const c = this.collectibles[i];
            c.update(dt, this.player);

            // Colisión con el jugador
            const dist = Math.hypot(this.player.x - c.x, this.player.y - c.y);
            if (dist < this.player.radius + c.radius) {
                this.onPickupCollected(c);
                this.collectibles.splice(i, 1);
            }
        }

        // 6. Colisiones
        this.handleCollisions();

        // 7. Director de Oleadas (Spawning)
        this.updateWaveManager(dt);

        // 8. Partículas y Efectos
        this.particles.update(dt);

        // 9. Actualizar HUD
        this.updateHUD();
    }

    updateWaveManager(dt) {
        this.waveTimer += dt;

        // Comprobar si es oleada de Jefe (múltiplos de 5)
        if (this.wave % 5 === 0 && !this.isBossWave && !this.activeBoss) {
            this.isBossWave = true;
            this.spawnBoss();
            return;
        }

        // Fin de oleada estándar
        if (!this.isBossWave && this.waveTimer >= this.waveDuration) {
            this.wave++;
            this.waveTimer = 0;
            this.particles.addFloatingText(`¡OLEADA ${this.wave}!`, window.innerWidth / 2, window.innerHeight / 2 - 80, '#00f3ff', 28, true);
            sounds.playPickup('powerup');
        }

        // Generar enemigos periódicamente
        this.spawnTimer += dt;
        const spawnInterval = Math.max(0.6, 2.2 - this.wave * 0.12);

        if (this.spawnTimer >= spawnInterval) {
            this.spawnTimer = 0;
            const maxEnemies = 10 + this.wave * 3;
            if (this.enemies.length < maxEnemies) {
                this.spawnEnemy();
            }
        }
    }

    spawnEnemy() {
        // Posición en los bordes de la pantalla fuera de vista
        const margin = 40;
        let x, y;
        const side = Math.floor(Math.random() * 4);
        if (side === 0) { // Arriba
            x = Math.random() * window.innerWidth;
            y = -margin;
        } else if (side === 1) { // Derecha
            x = window.innerWidth + margin;
            y = Math.random() * window.innerHeight;
        } else if (side === 2) { // Abajo
            x = Math.random() * window.innerWidth;
            y = window.innerHeight + margin;
        } else { // Izquierda
            x = -margin;
            y = Math.random() * window.innerHeight;
        }

        // Tipos de enemigos según la oleada
        let type = 'drone';
        const rand = Math.random();
        if (this.wave >= 2 && rand < 0.35) {
            type = 'swarmer';
        } else if (this.wave >= 3 && rand > 0.65) {
            type = 'gunner';
        } else if (this.wave >= 4 && rand > 0.85) {
            type = 'cruiser';
        }

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
        // 1. Proyectiles del jugador vs Enemigos
        for (const p of this.projectiles) {
            if (!p.isPlayer || p.dead) continue;

            for (const e of this.enemies) {
                if (e.dead) continue;

                const dist = Math.hypot(e.x - p.x, e.y - p.y);
                if (dist < e.radius + p.radius) {
                    const killed = e.takeDamage(p.damage);
                    this.particles.addFloatingText(`-${p.damage}`, e.x, e.y - 10, p.color, 14);

                    if (p.pierce > 0) {
                        p.pierce--;
                    } else {
                        p.dead = true;
                    }

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

        // 2. Proyectiles enemigos vs Jugador
        for (const p of this.projectiles) {
            if (p.isPlayer || p.dead) continue;

            const dist = Math.hypot(this.player.x - p.x, this.player.y - p.y);
            if (dist < this.player.radius + p.radius) {
                p.dead = true;
                const isDead = this.player.takeDamage(p.damage, this.particles, sounds);
                this.combo = 1.0; // Se rompe el combo
                this.comboTimer = 0;

                if (isDead) {
                    this.triggerGameOver();
                    return;
                }
            }
        }

        // 3. Colisión física directa de la nave con enemigos (embestida)
        for (const e of this.enemies) {
            if (e.dead) continue;

            const dist = Math.hypot(this.player.x - e.x, this.player.y - e.y);
            if (dist < this.player.radius + e.radius) {
                const contactDmg = e.type === 'boss' ? 40 : 25;
                const isDead = this.player.takeDamage(contactDmg, this.particles, sounds);
                this.combo = 1.0;
                this.comboTimer = 0;

                // Si la nave está en Dash, destruye o empuja al enemigo
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

        // Aumentar combo
        this.combo = Math.min(5.0, +(this.combo + 0.1).toFixed(1));
        this.comboTimer = this.comboMaxTime;

        // Efecto visual de explosión
        this.particles.createExplosion(enemy.x, enemy.y, enemy.color, enemy.type === 'boss' ? 80 : 20, enemy.type === 'boss' ? 2.2 : 1.0);

        // Soltar orbes de XP
        this.collectibles.push(new Collectible(enemy.x, enemy.y, 'xp', enemy.xpValue));

        // Probabilidad de soltar mejoras especiales
        const dropChance = Math.random();
        if (enemy.type === 'boss') {
            // Garantizar mejoras al derrotar al jefe
            this.collectibles.push(new Collectible(enemy.x - 25, enemy.y, 'shield', 50));
            this.collectibles.push(new Collectible(enemy.x + 25, enemy.y, 'bomb', 1));
            this.collectibles.push(new Collectible(enemy.x, enemy.y - 25, 'overdrive', 1));
            this.activeBoss = null;
            this.isBossWave = false;
            this.wave++;
            this.waveTimer = 0;
            this.showLevelUpModal(this.player.level);
        } else {
            if (dropChance < 0.05) {
                this.collectibles.push(new Collectible(enemy.x, enemy.y, 'shield', 40));
            } else if (dropChance < 0.07) {
                this.collectibles.push(new Collectible(enemy.x, enemy.y, 'bomb', 1));
            } else if (dropChance < 0.09) {
                this.collectibles.push(new Collectible(enemy.x, enemy.y, 'overdrive', 1));
            }
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

        // Escudo y Salud
        const shieldPct = Math.max(0, (this.player.shield / this.player.maxShield) * 100);
        this.dom.shieldBar.style.width = `${shieldPct}%`;
        this.dom.shieldText.textContent = `${Math.ceil(this.player.shield)}/${this.player.maxShield}`;

        const healthPct = Math.max(0, (this.player.health / this.player.maxHealth) * 100);
        this.dom.healthBar.style.width = `${healthPct}%`;
        this.dom.healthText.textContent = `${Math.ceil(this.player.health)}/${this.player.maxHealth}`;

        // Oleada y Tiempo
        this.dom.waveDisplay.textContent = `OLEADA ${this.wave}`;
        const mins = Math.floor(this.gameTime / 60);
        const secs = Math.floor(this.gameTime % 60);
        this.dom.timeDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

        // Barra del Jefe
        if (this.activeBoss && !this.activeBoss.dead) {
            this.dom.bossHealthContainer.classList.remove('hidden');
            this.dom.bossName.textContent = this.activeBoss.name;
            const bossPct = Math.max(0, (this.activeBoss.health / this.activeBoss.maxHealth) * 100);
            this.dom.bossBarFill.style.width = `${bossPct}%`;
        } else {
            this.dom.bossHealthContainer.classList.add('hidden');
        }

        // Score y Combo
        this.dom.scoreDisplay.textContent = this.score.toLocaleString();
        this.dom.comboDisplay.textContent = `x${this.combo.toFixed(1)}`;
        const comboPct = (this.comboTimer / this.comboMaxTime) * 100;
        this.dom.comboTimerFill.style.width = `${Math.max(0, comboPct)}%`;

        // Habilidades (Bombas y Dash)
        let bombDots = '';
        for (let i = 0; i < this.player.bombs; i++) bombDots += '● ';
        for (let i = this.player.bombs; i < this.player.maxBombs; i++) bombDots += '○ ';
        this.dom.bombCharges.textContent = bombDots.trim();

        const dashCdPct = (this.player.dashCooldown / this.player.dashCooldownMax) * 100;
        this.dom.dashCooldown.style.height = `${Math.max(0, dashCdPct)}%`;

        // Nivel y XP
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
        // Aplicar vibración de pantalla (Camera Shake)
        if (this.particles.shakeX !== 0 || this.particles.shakeY !== 0) {
            this.ctx.translate(this.particles.shakeX, this.particles.shakeY);
            this.ctx.rotate(this.particles.shakeAngle);
        }

        // 1. Estrellas de fondo y efectos ambientales
        this.particles.render(this.ctx);

        // 2. Orbes y Coleccionables
        for (const c of this.collectibles) {
            c.render(this.ctx);
        }

        // 3. Proyectiles
        for (const p of this.projectiles) {
            p.render(this.ctx);
        }

        // 4. Enemigos y Jefes
        for (const e of this.enemies) {
            e.render(this.ctx);
        }

        // 5. Jugador
        if (this.player && this.state !== 'GAME_OVER') {
            this.player.render(this.ctx);
        }

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
