// Changement d'apparence de la barre de navigation au défilement
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(7, 9, 19, 0.98)';
        navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.5)';
    } else {
        navbar.style.background = 'rgba(7, 9, 19, 0.9)';
        navbar.style.boxShadow = 'none';
    }
});

// Défilement doux (Smooth scroll) pour les liens d'ancrage
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetElement = document.querySelector(this.getAttribute('href'));
        if(targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 70, // Compense la hauteur de la navbar
                behavior: 'smooth'
            });
        }
    });
});
