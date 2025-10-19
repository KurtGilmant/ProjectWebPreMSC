const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configuration multer pour l'upload de CV
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = './uploads/cv';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'cv-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PDF sont acceptés'));
    }
  }
});

module.exports = (connection) => {
  /**
   * @swagger
   * /User:
   *   get:
   *     summary: GET all users
   *     tags: [User]
   *     responses:
   *       200:
   *         description: Return all users
   */
  router.get('/', (req, res) => {
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
   * /User/{user_id}:
   *   get:
   *     summary: GET user by ID
   *     tags: [User]
   *     parameters:
   *       - in: path
   *         name: user_id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: User found
   */
  router.get('/:user_id', (req, res) => {
    const userId = req.params.user_id;
    
    connection.query('SHOW COLUMNS FROM User LIKE "company_id"', (err, columns) => {
      if (err) {
        console.error('Erreur vérification colonne:', err);
        return res.status(500).json({ error: 'Erreur base de données' });
      }
      
      let query;
      if (columns.length > 0) {
        query = `
          SELECT u.*, c.name as company_name 
          FROM User u 
          LEFT JOIN Company c ON u.company_id = c.company_id 
          WHERE u.user_id = ?
        `;
      } else {
        query = 'SELECT * FROM User WHERE user_id = ?';
      }
      
      connection.query(query, [userId], (err, rows) => {
        if (err) {
          console.error('Erreur requête SQL:', err);
          return res.status(500).json({ error: 'Erreur base de données' });
        }
        res.json(rows[0]);
      });
    });
  });

  /**
   * @swagger
   * /User/find-user/{full_name}:
   *   get:
   *     summary: GET user by full name
   *     tags: [User]
   *     parameters:
   *       - in: path
   *         name: full_name
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: User found
   */
  router.get('/find-user/:full_name', (req, res) => {
    const userName = req.params.full_name;
    
    connection.query('SHOW COLUMNS FROM User LIKE "company_id"', (err, columns) => {
      if (err) {
        console.error('Erreur vérification colonne:', err);
        return res.status(500).json({ error: 'Erreur base de données' });
      }
      
      let query;
      if (columns.length > 0) {
        query = `
          SELECT u.*, c.name as company_name 
          FROM User u 
          LEFT JOIN Company c ON u.company_id = c.company_id 
          WHERE u.full_name = ?
        `;
      } else {
        query = 'SELECT * FROM User WHERE full_name = ?';
      }
      
      connection.query(query, [userName], (err, rows) => {
        if (err) {
          console.error('Erreur requête SQL:', err);
          return res.status(404).json({ error: 'Erreur base de données' });
        }
        res.json(rows[0]);
      });
    });
  });

  /**
   * @swagger
   * /User/check-exists/{full_name}:
   *   get:
   *     summary: Check if user exists
   *     tags: [User]
   *     parameters:
   *       - in: path
   *         name: full_name
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Returns existence status
   */
  router.get('/check-exists/:full_name', (req, res) => {
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
   *     tags: [User]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [email, password, full_name, role, resume]
   *             properties:
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *               full_name:
   *                 type: string
   *               role:
   *                 type: string
   *               resume:
   *                 type: string
   *     responses:
   *       200:
   *         description: User created successfully
   */
  router.post('/', async (req, res) => {
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
   *     summary: Login user
   *     tags: [User]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [password, hashedPassword, name]
   *             properties:
   *               password:
   *                 type: string
   *               hashedPassword:
   *                 type: string
   *               name:
   *                 type: string
   *     responses:
   *       200:
   *         description: Login successful
   */
  router.post('/login', async (req, res) => {
    const {password,hashedPassword,name} = req.body;
    console.log('name from request:', name);
    try {
      const testPassword = await bcrypt.compare(password, hashedPassword);
      if (testPassword) {
        const accessToken = jwt.sign(
          { name: name },
          process.env.ACCESS_TOKEN_SECRET,
          {expiresIn: '6h'}
        );
        console.log('Token payload:', { name: name });
        const refreshToken = jwt.sign(
          { name: name },
          process.env.REFRESH_TOKEN_SECRET,
          {expiresIn: '7d'}
        );

        res.cookie("jwt", refreshToken, {
          httpOnly: true, 
          maxAge: 7*24*60*60*1000,
          sameSite: "lax",
          secure: false
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

  /**
   * @swagger
   * /User/refresh:
   *   post:
   *     summary: Refresh access token
   *     tags: [User]
   *     responses:
   *       200:
   *         description: Token refreshed
   */
  router.post('/refresh', (req, res) => {
    const refreshToken = req.cookies?.jwt;
    if (!refreshToken) return res.sendStatus(401);

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) return res.sendStatus(403);
      const accessToken = jwt.sign(
        { name: decoded.name },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '6h' }
      );
      console.log('Token payload refresh:', { name: decoded.name });
      res.json({ accessToken });
    });
  });

  /**
   * @swagger
   * /User/{user_id}:
   *   put:
   *     summary: Update user
   *     tags: [User]
   *     parameters:
   *       - in: path
   *         name: user_id
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *               full_name:
   *                 type: string
   *               role:
   *                 type: string
   *               resume:
   *                 type: string
   *     responses:
   *       200:
   *         description: User updated successfully
   */
  router.put('/:user_id', async (req, res) => {
    const user_id = req.params.user_id;
    const {email, password, full_name, role, resume} = req.body;
    
    try {
      connection.query('SELECT * FROM User WHERE user_id = ?', [user_id], async (err, currentUser) => {
        if (err || currentUser.length === 0) {
          console.error('Erreur récupération utilisateur:', err);
          return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        
        const user = currentUser[0];
        
        const updatedEmail = email || user.email;
        const updatedFullName = full_name || user.full_name;
        const updatedRole = role || user.role;
        const updatedResume = resume || user.resume;
        
        let query, params;
        if (!password || password === 'unchanged') {
          query = 'UPDATE User SET email = ?, full_name = ?, role = ?, resume = ? WHERE user_id = ?';
          params = [updatedEmail, updatedFullName, updatedRole, updatedResume, user_id];
        } else {
          const hashedPassword = await bcrypt.hash(password, 10);
          query = 'UPDATE User SET email = ?, password = ?, full_name = ?, role = ?, resume = ? WHERE user_id = ?';
          params = [updatedEmail, hashedPassword, updatedFullName, updatedRole, updatedResume, user_id];
        }
        
        connection.query(query, params, (err, result) => {
          if (err) {
            console.error('Erreur SQL:', err);
            return res.status(500).json({ error: 'Erreur base de données' });
          }
          res.json({ success: true, message: 'User updated successfully' });
        });
      });
    } catch (error) {
      console.error('Erreur bcrypt:', error);
      res.status(500).json({ error: 'Erreur lors du hashage du mot de passe' });
    }
  });

  /**
   * @swagger
   * /User/{user_id}:
   *   delete:
   *     summary: Delete user
   *     tags: [User]
   *     parameters:
   *       - in: path
   *         name: user_id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: User deleted successfully
   */
  router.delete('/:user_id', (req, res) => {
    const user_id = req.params.user_id;
    connection.query('DELETE FROM User WHERE user_id = ?', user_id, (err, result) => {
      if (err) throw err;
      res.send('User deleted successfully');
    });
  });

  /**
   * @swagger
   * /User/{user_id}/company/{company_id}:
   *   put:
   *     summary: Associate user with company
   *     tags: [User]
   *     parameters:
   *       - in: path
   *         name: user_id
   *         required: true
   *         schema:
   *           type: integer
   *       - in: path
   *         name: company_id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: User associated with company
   */
  router.put('/:user_id/company/:company_id', (req, res) => {
    const userId = req.params.user_id;
    const companyId = req.params.company_id;
    
    connection.query(
      'UPDATE User SET company_id = ? WHERE user_id = ?',
      [companyId, userId],
      (err, result) => {
        if (err) {
          console.error('Erreur SQL:', err);
          return res.status(500).json({ error: 'Erreur base de données' });
        }
        res.json({ success: true, message: 'Utilisateur associé à l\'entreprise' });
      }
    );
  });

  /**
   * @swagger
   * /User/{user_id}/upload-cv:
   *   post:
   *     summary: Upload CV for user
   *     tags: [User]
   *     parameters:
   *       - in: path
   *         name: user_id
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               cv:
   *                 type: string
   *                 format: binary
   *     responses:
   *       200:
   *         description: CV uploaded successfully
   */
  router.post('/:user_id/upload-cv', upload.single('cv'), (req, res) => {
    const user_id = req.params.user_id;
    
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Aucun fichier uploadé' });
    }
    
    const cvPath = `/uploads/cv/${req.file.filename}`;
    
    connection.query('SHOW COLUMNS FROM User LIKE "cv_path"', (err, result) => {
      if (err) {
        console.error('Erreur vérification colonne:', err);
        return res.status(500).json({ success: false, error: 'Erreur base de données' });
      }
      
      if (result.length === 0) {
        connection.query('ALTER TABLE User ADD COLUMN cv_path VARCHAR(500)', (err) => {
          if (err) {
            console.error('Erreur ajout colonne cv_path:', err);
          }
          checkCompanyIdColumn();
        });
      } else {
        checkCompanyIdColumn();
      }
      
      function checkCompanyIdColumn() {
        connection.query('SHOW COLUMNS FROM User LIKE "company_id"', (err, result) => {
          if (err) {
            console.error('Erreur vérification colonne company_id:', err);
          }
          
          if (result.length === 0) {
            connection.query('ALTER TABLE User ADD COLUMN company_id INT', (err) => {
              if (err) {
                console.error('Erreur ajout colonne company_id:', err);
              }
              updateCvPath();
            });
          } else {
            updateCvPath();
          }
        });
      }
      
      function updateCvPath() {
        connection.query(
          'UPDATE User SET cv_path = ? WHERE user_id = ?',
          [cvPath, user_id],
          (err, result) => {
            if (err) {
              console.error('Erreur SQL:', err);
              return res.status(500).json({ success: false, error: 'Erreur base de données' });
            }
            res.json({ 
              success: true, 
              message: 'CV uploadé avec succès',
              cvPath: cvPath,
              filename: req.file.filename
            });
          }
        );
      }
    });
  });

  return router;
};