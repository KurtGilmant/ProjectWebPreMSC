let jobs = [];
let companies = [];
let companyRequests = [];
let editingId = null;

// Charger les entreprises depuis l'API
async function loadCompanies() {
    try {
        const response = await fetch('http://localhost:3000/Company');
        companies = await response.json();
    } catch (error) {
        console.error('Erreur lors du chargement des entreprises:', error);
    }
}

// Charger les offres depuis l'API
async function loadJobs() {
    try {
        const response = await fetch('http://localhost:3000/Offer/with-companies');
        jobs = await response.json();
        displayJobs();
    } catch (error) {
        console.error('Erreur lors du chargement des offres:', error);
    }
}

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
                <p><strong>${job.company_name || 'Entreprise inconnue'}</strong> - ${job.location}</p>
                <p>${job.description}</p>
                <p><strong>Salaire:</strong> ${job.salary}€</p>
            </div>
            <div class="admin-job-actions">
                <button class="learn-more" onclick="editJob(${job.offer_id})">Modifier</button>
                <button class="back-btn" onclick="deleteJob(${job.offer_id})">Supprimer</button>
            </div>
        `;
        jobsList.appendChild(jobElement);
    });
}

// Ajouter une nouvelle offre
async function addJob(jobData) {
    try {
        const response = await fetch('http://localhost:3000/Offer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jobData)
        });
        
        if (response.ok) {
            await loadJobs();
        } else {
            alert('Erreur lors de l\'ajout de l\'offre');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de l\'ajout de l\'offre');
    }
}

// Modifier une offre existante
async function updateJob(id, jobData) {
    try {
        const response = await fetch(`http://localhost:3000/Offer/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jobData)
        });
        
        if (response.ok) {
            await loadJobs();
        } else {
            alert('Erreur lors de la modification de l\'offre');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la modification de l\'offre');
    }
}

// Supprimer une offre
async function deleteJob(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
        try {
            const response = await fetch(`http://localhost:3000/Offer/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                await loadJobs();
            } else {
                alert('Erreur lors de la suppression de l\'offre');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la suppression de l\'offre');
        }
    }
}

// Préparer l'édition d'une offre
function editJob(id) {
    const job = jobs.find(job => job.offer_id === id);
    if (job) {
        editingId = id;
        document.getElementById('form-title').textContent = 'Modifier l\'offre';
        document.getElementById('job-id').value = job.offer_id;
        document.getElementById('job-title').value = job.title;
        document.getElementById('job-company').value = job.company_name || '';
        document.getElementById('job-description').value = job.description;
        document.getElementById('job-requirements').value = job.requirements || '';
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

// Charger les demandes d'inscription
async function loadCompanyRequests() {
    try {
        const response = await fetch('http://localhost:3000/Company/requests');
        companyRequests = await response.json();
        displayCompanyRequests();
    } catch (error) {
        console.error('Erreur lors du chargement des demandes:', error);
    }
}

// Afficher les demandes d'inscription
function displayCompanyRequests() {
    const requestsList = document.getElementById('company-requests');
    requestsList.innerHTML = '';
    
    const pendingRequests = companyRequests.filter(req => req.status === 'pending');
    
    if (pendingRequests.length === 0) {
        requestsList.innerHTML = '<p style="color: #666;">Aucune demande en attente</p>';
        return;
    }
    
    pendingRequests.forEach(request => {
        const requestElement = document.createElement('div');
        requestElement.className = 'admin-job-item';
        requestElement.innerHTML = `
            <div class="admin-job-info">
                <h3>${request.company_name}</h3>
                <p><strong>Contact:</strong> ${request.contact_name} (${request.email})</p>
                <p><strong>Description:</strong> ${request.description}</p>
                <p><small>Demande du ${new Date(request.created_at).toLocaleDateString()}</small></p>
            </div>
            <div class="admin-job-actions">
                <button class="learn-more" onclick="approveRequest(${request.request_id})">Approuver</button>
                <button class="back-btn" onclick="rejectRequest(${request.request_id})">Rejeter</button>
            </div>
        `;
        requestsList.appendChild(requestElement);
    });
}

// Approuver une demande
async function approveRequest(requestId) {
    if (confirm('Approuver cette demande d\'inscription ?')) {
        try {
            const response = await fetch(`http://localhost:3000/Company/requests/${requestId}/approve`, {
                method: 'PUT'
            });
            
            if (response.ok) {
                alert('Demande approuvée et compte créé !');
                await loadCompanyRequests();
                await loadCompanies();
            } else {
                alert('Erreur lors de l\'approbation');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de l\'approbation');
        }
    }
}

// Rejeter une demande
async function rejectRequest(requestId) {
    if (confirm('Rejeter cette demande d\'inscription ?')) {
        try {
            const response = await fetch(`http://localhost:3000/Company/requests/${requestId}/reject`, {
                method: 'PUT'
            });
            
            if (response.ok) {
                alert('Demande rejetée');
                await loadCompanyRequests();
            } else {
                alert('Erreur lors du rejet');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors du rejet');
        }
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', async function() {
    await loadCompanies();
    await loadCompanyRequests();
    await loadJobs();
    
    // Gestion du formulaire
    document.getElementById('job-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const companyName = formData.get('company');
        
        // Trouver ou créer l'entreprise
        let company = companies.find(c => c.name.toLowerCase() === companyName.toLowerCase());
        let companyId;
        
        if (!company) {
            // Créer une nouvelle entreprise
            try {
                const response = await fetch('http://localhost:3000/Company', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: companyName,
                        website: '',
                        location: formData.get('location'),
                        description: `Entreprise ${companyName}`
                    })
                });
                
                if (response.ok) {
                    await loadCompanies();
                    company = companies.find(c => c.name.toLowerCase() === companyName.toLowerCase());
                    companyId = company.company_id;
                } else {
                    alert('Erreur lors de la création de l\'entreprise');
                    return;
                }
            } catch (error) {
                console.error('Erreur:', error);
                alert('Erreur lors de la création de l\'entreprise');
                return;
            }
        } else {
            companyId = company.company_id;
        }
        
        const jobData = {
            title: formData.get('title'),
            description: formData.get('description'),
            company_id: companyId,
            location: formData.get('location'),
            contract_type: 'CDI',
            salary: parseInt(formData.get('salary')) || 0,
            category_id: 1,
            status: 'open',
            rythm: 'full-time',
            remote: false,
            language: 'French'
        };
        
        if (editingId) {
            await updateJob(editingId, jobData);
            cancelEdit();
        } else {
            await addJob(jobData);
            this.reset();
        }
    });
    
    // Bouton annuler
    document.getElementById('cancel-btn').addEventListener('click', cancelEdit);
});