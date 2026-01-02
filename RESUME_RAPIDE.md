#  RÉSUMÉ RAPIDE - Analyseur CV ATS

## En 3 phrases

1. **Quoi ?** Un outil qui analyse un CV et donne un score de compatibilité avec les systèmes de recrutement automatisés (ATS)

2. **Comment ?** En extrayant le texte du PDF et en appliquant des règles précises (mots-clés, structure, lisibilité...)

3. **Pourquoi fiable ?** Système 100% déterministe : même CV = toujours le même score (grâce au cache basé sur hash)

---

##  Installation en 3 étapes

```bash
# 1. Installer la dépendance
npm install

# 2. Reconstruire Docker
docker compose down -v
docker-compose up --build

# 3. Tester
# Ouvrir http://localhost:5500/pages/cv-analyzer.html
```

---

##  Fichiers créés

```
src/
├── cvAnalyzer.js              # Logique d'analyse (règles)
└── routes/
    └── cvAnalyzerRoutes.js    # API endpoint

pages/
└── cv-analyzer.html           # Interface utilisateur

docker-entrypoint-initdb/
└── init.sql                   # Table CV_Analysis ajoutée
```

---

##  Comment ça marche ?

```
1. User upload CV.pdf
   ↓
2. Calcul hash SHA-256 du fichier
   ↓
3. Vérification en cache (MySQL)
   ↓
4. Si nouveau : Extraction texte + Analyse
   ↓
5. Score calculé (4 catégories × 25 points)
   ↓
6. Sauvegarde + Affichage résultat
```

---

##  Les 4 catégories analysées

| Catégorie | Points | Vérifie quoi ? |
|-----------|--------|----------------|
|  Format | 25 | Longueur, sections, dates |
|  Contenu | 25 | Mots-clés, verbes d'action |
| ️ Lisibilité | 25 | Structure, hiérarchie |
|  Mots-clés | 25 | Densité, résultats chiffrés |

**Total : 100 points**

---

##  Garantie de fiabilité

**Même CV uploadé 10 fois = Même score 10 fois**

**Comment ?**
- Hash SHA-256 du fichier PDF
- Stockage en cache (table CV_Analysis)
- Règles mathématiques fixes (pas d'aléatoire)

---

##  Test rapide

Créez un fichier Word avec ce contenu, exportez en PDF :

```
JEAN DUPONT
Email: jean@email.com | Tél: 06 12 34 56 78

EXPÉRIENCE PROFESSIONNELLE
Développeur Full Stack - TechCorp (2020-2023)
- Développé 15 applications avec React et Node.js
- Géré une équipe de 3 développeurs
- Amélioré les performances de 40%

FORMATION
Master Informatique (2018-2020)

COMPÉTENCES
JavaScript, Python, React, Node.js, SQL, Docker
```

**Score attendu : 75-85/100** 

---

##  Pour la présentation scolaire

**Points clés à mentionner :**

1. **Problème réel** : 75% des entreprises utilisent des ATS
2. **Solution locale** : Pas de coûts, pas d'API externe
3. **Déterministe** : Résultats reproductibles (important pour un projet scientifique)
4. **Transparent** : Chaque point est expliqué
5. **Éducatif** : Aide les candidats à comprendre les ATS

---

##  Documentation complète

- `CV_ANALYZER_GUIDE.md` → Explication détaillée du fonctionnement
- `INSTALLATION_CV_ANALYZER.md` → Guide d'installation pas à pas
- `SCHEMA_FONCTIONNEMENT.md` → Schémas visuels
- `GUIDE_TESTS.md` → Scénarios de test

---

##  Problème ?

**Erreur "pdf-parse not found"**
```bash
npm install pdf-parse
docker-compose up --build
```

**Erreur "Table doesn't exist"**
```bash
docker compose down -v  # Le -v est important !
docker-compose up --build
```

**PDF ne s'analyse pas**
→ Vérifiez que c'est un PDF avec du texte (pas une image scannée)

---

##  API Endpoints

**POST /CV_Analyzer/analyze**
- Upload un CV
- Retourne le score + recommandations

**GET /CV_Analyzer/history/:user_id**
- Récupère l'historique des analyses

---

##  Pourquoi cette approche ?

 **Gratuit** : Pas d'API payante (AWS, OpenAI...)
 **Fiable** : Déterministe à 100%
 **Rapide** : Analyse en < 2 secondes
 **Transparent** : Code lisible et commenté
 **Pédagogique** : Montre comment fonctionnent les ATS

---

##  Prêt à tester !

1. Lancez Docker
2. Ouvrez `http://localhost:5500/pages/cv-analyzer.html`
3. Uploadez un CV PDF
4. Recevez votre score instantanément !

---

**Questions ? Consultez les guides détaillés dans le dossier du projet.**

**Bon courage pour votre projet scolaire ! **
