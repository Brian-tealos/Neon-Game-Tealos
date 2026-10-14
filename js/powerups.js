/**
 * Neon Void - Powerups & Collectibles Engine
 * Objetos recogibles con atracción magnética hacia el jugador.
 */

export class Collectible {
    constructor(x, y, type = 'xp', value = 15) {
        this.x = x;
        this.y = y;
        this.type = type; // 'xp', 'shield', 'bomb', 'overdrive'
        this.value = value;
        this.radius = type === 'xp' ? 5 : 9;
        this.dead = false;
        this.vx = (Math.random() - 0.5) * 80;
        this.vy = (Math.random() - 0.5) * 80;
        this.bobOffset = Math.random() * Math.PI * 2;

        switch (type) {
            case 'xp':
                this.color = '#06d6a0'; // Neon Mint Green
                break;
            case 'shield':
                this.color = '#00f3ff'; // Neon Cyan
                break;
            case 'bomb':
                this.color = '#ffbe0b'; // Amber Gold
                break;
            case 'overdrive':
                this.color = '#ff006e'; // Hot Magenta
                break;
            default:
                this.color = '#ffffff';
        }
    }

    update(dt, player) {
        // Fricción inicial tras ser soltado
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.vx *= 0.92;
        this.vy *= 0.92;

        // Atracción magnética hacia el jugador si está dentro del rango
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
            // Cristal de energía tipo rombo
            ctx.beginPath();
            ctx.moveTo(this.x, this.y - currentRadius * 1.3);
            ctx.lineTo(this.x + currentRadius, this.y);
            ctx.lineTo(this.x, this.y + currentRadius * 1.3);
            ctx.lineTo(this.x - currentRadius, this.y);
            ctx.closePath();
            ctx.fill();
        } else {
            // Orbe de poder circular con núcleo blanco
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
