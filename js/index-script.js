// Script pour les interactions de la page d'accueil
// Données des offres d'emploi disponibles
const jobOffers = [
    { id: 1, title: "Développeur Frontend React", company: "Pixel Labs" },
    { id: 2, title: "Ingénieur Données Junior", company: "DataWave" },
    { id: 3, title: "Product Manager", company: "StartupFlow" },
    { id: 4, title: "Designer UI/UX", company: "CreativeCore" },
    { id: 5, title: "DevOps / Cloud", company: "Opsify" }
];

document.addEventListener('DOMContentLoaded', function() {
    // Sélectionner tous les boutons
    const buttons = document.querySelectorAll('button');
    
    // Ajouter les effets hover et click similaires à offers.html
    buttons.forEach(button => {
        // Effet hover
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.transition = 'all 0.3s ease';
            
            // Effet spécifique selon le type de bouton
            if (this.style.backgroundColor === 'rgb(252, 162, 7)' || this.classList.contains('button-3') || this.classList.contains('div-wrapper')) {
                this.style.backgroundColor = '#e6920a';
            }
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            
            // Restaurer la couleur originale
            if (this.style.backgroundColor === 'rgb(230, 146, 10)') {
                this.style.backgroundColor = '#fca207';
            }
        });
        
        // Effet click
        button.addEventListener('click', function(e) {
            // Animation de click
            this.style.transform = 'translateY(1px)';
            setTimeout(() => {
                this.style.transform = 'translateY(-2px)';
            }, 100);
            
            // Gestion des boutons de connexion/inscription
            if (this.textContent.includes('Se Connecter')) {
                e.preventDefault();
                console.log('Redirection vers page de connexion');
                // Ici vous pouvez ajouter la logique de redirection
            } else if (this.textContent.includes('Nous rejoindre')) {
                e.preventDefault();
                console.log('Redirection vers page d\'inscription');
                // Ici vous pouvez ajouter la logique de redirection
            }
        });
    });
    
    // Animation d'apparition des cartes au scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observer les cartes
    const cards = document.querySelectorAll('.customer-quote, .customer-quote-2, .customer-quote-3, .card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
    
    // Fonctionnalité de recherche
    const searchInput = document.getElementById('search-input');
    const searchButton = document.querySelector('.button-5');
    
    function performSearch() {
        const searchTerm = searchInput.value.trim();
        
        if (searchTerm === '') {
            window.location.href = 'offers.html';
            return;
        }
        
        // Passer le terme de recherche via URL
        window.location.href = `offers.html?search=${encodeURIComponent(searchTerm)}`;
    }
    
    // Event listeners pour la recherche
    searchButton.addEventListener('click', function(e) {
        e.preventDefault();
        performSearch();
    });
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        }
    });
    
    console.log('Index page interactions loaded successfully!');
});