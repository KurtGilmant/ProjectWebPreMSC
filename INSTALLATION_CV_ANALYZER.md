#  Installation de l'Analyseur de CV ATS

## Étapes d'installation

### 1. Installer la nouvelle dépendance

```bash
npm install
```

Cela installera `pdf-parse` qui permet d'extraire le texte des PDF.

### 2. Arrêter et reconstruire Docker

```bash
# Arrêter Docker et supprimer les volumes
docker compose down -v

# Reconstruire et démarrer
docker-compose up --build
```

**Important :** Le `-v` supprime les volumes pour que la nouvelle table `CV_Analysis` soit créée.

### 3. Vérifier que tout fonctionne

Une fois Docker démarré, vérifiez :

```bash
# Le serveur devrait afficher :
 Connecté à MySQL
 Serveur démarré sur le port 3000
```

### 4. Accéder à l'analyseur

1. Ouvrez `index.html` avec Live Server
2. Connectez-vous avec un compte
3. Cliquez sur "Analyseur CV" dans la navigation
4. Uploadez un CV PDF

##  Tester avec un CV de test

Vous pouvez créer un CV simple pour tester :

**Exemple de CV test (créer un fichier Word puis exporter en PDF) :**

```
JEAN DUPONT
Email: jean.dupont@email.com
Téléphone: 06 12 34 56 78

EXPÉRIENCE PROFESSIONNELLE

Développeur Full Stack - TechCorp (2020-2023)
- Développé 15 applications web avec React et Node.js
- Géré une équipe de 3 développeurs
- Amélioré les performances de 40%

FORMATION

Master Informatique - Université Paris (2018-2020)
Licence Informatique - Université Lyon (2015-2018)

COMPÉTENCES TECHNIQUES

JavaScript, Python, React, Node.js, SQL, Docker, Git, AWS
```

**Score attendu :** ~75-85/100

##  Fichiers créés

Voici les nouveaux fichiers ajoutés au projet :

```
ProjectWebPreMSC/
├── src/
│   ├── cvAnalyzer.js                    # Module d'analyse (logique métier)
│   └── routes/
│       └── cvAnalyzerRoutes.js          # Route API
├── pages/
│   └── cv-analyzer.html                 # Interface utilisateur
├── uploads/
│   └── temp/                            # Dossier pour uploads temporaires
├── docker-entrypoint-initdb/
│   └── init.sql                         # Modifié (table CV_Analysis ajoutée)
├── package.json                         # Modifié (pdf-parse ajouté)
├── CV_ANALYZER_GUIDE.md                 # Guide complet
└── INSTALLATION_CV_ANALYZER.md          # Ce fichier
```

##  Vérifier que la table est créée

Vous pouvez vérifier que la table `CV_Analysis` existe :

```bash
# Se connecter à MySQL dans Docker
docker exec -it <container_id> mysql -u root -p

# Mot de passe : celui de votre .env (MYSQL_ROOT_PASSWORD)

# Dans MySQL :
USE monapp;
SHOW TABLES;
DESCRIBE CV_Analysis;
```

Vous devriez voir la table avec les colonnes :
- analysis_id
- user_id
- cv_hash
- score_total
- format_structure
- contenu_textuel
- lisibilite
- optimisation_mots_cles
- points_forts
- points_amelioration
- recommandations
- analyzed_at

##  Dépannage

### Erreur : "Cannot find module 'pdf-parse'"

**Solution :**
```bash
npm install pdf-parse
docker-compose up --build
```

### Erreur : "Table 'CV_Analysis' doesn't exist"

**Solution :**
```bash
docker compose down -v  # Le -v est important !
docker-compose up --build
```

### Erreur : "Aucun fichier uploadé"

**Vérification :**
- Le dossier `uploads/temp/` existe-t-il ?
- Le fichier est-il bien un PDF ?
- La taille est-elle < 5MB ?

### Le PDF ne s'analyse pas

**Causes possibles :**
- PDF scanné (image) → Pas de texte extractible
- PDF protégé par mot de passe
- PDF corrompu

**Solution :** Utilisez un PDF avec du texte sélectionnable.

##  API Endpoints

### POST /CV_Analyzer/analyze
Analyse un CV et retourne le score ATS.

**Body (multipart/form-data) :**
- `cv` : Fichier PDF
- `user_id` : ID de l'utilisateur

**Response :**
```json
{
  "success": true,
  "cached": false,
  "analysis": {
    "score_total": 85,
    "format_structure": 23,
    "contenu_textuel": 22,
    "lisibilite": 20,
    "optimisation_mots_cles": 20,
    "points_forts": ["..."],
    "points_amelioration": ["..."],
    "recommandations": ["..."]
  }
}
```

### GET /CV_Analyzer/history/:user_id
Récupère l'historique des analyses d'un utilisateur.

**Response :**
```json
{
  "success": true,
  "history": [
    {
      "analysis_id": 1,
      "score_total": 85,
      "analyzed_at": "2024-01-15 10:30:00"
    }
  ]
}
```

##  Checklist de vérification

- [ ] `npm install` exécuté
- [ ] Docker reconstruit avec `--build`
- [ ] Table `CV_Analysis` créée
- [ ] Dossier `uploads/temp/` existe
- [ ] Page accessible sur `http://localhost:5500/pages/cv-analyzer.html`
- [ ] Upload d'un PDF fonctionne
- [ ] Score affiché correctement
- [ ] Même CV donne le même score (cache fonctionne)

## 🎉 C'est prêt !

Votre analyseur de CV ATS est maintenant opérationnel. 

Pour plus de détails sur le fonctionnement, consultez `CV_ANALYZER_GUIDE.md`.
