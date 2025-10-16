// Gestion de l'authentification
const API_BASE_URL = 'http://localhost:3000';

// Fonction pour effectuer une requête à l'API
async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        return await response.json();
    } catch (error) {
        console.error('Erreur API:', error);
        throw error;
    }
}

// Fonction de connexion
async function login(email, password) {
    try {
        // 1. Récupérer tous les utilisateurs et trouver par email
        const usersResponse = await apiRequest('/User');
        const userResponse = usersResponse.find(user => user.email === email);
        
        if (!userResponse) {
            throw new Error('Utilisateur non trouvé');
        }

        // 2. Vérifier le mot de passe
        const loginResponse = await apiRequest('/User/login', {
            method: 'POST',
            body: JSON.stringify({
                password: password,
                hashedPassword: userResponse.password,
                name: userResponse.full_name
            })
        });

        if (loginResponse.success) {
            // Stocker les infos utilisateur
            localStorage.setItem('user', JSON.stringify({
                id: userResponse.user_id,
                email: userResponse.email,
                name: userResponse.full_name,
                role: userResponse.role
            }));
            localStorage.setItem('accessToken', loginResponse.accessToken);
            return { success: true, user: userResponse };
        } else {
            throw new Error(loginResponse.message || 'Erreur de connexion');
        }
    } catch (error) {
        console.error('Erreur login:', error);
        return { success: false, error: error.message };
    }
}

// Fonction d'inscription
async function register(userData) {
    try {
        const response = await apiRequest('/User', {
            method: 'POST',
            body: JSON.stringify(userData)
        });

        if (response.success) {
            return { success: true, message: 'Inscription réussie' };
        } else {
            throw new Error(response.error || 'Erreur d\'inscription');
        }
    } catch (error) {
        console.error('Erreur inscription:', error);
        return { success: false, error: error.message };
    }
}

// Vérifier si l'utilisateur est connecté
function isLoggedIn() {
    return localStorage.getItem('user') !== null;
}

// Récupérer les infos utilisateur
function getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Déconnexion
function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    window.location.href = '../index.html';
}