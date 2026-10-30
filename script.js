const canvas = document.getElementById('space-bg');
const ctx = canvas.getContext('2d');
const ariane6 = new Image();
ariane6.src = 'ariane6.svg';

let width, height;
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Génération du champ d'étoiles
const stars = Array.from({ length: 150 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size: Math.random() * 1.8,
    alpha: Math.random()
}));

// Télémétrie UI
const hudAlt = document.getElementById('hud-alt');
const hudSpeed = document.getElementById('hud-speed');

function getScrollProgress() {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    return totalHeight > 0 ? Math.min(Math.max(window.scrollY / totalHeight, 0), 1) : 0;
}

function drawBackground(progress) {
    // Phase 1 : Atmosphère basse (Décollage) -> Phase 4 : Espace profond (Orbite)
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    
    if (progress < 0.25) {
        // Atmosphère terrestre au départ
        gradient.addColorStop(0, '#020b1e');
        gradient.addColorStop(0.7, '#002244');
        gradient.addColorStop(1, '#004488');
    } else if (progress < 0.65) {
        // Stratosphère / Haute atmosphère
        gradient.addColorStop(0, '#010614');
        gradient.addColorStop(0.8, '#001127');
        gradient.addColorStop(1, '#002244');
    } else {
        // Espace vide
        gradient.addColorStop(0, '#010308');
        gradient.addColorStop(1, '#030712');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Halos bleus subtils pour donner de la profondeur au fond.
    const glow = ctx.createRadialGradient(
        width * 0.5, height * 0.35, 0,
        width * 0.5, height * 0.35, width * 0.7
    );
    glow.addColorStop(0, `rgba(0, 102, 255, ${0.12 - progress * 0.04})`);
    glow.addColorStop(0.45, `rgba(0, 163, 224, ${0.05 - progress * 0.02})`);
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    const horizon = ctx.createLinearGradient(0, height * 0.55, 0, height);
    horizon.addColorStop(0, 'rgba(0, 102, 255, 0)');
    horizon.addColorStop(1, 'rgba(0, 102, 255, 0.08)');
    ctx.fillStyle = horizon;
    ctx.fillRect(0, 0, width, height);

    // Dessin des étoiles (plus visibles à mesure qu'on monte)
    const starAlphaMultiplier = Math.min(progress * 1.5 + 0.2, 1);
    stars.forEach(star => {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha * starAlphaMultiplier})`;
        ctx.fillRect(star.x, star.y, star.size, star.size);
    });
}

function drawTrajectoryAndRocket(progress) {
    // Calcul de la courbe de trajectoire parabolique
    const startX = width * 0.15;
    const startY = height * 0.85;
    const controlX = width * 0.45;
    const controlY = height * 0.1;
    const endX = width * 0.9;
    const endY = height * 0.2;

    // Dessiner la ligne de trajectoire (Bleu Arianespace)
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(controlX, controlY, endX, endY);
    ctx.strokeStyle = 'rgba(0, 163, 224, 0.3)';
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);

    // Position exacte de la fusée (Bézier quadratique)
    const t = progress;
    const rx = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * controlX + t * t * endX;
    const ry = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * controlY + t * t * endY;

    // Calcul de la tangente pour orienter la fusée
    const dx = 2 * (1 - t) * (controlX - startX) + 2 * t * (endX - controlX);
    const dy = 2 * (1 - t) * (controlY - startY) + 2 * t * (endY - controlY);
    const angle = Math.atan2(dy, dx);

    ctx.save();
    ctx.translate(rx, ry);
    ctx.rotate(angle + Math.PI / 2);

    if (ariane6.complete && ariane6.naturalWidth > 0) {
        const rocketHeight = Math.min(220, Math.max(150, height * 0.25));
        const rocketWidth = rocketHeight * (ariane6.naturalWidth / ariane6.naturalHeight);

        if (progress < 0.95) {
            const flameLength = 20 + Math.random() * 12;
            const flame = ctx.createLinearGradient(0, 0, 0, flameLength);
            flame.addColorStop(0, '#fff3a3');
            flame.addColorStop(0.35, '#ffb21c');
            flame.addColorStop(0.72, '#ff5a16');
            flame.addColorStop(1, 'rgba(255, 54, 0, 0)');

            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.shadowColor = '#ff6a1a';
            ctx.shadowBlur = 18;
            ctx.fillStyle = flame;
            ctx.beginPath();
            ctx.moveTo(-rocketWidth * 0.16, -2);
            ctx.quadraticCurveTo(-rocketWidth * 0.08, flameLength * 0.4, 0, flameLength);
            ctx.quadraticCurveTo(rocketWidth * 0.08, flameLength * 0.4, rocketWidth * 0.16, -2);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        ctx.shadowColor = 'rgba(0, 163, 224, 0.55)';
        ctx.shadowBlur = 12;
        ctx.drawImage(ariane6, -rocketWidth / 2, -rocketHeight, rocketWidth, rocketHeight);
        ctx.shadowBlur = 0;
    }

    ctx.restore();
}

function updateHUD(progress) {
    const alt = Math.round(progress * 420); // 0 à 420 km (Orbite LEO)
    const speed = Math.round(progress * 7600); // 0 à 7600 m/s
    hudAlt.textContent = alt;
    hudSpeed.textContent = speed;

}

// Boucle de rendu
function render() {
    const progress = getScrollProgress();
    ctx.clearRect(0, 0, width, height);
    
    drawBackground(progress);
    drawTrajectoryAndRocket(progress);
    updateHUD(progress);

    requestAnimationFrame(render);
}

render();
