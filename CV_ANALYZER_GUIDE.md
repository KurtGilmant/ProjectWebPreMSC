# 🤖 Analyseur de CV ATS - Guide Complet

##  Qu'est-ce qu'un ATS ?

**ATS** = Applicant Tracking System (Système de Suivi des Candidatures)

C'est un logiciel utilisé par **75% des entreprises** pour :
- Filtrer automatiquement les CV
- Extraire les informations clés
- Classer les candidats par pertinence

**Problème :** Si votre CV n'est pas "compatible ATS", il peut être rejeté automatiquement, même si vous êtes qualifié !

---

##  Comment fonctionne notre analyseur ?

### 1. **Extraction du texte (pdf-parse)**

```javascript
const pdfParse = require('pdf-parse');
const pdfData = await pdfParse(fichierPDF);
const texte = pdfData.text; // Texte brut extrait
```

**Pourquoi ?** Les ATS ne lisent que le texte, pas les images ou la mise en page complexe.

---

### 2. **Analyse par règles déterministes**

Notre système analyse **4 catégories** (25 points chacune) :

####  A. Format et Structure (25 points)

**Ce qui est vérifié :**
-  Longueur appropriée (300-2000 mots)
-  Sections identifiables (Expérience, Formation, Compétences...)
-  Pas de caractères spéciaux problématiques (★, ●, ◆)
-  Dates formatées correctement (2020, 2021...)

**Exemple de code :**
```javascript
// Vérifier la longueur
const wordCount = cvText.split(/\s+/).length;
if (wordCount >= 300 && wordCount <= 2000) {
    score += 8; // Bon !
}

// Chercher les sections
const sections = ['expérience', 'formation', 'compétence'];
sections.forEach(section => {
    if (cvText.toLowerCase().includes(section)) {
        score += 2; // Section trouvée
    }
});
```

---

####  B. Contenu Textuel (25 points)

**Ce qui est vérifié :**
-  Mots-clés techniques (JavaScript, Python, Docker...)
-  Verbes d'action (développé, géré, optimisé...)
-  Coordonnées complètes (email + téléphone)

**Exemple de code :**
```javascript
const techKeywords = ['javascript', 'python', 'react', 'sql'];
const found = techKeywords.filter(keyword => 
    cvText.toLowerCase().includes(keyword)
);
score += found.length * 1.5; // Plus de mots-clés = meilleur score
```

**Pourquoi c'est important ?** Les ATS cherchent des mots-clés spécifiques pour matcher avec l'offre d'emploi.

---

#### ️ C. Lisibilité (25 points)

**Ce qui est vérifié :**
-  Lignes pas trop longues (< 80 caractères)
-  Titres en majuscules pour la hiérarchie
-  Structure linéaire (pas de colonnes multiples)

**Exemple de code :**
```javascript
// Vérifier la longueur moyenne des lignes
const lines = cvText.split('\n');
const avgLength = lines.reduce((sum, line) => sum + line.length, 0) / lines.length;

if (avgLength < 80) {
    score += 8; // Bonne lisibilité
}
```

**Pourquoi ?** Les ATS ont du mal à lire les tableaux et colonnes complexes.

---

####  D. Optimisation Mots-clés (25 points)

**Ce qui est vérifié :**
-  Densité de mots-clés (1-5% du texte)
-  Résultats quantifiés (chiffres, pourcentages)
-  Certifications/diplômes mentionnés

**Exemple de code :**
```javascript
// Calculer la densité de mots-clés
const density = (keywordsFound / totalWords) * 100;

if (density >= 1 && density <= 5) {
    score += 10; // Densité optimale
}

// Chercher des résultats quantifiés
const quantified = cvText.match(/\d+%|\d+\s*(ans|projets|clients)/gi);
if (quantified && quantified.length >= 3) {
    score += 8; // Résultats chiffrés présents
}
```

---

### 3. **Système de cache (déterminisme garanti)**

**Problème :** Comment garantir que le même CV donne toujours le même score ?

**Solution :** Hash SHA-256 du fichier PDF

```javascript
const crypto = require('crypto');
const hash = crypto.createHash('sha256').update(fichierPDF).digest('hex');

// Vérifier si ce hash existe déjà en base
const resultatCache = await db.query('SELECT * FROM CV_Analysis WHERE cv_hash = ?', [hash]);

if (resultatCache.length > 0) {
    // Retourner le résultat en cache (identique à 100%)
    return resultatCache[0];
}
```

**Avantage :** Même CV = Même hash = Même résultat (toujours !)

---

### 4. **Stockage en base de données**

```sql
CREATE TABLE CV_Analysis (
    analysis_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    cv_hash VARCHAR(64) NOT NULL UNIQUE, -- Hash du CV
    score_total INT NOT NULL,
    format_structure INT NOT NULL,
    contenu_textuel INT NOT NULL,
    lisibilite INT NOT NULL,
    optimisation_mots_cles INT NOT NULL,
    points_forts JSON,
    points_amelioration JSON,
    recommandations JSON,
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Pourquoi JSON ?** Pour stocker des listes de recommandations flexibles.

---

##  Flux complet de l'analyse

```
1. Utilisateur upload un CV (PDF)
   ↓
2. Calcul du hash SHA-256
   ↓
3. Vérification en cache (base de données)
   ↓
4a. Si trouvé → Retourner résultat en cache 
   ↓
4b. Si nouveau → Continuer
   ↓
5. Extraction du texte avec pdf-parse
   ↓
6. Analyse par règles (4 catégories × 25 points)
   ↓
7. Génération des recommandations
   ↓
8. Sauvegarde en base de données
   ↓
9. Affichage des résultats à l'utilisateur
```

---

##  Interface utilisateur (Chat)

**Pourquoi un chat ?**
- Plus engageant qu'un simple formulaire
- Guidage progressif de l'utilisateur
- Feedback en temps réel

**Éléments clés :**
```html
<!-- Zone de messages -->
<div class="chat-messages">
    <div class="bot-message">👋 Bonjour ! Déposez votre CV...</div>
</div>

<!-- Zone d'upload -->
<input type="file" accept=".pdf">

<!-- Résultats avec score visuel -->
<div class="score-circle">85/100</div>
```

---

##  Garanties de fiabilité

### 1. **Déterminisme à 100%**
- Règles mathématiques fixes (pas d'aléatoire)
- Cache basé sur hash (même fichier = même résultat)
- Pas d'IA générative (pas de variabilité)

### 2. **Transparence**
- Chaque point est expliqué
- Détails fournis pour chaque catégorie
- Recommandations concrètes

### 3. **Performance**
- Analyse en < 2 secondes
- Cache pour éviter les re-calculs
- Pas d'appel API externe (tout en local)

---

##  Exemple de scoring

**CV avec :**
- 500 mots 
- 3 sections (Expérience, Formation, Compétences) 
- 8 mots-clés techniques 
- 5 verbes d'action 
- Email + téléphone 
- Dates formatées 
- 3 résultats quantifiés 

**Score calculé :**
- Format : 23/25
- Contenu : 22/25
- Lisibilité : 20/25
- Mots-clés : 21/25
- **TOTAL : 86/100** 🎉

---

##  Installation et utilisation

### 1. Installer la dépendance
```bash
npm install pdf-parse
```

### 2. Reconstruire Docker
```bash
docker compose down -v
docker-compose up --build
```

### 3. Accéder à l'analyseur
```
http://localhost:5500/pages/cv-analyzer.html
```

### 4. Tester
- Connectez-vous avec un compte
- Uploadez un CV PDF
- Recevez votre score instantanément !

---

##  Pourquoi cette approche pour un projet scolaire ?

 **Pas de coûts** (pas d'API payante)
 **100% déterministe** (facile à démontrer)
 **Transparent** (code compréhensible)
 **Éducatif** (montre la logique des ATS)
 **Performant** (analyse rapide)
 **Évolutif** (facile d'ajouter des règles)

---

##  Points clés à retenir

1. **Les ATS lisent le texte brut** → Pas de mise en page complexe
2. **Les mots-clés sont cruciaux** → Adapter au poste visé
3. **La structure compte** → Sections claires et identifiables
4. **Les chiffres parlent** → Quantifier les résultats
5. **Le cache garantit la cohérence** → Même CV = Même score

---

##  Améliorations possibles

- Ajouter plus de mots-clés par secteur (IT, Marketing, Finance...)
- Analyser la correspondance avec une offre d'emploi spécifique
- Suggérer des mots-clés manquants
- Comparer avec d'autres CV (benchmarking)
- Export PDF du rapport d'analyse

---

**Créé pour Jobly - Projet scolaire MSC**
