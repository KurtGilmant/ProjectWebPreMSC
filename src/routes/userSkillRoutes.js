const express = require('express');

const router = express.Router();

module.exports = (connection) => {
  // GET all user skills
  router.get('/', (req, res) => {
    connection.query('SELECT * FROM User_Skills', (err, results) => {
      if (err) return res.status(500).json({ error: 'Erreur base de données' });
      res.json(results);
    });
  });

  // GET user skills by user ID
  router.get('/:user_id', (req, res) => {
    connection.query('SELECT * FROM User_Skills WHERE user_id = ?', [req.params.user_id], (err, results) => {
      if (err) return res.status(500).json({ error: 'Erreur base de données' });
      res.json(results);
    });
  });

  // Create user skill
  router.post('/', (req, res) => {
    const { user_id, skill_id } = req.body;
    connection.query('INSERT INTO User_Skills (user_id, skill_id) VALUES (?, ?)', [user_id, skill_id], (err, result) => {
      if (err) return res.status(500).json({ error: 'Erreur base de données' });
      res.send('User skill added');
    });
  });

  // Update user skill
  router.put('/:user_skill_id', (req, res) => {
    const { user_id, skill_id } = req.body;
    connection.query('UPDATE User_Skills SET user_id = ?, skill_id = ? WHERE user_skill_id = ?', [user_id, skill_id, req.params.user_skill_id], (err, result) => {
      if (err) return res.status(500).json({ error: 'Erreur base de données' });
      res.send('User skill updated');
    });
  });

  // Delete user skill
  router.delete('/:user_skill_id', (req, res) => {
    connection.query('DELETE FROM User_Skills WHERE user_skill_id = ?', [req.params.user_skill_id], (err, result) => {
      if (err) return res.status(500).json({ error: 'Erreur base de données' });
      res.send('User skill deleted');
    });
  });

  return router;
};