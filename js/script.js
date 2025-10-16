// Variables pour stocker les données
let jobs = [];
let currentUser = null;

// Fonction pour récupérer les informations du profil connecté
async function loadUserProfile() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        alert('Vous devez être connecté pour postuler');
        window.location.href = 'connexion.html';
        return;
    }
    
    try {
        // Décoder le token pour récupérer le nom d'utilisateur
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userName = payload.name;
        
        // Récupérer les informations complètes de l'utilisateur
        const response = await fetch(`http://localhost:3000/User/find-user/${encodeURIComponent(userName)}`);
        if (response.ok) {
            currentUser = await response.json();
            
            // Pré-remplir le formulaire avec les informations du profil
            if (currentUser) {
                const fullName = currentUser.full_name || '';
                const nameParts = fullName.split(' ');
                
                document.getElementById('prenom').value = nameParts[0] || '';
                document.getElementById('nom').value = nameParts.slice(1).join(' ') || '';
                document.getElementById('email').value = currentUser.email || '';
                
                // Si l'utilisateur a un CV, afficher un message
                if (currentUser.cv_path) {
                    const messageField = document.getElementById('message');
                    if (!messageField.value) {
                        messageField.placeholder = 'Mon CV est disponible dans mon profil. ' + messageField.placeholder;
                    }
                }
            }
        }
    } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
    }
}

// Fonction pour récupérer les offres depuis l'API
async function fetchJobs() {
    try {
        const response = await fetch('http://localhost:3000/Offer/with-companies');
        const offers = await response.json();
        
        // Mapper les offres au format attendu
        jobs = offers.map(offer => ({
            id: offer.offer_id,
            title: offer.title,
            description: offer.description,
            company: offer.company_name || 'Entreprise inconnue',
            requirements: `${offer.contract_type || 'Contrat non spécifié'} - ${offer.rythm || 'Temps plein'}`,
            location: offer.location,
            salary: offer.salary ? `${offer.salary}€/an` : 'À négocier',
            contract_type: offer.contract_type,
            rythm: offer.rythm,
            remote: offer.remote
        }));
        
        return jobs;
    } catch (error) {
        console.error('Erreur lors du chargement des offres:', error);
        return [];
    }
}

// Fonction pour afficher les détails d'une offre
function showJobDetails(jobId) {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    
    // Remplir les détails
    document.getElementById('detail-title').textContent = job.title;
    document.getElementById('detail-company').textContent = job.company;
    document.getElementById('detail-description').textContent = job.description;
    document.getElementById('detail-requirements').textContent = `Type de contrat: ${job.contract_type || 'Non spécifié'}`;
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

// Génération dynamique des cartes d'offres
function generateJobCards(jobsToShow = jobs) {
    const jobsGrid = document.querySelector('.jobs-grid');
    jobsGrid.innerHTML = ''; // Vider la grille
    
    if (jobsToShow.length === 0) {
        jobsGrid.innerHTML = '<p style="text-align: center; color: #828282; grid-column: 1 / -1;">Aucune offre trouvée pour votre recherche.</p>';
        return;
    }
    
    jobsToShow.forEach(job => {
        const jobCard = document.createElement('div');
        jobCard.className = 'job-card';
        jobCard.innerHTML = `
            <h2 class="job-title">${job.title}</h2>
            <p class="job-company">${job.company}</p>
            <p class="job-description">${job.description}</p>
            <button class="learn-more" data-job-id="${job.id}">En savoir plus</button>
        `;
        jobsGrid.appendChild(jobCard);
    });
}

// Fonction pour filtrer les offres selon le terme de recherche
function filterJobs(searchTerm) {
    if (!searchTerm) return jobs;
    
    return jobs.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        job.company.toLowerCase().includes(searchTerm.toLowerCase())
    );
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', async function() {
    // Afficher un message de chargement
    const jobsGrid = document.querySelector('.jobs-grid');
    jobsGrid.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">Chargement des offres...</p>';
    
    // Récupérer les offres depuis la base de données
    await fetchJobs();
    
    // Récupérer le terme de recherche depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('search');
    
    // Filtrer les offres si un terme de recherche est présent
    const filteredJobs = filterJobs(searchTerm);
    
    // Générer les cartes d'offres filtrées
    generateJobCards(filteredJobs);
    
    // Event listeners pour les boutons "En savoir plus"
    document.querySelector('.jobs-grid').addEventListener('click', function(e) {
        if (e.target.classList.contains('learn-more')) {
            const jobId = parseInt(e.target.getAttribute('data-job-id'));
            showJobDetails(jobId);
        }
    });
    
    // Event listener pour le bouton retour
    document.getElementById('back-btn').addEventListener('click', showJobsList);
    
    // Event listener pour le bouton Postuler
    document.getElementById('apply-btn').addEventListener('click', async function() {
        const jobTitle = document.getElementById('detail-title').textContent;
        document.getElementById('form-job-title').textContent = jobTitle;
        
        // Récupérer les informations du profil connecté
        await loadUserProfile();
        
        document.getElementById('job-details').classList.add('hidden');
        document.getElementById('application-form').classList.remove('hidden');
    });
    
    // Event listener pour retour aux détails depuis le formulaire
    document.getElementById('back-to-details').addEventListener('click', function() {
        document.getElementById('application-form').classList.add('hidden');
        document.getElementById('job-details').classList.remove('hidden');
    });
    
    // Event listener pour le formulaire de candidature
    document.getElementById('candidature-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!currentUser) {
            alert('Erreur: informations utilisateur non disponibles');
            return;
        }
        
        const formData = new FormData(this);
        const jobTitle = document.getElementById('detail-title').textContent;
        const jobId = jobs.find(j => j.title === jobTitle)?.id;
        
        const applicationData = {
            offer_id: jobId,
            user_id: currentUser.user_id,
            applicant_name: currentUser.full_name,
            applicant_email: currentUser.email,
            resume: currentUser.resume || 'CV disponible dans le profil utilisateur',
            message: formData.get('message') || 'Candidature via le site Jobly',
            status: 'pending'
        };
        
        try {
            const response = await fetch('http://localhost:3000/Application', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(applicationData)
            });
            
            if (response.ok) {
                alert('Candidature envoyée avec succès!');
                document.getElementById('application-form').classList.add('hidden');
                document.getElementById('job-details').classList.remove('hidden');
                this.reset();
            } else {
                alert('Erreur lors de l\'envoi de la candidature');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de l\'envoi de la candidature');
        }
    });
    
    console.log('Jobly loaded successfully!');
});