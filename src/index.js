const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();
const setupSwagger = require('./swagger');
const cors = require('cors');

const app = express();
app.use(cors());
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
 *     tags:
 *       - User
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
 *     summary: GET all infos of one user by is id
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User found and return all infos
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
 *     summary: Create new user
 *     tags:
 *       - User
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
 *         description: User post with success
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: User added successfully
 *       400:
 *         description: invalid data
 */

// Create a new user
app.post('/User', (req, res) => {
    const {email, password, full_name, role, resume} = req.body;
    connection.query('INSERT INTO User (email, password, full_name, role, resume) VALUES (?, ?, ?, ?, ?)', [email, password, full_name, role, resume], (err, result) => {
      if (err) throw err;
      res.send('User added successfully');
    });
  });


/**
 * @swagger
 * /User/{user_id}:
 *   put:
 *     summary: Change User info by his id
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User's id 
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
 *                 example: updated@example.com
 *               password:
 *                 type: string
 *                 example: newSecret123
 *               full_name:
 *                 type: string
 *                 example: Jane Doe
 *               role:
 *                 type: string
 *                 example: admin
 *               resume:
 *                 type: string
 *                 example: Experienced backend developer
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: User updated successfully
 *       400:
 *         description: invalid data
 *       404:
 *         description: user not found
 */

 // Update user by ID
app.put('/User/:user_id', (req, res) => {
  const user_id = req.params.user_id;
  const {email, password, full_name, role, resume} = req.body;
  connection.query('UPDATE User SET email = ?, password=?, full_name=?, role=?, resume=? WHERE user_id = ?', [email, password, full_name, role, resume,user_id], (err, result) => {
    if (err) throw err;
    res.send('User updated successfully');
  });
});


/**
 * @swagger
 * /User/{user_id}:
 *   delete:
 *     summary: Supprimer un utilisateur par son ID
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User's id
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: User deleted successfully
 *       404:
 *         description: user not found
 */

// Delete user by ID
app.delete('/User/:user_id', (req, res) => {
  const user_id = req.params.user_id;
  connection.query('DELETE FROM User WHERE user_id = ?', user_id, (err, result) => {
    if (err) throw err;
    res.send('User deleted successfully');
  });
});


// --- Job_Category CRUD ---
app.get('/Job_Category', (req, res) => {
  connection.query('SELECT * FROM Job_Category', (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.json(results);
  });
});
app.post('/Job_Category', (req, res) => {
  const { name } = req.body;
  connection.query('INSERT INTO Job_Category (name) VALUES (?)', [name], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.send('Category added');
  });
});
app.get('/Job_Category/:id', (req, res) => {
  connection.query('SELECT * FROM Job_Category WHERE job_category_id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.json(results[0]);
  });
});
app.put('/Job_Category/:id', (req, res) => {
  connection.query('UPDATE Job_Category SET name = ? WHERE job_category_id = ?', [req.body.name, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.send('Category updated');
  });
});
app.delete('/Job_Category/:id', (req, res) => {
  connection.query('DELETE FROM Job_Category WHERE job_category_id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.send('Category deleted');
  });
});

// --- Skills CRUD ---
app.get('/Skills', (req, res) => {
  connection.query('SELECT * FROM Skills', (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.json(results);
  });
});
app.post('/Skills', (req, res) => {
  const { name } = req.body;
  connection.query('INSERT INTO Skills (name) VALUES (?)', [name], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.send('Skill added');
  });
});
app.get('/Skills/:id', (req, res) => {
  connection.query('SELECT * FROM Skills WHERE skill_id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.json(results[0]);
  });
});
app.put('/Skills/:id', (req, res) => {
  connection.query('UPDATE Skills SET name = ? WHERE skill_id = ?', [req.body.name, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.send('Skill updated');
  });
});
app.delete('/Skills/:id', (req, res) => {
  connection.query('DELETE FROM Skills WHERE skill_id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.send('Skill deleted');
  });
});

// --- Company CRUD ---
app.get('/Company', (req, res) => {
  connection.query('SELECT * FROM Company', (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.json(results);
  });
});
app.post('/Company', (req, res) => {
  const { name, website, location, description } = req.body;
  connection.query('INSERT INTO Company (name, website, location, description) VALUES (?, ?, ?, ?)', [name, website, location, description], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.send('Company added');
  });
});
app.get('/Company/:id', (req, res) => {
  connection.query('SELECT * FROM Company WHERE company_id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.json(results[0]);
  });
});
app.put('/Company/:id', (req, res) => {
  const { name, website, location, description } = req.body;
  connection.query('UPDATE Company SET name = ?, website = ?, location = ?, description = ? WHERE company_id = ?', [name, website, location, description, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.send('Company updated');
  });
});
app.delete('/Company/:id', (req, res) => {
  connection.query('DELETE FROM Company WHERE company_id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.send('Company deleted');
  });
});

// --- Offer CRUD ---
app.get('/Offer', (req, res) => {
  connection.query('SELECT * FROM Offer', (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.json(results);
  });
});
app.post('/Offer', (req, res) => {
  const { title, description, company_id, location, contract_type, salary, category_id, status, rythm, remote, language } = req.body;
  connection.query(
    'INSERT INTO Offer (title, description, company_id, location, contract_type, salary, category_id, status, rythm, remote, language) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [title, description, company_id, location, contract_type, salary, category_id, status, rythm, remote, language],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Erreur base de données' });
      res.send('Offer added');
    }
  );
});
app.get('/Offer/:id', (req, res) => {
  connection.query('SELECT * FROM Offer WHERE offer_id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.json(results[0]);
  });
});
app.put('/Offer/:id', (req, res) => {
  const { title, description, company_id, location, contract_type, salary, category_id, status, rythm, remote, language } = req.body;
  connection.query('UPDATE Offer SET title = ?, description = ?, company_id = ?, location = ?, contract_type = ?, salary = ?, category_id = ?, status = ?, rythm = ?, remote = ?, language = ? WHERE offer_id = ?', [title, description, company_id, location, contract_type, salary, category_id, status, rythm, remote, language, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.send('Offer updated');
  });
});
app.delete('/Offer/:id', (req, res) => {
  connection.query('DELETE FROM Offer WHERE offer_id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.send('Offer deleted');
  });
});

// --- Application CRUD ---
app.get('/Application', (req, res) => {
  connection.query('SELECT * FROM Application', (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.json(results);
  });
});
app.post('/Application', (req, res) => {
  const { offer_id, user_id, applicant_name, applicant_email, resume, message, status } = req.body;
  connection.query('INSERT INTO Application (offer_id, user_id, applicant_name, applicant_email, resume, message, status) VALUES (?, ?, ?, ?, ?, ?, ?)', [offer_id, user_id, applicant_name, applicant_email, resume, message, status], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.send('Application added');
  });
});
app.get('/Application/:id', (req, res) => {
  connection.query('SELECT * FROM Application WHERE application_id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.json(results[0]);
  });
});
app.put('/Application/:id', (req, res) => {
  const { offer_id, user_id, applicant_name, applicant_email, resume, message, status } = req.body;
  connection.query('UPDATE Application SET offer_id = ?, user_id = ?, applicant_name = ?, applicant_email = ?, resume = ?, message = ?, status = ? WHERE application_id = ?', [offer_id, user_id, applicant_name, applicant_email, resume, message, status, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.send('Application updated');
  });
});
app.delete('/Application/:id', (req, res) => {
  connection.query('DELETE FROM Application WHERE application_id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.send('Application deleted');
  });
});

// --- User_Skills CRUD ---
app.get('/User_Skills', (req, res) => {
  connection.query('SELECT * FROM User_Skills', (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.json(results);
  });
});
app.post('/User_Skills', (req, res) => {
  const { user_id, skill_id } = req.body;
  connection.query('INSERT INTO User_Skills (user_id, skill_id) VALUES (?, ?)', [user_id, skill_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.send('User skill added');
  });
});
app.get('/User_Skills/:id', (req, res) => {
  connection.query('SELECT * FROM User_Skills WHERE user_skill_id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.json(results[0]);
  });
});
app.put('/User_Skills/:id', (req, res) => {
  const { user_id, skill_id } = req.body;
  connection.query('UPDATE User_Skills SET user_id = ?, skill_id = ? WHERE user_skill_id = ?', [user_id, skill_id, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.send('User skill updated');
  });
});
app.delete('/User_Skills/:id', (req, res) => {
  connection.query('DELETE FROM User_Skills WHERE user_skill_id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.send('User skill deleted');
  });
});

// --- Sought_Skills CRUD ---
app.get('/Sought_Skills', (req, res) => {
  connection.query('SELECT * FROM Sought_Skills', (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.json(results);
  });
});
app.post('/Sought_Skills', (req, res) => {
  const { offer_id, skill_id } = req.body;
  connection.query('INSERT INTO Sought_Skills (offer_id, skill_id) VALUES (?, ?)', [offer_id, skill_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.send('Sought skill added');
  });
});

app.get('/Sought_Skills/:id', (req, res) => {
  connection.query('SELECT * FROM Sought_Skills WHERE sought_skill_id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.json(results[0]);
  });
});
app.put('/Sought_Skills/:id', (req, res) => {
  const { offer_id, skill_id } = req.body;
  connection.query('UPDATE Sought_Skills SET offer_id = ?, skill_id = ? WHERE sought_skill_id = ?', [offer_id, skill_id, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.send('Sought skill updated');
  });
});
app.delete('/Sought_Skills/:id', (req, res) => {
  connection.query('DELETE FROM Sought_Skills WHERE sought_skill_id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.send('Sought skill deleted');
  });
});



app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
});
