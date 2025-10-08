// Données des offres d'emploi
const jobs = [
    {
        id: 1,
        title: "Développeur Frontend React",
        description: "Travail sur des interfaces modernes avec React.",
        company: "Pixel Labs"
    },
    {
        id: 2,
        title: "Ingénieur Données Junior",
        description: "Collecte et nettoyage des données pour l'équipe produit.",
        company: "DataWave"
    },
    {
        id: 3,
        title: "Product Manager",
        description: "Coordination des équipes et suivi de la feuille de route produit.",
        company: "StartupFlow"
    },
    {
        id: 4,
        title: "Designer UI/UX",
        description: "Concevoir des interfaces claires et accessibles.",
        company: "CreativeCore"
    },
    {
        id: 5,
        title: "DevOps / Cloud",
        description: "Automatisation des déploiements et gestion du cloud.",
        company: "Opsify"
    }
];

// Fonction pour gérer les clics sur "Learn more"
function handleLearnMore(jobId) {
    console.log(`Learn more clicked for job ID: ${jobId}`);
    // Ici vous pourrez ajouter la logique future
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Jobly loaded successfully!');
    
    // Ajouter les event listeners aux boutons
    const buttons = document.querySelectorAll('.learn-more');
    buttons.forEach((button, index) => {
        button.addEventListener('click', () => handleLearnMore(jobs[index].id));
    });
});