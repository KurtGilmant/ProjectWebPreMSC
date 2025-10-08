// Données des offres d'emploi
const jobs = [
    {
        id: 1,
        title: "Développeur Frontend React",
        description: "Travail sur des interfaces modernes avec React.",
        company: "Pixel Labs",
        requirements: "3+ ans d'expérience en React, TypeScript, CSS",
        location: "Paris, France (Hybride)",
        salary: "45k - 55k €/an"
    },
    {
        id: 2,
        title: "Ingénieur Données Junior",
        description: "Collecte et nettoyage des données pour l'équipe produit.",
        company: "DataWave",
        requirements: "Python, SQL, notions de Machine Learning",
        location: "Lyon, France (Remote possible)",
        salary: "38k - 45k €/an"
    },
    {
        id: 3,
        title: "Product Manager",
        description: "Coordination des équipes et suivi de la feuille de route produit.",
        company: "StartupFlow",
        requirements: "2+ ans en product management, méthodologies agiles",
        location: "Bordeaux, France",
        salary: "50k - 60k €/an"
    },
    {
        id: 4,
        title: "Designer UI/UX",
        description: "Concevoir des interfaces claires et accessibles.",
        company: "CreativeCore",
        requirements: "Figma, Sketch, portfolio requis",
        location: "Toulouse, France",
        salary: "40k - 50k €/an"
    },
    {
        id: 5,
        title: "DevOps / Cloud",
        description: "Automatisation des déploiements et gestion du cloud.",
        company: "Opsify",
        requirements: "Docker, Kubernetes, AWS/Azure",
        location: "Nantes, France (Full remote)",
        salary: "55k - 65k €/an"
    }
];

// Fonction pour afficher les détails d'une offre
function showJobDetails(jobId) {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    
    // Remplir les détails
    document.getElementById('detail-title').textContent = job.title;
    document.getElementById('detail-company').textContent = job.company;
    document.getElementById('detail-description').textContent = job.description;
    document.getElementById('detail-requirements').textContent = `Compétences requises: ${job.requirements}`;
    document.getElementById('detail-location').textContent = `Localisation: ${job.location}`;
    document.getElementById('detail-salary').textContent = `Salaire: ${job.salary}`;
    
    // Masquer la grille et afficher les détails
    document.querySelector('.jobs-grid').classList.add('hidden');
    document.getElementById('job-details').classList.remove('hidden');
}

// Fonction pour retourner à la liste
function showJobsList() {
    document.getElementById('job-details').classList.add('hidden');
    document.querySelector('.jobs-grid').classList.remove('hidden');
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Jobly loaded successfully!');
    
    // Ajouter les event listeners aux boutons Learn more
    const buttons = document.querySelectorAll('.learn-more');
    buttons.forEach((button, index) => {
        button.addEventListener('click', () => showJobDetails(jobs[index].id));
    });
    
    // Ajouter event listener au bouton retour
    document.getElementById('back-btn').addEventListener('click', showJobsList);
});