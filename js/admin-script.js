// Données des offres d'emploi (simulation base de données)
let jobs = [
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

let nextId = 6;
let editingId = null;

// Afficher la liste des offres
function displayJobs() {
    const jobsList = document.getElementById('jobs-list');
    jobsList.innerHTML = '';
    
    jobs.forEach(job => {
        const jobElement = document.createElement('div');
        jobElement.className = 'admin-job-item';
        jobElement.innerHTML = `
            <div class="admin-job-info">
                <h3>${job.title}</h3>
                <p><strong>${job.company}</strong> - ${job.location}</p>
                <p>${job.description}</p>
            </div>
            <div class="admin-job-actions">
                <button class="learn-more" onclick="editJob(${job.id})">Modifier</button>
                <button class="back-btn" onclick="deleteJob(${job.id})">Supprimer</button>
            </div>
        `;
        jobsList.appendChild(jobElement);
    });
}

// Ajouter une nouvelle offre
function addJob(jobData) {
    const newJob = {
        id: nextId++,
        ...jobData
    };
    jobs.push(newJob);
    displayJobs();
}

// Modifier une offre existante
function updateJob(id, jobData) {
    const index = jobs.findIndex(job => job.id === id);
    if (index !== -1) {
        jobs[index] = { id, ...jobData };
        displayJobs();
    }
}

// Supprimer une offre
function deleteJob(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
        jobs = jobs.filter(job => job.id !== id);
        displayJobs();
    }
}

// Préparer l'édition d'une offre
function editJob(id) {
    const job = jobs.find(job => job.id === id);
    if (job) {
        editingId = id;
        document.getElementById('form-title').textContent = 'Modifier l\'offre';
        document.getElementById('job-id').value = job.id;
        document.getElementById('job-title').value = job.title;
        document.getElementById('job-company').value = job.company;
        document.getElementById('job-description').value = job.description;
        document.getElementById('job-requirements').value = job.requirements;
        document.getElementById('job-location').value = job.location;
        document.getElementById('job-salary').value = job.salary;
        document.querySelector('.submit-btn').textContent = 'Modifier l\'offre';
        document.getElementById('cancel-btn').style.display = 'inline-block';
    }
}

// Annuler l'édition
function cancelEdit() {
    editingId = null;
    document.getElementById('form-title').textContent = 'Ajouter une offre';
    document.getElementById('job-form').reset();
    document.querySelector('.submit-btn').textContent = 'Ajouter l\'offre';
    document.getElementById('cancel-btn').style.display = 'none';
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    displayJobs();
    
    // Gestion du formulaire
    document.getElementById('job-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const jobData = {
            title: formData.get('title'),
            company: formData.get('company'),
            description: formData.get('description'),
            requirements: formData.get('requirements'),
            location: formData.get('location'),
            salary: formData.get('salary')
        };
        
        if (editingId) {
            updateJob(editingId, jobData);
            cancelEdit();
        } else {
            addJob(jobData);
            this.reset();
        }
    });
    
    // Bouton annuler
    document.getElementById('cancel-btn').addEventListener('click', cancelEdit);
});