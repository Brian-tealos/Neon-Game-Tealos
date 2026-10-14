/**
 * Neon Void - Controles táctiles (Android / móviles / tablets)
 *
 * Joystick izquierdo  -> mover la nave
 * Joystick derecho    -> apuntar y disparar (dispara mientras lo mantienes inclinado)
 * Botones DASH / EMP  -> habilidades
 * Botón de pausa      -> pausa
 *
 * Se apoya en window.__neonGame (lo expone el juego) y en eventos de teclado
 * sintéticos para Dash / EMP / Pausa, así reutiliza el sonido y la lógica existentes.
 */
(function () {
    'use strict';

    window.addEventListener('DOMContentLoaded', () => {
        const game = window.__neonGame;
        if (!game) return;

        const wrapper = document.getElementById('game-wrapper');
        const input = game.input;
        let built = false;
        let ui = null;

        // ---------------------------------------------------------------
        // Detección de modo táctil
        // ---------------------------------------------------------------
        const coarse = window.matchMedia('(pointer: coarse)').matches;
        if (coarse) {
            enableTouchMode();
        } else {
            // Portátiles con pantalla táctil: se activa al primer toque
            window.addEventListener('touchstart', enableTouchMode, { once: true, passive: true });
        }

        function enableTouchMode() {
            if (built) return;
            built = true;
            document.body.classList.add('touch-device');
            input.aimActive = true;   // el ángulo lo manda el joystick, no el ratón
            input.aimAngle = -Math.PI / 2; // apunta hacia arriba al empezar
            ui = buildControls();
            setupFullscreenOnStart();
            setupAutoPause();
            requestAnimationFrame(tick);
        }

        // ---------------------------------------------------------------
        // Construcción del DOM de controles
        // ---------------------------------------------------------------
        function buildControls() {
            const root = document.createElement('div');
            root.id = 'touch-controls';
            root.className = 'tc-off';
            root.innerHTML = `
                <div class="tc-zone tc-left" id="tc-move"></div>
                <div class="tc-zone tc-right" id="tc-aim"></div>
                <div class="tc-stick" id="tc-stick-move"><div class="tc-knob"></div></div>
                <div class="tc-stick tc-stick-aim" id="tc-stick-aim"><div class="tc-knob"></div></div>
                <button class="tc-btn tc-dash" id="tc-dash" type="button" aria-label="Dash">
                    <span class="tc-cd" id="tc-dash-cd"></span>
                    <span class="tc-label">DASH</span>
                </button>
                <button class="tc-btn tc-emp" id="tc-emp" type="button" aria-label="Pulso EMP">
                    <span class="tc-label">EMP</span>
                    <span class="tc-count" id="tc-emp-count">0</span>
                </button>
                <button class="tc-pause" id="tc-pause" type="button" aria-label="Pausa">❚❚</button>
            `;
            wrapper.appendChild(root);

            const moveStick = makeStick(
                root.querySelector('#tc-move'),
                root.querySelector('#tc-stick-move'),
                (x, y, active) => {
                    const m = Math.hypot(x, y);
                    const dead = 0.12;
                    if (!active || m < dead) {
                        input.moveX = 0;
                        input.moveY = 0;
                    } else {
                        const k = (Math.min(1, m) - dead) / (1 - dead) / m;
                        input.moveX = x * k;
                        input.moveY = y * k;
                    }
                }
            );

            let aimHeld = false;
            const aimStick = makeStick(
                root.querySelector('#tc-aim'),
                root.querySelector('#tc-stick-aim'),
                (x, y, active) => {
                    const m = Math.hypot(x, y);
                    aimHeld = active;
                    if (active && m > 0.25) {
                        input.aimAngle = Math.atan2(y, x);
                        input.touchFire = true;
                    } else {
                        input.touchFire = false;
                    }
                }
            );

            bindButton(root.querySelector('#tc-dash'), 'ShiftLeft');
            bindButton(root.querySelector('#tc-emp'), 'Space');
            bindButton(root.querySelector('#tc-pause'), 'Escape');

            return {
                root,
                moveStick,
                aimStick,
                isAimHeld: () => aimHeld,
                dashCd: root.querySelector('#tc-dash-cd'),
                empCount: root.querySelector('#tc-emp-count'),
                dashBtn: root.querySelector('#tc-dash'),
                empBtn: root.querySelector('#tc-emp')
            };
        }

        // Joystick flotante: aparece donde apoyas el dedo dentro de su mitad de pantalla
        function makeStick(zone, stickEl, onChange) {
            const RADIUS = 56;
            const knob = stickEl.firstElementChild;
            let activeId = null;
            let cx = 0;
            let cy = 0;

            zone.addEventListener('pointerdown', (e) => {
                if (activeId !== null) return;
                activeId = e.pointerId;
                try { zone.setPointerCapture(activeId); } catch (_) { /* ignorar */ }
                cx = e.clientX;
                cy = e.clientY;
                stickEl.style.left = cx + 'px';
                stickEl.style.top = cy + 'px';
                stickEl.classList.add('active');
                knob.style.transform = 'translate(-50%, -50%)';
                onChange(0, 0, true);
                e.preventDefault();
            });

            zone.addEventListener('pointermove', (e) => {
                if (e.pointerId !== activeId) return;
                let dx = e.clientX - cx;
                let dy = e.clientY - cy;
                const d = Math.hypot(dx, dy);
                if (d > RADIUS) {
                    dx = (dx / d) * RADIUS;
                    dy = (dy / d) * RADIUS;
                }
                knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
                onChange(dx / RADIUS, dy / RADIUS, true);
                e.preventDefault();
            });

            const end = (e) => {
                if (e.pointerId !== activeId) return;
                release();
            };
            zone.addEventListener('pointerup', end);
            zone.addEventListener('pointercancel', end);
            zone.addEventListener('lostpointercapture', end);

            function release() {
                activeId = null;
                stickEl.classList.remove('active');
                onChange(0, 0, false);
            }

            return { reset: () => { if (activeId !== null) release(); } };
        }

        // Los botones lanzan el mismo evento de teclado que ya entiende el juego
        function bindButton(btn, code) {
            btn.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                window.dispatchEvent(new KeyboardEvent('keydown', { code, bubbles: true, cancelable: true }));
                window.dispatchEvent(new KeyboardEvent('keyup', { code, bubbles: true }));
                btn.classList.add('pressed');
            });
            const up = () => btn.classList.remove('pressed');
            btn.addEventListener('pointerup', up);
            btn.addEventListener('pointercancel', up);
            btn.addEventListener('pointerleave', up);
            btn.addEventListener('contextmenu', (e) => e.preventDefault());
        }

        // ---------------------------------------------------------------
        // Pantalla completa + horizontal al iniciar la partida
        // ---------------------------------------------------------------
        function setupFullscreenOnStart() {
            const btnStart = document.getElementById('btn-start');
            if (!btnStart) return;
            btnStart.addEventListener('click', async () => {
                try {
                    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
                        await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
                    }
                    if (screen.orientation && screen.orientation.lock) {
                        await screen.orientation.lock('landscape');
                    }
                } catch (_) {
                    // Si el navegador no lo permite, el juego sigue funcionando igual
                }
            });
        }

        // Pausa automática al cambiar de app o bloquear el teléfono
        function setupAutoPause() {
            document.addEventListener('visibilitychange', () => {
                if (document.hidden && game.state === 'PLAYING') game.pauseGame();
            });
        }

        // ---------------------------------------------------------------
        // Bucle ligero: visibilidad de controles + indicadores de botones
        // ---------------------------------------------------------------
        let wasPlaying = false;
        let lastCd = -1;
        let lastBombs = -1;

        function tick() {
            const playing = game.state === 'PLAYING';

            if (playing !== wasPlaying) {
                wasPlaying = playing;
                ui.root.classList.toggle('tc-off', !playing);
                if (!playing) {
                    ui.moveStick.reset();
                    ui.aimStick.reset();
                    input.moveX = 0;
                    input.moveY = 0;
                    input.touchFire = false;
                }
            }

            if (playing && game.player) {
                // Sin disparar, la nave mira hacia donde se mueve
                if (!ui.isAimHeld() && (input.moveX || input.moveY)) {
                    input.aimAngle = Math.atan2(input.moveY, input.moveX);
                }

                const p = game.player;
                const cd = Math.round(Math.max(0, p.dashCooldown / p.dashCooldownMax) * 100);
                if (cd !== lastCd) {
                    lastCd = cd;
                    ui.dashCd.style.height = cd + '%';
                    ui.dashBtn.classList.toggle('cooling', cd > 0);
                }
                if (p.bombs !== lastBombs) {
                    lastBombs = p.bombs;
                    ui.empCount.textContent = String(p.bombs);
                    ui.empBtn.classList.toggle('empty', p.bombs <= 0);
                }
            }

            requestAnimationFrame(tick);
        }
    });
})();
