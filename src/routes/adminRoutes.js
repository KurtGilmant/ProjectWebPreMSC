const express = require('express');

const router = express.Router();

module.exports = (connection) => {
  /**
   * @swagger
   * /Admin/companies:
   *   get:
   *     summary: GET all company accounts for admin
   *     tags: [Admin]
   *     responses:
   *       200:
   *         description: Return all company accounts with user details
   */
  router.get('/companies', (req, res) => {
    const query = `
      SELECT 
        u.user_id,
        u.email,
        u.full_name,
        u.role,
        c.company_id,
        c.name as company_name,
        c.website,
        c.location,
        c.description
      FROM User u
      LEFT JOIN Company c ON u.company_id = c.company_id
      WHERE u.role = 'employeur'
    `;
    
    connection.query(query, (err, results) => {
      if (err) {
        console.error('Erreur SQL:', err);
        return res.status(500).json({ error: 'Erreur base de données' });
      }
      res.json(results);
    });
  });

  return router;
};