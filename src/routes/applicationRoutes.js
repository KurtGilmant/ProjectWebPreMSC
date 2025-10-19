const express = require('express');

const router = express.Router();

module.exports = (connection) => {
  /**
   * @swagger
   * /Application:
   *   get:
   *     summary: GET all applications
   *     tags: [Application]
   *     responses:
   *       200:
   *         description: Return all applications
   */
  router.get('/', (req, res) => {
    connection.query('SELECT * FROM Application', (err, results) => {
      if (err) return res.status(500).json({ error: 'Erreur base de données' });
      res.json(results);
    });
  });

  /**
   * @swagger
   * /Application/user/{user_id}:
   *   get:
   *     summary: GET applications by user ID
   *     tags: [Application]
   *     parameters:
   *       - in: path
   *         name: user_id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Return user applications
   */
  router.get('/user/:user_id', (req, res) => {
    const userId = req.params.user_id;
    
    const query = `
      SELECT 
        a.*,
        o.title as offer_title,
        c.name as company_name
      FROM Application a
      LEFT JOIN Offer o ON a.offer_id = o.offer_id
      LEFT JOIN Company c ON o.company_id = c.company_id
      WHERE a.user_id = ?
      ORDER BY a.created_at DESC
    `;
    
    connection.query(query, [userId], (err, results) => {
      if (err) {
        console.error('Erreur SQL:', err);
        return res.status(500).json({ error: 'Erreur base de données' });
      }
      res.json(results);
    });
  });

  /**
   * @swagger
   * /Application/company/{user_id}:
   *   get:
   *     summary: GET applications by company user ID
   *     tags: [Application]
   *     parameters:
   *       - in: path
   *         name: user_id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Return company applications
   */
  router.get('/company/:user_id', (req, res) => {
    const userId = req.params.user_id;
    
    const query = `
      SELECT 
        a.*,
        o.title as offer_title,
        c.name as company_name,
        candidate.cv_path as candidate_cv
      FROM Application a
      LEFT JOIN Offer o ON a.offer_id = o.offer_id
      LEFT JOIN Company c ON o.company_id = c.company_id
      LEFT JOIN User u ON u.company_id = c.company_id
      LEFT JOIN User candidate ON candidate.user_id = a.user_id
      WHERE u.user_id = ?
      ORDER BY a.created_at DESC
    `;
    
    connection.query(query, [userId], (err, results) => {
      if (err) {
        console.error('Erreur SQL:', err);
        return res.status(500).json({ error: 'Erreur base de données' });
      }
      res.json(results);
    });
  });

  /**
   * @swagger
   * /Application/{application_id}:
   *   get:
   *     summary: GET application by ID
   *     tags: [Application]
   *     parameters:
   *       - in: path
   *         name: application_id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Application found
   */
  router.get('/:application_id', (req, res) => {
    connection.query('SELECT * FROM Application WHERE application_id = ?', [req.params.application_id], (err, results) => {
      if (err) return res.status(500).json({ error: 'Erreur base de données' });
      res.json(results[0]);
    });
  });

  /**
   * @swagger
   * /Application:
   *   post:
   *     summary: Create new application
   *     tags: [Application]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [offer_id, user_id, applicant_name, applicant_email]
   *             properties:
   *               offer_id:
   *                 type: integer
   *               user_id:
   *                 type: integer
   *               applicant_name:
   *                 type: string
   *               applicant_email:
   *                 type: string
   *               resume:
   *                 type: string
   *               message:
   *                 type: string
   *               status:
   *                 type: string
   *     responses:
   *       200:
   *         description: Application created successfully
   */
  router.post('/', (req, res) => {
    const { offer_id, user_id, applicant_name, applicant_email, resume, message, status } = req.body;
    
    connection.query('SHOW COLUMNS FROM Application LIKE "created_at"', (err, columns) => {
      if (err) {
        console.error('Erreur vérification colonne:', err);
        return res.status(500).json({ error: 'Erreur base de données' });
      }
      
      let query, params;
      if (columns.length > 0) {
        query = 'INSERT INTO Application (offer_id, user_id, applicant_name, applicant_email, resume, message, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())';
        params = [offer_id, user_id, applicant_name, applicant_email, resume, message, status];
      } else {
        query = 'INSERT INTO Application (offer_id, user_id, applicant_name, applicant_email, resume, message, status) VALUES (?, ?, ?, ?, ?, ?, ?)';
        params = [offer_id, user_id, applicant_name, applicant_email, resume, message, status];
      }
      
      connection.query(query, params, (err, result) => {
        if (err) {
          console.error('Erreur SQL:', err);
          return res.status(500).json({ error: 'Erreur base de données' });
        }
        res.json({ success: true, message: 'Application added successfully', applicationId: result.insertId });
      });
    });
  });

  // Update application
  router.put('/:application_id', (req, res) => {
    const { offer_id, user_id, applicant_name, applicant_email, resume, message, status } = req.body;
    connection.query('UPDATE Application SET offer_id = ?, user_id = ?, applicant_name = ?, applicant_email = ?, resume = ?, message = ?, status = ? WHERE application_id = ?', [offer_id, user_id, applicant_name, applicant_email, resume, message, status, req.params.application_id], (err, result) => {
      if (err) return res.status(500).json({ error: 'Erreur base de données' });
      res.send('Application updated');
    });
  });

  // Update application status
  router.put('/:application_id/status', (req, res) => {
    const applicationId = req.params.application_id;
    const { status } = req.body;
    
    connection.query(
      'UPDATE Application SET status = ? WHERE application_id = ?',
      [status, applicationId],
      (err, result) => {
        if (err) {
          console.error('Erreur SQL:', err);
          return res.status(500).json({ error: 'Erreur base de données' });
        }
        res.json({ success: true, message: 'Statut mis à jour' });
      }
    );
  });

  // Delete application
  router.delete('/:application_id', (req, res) => {
    connection.query('DELETE FROM Application WHERE application_id = ?', [req.params.application_id], (err, result) => {
      if (err) return res.status(500).json({ error: 'Erreur base de données' });
      res.send('Application deleted');
    });
  });

  return router;
};