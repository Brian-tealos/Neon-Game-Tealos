/**
 * Neon Void - Roguelite Upgrades Deck
 * Módulos tecnológicos desbloqueables al subir de nivel o derrotar oleadas.
 */

export const UPGRADE_POOL = [
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

export function getRandomUpgrades(count = 3) {
    const shuffled = [...UPGRADE_POOL].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}
