const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();
const setupSwagger = require('./swagger');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const fs = require('fs');

const app = express();

// Middleware
app.use(cookieParser());
app.use(express.json());

const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

const PORT = process.env.PORT || 3000;

// Serve uploaded files and static files
app.use('/uploads', express.static('uploads'));
app.use(express.static('.'));

// MySQL Connection
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

// Database setup
setTimeout(() => {
  connection.query('SHOW COLUMNS FROM User LIKE "company_id"', (err, result) => {
    if (err) {
      console.error('Erreur vérification colonne company_id:', err);
      return;
    }
    
    if (result.length === 0) {
      connection.query('ALTER TABLE User ADD COLUMN company_id INT', (err) => {
        if (err) {
          console.error('Erreur ajout colonne company_id:', err);
        } else {
          console.log('✅ Colonne company_id ajoutée à la table User');
        }
      });
    }
  });
  
  connection.query('SHOW COLUMNS FROM Application LIKE "created_at"', (err, result) => {
    if (err) {
      console.error('Erreur vérification colonne created_at:', err);
      return;
    }
    
    if (result.length === 0) {
      connection.query('ALTER TABLE Application ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP', (err) => {
        if (err) {
          console.error('Erreur ajout colonne created_at:', err);
        } else {
          console.log('✅ Colonne created_at ajoutée à la table Application');
        }
      });
    }
  });
}, 2000);

// Setup Swagger
setupSwagger(app);

// Import route modules
const userRoutes = require('./routes/userRoutes')(connection);
const companyRoutes = require('./routes/companyRoutes')(connection);
const offerRoutes = require('./routes/offerRoutes')(connection);
const applicationRoutes = require('./routes/applicationRoutes')(connection);
const skillRoutes = require('./routes/skillRoutes')(connection);
const categoryRoutes = require('./routes/categoryRoutes')(connection);
const userSkillRoutes = require('./routes/userSkillRoutes')(connection);
const soughtSkillRoutes = require('./routes/soughtSkillRoutes')(connection);
const adminRoutes = require('./routes/adminRoutes')(connection);

// Use routes
app.use('/User', userRoutes);
app.use('/Company', companyRoutes);
app.use('/Offer', offerRoutes);
app.use('/Application', applicationRoutes);
app.use('/Skills', skillRoutes);
app.use('/Job_Category', categoryRoutes);
app.use('/User_Skills', userSkillRoutes);
app.use('/Sought_Skills', soughtSkillRoutes);
app.use('/Admin', adminRoutes);

app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
});