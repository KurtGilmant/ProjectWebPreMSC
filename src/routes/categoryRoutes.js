const express = require('express');

const router = express.Router();

module.exports = (connection) => {
  /**
   * @swagger
   * /Job_Category:
   *   get:
   *     summary: GET all job categories
   *     tags: [Job_Category]
   *     responses:
   *       200:
   *         description: Return all job categories
   */
  router.get('/', (req, res) => {
    connection.query('SELECT * FROM Job_Category', (err, results) => {
      if (err) return res.status(500).json({ error: 'Erreur base de données' });
      res.json(results);
    });
  });

  // GET job category by ID
  router.get('/:job_category_id', (req, res) => {
    connection.query('SELECT * FROM Job_Category WHERE job_category_id = ?', [req.params.job_category_id], (err, results) => {
      if (err) return res.status(500).json({ error: 'Erreur base de données' });
      res.json(results[0]);
    });
  });

  /**
   * @swagger
   * /Job_Category:
   *   post:
   *     summary: Create new job category
   *     tags: [Job_Category]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name]
   *             properties:
   *               name:
   *                 type: string
   *     responses:
   *       200:
   *         description: Category created successfully
   */
  router.post('/', (req, res) => {
    const { name } = req.body;
    connection.query('INSERT INTO Job_Category (name) VALUES (?)', [name], (err, result) => {
      if (err) return res.status(500).json({ error: 'Erreur base de données' });
      res.send('Category added');
    });
  });

  // Update job category
  router.put('/:job_category_id', (req, res) => {
    connection.query('UPDATE Job_Category SET name = ? WHERE job_category_id = ?', [req.body.name, req.params.job_category_id], (err, result) => {
      if (err) return res.status(500).json({ error: 'Erreur base de données' });
      res.send('Category updated');
    });
  });

  // Delete job category
  router.delete('/:job_category_id', (req, res) => {
    connection.query('DELETE FROM Job_Category WHERE job_category_id = ?', [req.params.job_category_id], (err, result) => {
      if (err) return res.status(500).json({ error: 'Erreur base de données' });
      res.send('Category deleted');
    });
  });

  return router;
};