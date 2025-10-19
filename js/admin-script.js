let jobs = [];
let companies = [];
let companyRequests = [];
let companyAccounts = [];
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
                <button class="learn-more" onclick="editJob(${job.offer_id}); console.log('Button clicked for job:', ${job.offer_id});">Modifier</button>
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
    console.log('editJob called with id:', id);
    const job = jobs.find(job => job.offer_id === id);
    console.log('Found job:', job);
    
    if (job) {
        editingId = id;
        const formTitle = document.getElementById('form-title');
        const jobTitle = document.querySelector('input[name="title"]');
        const jobCompany = document.querySelector('input[name="company"]');
        const jobDescription = document.querySelector('textarea[name="description"]');
        const jobLocation = document.querySelector('input[name="location"]');
        const jobSalary = document.querySelector('input[name="salary"]');
        const submitBtn = document.querySelector('.submit-btn');
        const cancelBtn = document.getElementById('cancel-btn');
        
        console.log('Form elements found:', {
            formTitle: !!formTitle,
            jobTitle: !!jobTitle,
            jobCompany: !!jobCompany,
            jobDescription: !!jobDescription,
            jobLocation: !!jobLocation,
            jobSalary: !!jobSalary,
            submitBtn: !!submitBtn,
            cancelBtn: !!cancelBtn
        });
        
        if (formTitle) formTitle.textContent = 'Modifier l\'offre';
        if (jobTitle) jobTitle.value = job.title;
        if (jobCompany) jobCompany.value = job.company_name || '';
        if (jobDescription) jobDescription.value = job.description;
        if (jobLocation) jobLocation.value = job.location;
        if (jobSalary) jobSalary.value = job.salary;
        if (submitBtn) submitBtn.textContent = 'Modifier l\'offre';
        if (cancelBtn) cancelBtn.style.display = 'inline-block';
        
        // Scroll to form
        const jobForm = document.getElementById('job-form');
        if (jobForm) {
            jobForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    } else {
        console.log('Job not found for id:', id);
    }
}

// Annuler l'édition
function cancelEdit() {
    editingId = null;
    const formTitle = document.getElementById('form-title');
    const jobForm = document.getElementById('job-form');
    const submitBtn = document.querySelector('.submit-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    
    if (formTitle) formTitle.textContent = 'Ajouter une offre';
    if (jobForm) jobForm.reset();
    if (submitBtn) submitBtn.textContent = 'Ajouter l\'offre';
    if (cancelBtn) cancelBtn.style.display = 'none';
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

// Charger les comptes entreprises
async function loadCompanyAccounts() {
    try {
        const response = await fetch('http://localhost:3000/Admin/companies');
        companyAccounts = await response.json();
        displayCompanyAccounts();
    } catch (error) {
        console.error('Erreur lors du chargement des comptes entreprises:', error);
    }
}

// Afficher les comptes entreprises
function displayCompanyAccounts() {
    const companiesList = document.getElementById('companies-list');
    companiesList.innerHTML = '';
    
    if (companyAccounts.length === 0) {
        companiesList.innerHTML = '<p style="color: #666;">Aucun compte entreprise</p>';
        return;
    }
    
    companyAccounts.forEach(account => {
        const accountElement = document.createElement('div');
        accountElement.className = 'company-admin-item';
        accountElement.innerHTML = `
            <div class="company-info">
                <h3>${account.company_name || 'Entreprise sans nom'}</h3>
                <p><strong>Contact:</strong> ${account.full_name} (${account.email})</p>
                <p><strong>Localisation:</strong> ${account.location || 'Non renseignée'}</p>
                <p><strong>Site web:</strong> ${account.website || 'Non renseigné'}</p>
                <p><small>Description: ${account.description || 'Aucune description'}</small></p>
            </div>
            <div class="company-actions">
                <button onclick="openEditModal(${account.user_id})" class="btn-edit">Modifier</button>
                <button onclick="deleteCompanyAccount(${account.user_id})" class="btn-delete">Supprimer</button>
            </div>
        `;
        companiesList.appendChild(accountElement);
    });
}

// Ouvrir la modal d'édition
function openEditModal(userId) {
    const account = companyAccounts.find(acc => acc.user_id === userId);
    if (!account) return;
    
    document.getElementById('editUserId').value = userId;
    document.getElementById('editCompanyName').value = account.company_name || '';
    document.getElementById('editEmail').value = account.email;
    document.getElementById('editWebsite').value = account.website || '';
    document.getElementById('editLocation').value = account.location || '';
    document.getElementById('editDescription').value = account.description || '';
    document.getElementById('editPassword').value = '';
    
    document.getElementById('editCompanyModal').style.display = 'block';
}

// Fermer la modal d'édition
function closeEditModal() {
    document.getElementById('editCompanyModal').style.display = 'none';
}

// Supprimer un compte entreprise
async function deleteCompanyAccount(userId) {
    if (confirm('Supprimer ce compte entreprise ? Cette action est irréversible.')) {
        try {
            const response = await fetch(`http://localhost:3000/User/${userId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                showNotification('Compte entreprise supprimé!', 'success');
                await loadCompanyAccounts();
            } else {
                showNotification('Erreur lors de la suppression', 'error');
            }
        } catch (error) {
            console.error('Erreur:', error);
            showNotification('Erreur lors de la suppression', 'error');
        }
    }
}

// Fonction pour afficher des notifications
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        background: ${type === 'success' ? '#28a745' : '#dc3545'};
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialisation
document.addEventListener('DOMContentLoaded', async function() {
    await loadCompanies();
    await loadCompanyRequests();
    await loadCompanyAccounts();
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
    
    // Gestion du formulaire d'édition des comptes entreprise
    const editForm = document.getElementById('editCompanyForm');
    if (editForm) {
        editForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const userId = document.getElementById('editUserId').value;
            const name = document.getElementById('editCompanyName').value;
            const email = document.getElementById('editEmail').value;
            const password = document.getElementById('editPassword').value;
            const website = document.getElementById('editWebsite').value;
            const location = document.getElementById('editLocation').value;
            const description = document.getElementById('editDescription').value;
            
            const updateData = { email };
            if (password && password.trim() !== '') {
                updateData.password = password;
            }
            
            try {
                // Mettre à jour l'utilisateur
                const userResponse = await fetch(`http://localhost:3000/User/${userId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updateData)
                });
                
                if (userResponse.ok) {
                    // Mettre à jour l'entreprise
                    const companyResponse = await fetch(`http://localhost:3000/Company/user/${userId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name, website, location, description })
                    });
                    
                    if (companyResponse.ok) {
                        closeEditModal();
                        await loadCompanyAccounts();
                        showNotification('Compte entreprise modifié avec succès!', 'success');
                    } else {
                        throw new Error('Erreur lors de la mise à jour de l\'entreprise');
                    }
                } else {
                    throw new Error('Erreur lors de la mise à jour de l\'utilisateur');
                }
            } catch (error) {
                console.error('Erreur:', error);
                showNotification('Erreur lors de la modification du compte entreprise', 'error');
            }
        });
    }
    
    // Fermer la modal en cliquant à l'extérieur
    window.onclick = function(event) {
        const modal = document.getElementById('editCompanyModal');
        if (event.target === modal) {
            closeEditModal();
        }
    };
});