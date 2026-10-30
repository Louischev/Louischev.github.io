const canvas = document.getElementById('space-bg');
const ctx = canvas.getContext('2d');

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
const hudPhase = document.getElementById('hud-phase');

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
    ctx.rotate(angle);

    // Flamme du booster (animée)
    if (progress < 0.95) {
        ctx.beginPath();
        ctx.moveTo(-15, 0);
        ctx.lineTo(-30 - Math.random() * 12, -4);
        ctx.lineTo(-25, 0);
        ctx.lineTo(-30 - Math.random() * 12, 4);
        ctx.closePath();
        ctx.fillStyle = progress < 0.3 ? '#ff6600' : '#00a3e0'; // Flamme chaude au décollage, puis bleue hyperergolique/hydrogène
        ctx.shadowBlur = 15;
        ctx.shadowColor = ctx.fillStyle;
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    // Dessin vectoriel de la fusée (Ariane Style)
    ctx.fillStyle = '#f0f4f8';
    ctx.beginPath();
    ctx.moveTo(18, 0); // Nez
    ctx.lineTo(-12, -5);
    ctx.lineTo(-15, -5);
    ctx.lineTo(-15, 5);
    ctx.lineTo(-12, 5);
    ctx.closePath();
    ctx.fill();

    // Bandeau bleu Arianespace sur le corps
    ctx.fillStyle = '#0066FF';
    ctx.fillRect(-2, -4.5, 6, 9);

    ctx.restore();
}

function updateHUD(progress) {
    const alt = Math.round(progress * 420); // 0 à 420 km (Orbite LEO)
    const speed = Math.round(progress * 7600); // 0 à 7600 m/s
    hudAlt.textContent = alt;
    hudSpeed.textContent = speed;

    if (progress < 0.20) {
        hudPhase.textContent = "T-0s | DÉCOLLAGE & POUSSÉE MAX";
    } else if (progress < 0.50) {
        hudPhase.textContent = "SÉPARATION BOOSTERS (EAP)";
    } else if (progress < 0.80) {
        hudPhase.textContent = "ÉSTAGE PRINCIPAL & LARGAGE COIFFE";
    } else {
        hudPhase.textContent = "INJECTION ORBITALE (RÉUSSITE)";
    }
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
