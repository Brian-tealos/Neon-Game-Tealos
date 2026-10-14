/**
 * Neon Void - Entry Point
 * Inicialización de componentes, eventos de interfaz y arranque del loop principal.
 */

import { Game } from './game.js';
import { sounds } from './audio.js';

window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    window.__neonGame = game; // lo usa js/mobile.js

    // Referencias de botones del menú
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

    // Iniciar Misión
    btnStart.addEventListener('click', () => {
        game.startNewGame();
    });

    // Modal de Instrucciones
    btnHow.addEventListener('click', () => {
        instructionsModal.classList.remove('hidden');
    });

    btnCloseHow.addEventListener('click', () => {
        instructionsModal.classList.add('hidden');
    });

    // Reintentar partida tras Game Over
    btnRestart.addEventListener('click', () => {
        game.startNewGame();
    });

    // Regresar al Menú Principal
    btnMenu.addEventListener('click', () => {
        game.state = 'MENU';
        game.dom.gameOverScreen.classList.add('hidden');
        game.dom.startScreen.classList.remove('hidden');
        game.dom.startScreen.classList.add('active');
        game.dom.hud.classList.add('hidden');
    });

    // Continuar desde Pausa
    btnResume.addEventListener('click', () => {
        game.resumeGame();
    });

    // Abandonar partida
    btnQuit.addEventListener('click', () => {
        game.state = 'MENU';
        game.dom.pauseScreen.classList.add('hidden');
        game.dom.startScreen.classList.remove('hidden');
        game.dom.startScreen.classList.add('active');
        game.dom.hud.classList.add('hidden');
    });

    // Toggles de Audio
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

    // Arrancar el ciclo de animación del canvas
    requestAnimationFrame((time) => game.loop(time));
});
