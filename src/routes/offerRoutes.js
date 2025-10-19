const express = require('express');

const router = express.Router();

module.exports = (connection) => {
  /**
   * @swagger
   * /Offer:
   *   get:
   *     summary: GET all offers
   *     tags: [Offer]
   *     responses:
   *       200:
   *         description: Return all offers
   */
  router.get('/', (req, res) => {
    connection.query('SELECT * FROM Offer', (err, results) => {
      if (err) return res.status(500).json({ error: 'Erreur base de données' });
      res.json(results);
    });
  });

  /**
   * @swagger
   * /Offer/with-companies:
   *   get:
   *     summary: GET offers with company names and filters
   *     tags: [Offer]
   *     parameters:
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *       - in: query
   *         name: location
   *         schema:
   *           type: string
   *       - in: query
   *         name: contract_type
   *         schema:
   *           type: string
   *       - in: query
   *         name: remote
   *         schema:
   *           type: boolean
   *     responses:
   *       200:
   *         description: Return filtered offers with company names
   */
  router.get('/with-companies', (req, res) => {
    const { search, location, contract_type, remote, min_salary, max_salary } = req.query;
    
    let query = `
      SELECT 
        o.offer_id,
        o.title,
        o.description,
        o.location,
        o.contract_type,
        o.salary,
        o.status,
        o.rythm,
        o.remote,
        o.language,
        o.company_id,
        c.name as company_name
      FROM Offer o
      LEFT JOIN Company c ON o.company_id = c.company_id
      WHERE o.status = 'open'
    `;
    
    const params = [];
    
    if (search) {
      query += ` AND (o.title LIKE ? OR o.description LIKE ? OR c.name LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (location) {
      query += ` AND o.location LIKE ?`;
      params.push(`%${location}%`);
    }
    
    if (contract_type) {
      query += ` AND o.contract_type = ?`;
      params.push(contract_type);
    }
    
    if (remote !== undefined) {
      query += ` AND o.remote = ?`;
      params.push(remote === 'true' ? 1 : 0);
    }
    
    if (min_salary) {
      query += ` AND o.salary >= ?`;
      params.push(parseInt(min_salary));
    }
    
    if (max_salary) {
      query += ` AND o.salary <= ?`;
      params.push(parseInt(max_salary));
    }
    
    query += ` ORDER BY o.offer_id DESC`;
    
    connection.query(query, params, (err, results) => {
      if (err) {
        console.error('Erreur requête SQL:', err);
        return res.status(500).json({ error: 'Erreur base de données' });
      }
      res.json(results);
    });
  });

  /**
   * @swagger
   * /Offer/company/{user_id}:
   *   get:
   *     summary: GET offers by company user ID
   *     tags: [Offer]
   *     parameters:
   *       - in: path
   *         name: user_id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Return company offers
   */
  router.get('/company/:user_id', (req, res) => {
    const userId = req.params.user_id;
    
    const query = `
      SELECT 
        o.offer_id,
        o.title,
        o.description,
        o.location,
        o.contract_type,
        o.salary,
        o.status,
        o.rythm,
        o.remote,
        o.language,
        c.name as company_name,
        c.company_id
      FROM Offer o
      LEFT JOIN Company c ON o.company_id = c.company_id
      LEFT JOIN User u ON u.company_id = c.company_id
      WHERE u.user_id = ?
    `;
    
    connection.query(query, [userId], (err, results) => {
      if (err) {
        console.error('Erreur requête SQL:', err);
        return res.status(500).json({ error: 'Erreur base de données' });
      }
      res.json(results);
    });
  });

  /**
   * @swagger
   * /Offer/{offer_id}:
   *   get:
   *     summary: GET offer by ID
   *     tags: [Offer]
   *     parameters:
   *       - in: path
   *         name: offer_id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Offer found
   */
  router.get('/:offer_id', (req, res) => {
    connection.query('SELECT * FROM Offer WHERE offer_id = ?', [req.params.offer_id], (err, results) => {
      if (err) return res.status(500).json({ error: 'Erreur base de données' });
      res.json(results[0]);
    });
  });

  /**
   * @swagger
   * /Offer:
   *   post:
   *     summary: Create new offer
   *     tags: [Offer]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [title, description, company_id, location]
   *             properties:
   *               title:
   *                 type: string
   *               description:
   *                 type: string
   *               company_id:
   *                 type: integer
   *               location:
   *                 type: string
   *               contract_type:
   *                 type: string
   *               salary:
   *                 type: integer
   *               status:
   *                 type: string
   *               remote:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Offer created successfully
   */
  router.post('/', (req, res) => {
    const { title, description, company_id, location, contract_type, salary, category_id, status, rythm, remote, language } = req.body;
    connection.query(
      'INSERT INTO Offer (title, description, company_id, location, contract_type, salary, category_id, status, rythm, remote, language) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description, company_id, location, contract_type, salary, category_id, status, rythm, remote, language],
      (err, result) => {
        if (err) {
          console.error('Erreur SQL:', err);
          return res.status(500).json({ error: 'Erreur base de données' });
        }
        res.json({ success: true, message: 'Offer added successfully', offerId: result.insertId });
      }
    );
  });

  /**
   * @swagger
   * /Offer/{offer_id}:
   *   put:
   *     summary: Update offer
   *     tags: [Offer]
   *     parameters:
   *       - in: path
   *         name: offer_id
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
   *               title:
   *                 type: string
   *               description:
   *                 type: string
   *               company_id:
   *                 type: integer
   *               location:
   *                 type: string
   *               contract_type:
   *                 type: string
   *               salary:
   *                 type: integer
   *               status:
   *                 type: string
   *               remote:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Offer updated successfully
   */
  router.put('/:offer_id', (req, res) => {
    const { title, description, company_id, location, contract_type, salary, category_id, status, rythm, remote, language } = req.body;
    connection.query('UPDATE Offer SET title = ?, description = ?, company_id = ?, location = ?, contract_type = ?, salary = ?, category_id = ?, status = ?, rythm = ?, remote = ?, language = ? WHERE offer_id = ?', [title, description, company_id, location, contract_type, salary, category_id, status, rythm, remote, language, req.params.offer_id], (err, result) => {
      if (err) return res.status(500).json({ error: 'Erreur base de données' });
      res.json({ success: true, message: 'Offer updated successfully' });
    });
  });

  /**
   * @swagger
   * /Offer/{offer_id}:
   *   delete:
   *     summary: Delete offer
   *     tags: [Offer]
   *     parameters:
   *       - in: path
   *         name: offer_id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Offer deleted successfully
   */
  router.delete('/:offer_id', (req, res) => {
    connection.query('DELETE FROM Offer WHERE offer_id = ?', [req.params.offer_id], (err, result) => {
      if (err) return res.status(500).json({ error: 'Erreur base de données' });
      res.json({ success: true, message: 'Offer deleted successfully' });
    });
  });

  return router;
};