#  Schéma de fonctionnement - Analyseur CV ATS

##  Architecture globale

```
┌─────────────────────────────────────────────────────────────────┐
│                         UTILISATEUR                              │
│                                                                  │
│  1. Se connecte sur Jobly                                       │
│  2. Accède à "Analyseur CV"                                     │
│  3. Upload son CV (PDF)                                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (cv-analyzer.html)                   │
│                                                                  │
│  • Interface chat conviviale                                    │
│  • Validation du fichier (PDF, < 5MB)                          │
│  • Affichage du score et recommandations                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ POST /CV_Analyzer/analyze
                         │ (FormData: cv + user_id)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  BACKEND (cvAnalyzerRoutes.js)                   │
│                                                                  │
│  1. Réception du fichier PDF                                    │
│  2. Calcul du hash SHA-256                                      │
│  3. Vérification en cache (MySQL)                               │
│     ├─ Si trouvé → Retour immédiat                           │
│     └─ Si nouveau → Continuer                                   │
│  4. Extraction du texte (pdf-parse)                             │
│  5. Appel du module d'analyse                                   │
│  6. Sauvegarde en base de données                               │
│  7. Retour du résultat                                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   MODULE D'ANALYSE (cvAnalyzer.js)               │
│                                                                  │
│  Analyse 4 catégories (25 points chacune) :                     │
│                                                                  │
│   FORMAT ET STRUCTURE                                         │
│     • Longueur (300-2000 mots)                                  │
│     • Sections identifiables                                    │
│     • Pas de caractères spéciaux                                │
│     • Dates formatées                                           │
│                                                                  │
│   CONTENU TEXTUEL                                             │
│     • Mots-clés techniques                                      │
│     • Verbes d'action                                           │
│     • Coordonnées complètes                                     │
│                                                                  │
│  ️ LISIBILITÉ                                                  │
│     • Longueur des lignes                                       │
│     • Hiérarchie claire                                         │
│     • Structure linéaire                                        │
│                                                                  │
│   OPTIMISATION MOTS-CLÉS                                      │
│     • Densité de mots-clés                                      │
│     • Résultats quantifiés                                      │
│     • Certifications                                            │
│                                                                  │
│  ️ RÉSULTAT : Score total + Recommandations                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BASE DE DONNÉES (MySQL)                       │
│                                                                  │
│  Table : CV_Analysis                                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ analysis_id (PK)                                         │  │
│  │ user_id (FK → User)                                      │  │
│  │ cv_hash (UNIQUE) ← Garantit le déterminisme             │  │
│  │ score_total                                              │  │
│  │ format_structure                                         │  │
│  │ contenu_textuel                                          │  │
│  │ lisibilite                                               │  │
│  │ optimisation_mots_cles                                   │  │
│  │ points_forts (JSON)                                      │  │
│  │ points_amelioration (JSON)                               │  │
│  │ recommandations (JSON)                                   │  │
│  │ analyzed_at (TIMESTAMP)                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

##  Flux détaillé de l'analyse

```
┌──────────────┐
│ Upload PDF   │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ Calcul hash SHA-256                                      │
│                                                          │
│ Exemple :                                                │
│ CV.pdf → a3f5e8c9d2b1... (64 caractères)                │
└──────┬───────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ Recherche en cache                                       │
│                                                          │
│ SELECT * FROM CV_Analysis WHERE cv_hash = 'a3f5e8c9...' │
└──────┬───────────────────────────────────────────────────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
   Trouvé ?          Pas trouvé
       │                 │
       │                 ▼
       │         ┌───────────────────┐
       │         │ Extraction texte  │
       │         │ (pdf-parse)       │
       │         └────────┬──────────┘
       │                  │
       │                  ▼
       │         ┌───────────────────────────────────────┐
       │         │ Analyse par règles                    │
       │         │                                       │
       │         │ • Compter mots-clés                   │
       │         │ • Vérifier sections                   │
       │         │ • Calculer densité                    │
       │         │ • Détecter dates                      │
       │         │ • Chercher verbes d'action            │
       │         │                                       │
       │         │ ️ Score = Σ(4 catégories)            │
       │         └────────┬──────────────────────────────┘
       │                  │
       │                  ▼
       │         ┌───────────────────┐
       │         │ Sauvegarde en BDD │
       │         └────────┬──────────┘
       │                  │
       └──────────────────┘
                  │
                  ▼
         ┌────────────────────┐
         │ Retour résultat    │
         │ {                  │
         │   score: 85,       │
         │   details: {...},  │
         │   cached: true/false│
         │ }                  │
         └────────────────────┘
```

---

##  Exemple de scoring détaillé

```
CV EXEMPLE :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

JEAN DUPONT
Email: jean@email.com | Tél: 06 12 34 56 78

EXPÉRIENCE PROFESSIONNELLE
Développeur Full Stack - TechCorp (2020-2023)
- Développé 15 applications web avec React et Node.js
- Géré une équipe de 3 développeurs
- Amélioré les performances de 40%

FORMATION
Master Informatique - Université Paris (2018-2020)

COMPÉTENCES TECHNIQUES
JavaScript, Python, React, Node.js, SQL, Docker, Git

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ANALYSE :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 FORMAT ET STRUCTURE : 23/25
    Longueur : 120 mots (appropriée)           +8
    Sections : 3 trouvées                      +6
    Pas de caractères spéciaux                 +4
    Dates : 4 dates formatées                  +3
    Manque quelques sections                   +2

 CONTENU TEXTUEL : 22/25
    Mots-clés tech : 7 trouvés                 +10.5
    Verbes d'action : 3 trouvés                +3
    Email + téléphone présents                 +7
    Pourrait avoir plus de verbes              +1.5

️ LISIBILITÉ : 20/25
    Lignes courtes (< 80 car.)                 +8
    Titres en majuscules                       +10
    Pas assez de hiérarchie                    +2

 OPTIMISATION MOTS-CLÉS : 21/25
    Densité : 5.8% (bonne)                     +10
    Résultats quantifiés : 3 trouvés           +8
    Pas de certifications                      +3

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 SCORE TOTAL : 86/100

 POINTS FORTS :
   • Excellente structure et format
   • Contenu riche et pertinent
   • 7 compétences techniques identifiées

⚠ À AMÉLIORER :
   • Ajouter une section "Certifications"
   • Utiliser plus de verbes d'action

 RECOMMANDATIONS :
   • Excellent CV ! Compatible avec la plupart des ATS
   • Continuez à mettre à jour vos compétences régulièrement
```

---

##  Garantie de déterminisme

```
MÊME CV = MÊME HASH = MÊME RÉSULTAT

Exemple :
┌─────────────────────────────────────────────────────────┐
│ Upload #1 : CV_Jean.pdf                                 │
│ Hash : a3f5e8c9d2b1...                                  │
│ Score : 86/100                                          │
│ Sauvegarde en BDD                                     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Upload #2 : CV_Jean.pdf (même fichier)                 │
│ Hash : a3f5e8c9d2b1... (identique !)                   │
│ Recherche en cache → Trouvé                          │
│ Score : 86/100 (sans recalcul)                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Upload #3 : CV_Jean_v2.pdf (modifié)                   │
│ Hash : b7e2f9a1c3d4... (différent !)                   │
│ Recherche en cache → Pas trouvé                        │
│ Nouvelle analyse → Score : 92/100                      │
│ Sauvegarde en BDD                                     │
└─────────────────────────────────────────────────────────┘
```

---

##  Technologies utilisées

```
┌─────────────────────────────────────────────────────────┐
│ FRONTEND                                                │
│ • HTML5 / CSS3                                          │
│ • JavaScript Vanilla                                    │
│ • Interface chat responsive                             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ BACKEND                                                 │
│ • Node.js + Express.js                                  │
│ • Multer (upload fichiers)                              │
│ • pdf-parse (extraction texte)                          │
│ • crypto (hash SHA-256)                                 │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ BASE DE DONNÉES                                         │
│ • MySQL 8.0                                             │
│ • Table CV_Analysis                                     │
│ • Colonnes JSON pour flexibilité                        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ INFRASTRUCTURE                                          │
│ • Docker + Docker Compose                               │
│ • Volumes persistants                                   │
│ • Réseau isolé                                          │
└─────────────────────────────────────────────────────────┘
```

---

##  Avantages pour un projet scolaire

 **Pas de coûts** : Tout en local, pas d'API payante
 **Déterministe** : Facile à démontrer et tester
 **Transparent** : Code lisible et commenté
 **Éducatif** : Montre comment fonctionnent les ATS
 **Performant** : Analyse en < 2 secondes
 **Évolutif** : Facile d'ajouter des règles

---

**Jobly - Analyseur CV ATS**
*Projet scolaire MSC - 2024*
