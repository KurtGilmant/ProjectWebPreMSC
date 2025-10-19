const express = require('express');

const router = express.Router();

module.exports = (connection) => {
  /**
   * @swagger
   * /Skills:
   *   get:
   *     summary: GET all skills
   *     tags: [Skills]
   *     responses:
   *       200:
   *         description: Return all skills
   */
  router.get('/', (req, res) => {
    connection.query('SELECT * FROM Skills', (err, results) => {
      if (err) return res.status(500).json({ error: 'Erreur base de données' });
      res.json(results);
    });
  });

  /**
   * @swagger
   * /Skills/{skill_id}:
   *   get:
   *     summary: GET skill by ID
   *     tags: [Skills]
   *     parameters:
   *       - in: path
   *         name: skill_id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Skill found
   */
  router.get('/:skill_id', (req, res) => {
    connection.query('SELECT * FROM Skills WHERE skill_id = ?', [req.params.skill_id], (err, results) => {
      if (err) return res.status(500).json({ error: 'Erreur base de données' });
      res.json(results[0]);
    });
  });

  /**
   * @swagger
   * /Skills:
   *   post:
   *     summary: Create new skill
   *     tags: [Skills]
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
   *         description: Skill created successfully
   */
  router.post('/', (req, res) => {
    const { name } = req.body;
    connection.query('INSERT INTO Skills (name) VALUES (?)', [name], (err, result) => {
      if (err) return res.status(500).json({ error: 'Erreur base de données' });
      res.send('Skill added');
    });
  });

  /**
   * @swagger
   * /Skills/{skill_id}:
   *   put:
   *     summary: Update skill
   *     tags: [Skills]
   *     parameters:
   *       - in: path
   *         name: skill_id
   *         required: true
   *         schema:
   *           type: integer
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
   *         description: Skill updated successfully
   */
  router.put('/:skill_id', (req, res) => {
    connection.query('UPDATE Skills SET name = ? WHERE skill_id = ?', [req.body.name, req.params.skill_id], (err, result) => {
      if (err) return res.status(500).json({ error: 'Erreur base de données' });
      res.send('Skill updated');
    });
  });

  /**
   * @swagger
   * /Skills/{skill_id}:
   *   delete:
   *     summary: Delete skill
   *     tags: [Skills]
   *     parameters:
   *       - in: path
   *         name: skill_id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Skill deleted successfully
   */
  router.delete('/:skill_id', (req, res) => {
    connection.query('DELETE FROM Skills WHERE skill_id = ?', [req.params.skill_id], (err, result) => {
      if (err) return res.status(500).json({ error: 'Erreur base de données' });
      res.send('Skill deleted');
    });
  });

  return router;
};