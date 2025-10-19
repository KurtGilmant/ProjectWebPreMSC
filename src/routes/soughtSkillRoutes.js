const express = require('express');

const router = express.Router();

module.exports = (connection) => {
  // GET all sought skills
  router.get('/', (req, res) => {
    connection.query('SELECT * FROM Sought_Skills', (err, results) => {
      if (err) return res.status(500).json({ error: 'Erreur base de données' });
      res.json(results);
    });
  });

  // GET sought skills by offer ID
  router.get('/:id', (req, res) => {
    connection.query('SELECT * FROM Sought_Skills WHERE offer_id = ?', [req.params.offer_id], (err, results) => {
      if (err) return res.status(500).json({ error: 'Erreur base de données' });
      res.json(results);
    });
  });

  // Create sought skill
  router.post('/', (req, res) => {
    const { offer_id, skill_id } = req.body;
    connection.query('INSERT INTO Sought_Skills (offer_id, skill_id) VALUES (?, ?)', [offer_id, skill_id], (err, result) => {
      if (err) return res.status(500).json({ error: 'Erreur base de données' });
      res.send('Sought skill added');
    });
  });

  // Update sought skill
  router.put('/:id', (req, res) => {
    const { offer_id, skill_id } = req.body;
    connection.query('UPDATE Sought_Skills SET offer_id = ?, skill_id = ? WHERE sought_skill_id = ?', [offer_id, skill_id, req.params.sought_skill_id], (err, result) => {
      if (err) return res.status(500).json({ error: 'Erreur base de données' });
      res.send('Sought skill updated');
    });
  });

  // Delete sought skill
  router.delete('/:id', (req, res) => {
    connection.query('DELETE FROM Sought_Skills WHERE sought_skill_id = ?', [req.params.sought_skill_id], (err, result) => {
      if (err) return res.status(500).json({ error: 'Erreur base de données' });
      res.send('Sought skill deleted');
    });
  });

  return router;
};