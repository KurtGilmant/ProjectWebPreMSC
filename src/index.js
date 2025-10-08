const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();
const setupSwagger = require('./swagger');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // important pour le POST

// Connexion MySQL
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

function connectWithRetry() {
  connection.connect(err => {
    if (err) {
      console.error('⛔️ Erreur de connexion, nouvel essai dans 5s...', err);
      setTimeout(connectWithRetry, 5000);
    } else {
      console.log("✅ Connecté à MySQL");
    }
  });
}

connectWithRetry();


// Setup API

// ✅ Ajout de Swagger
setupSwagger(app);

/**
 * @swagger
 * /User:
 *   get:
 *     summary: GET all infos of all users
 *     responses:
 *       200:
 *         description: Return all infos of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   user_id:
 *                     type: integer
 *                   email:
 *                     type: string
 *                   password:
 *                     type: string
 *                   full_name:
 *                     type: string
 *                   role:
 *                     type: string
 *                   created_at:
 *                     type: string
 */

// Endpoint GET /User
app.get('/User', (req, res) => {
  connection.query('SELECT * FROM User', (err, results) => {
    if (err) {
      console.error('Erreur requête SQL:', err);
      return res.status(500).json({ error: 'Erreur base de données' });
    }
    res.json(results);
  });
});


/**
 * @swagger
 * /User/{id}:
 *   get:
 *     summary: Récupérer un utilisateur par ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Utilisateur trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: integer
 *                 email:
 *                   type: string
 *                 password:
 *                   type: string
 *                 full_name:
 *                   type: string
 *                 role:
 *                   type: string
 *                 created_at:
 *                   type: string
 */

// Get user by ID
app.get('/User/:user_id', (req, res) => {
  const userId = req.params.user_id;
  connection.query('SELECT * FROM User WHERE user_id = ?', userId, (err, rows) => {
    if (err) throw err;
    res.json(rows[0]);
  });
});


/**
 * @swagger
 * /User:
 *   post:
 *     summary: Créer un nouvel utilisateur
 *     tags:
 *       - Utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - full_name
 *               - role
 *               - resume
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: mySecret123
 *               full_name:
 *                 type: string
 *                 example: John Doe
 *               role:
 *                 type: string
 *                 example: employeur
 *               resume:
 *                 type: string
 *                 example: I am a software developer...
 *     responses:
 *       200:
 *         description: Utilisateur ajouté avec succès
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: User added successfully
 *       400:
 *         description: Données invalides
 *       500:
 *         description: Erreur serveur
 */

// Create a new user
app.post('/User', (req, res) => {
    const {email, password, full_name, role, resume} = req.body;
    connection.query('INSERT INTO User (email, password, full_name, role, resume) VALUES (?, ?, ?, ?, ?)', [email, password, full_name, role, resume], (err, result) => {
      if (err) throw err;
      res.send('User added successfully');
    });
  });





// Lancement du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
