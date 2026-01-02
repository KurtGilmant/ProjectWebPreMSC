const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const pdfParse = require('pdf-parse');
const fs = require('fs').promises;
const { analyzeCVForATS } = require('../cvAnalyzer');

const router = express.Router();

// Configuration multer pour upload temporaire
const upload = multer({ 
  dest: './uploads/temp/',
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
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
   * /CV_Analyzer/analyze:
   *   post:
   *     summary: Analyze CV for ATS compatibility
   *     tags: [CV_Analyzer]
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
   *               user_id:
   *                 type: integer
   *     responses:
   *       200:
   *         description: Analysis completed
   */
  router.post('/analyze', upload.single('cv'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'Aucun fichier uploadé' });
      }

      const userId = req.body.user_id;
      if (!userId) {
        return res.status(400).json({ success: false, error: 'user_id requis' });
      }

      // Lire le fichier PDF
      const dataBuffer = await fs.readFile(req.file.path);
      
      // Calculer le hash du fichier pour le cache
      const cvHash = crypto.createHash('sha256').update(dataBuffer).digest('hex');
      
      // Vérifier si ce CV a déjà été analysé
      connection.query(
        'SELECT * FROM CV_Analysis WHERE cv_hash = ?',
        [cvHash],
        async (err, results) => {
          if (err) {
            console.error('Erreur DB:', err);
            await fs.unlink(req.file.path); // Nettoyer le fichier temp
            return res.status(500).json({ success: false, error: 'Erreur base de données' });
          }

          // Si déjà analysé, retourner le résultat en cache
          if (results && results.length > 0) {
            await fs.unlink(req.file.path); // Nettoyer le fichier temp
            
            const cached = results[0];
            return res.json({
              success: true,
              cached: true,
              analysis: {
                score_total: cached.score_total,
                format_structure: cached.format_structure,
                contenu_textuel: cached.contenu_textuel,
                lisibilite: cached.lisibilite,
                optimisation_mots_cles: cached.optimisation_mots_cles,
                points_forts: typeof cached.points_forts === 'string' ? JSON.parse(cached.points_forts) : cached.points_forts,
                points_amelioration: typeof cached.points_amelioration === 'string' ? JSON.parse(cached.points_amelioration) : cached.points_amelioration,
                recommandations: typeof cached.recommandations === 'string' ? JSON.parse(cached.recommandations) : cached.recommandations,
                analyzed_at: cached.analyzed_at
              }
            });
          }

          // Nouvelle analyse
          try {
            // Extraire le texte du PDF
            const pdfData = await pdfParse(dataBuffer);
            const cvText = pdfData.text;

            if (!cvText || cvText.trim().length < 50) {
              await fs.unlink(req.file.path);
              return res.status(400).json({ 
                success: false, 
                error: 'Le PDF semble vide ou illisible. Assurez-vous qu\'il contient du texte.' 
              });
            }

            // Analyser le CV
            const analysis = analyzeCVForATS(cvText);

            // Sauvegarder en base de données (mais continuer même si ça échoue)
            connection.query(
              `INSERT INTO CV_Analysis 
              (user_id, cv_hash, score_total, format_structure, contenu_textuel, 
               lisibilite, optimisation_mots_cles, points_forts, points_amelioration, recommandations)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                userId,
                cvHash,
                analysis.score_total,
                analysis.format_structure,
                analysis.contenu_textuel,
                analysis.lisibilite,
                analysis.optimisation_mots_cles,
                JSON.stringify(analysis.points_forts),
                JSON.stringify(analysis.points_amelioration),
                JSON.stringify(analysis.recommandations)
              ],
              async (err, result) => {
                // Nettoyer le fichier temporaire
                await fs.unlink(req.file.path);

                if (err) {
                  console.error('Erreur sauvegarde (non bloquante):', err.message);
                }

                // Retourner l'analyse même si la sauvegarde a échoué
                res.json({
                  success: true,
                  cached: false,
                  analysis: {
                    score_total: analysis.score_total,
                    format_structure: analysis.format_structure,
                    contenu_textuel: analysis.contenu_textuel,
                    lisibilite: analysis.lisibilite,
                    optimisation_mots_cles: analysis.optimisation_mots_cles,
                    points_forts: analysis.points_forts,
                    points_amelioration: analysis.points_amelioration,
                    recommandations: analysis.recommandations,
                    details: analysis.details
                  }
                });
              }
            );
          } catch (parseError) {
            await fs.unlink(req.file.path);
            console.error('Erreur extraction PDF:', parseError);
            res.status(500).json({ 
              success: false, 
              error: 'Erreur lors de l\'extraction du texte du PDF' 
            });
          }
        }
      );
    } catch (error) {
      console.error('Erreur générale:', error);
      if (req.file && req.file.path) {
        await fs.unlink(req.file.path);
      }
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * @swagger
   * /CV_Analyzer/history/{user_id}:
   *   get:
   *     summary: Get CV analysis history for user
   *     tags: [CV_Analyzer]
   *     parameters:
   *       - in: path
   *         name: user_id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Analysis history
   */
  router.get('/history/:user_id', (req, res) => {
    const userId = req.params.user_id;
    
    connection.query(
      'SELECT * FROM CV_Analysis WHERE user_id = ? ORDER BY analyzed_at DESC',
      [userId],
      (err, results) => {
        if (err) {
          console.error('Erreur DB:', err);
          return res.status(500).json({ success: false, error: 'Erreur base de données' });
        }

        const history = results.map(row => {
          try {
            return {
              analysis_id: row.analysis_id,
              score_total: row.score_total,
              format_structure: row.format_structure,
              contenu_textuel: row.contenu_textuel,
              lisibilite: row.lisibilite,
              optimisation_mots_cles: row.optimisation_mots_cles,
              points_forts: typeof row.points_forts === 'string' ? JSON.parse(row.points_forts) : row.points_forts,
              points_amelioration: typeof row.points_amelioration === 'string' ? JSON.parse(row.points_amelioration) : row.points_amelioration,
              recommandations: typeof row.recommandations === 'string' ? JSON.parse(row.recommandations) : row.recommandations,
              analyzed_at: row.analyzed_at
            };
          } catch (e) {
            console.error('Erreur parsing JSON:', e);
            return null;
          }
        }).filter(item => item !== null);

        res.json({ success: true, history });
      }
    );
  });

  return router;
};
