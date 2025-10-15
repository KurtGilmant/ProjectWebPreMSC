const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();
const setupSwagger = require('./swagger');
const cors = require('cors');

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");
const verifyJWT = require('../middleware/verifyJWT.js');
const cookieParser = require("cookie-parser");

const app = express();

// middleware for cookies
app.use(cookieParser());

const allowedOrigins = [
  "http://127.0.0.1:5500",
  "http://localhost:3000",
  "http://localhost:5500",
  // Add more origins as needed
];

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


// --- User CRUD ---
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
app.get('/User', verifyJWT, (req, res) => {
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
app.get('/User/:user_id', (req, res) => {
  const userId = req.params.user_id;
  connection.query('SELECT * FROM User WHERE user_id = ?', userId, (err, rows) => {
    if (err) throw err;
    res.json(rows[0]);
  });
});
/**
 * @swagger
 * /User/find-user/{full_name}:
 *   get:
 *     summary: Get user info by full name
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: full_name
 *         required: true
 *         schema:
 *           type: string
 *         description: Full name of the user to retrieve
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
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User not found
 */
app.get('/User/find-user/:full_name', (req, res) => {
  const userName = req.params.full_name;
  connection.query('SELECT * FROM User WHERE full_name = ?', userName, (err, rows) => {
    if (err) {
      console.error('Erreur requête SQL:', err);
      return res.status(404).json({ error: 'Erreur base de données' });
    }
    res.json(rows[0]);
  });
});
/**
 * @swagger
 * /User/check-exists/{full_name}:
 *   get:
 *     summary: Check if a user exists by full name
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: full_name
 *         required: true
 *         schema:
 *           type: string
 *         description: Full name of the user to check
 *     responses:
 *       200:
 *         description: Returns whether the user exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exists:
 *                   type: boolean
 *                   example: true
 *       500:
 *         description: Database error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Erreur base de données
 */
app.get('/User/check-exists/:full_name', (req, res) => {
  const full_name = req.params.full_name;
  connection.query('SELECT COUNT(*) AS count FROM User WHERE full_name = ?', [full_name], (err, results) => {
    if (err) {
      console.error('Erreur requête SQL:', err);
      return res.status(500).json({ error: 'Erreur base de données' });
    }
    res.json({ exists: results[0].count > 0 });
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
app.post('/User', async (req, res) => {
    const {email, password, full_name, role, resume} = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      connection.query(
        'INSERT INTO User (email, password, full_name, role, resume) VALUES (?, ?, ?, ?, ?)',
        [email, hashedPassword, full_name, role, resume],
        (err, result) => {
          if (err) {
            console.error('Erreur SQL:', err);
            return res.status(500).json({ success: false, error: err.message });
          }
          console.log('User created:', result);
          res.json({ success: true, message: 'User added successfully', userId: result.insertId });
        }
      );
    } catch (err) {
      console.error('Erreur bcrypt:', err);
      res.status(500).json({ success: false, error: 'Error hashing password' });
    }
  });
/**
 * @swagger
 * /User/login:
 *   post:
 *     summary: Login user with password
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - hashedPassword
 *             properties:
 *               password:
 *                 type: string
 *                 example: mySecret123
 *               hashedPassword:
 *                 type: string
 *                 example: $2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36rQe4gkQ6QJ8QJ8QJ8QJ8Q
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login successful
 *       401:
 *         description: Invalid password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Invalid password
 *       500:
 *         description: Error hashing password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Error hashing password
 */
app.post('/User/login', async (req, res) => {
    const {password,hashedPassword,name} = req.body;
    console.log('name from request:', name); // Debug line
    try {
      const testPassword = await bcrypt.compare(password, hashedPassword);
      if (testPassword) {
        const accessToken = jwt.sign(
          { name: name },
          process.env.ACCESS_TOKEN_SECRET,
          {expiresIn: '30s'}
        );
        console.log('Token payload:', { name: name }); // Debug line
        const refreshToken = jwt.sign(
          { name: name },
          process.env.REFRESH_TOKEN_SECRET,
          {expiresIn: '1d'}
        );

        res.cookie("jwt", refreshToken, {
          httpOnly: true, 
          maxAge: 24*60*60*1000,
          sameSite: "lax", // or "lax" for local, but "none" is needed for cross-origin
          secure: false     // set to true only if using HTTPS
          });
        res.json({accessToken, success: true, message: 'Login successful' });
      } else {
        res.status(401).json({ success: false, message: 'Invalid password' });
      }
    }catch (err) {
      console.error('Erreur bcrypt:', err);
      res.status(500).json({ success: false, error: 'Error hashing password' });
    }
  });

app.post('/User/refresh', (req, res) => {
  const refreshToken = req.cookies?.jwt;
  if (!refreshToken) return res.sendStatus(401);

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);
    const accessToken = jwt.sign(
      { name: decoded.name },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '30s' }
    );
    console.log('Token payload refresh:', { name: decoded.name }); // Debug line
    res.json({ accessToken });
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
app.delete('/User/:user_id', (req, res) => {
  const user_id = req.params.user_id;
  connection.query('DELETE FROM User WHERE user_id = ?', user_id, (err, result) => {
    if (err) throw err;
    res.send('User deleted successfully');
  });
});


// --- Job_Category CRUD ---
/**
 * @swagger
 * /Job_Category:
 *   get:
 *     summary: GET all infos of all job category
 *     tags:
 *       - Job_Category
 *     responses:
 *       200:
 *         description: Return job category
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   job_category_id:
 *                     type: integer
 *                   name:
 *                     type: string
 */
app.get('/Job_Category', (req, res) => {
  connection.query('SELECT * FROM Job_Category', (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.json(results);
  });
});
/**
 * @swagger
 * /Job_Category:
 *   post:
 *     summary: Create new job category
 *     tags:
 *       - Job_Category
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 example: jongling
 *     responses:
 *       200:
 *         description: Job category added successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Job category added successfully
 *       400:
 *         description: invalid data
 */
app.post('/Job_Category', (req, res) => {
  const { name } = req.body;
  connection.query('INSERT INTO Job_Category (name) VALUES (?)', [name], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.send('Category added');
  });
});
/**
 * @swagger
 * /Job_Category/{id}:
 *   get:
 *     summary: GET all infos of one job category by is id
 *     tags:
 *       - Job_Category
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Job category found and return all infos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 job_category_id:
 *                   type: integer
 *                 name:
 *                   type: string
 */
app.get('/Job_Category/:job_category_id', (req, res) => {
  connection.query('SELECT * FROM Job_Category WHERE job_category_id = ?', [req.params.job_category_id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.json(results[0]);
  });
});
/**
 * @swagger
 * /Job_Category/{job_category_id}:
 *   put:
 *     summary: Change job category info by his id
 *     tags:
 *       - Job_Category
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: job category's id 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Mythology
 *     responses:
 *       200:
 *         description: job category updated successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: job category updated successfully
 *       400:
 *         description: invalid data
 *       404:
 *         description: job category not found
 */
app.put('/Job_Category/:job_category_id', (req, res) => {
  connection.query('UPDATE Job_Category SET name = ? WHERE job_category_id = ?', [req.body.name, req.params.job_category_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.send('Category updated');
  });
});
/**
 * @swagger
 * /Job_Category/{job_category_id}:
 *   delete:
 *     summary: Delete a job category by its ID
 *     tags:
 *       - Job_Category
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: job category's id
 *     responses:
 *       200:
 *         description: job category deleted successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: job category deleted successfully
 *       404:
 *         description: job category not found
 */
app.delete('/Job_Category/:job_category_id', (req, res) => {
  connection.query('DELETE FROM Job_Category WHERE job_category_id = ?', [req.params.job_category_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.send('Category deleted');
  });
});


// --- Skills CRUD ---
/**
 * @swagger
 * /Skills:
 *   get:
 *     summary: GET all infos of all skills
 *     tags:
 *       - Skills
 *     responses:
 *       200:
 *         description: Return all infos of all skills
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   skill_id:
 *                     type: integer
 *                   name:
 *                     type: string
 */
app.get('/Skills', (req, res) => {
  connection.query('SELECT * FROM Skills', (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.json(results);
  });
});
/**
 * @swagger
 * /Skills:
 *   post:
 *     summary: Create new skill
 *     tags:
 *       - Skills
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Dance
 *     responses:
 *       200:
 *         description: Skill added successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Skill added successfully
 *       400:
 *         description: invalid data
 */
app.post('/Skills', (req, res) => {
  const { name } = req.body;
  connection.query('INSERT INTO Skills (name) VALUES (?)', [name], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.send('Skill added');
  });
});
/**
 * @swagger
 * /Skills/{id}:
 *   get:
 *     summary: GET all infos of one skill by is id
 *     tags:
 *       - Skills
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Skill found and return all infos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 skill_id:
 *                   type: integer
 *                 name:
 *                   type: string
 */
app.get('/Skills/:skill_id', (req, res) => {
  connection.query('SELECT * FROM Skills WHERE skill_id = ?', [req.params.skill_id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.json(results[0]);
  });
});
/**
 * @swagger
 * /Skills/{skill_id}:
 *   put:
 *     summary: Change skill info by his id
 *     tags:
 *       - Skills
 *     parameters:
 *       - in: path
 *         name: skill_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Skills's id 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Lucky
 *       200:
 *         description: Skill updated successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Skill updated successfully
 *       400:
 *         description: invalid data
 *       404:
 *         description: Skill not found
 */
app.put('/Skills/:skill_id', (req, res) => {
  connection.query('UPDATE Skills SET name = ? WHERE skill_id = ?', [req.body.name, req.params.skill_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.send('Skill updated');
  });
});
/**
 * @swagger
 * /Skills/{skill_id}:
 *   delete:
 *     summary: Delete a skill by its ID
 *     tags:
 *       - Skills
 *     parameters:
 *       - in: path
 *         name: skill_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Skill's id
 *     responses:
 *       200:
 *         description: Skill deleted successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Skill deleted successfully
 *       404:
 *         description: Skill not found
 */
app.delete('/Skills/:skill_id', (req, res) => {
  connection.query('DELETE FROM Skills WHERE skill_id = ?', [req.params.skill_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.send('Skill deleted');
  });
});


// --- Company CRUD ---
/**
 * @swagger
 * /Company:
 *   get:
 *     summary: GET all infos of all companies
 *     tags:
 *       - Company
 *     responses:
 *       200:
 *         description: Return all infos of all companies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   company_id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   website:
 *                     type: string
 *                   location:
 *                     type: string
 *                   description:
 *                     type: string
 */
app.get('/Company', (req, res) => {
  connection.query('SELECT * FROM Company', (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.json(results);
  });
});
/**
 * @swagger
 * /Company:
 *   post:
 *     summary: Create new company
 *     tags:
 *       - Company
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - website
 *               - location
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 example: Sephora
 *               website:
 *                 type: string
 *                 example: sephora.com
 *               location:
 *                 type: string
 *                 example: Bordeaux
 *               description:
 *                 type: string
 *                 example: On est gentil
 *     responses:
 *       200:
 *         description: Company added successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Company added successfully
 *       400:
 *         description: invalid data
 */
app.post('/Company', (req, res) => {
  const { name, website, location, description } = req.body;
  connection.query('INSERT INTO Company (name, website, location, description) VALUES (?, ?, ?, ?)', [name, website, location, description], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.send('Company added');
  });
});
/**
 * @swagger
 * /Company/{id}:
 *   get:
 *     summary: GET all infos of one company by is id
 *     tags:
 *       - Company
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Company found and return all infos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 company_id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 website:
 *                   type: string
 *                 location:
 *                   type: string
 *                 description:
 *                   type: string
 */
app.get('/Company/:company_id', (req, res) => {
  connection.query('SELECT * FROM Company WHERE company_id = ?', [req.params.company_id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.json(results[0]);
  });
});
/**
 * @swagger
 * /Company/{company_id}:
 *   put:
 *     summary: Change company info by his id
 *     tags:
 *       - Company
 *     parameters:
 *       - in: path
 *         name: company_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Company's id 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - website
 *               - location
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 example: Castorama
 *               website:
 *                 type: string
 *                 example: castorama.com
 *               location:
 *                 type: string
 *                 example: Marseille
 *               description:
 *                 type: string
 *                 example: On adore les chats
 *     responses:
 *       200:
 *         description: Company updated successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Company updated successfully
 *       400:
 *         description: invalid data
 *       404:
 *         description: Company not found
 */
app.put('/Company/:company_id', (req, res) => {
  const { name, website, location, description } = req.body;
  connection.query('UPDATE Company SET name = ?, website = ?, location = ?, description = ? WHERE company_id = ?', [name, website, location, description, req.params.company_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.send('Company updated');
  });
});
/**
 * @swagger
 * /Company/{company_id}:
 *   delete:
 *     summary: Delete a company by its ID
 *     tags:
 *       - Company
 *     parameters:
 *       - in: path
 *         name: company_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Company's id
 *     responses:
 *       200:
 *         description: Company deleted successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Company deleted successfully
 *       404:
 *         description: Company not found
 */
app.delete('/Company/:company_id', (req, res) => {
  connection.query('DELETE FROM Company WHERE company_id = ?', [req.params.company_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.send('Company deleted');
  });
});


// --- Offer CRUD ---
/**
 * @swagger
 * /Offer:
 *   get:
 *     summary: GET all infos of all offers
 *     tags:
 *       - Offer
 *     responses:
 *       200:
 *         description: Return all infos of all offers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   offer_id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   company_id:
 *                     type: integer
 *                   location:
 *                     type: string
 *                   contract_type:
 *                     type: string
 *                   salary:
 *                     type: integer
 *                   category_id:
 *                     type: integer
 *                   status:
 *                     type: string
 *                   rythm:
 *                     type: string
 *                   remote:
 *                     type: boolean
 *                   language:
 *                     type: string
 */
app.get('/Offer', (req, res) => {
  connection.query('SELECT * FROM Offer', (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.json(results);
  });
});
/**
 * @swagger
 * /Offer:
 *   post:
 *     summary: Create new offer
 *     tags:
 *       - Offer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - company_id
 *               - location
 *               - contract_type
 *               - salary
 *               - category_id
 *               - status
 *               - rythm
 *               - remote
 *               - language
 *             properties:
 *               title:
 *                 type: string
 *                 example: Data Analyst
 *               description:
 *                 type: string
 *                 example: On cherche un data analyst...
 *               company_id:
 *                 type: integer
 *                 example: 23
 *               location:
 *                 type: string
 *                 example: Agen
 *               contract_type:
 *                 type: string
 *                 example: CDI
 *               salary:
 *                 type: integer
 *                 example: 35000
 *               category_id:
 *                 type: integer
 *                 example: 5
 *               status:
 *                 type: string
 *                 example: open
 *               rythm:
 *                 type: string
 *                 example: full-time
 *               remote:
 *                 type: boolean
 *                 example: true
 *               language:
 *                 type: string
 *                 example: French
 *     responses:
 *       200:
 *         description: Offer post with success
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Offer added successfully
 *       400:
 *         description: invalid data
 */
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
/**
 * @swagger
 * /Offer/{id}:
 *   get:
 *     summary: GET all infos of one offer by is id
 *     tags:
 *       - Offer
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Offer found and return all infos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 offer_id:
 *                   type: integer
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 company_id:
 *                   type: integer
 *                 location:
 *                   type: string
 *                 contract_type:
 *                   type: string
 *                 salary:
 *                   type: integer
 *                 category_id:
 *                   type: integer
 *                 status:
 *                   type: string
 *                 rythm:
 *                   type: string
 *                 remote:
 *                   type: boolean
 *                 language:
 *                   type: string
 */
app.get('/Offer/:offer_id', (req, res) => {
  connection.query('SELECT * FROM Offer WHERE offer_id = ?', [req.params.offer_id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.json(results[0]);
  });
});
/**
 * @swagger
 * /Offer/{offer_id}:
 *   put:
 *     summary: Change Offer info by his id
 *     tags:
 *       - Offer
 *     parameters:
 *       - in: path
 *         name: offer_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Offer's id 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - company_id
 *               - location
 *               - contract_type
 *               - salary
 *               - category_id
 *               - status
 *               - rythm
 *               - remote
 *               - language
 *             properties:
 *               title:
 *                 type: string
 *                 example: Data Analyst
 *               description:
 *                 type: string
 *                 example: On cherche un data analyst...
 *               company_id:
 *                 type: integer
 *                 example: 23
 *               location:
 *                 type: string
 *                 example: Agen
 *               contract_type:
 *                 type: string
 *                 example: CDI
 *               salary:
 *                 type: integer
 *                 example: 35000
 *               category_id:
 *                 type: integer
 *                 example: 5
 *               status:
 *                 type: string
 *                 example: open
 *               rythm:
 *                 type: string
 *                 example: full-time
 *               remote:
 *                 type: boolean
 *                 example: true
 *               language:
 *                 type: string
 *                 example: French
 *     responses:
 *       200:
 *         description: Offer updated successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Offer updated successfully
 *       400:
 *         description: invalid data
 *       404:
 *         description: offer not found
 */
app.put('/Offer/:offer_id', (req, res) => {
  const { title, description, company_id, location, contract_type, salary, category_id, status, rythm, remote, language } = req.body;
  connection.query('UPDATE Offer SET title = ?, description = ?, company_id = ?, location = ?, contract_type = ?, salary = ?, category_id = ?, status = ?, rythm = ?, remote = ?, language = ? WHERE offer_id = ?', [title, description, company_id, location, contract_type, salary, category_id, status, rythm, remote, language, req.params.offer_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.send('Offer updated');
  });
});
/**
 * @swagger
 * /Offer/{offer_id}:
 *   delete:
 *     summary: Delete a offer by its ID
 *     tags:
 *       - Offer
 *     parameters:
 *       - in: path
 *         name: offer_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Offer's id
 *     responses:
 *       200:
 *         description: Offer deleted successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Offer deleted successfully
 *       404:
 *         description: offer not found
 */
app.delete('/Offer/:offer_id', (req, res) => {
  connection.query('DELETE FROM Offer WHERE offer_id = ?', [req.params.offer_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.send('Offer deleted');
  });
});


// --- Application CRUD ---
/**
 * @swagger
 * /Application:
 *   get:
 *     summary: GET all infos of all applications
 *     tags:
 *       - Application
 *     responses:
 *       200:
 *         description: Return all infos of all applications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   application_id:
 *                     type: integer
 *                   offer_id:
 *                     type: integer
 *                   user_id:
 *                     type: integer
 *                   applicant_name:
 *                     type: string
 *                   applicant_email:
 *                     type: string
 *                   resume:
 *                     type: string
 *                   message:
 *                     type: string
 *                   status:
 *                     type: string
 */
app.get('/Application', (req, res) => {
  connection.query('SELECT * FROM Application', (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.json(results);
  });
});
/**
 * @swagger
 * /Application:
 *   post:
 *     summary: Create new application
 *     tags:
 *       - Application
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - offer_id
 *               - user_id
 *               - applicant_name
 *               - applicant_email
 *               - resume
 *               - message
 *               - status
 *             properties:
 *               offer_id:
 *                 type: integer
 *                 example: 12
 *               user_id:
 *                 type: integer
 *                 example: 34
 *               applicant_name:
 *                 type: string
 *                 example: Loulou
 *               applicant_email:
 *                 type: string
 *                 format: email
 *                 example: loulou@example.com
 *               resume:
 *                 type: string
 *                 example: I give my everything to this job...
 *               message:
 *                 type: string
 *                 example: I am very interested in this position...
 *               status:
 *                 type: string
 *                 example: open
 *     responses:
 *       200:
 *         description: Application added successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Application added successfully
 *       400:
 *         description: invalid data
 */
app.post('/Application', (req, res) => {
  const { offer_id, user_id, applicant_name, applicant_email, resume, message, status } = req.body;
  connection.query('INSERT INTO Application (offer_id, user_id, applicant_name, applicant_email, resume, message, status) VALUES (?, ?, ?, ?, ?, ?, ?)', [offer_id, user_id, applicant_name, applicant_email, resume, message, status], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.send('Application added');
  });
});
/**
 * @swagger
 * /Application/{id}:
 *   get:
 *     summary: GET all infos of one application by is id
 *     tags:
 *       - Application
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Application found and return all infos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 application_id:
 *                   type: integer
 *                 offer_id:
 *                   type: integer
 *                 user_id:
 *                   type: integer
 *                 applicant_name:
 *                   type: string
 *                 applicant_email:
 *                   type: string
 *                 resume:
 *                   type: string
 *                 message:
 *                   type: string
 *                 status:
 *                   type: string
 */
app.get('/Application/:application_id', (req, res) => {
  connection.query('SELECT * FROM Application WHERE application_id = ?', [req.params.application_id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.json(results[0]);
  });
});
/**
 * @swagger
 * /Application/{application_id}:
 *   put:
 *     summary: Change Application info by his id
 *     tags:
 *       - Application
 *     parameters:
 *       - in: path
 *         name: application_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Application's id 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - offer_id
 *               - user_id
 *               - applicant_name
 *               - applicant_email
 *               - resume
 *               - message
 *               - status
 *             properties:
 *               offer_id:
 *                 type: integer
 *                 example: 12
 *               user_id:
 *                 type: integer
 *                 example: 34
 *               applicant_name:
 *                 type: string
 *                 example: Loulou
 *               applicant_email:
 *                 type: string
 *                 format: email
 *                 example: loulou@example.com
 *               resume:
 *                 type: string
 *                 example: I give my everything to this job...
 *               message:
 *                 type: string
 *                 example: I am very interested in this position...
 *               status:
 *                 type: string
 *                 example: open
 *     responses:
 *       200:
 *         description: Application updated successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Application updated successfully
 *       400:
 *         description: invalid data
 *       404:
 *         description: application not found
 */
app.put('/Application/:application_id', (req, res) => {
  const { offer_id, user_id, applicant_name, applicant_email, resume, message, status } = req.body;
  connection.query('UPDATE Application SET offer_id = ?, user_id = ?, applicant_name = ?, applicant_email = ?, resume = ?, message = ?, status = ? WHERE application_id = ?', [offer_id, user_id, applicant_name, applicant_email, resume, message, status, req.params.application_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.send('Application updated');
  });
});
/**
 * @swagger
 * /Application/{application_id}:
 *   delete:
 *     summary: Delete an application by its ID
 *     tags:
 *       - Application
 *     parameters:
 *       - in: path
 *         name: application_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Application's id
 *     responses:
 *       200:
 *         description: Application deleted successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Application deleted successfully
 *       404:
 *         description: application not found
 */
app.delete('/Application/:application_id', (req, res) => {
  connection.query('DELETE FROM Application WHERE application_id = ?', [req.params.application_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.send('Application deleted');
  });
});


// --- User_Skills CRUD ---
/**
 * @swagger
 * /User_Skills:
 *   get:
 *     summary: GET all infos of all user skills
 *     tags:
 *       - User_Skills
 *     responses:
 *       200:
 *         description: Return all infos of all user skills
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   user_skill_id:
 *                     type: integer
 *                   user_id:
 *                     type: integer
 *                   skill_id:
 *                     type: integer
 */
app.get('/User_Skills', (req, res) => {
  connection.query('SELECT * FROM User_Skills', (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.json(results);
  });
});
/**
 * @swagger
 * /User_Skills:
 *   post:
 *     summary: Create new user skill
 *     tags:
 *       - User_Skills
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - skill_id
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 26
 *               skill_id:
 *                 type: integer
 *                 example: 90
 *     responses:
 *       200:
 *         description: User_Skills post with success
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: User_Skills added successfully
 *       400:
 *         description: invalid data
 */
app.post('/User_Skills', (req, res) => {
  const { user_id, skill_id } = req.body;
  connection.query('INSERT INTO User_Skills (user_id, skill_id) VALUES (?, ?)', [user_id, skill_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.send('User skill added');
  });
});
/**
 * @swagger
 * /User_Skills/{id}:
 *   get:
 *     summary: GET all user skill infos by one user id 
 *     tags:
 *       - User_Skills
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User_Skills found and return all infos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_skill_id:
 *                   type: integer
 *                 user_id:
 *                   type: integer
 *                 skill_id:
 *                   type: integer
 */
app.get('/User_Skills/:user_id', (req, res) => {
  connection.query('SELECT * FROM User_Skills WHERE user_id = ?', [req.params.user_id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.json(results);
  });
});
/**
 * @swagger
 * /User_Skills/{user_skill_id}:
 *   put:
 *     summary: Change User_Skills info by his id
 *     tags:
 *       - User_Skills
 *     parameters:
 *       - in: path
 *         name: user_skill_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User_Skills's id 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - skill_id
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 54
 *               skill_id:
 *                 type: integer
 *                 example: 123
 *     responses:
 *       200:
 *         description: User_Skills updated successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: User_Skills updated successfully
 *       400:
 *         description: invalid data
 *       404:
 *         description: user's skill not found
 */
app.put('/User_Skills/:user_skill_id', (req, res) => {
  const { user_id, skill_id } = req.body;
  connection.query('UPDATE User_Skills SET user_id = ?, skill_id = ? WHERE user_skill_id = ?', [user_id, skill_id, req.params.user_skill_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.send('User skill updated');
  });
});
/**
 * @swagger
 * /User_Skills/{user_skill_id}:
 *   delete:
 *     summary: Delete a user's skill by its ID
 *     tags:
 *       - User_Skills
 *     parameters:
 *       - in: path
 *         name: user_skill_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User_Skills' id
 *     responses:
 *       200:
 *         description: User_Skills deleted successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: User_Skills deleted successfully
 *       404:
 *         description: user's skills not found
 */
app.delete('/User_Skills/:user_skill_id', (req, res) => {
  connection.query('DELETE FROM User_Skills WHERE user_skill_id = ?', [req.params.user_skill_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.send('User skill deleted');
  });
});


// --- Sought_Skills CRUD ---
/**
 * @swagger
 * /Sought_Skills:
 *   get:
 *     summary: GET all infos of all Sought_Skills
 *     tags:
 *       - Sought_Skills
 *     responses:
 *       200:
 *         description: Return all infos of all Sought_Skills
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   sought_skill_id:
 *                     type: integer
 *                   offer_id:
 *                     type: integer
 *                   skill_id:
 *                     type: integer
 */
app.get('/Sought_Skills', (req, res) => {
  connection.query('SELECT * FROM Sought_Skills', (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.json(results);
  });
});
/**
 * @swagger
 * /Sought_Skills:
 *   post:
 *     summary: Create new Sought_Skills
 *     tags:
 *       - Sought_Skills
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - offer_id
 *               - skill_id
 *             properties:
 *               offer_id:
 *                 type: integer
 *                 example: 76
 *               skill_id:
 *                 type: integer
 *                 example: 72
 *     responses:
 *       200:
 *         description: Sought_Skills added successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Sought_Skills added successfully
 *       400:
 *         description: invalid data
 */
app.post('/Sought_Skills', (req, res) => {
  const { offer_id, skill_id } = req.body;
  connection.query('INSERT INTO Sought_Skills (offer_id, skill_id) VALUES (?, ?)', [offer_id, skill_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.send('Sought skill added');
  });
});
/**
 * @swagger
 * /Sought_Skills/{id}:
 *   get:
 *     summary: GET all sought skill by one offer id
 *     tags:
 *       - Sought_Skills
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sought_Skills found and return all infos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sought_skill_id:
 *                   type: integer
 *                 offer_id:
 *                   type: integer
 *                 skill_id:
 *                   type: integer
 */
app.get('/Sought_Skills/:id', (req, res) => {
  connection.query('SELECT * FROM Sought_Skills WHERE offer_id = ?', [req.params.offer_id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.json(results);
  });
});
/**
 * @swagger
 * /Sought_Skills/{sought_skill_id}:
 *   put:
 *     summary: Change Sought_Skills info by his id
 *     tags:
 *       - Sought_Skills
 *     parameters:
 *       - in: path
 *         name: sought_skill_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Sought_Skills's id 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - offer_id
 *               - skill_id
 *             properties:
 *               offer_id:
 *                 type: integer
 *                 example: 892
 *               password:
 *                 type: integer
 *                 example: 185
 *     responses:
 *       200:
 *         description: Sought_Skills updated successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Sought_Skills updated successfully
 *       400:
 *         description: invalid data
 *       404:
 *         description: Sought_Skills not found
 */
app.put('/Sought_Skills/:id', (req, res) => {
  const { offer_id, skill_id } = req.body;
  connection.query('UPDATE Sought_Skills SET offer_id = ?, skill_id = ? WHERE sought_skill_id = ?', [offer_id, skill_id, req.params.sought_skill_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.send('Sought skill updated');
  });
});
/**
 * @swagger
 * /Sought_Skills/{sought_skill_id}:
 *   delete:
 *     summary: Delete a Sought_Skills by its ID
 *     tags:
 *       - Sought_Skills
 *     parameters:
 *       - in: path
 *         name: sought_skill_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Sought_Skills's id
 *     responses:
 *       200:
 *         description: Sought_Skills deleted successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Sought_Skills deleted successfully
 *       404:
 *         description: Sought_Skills not found
 */
app.delete('/Sought_Skills/:id', (req, res) => {
  connection.query('DELETE FROM Sought_Skills WHERE sought_skill_id = ?', [req.params.sought_skill_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur base de données' });
    res.send('Sought skill deleted');
  });
});



app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
});
