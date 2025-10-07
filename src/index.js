const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

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

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
