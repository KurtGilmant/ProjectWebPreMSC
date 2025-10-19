const express = require('express');
const bcrypt = require('bcrypt');

const router = express.Router();

module.exports = (connection) => {
  /**
   * @swagger
   * /Company:
   *   get:
   *     summary: GET all companies
   *     tags: [Company]
   *     responses:
   *       200:
   *         description: Return all companies
   */
  router.get('/', (req, res) => {
    connection.query('SELECT * FROM Company', (err, results) => {
      if (err) return res.status(500).json({ error: 'Erreur base de données' });
      res.json(results);
    });
  });

  /**
   * @swagger
   * /Company/request:
   *   post:
   *     summary: Submit company registration request
   *     tags: [Company]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [company_name, contact_name, email]
   *             properties:
   *               company_name:
   *                 type: string
   *               contact_name:
   *                 type: string
   *               email:
   *                 type: string
   *               phone:
   *                 type: string
   *               description:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: Request submitted successfully
   */
  router.post('/request', (req, res) => {
    const { company_name, contact_name, email, phone, description, password } = req.body;
    console.log('Mot de passe reçu dans la demande:', password);
    
    connection.query(`
      CREATE TABLE IF NOT EXISTS Company_Registration_Request (
        request_id INT AUTO_INCREMENT PRIMARY KEY,
        company_name VARCHAR(255) NOT NULL,
        contact_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        description TEXT,
        password VARCHAR(255),
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Erreur création table:', err);
        return res.status(500).json({ error: 'Erreur base de données' });
      }
      
      connection.query('SHOW COLUMNS FROM Company_Registration_Request LIKE "password"', (err, columns) => {
        if (err) {
          console.error('Erreur vérification colonne:', err);
        }
        
        if (columns.length === 0) {
          connection.query('ALTER TABLE Company_Registration_Request ADD COLUMN password VARCHAR(255)', (err) => {
            if (err) {
              console.error('Erreur ajout colonne password:', err);
            }
            insertRequest();
          });
        } else {
          insertRequest();
        }
      });
      
      function insertRequest() {
        connection.query(
          'INSERT INTO Company_Registration_Request (company_name, contact_name, email, phone, description, password) VALUES (?, ?, ?, ?, ?, ?)',
          [company_name, contact_name, email, phone, description, password],
          (err, result) => {
            if (err) {
              console.error('Erreur SQL:', err);
              return res.status(500).json({ error: 'Erreur base de données' });
            }
            res.json({ success: true, message: 'Demande d\'inscription envoyée avec succès' });
          }
        );
      }
    });
  });

  /**
   * @swagger
   * /Company/requests:
   *   get:
   *     summary: GET all company registration requests
   *     tags: [Company]
   *     responses:
   *       200:
   *         description: Return all registration requests
   */
  router.get('/requests', (req, res) => {
    connection.query('SELECT * FROM Company_Registration_Request ORDER BY created_at DESC', (err, results) => {
      if (err) {
        console.error('Erreur SQL:', err);
        return res.status(500).json({ error: 'Erreur base de données' });
      }
      res.json(results);
    });
  });

  // Approve company registration request
  router.put('/requests/:id/approve', async (req, res) => {
    const requestId = req.params.id;
    
    try {
      connection.query('SELECT * FROM Company_Registration_Request WHERE request_id = ?', [requestId], async (err, results) => {
        if (err || results.length === 0) {
          console.error('Erreur récupération demande:', err);
          return res.status(404).json({ error: 'Demande non trouvée' });
        }
        
        const request = results[0];
        const passwordToUse = request.password || 'temp123';
        console.log('Mot de passe récupéré de la demande:', passwordToUse);
        const hashedPassword = await bcrypt.hash(passwordToUse, 10);
        
        connection.query(
          'INSERT INTO Company (name, website, location, description) VALUES (?, ?, ?, ?)',
          [request.company_name, '', '', request.description],
          (err, companyResult) => {
            if (err) {
              console.error('Erreur création entreprise:', err);
              return res.status(500).json({ error: 'Erreur création entreprise: ' + err.message });
            }
            
            connection.query('SHOW COLUMNS FROM User LIKE "company_id"', (err, columns) => {
              if (err) {
                console.error('Erreur vérification colonne:', err);
              }
              
              let userQuery, userParams;
              if (columns.length > 0) {
                userQuery = 'INSERT INTO User (email, password, full_name, role, resume, company_id) VALUES (?, ?, ?, ?, ?, ?)';
                userParams = [request.email, hashedPassword, request.contact_name, 'employeur', `Contact pour ${request.company_name}`, companyResult.insertId];
              } else {
                userQuery = 'INSERT INTO User (email, password, full_name, role, resume) VALUES (?, ?, ?, ?, ?)';
                userParams = [request.email, hashedPassword, request.contact_name, 'employeur', `Contact pour ${request.company_name}`];
              }
              
              connection.query(userQuery, userParams, (err, userResult) => {
                if (err) {
                  console.error('Erreur création utilisateur:', err);
                  return res.status(500).json({ error: 'Erreur création utilisateur: ' + err.message });
                }
                
                connection.query(
                  'UPDATE Company_Registration_Request SET status = "approved" WHERE request_id = ?',
                  [requestId],
                  (err) => {
                    if (err) {
                      console.error('Erreur mise à jour demande:', err);
                    }
                    res.json({ success: true, message: 'Demande approuvée et compte créé' });
                  }
                );
              });
            });
          }
        );
      });
    } catch (error) {
      console.error('Erreur générale:', error);
      res.status(500).json({ error: 'Erreur serveur: ' + error.message });
    }
  });

  // Reject company registration request
  router.put('/requests/:id/reject', (req, res) => {
    const requestId = req.params.id;
    
    connection.query(
      'UPDATE Company_Registration_Request SET status = "rejected" WHERE request_id = ?',
      [requestId],
      (err, result) => {
        if (err) {
          console.error('Erreur SQL:', err);
          return res.status(500).json({ error: 'Erreur base de données' });
        }
        res.json({ success: true, message: 'Demande rejetée' });
      }
    );
  });

  /**
   * @swagger
   * /Company/{company_id}:
   *   get:
   *     summary: GET company by ID
   *     tags: [Company]
   *     parameters:
   *       - in: path
   *         name: company_id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Company found
   */
  router.get('/:company_id', (req, res) => {
    connection.query('SELECT * FROM Company WHERE company_id = ?', [req.params.company_id], (err, results) => {
      if (err) return res.status(500).json({ error: 'Erreur base de données' });
      res.json(results[0]);
    });
  });

  /**
   * @swagger
   * /Company:
   *   post:
   *     summary: Create new company
   *     tags: [Company]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name, website, location, description]
   *             properties:
   *               name:
   *                 type: string
   *               website:
   *                 type: string
   *               location:
   *                 type: string
   *               description:
   *                 type: string
   *     responses:
   *       200:
   *         description: Company created successfully
   */
  router.post('/', (req, res) => {
    const { name, website, location, description } = req.body;
    connection.query('INSERT INTO Company (name, website, location, description) VALUES (?, ?, ?, ?)', [name, website, location, description], (err, result) => {
      if (err) {
        console.error('Erreur SQL:', err);
        return res.status(500).json({ error: 'Erreur base de données' });
      }
      res.json({ success: true, message: 'Company added successfully', companyId: result.insertId });
    });
  });

  /**
   * @swagger
   * /Company/{company_id}:
   *   put:
   *     summary: Update company
   *     tags: [Company]
   *     parameters:
   *       - in: path
   *         name: company_id
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
   *               name:
   *                 type: string
   *               website:
   *                 type: string
   *               location:
   *                 type: string
   *               description:
   *                 type: string
   *     responses:
   *       200:
   *         description: Company updated successfully
   */
  router.put('/:company_id', (req, res) => {
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
   *     summary: Delete company
   *     tags: [Company]
   *     parameters:
   *       - in: path
   *         name: company_id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Company deleted successfully
   */
  router.delete('/:company_id', (req, res) => {
    connection.query('DELETE FROM Company WHERE company_id = ?', [req.params.company_id], (err, result) => {
      if (err) return res.status(500).json({ error: 'Erreur base de données' });
      res.send('Company deleted');
    });
  });

  // Update company by user ID
  router.put('/user/:user_id', (req, res) => {
    const userId = req.params.user_id;
    const { name, website, location, description } = req.body;
    
    connection.query(
      'SELECT company_id FROM User WHERE user_id = ?',
      [userId],
      (err, userResult) => {
        if (err || userResult.length === 0) {
          console.error('Erreur récupération utilisateur:', err);
          return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        
        const companyId = userResult[0].company_id;
        if (!companyId) {
          return res.status(404).json({ error: 'Aucune entreprise associée à cet utilisateur' });
        }
        
        connection.query(
          'UPDATE Company SET name = ?, website = ?, location = ?, description = ? WHERE company_id = ?',
          [name, website, location, description, companyId],
          (err, result) => {
            if (err) {
              console.error('Erreur SQL:', err);
              return res.status(500).json({ error: 'Erreur base de données' });
            }
            res.json({ success: true, message: 'Company updated successfully' });
          }
        );
      }
    );
  });

  return router;
};