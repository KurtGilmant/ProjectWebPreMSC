#  Guide de tests - Analyseur CV ATS

##  Créer des CV de test

Pour tester l'analyseur, créez ces 3 CV dans Word puis exportez-les en PDF :

---

###  CV Test 1 : "CV Excellent" (Score attendu : 80-90/100)

```
MARIE MARTIN
Email: marie.martin@email.com | Téléphone: 06 12 34 56 78
LinkedIn: linkedin.com/in/mariemartin

EXPÉRIENCE PROFESSIONNELLE

Développeuse Full Stack Senior - TechCorp, Paris (2020-2023)
• Développé 15 applications web avec React et Node.js
• Géré une équipe de 3 développeurs juniors
• Amélioré les performances de 40% sur 10 projets
• Déployé 20 microservices sur AWS avec Docker

Développeuse Frontend - StartupFlow, Lyon (2018-2020)
• Créé 8 interfaces utilisateur avec React et TypeScript
• Optimisé le temps de chargement de 60%
• Formé 5 nouveaux développeurs

FORMATION

Master Informatique - Université Paris-Saclay (2016-2018)
Licence Informatique - Université Lyon 1 (2013-2016)

COMPÉTENCES TECHNIQUES

Langages: JavaScript, TypeScript, Python, SQL
Frameworks: React, Node.js, Express, Vue.js
Outils: Docker, Kubernetes, Git, Jenkins, AWS
Bases de données: PostgreSQL, MongoDB, Redis

CERTIFICATIONS

• AWS Certified Solutions Architect (2022)
• Scrum Master Certified (2021)

LANGUES

Français (natif), Anglais (courant), Espagnol (intermédiaire)
```

**Pourquoi ce CV score bien :**
-  Sections claires et complètes
-  Nombreux mots-clés techniques (15+)
-  Verbes d'action (développé, géré, créé, optimisé...)
-  Résultats quantifiés (40%, 60%, 15 apps...)
-  Coordonnées complètes
-  Certifications mentionnées
-  Dates formatées correctement

---

### ⚠ CV Test 2 : "CV Moyen" (Score attendu : 50-65/100)

```
Jean Dupont
jean.dupont@email.com

Expérience

Développeur chez ABC Company
J'ai travaillé sur plusieurs projets web. J'ai utilisé différentes technologies.
J'ai aidé l'équipe sur divers sujets.

Formation

Master informatique
Licence informatique

Compétences

JavaScript, HTML, CSS, un peu de Python
```

**Pourquoi ce CV score moyen :**
- ⚠ Manque de structure claire
- ⚠ Pas de dates
- ⚠ Peu de mots-clés techniques
- ⚠ Pas de résultats quantifiés
- ⚠ Verbes d'action faibles
- ⚠ Pas de téléphone
- ⚠ Descriptions vagues

---

###  CV Test 3 : "CV Faible" (Score attendu : 20-40/100)

```
CV

Nom: Pierre
Email: pierre@mail.com

★ Expérience ★
● Travail dans l'informatique
● Plusieurs années d'expérience

◆ Formation ◆
• École d'informatique

■ Compétences ■
► Ordinateurs
► Internet
```

**Pourquoi ce CV score faible :**
-  Caractères spéciaux problématiques (★, ●, ◆)
-  Très court (< 100 mots)
-  Pas de mots-clés techniques
-  Pas de dates
-  Pas de téléphone
-  Descriptions trop vagues
-  Pas de verbes d'action

---

##  Scénarios de test

### Test 1 : Vérifier le déterminisme

**Objectif :** S'assurer que le même CV donne toujours le même score

**Étapes :**
1. Uploadez "CV Excellent"
2. Notez le score (ex: 86/100)
3. Uploadez à nouveau le même fichier
4. Vérifiez que :
   - Le message "Résultat en cache" apparaît
   - Le score est identique (86/100)
   - Les recommandations sont identiques

**Résultat attendu :**  Score identique + message "en cache"

---

### Test 2 : Vérifier la différenciation

**Objectif :** S'assurer que des CV différents donnent des scores différents

**Étapes :**
1. Uploadez "CV Excellent" → Score ~85/100
2. Uploadez "CV Moyen" → Score ~55/100
3. Uploadez "CV Faible" → Score ~30/100

**Résultat attendu :**  Scores décroissants et cohérents

---

### Test 3 : Vérifier les recommandations

**Objectif :** S'assurer que les recommandations sont pertinentes

**Étapes :**
1. Uploadez "CV Faible"
2. Vérifiez les points à améliorer :
   -  "Améliorer la structure"
   -  "Ajouter des mots-clés"
   -  "Ajouter coordonnées complètes"

**Résultat attendu :**  Recommandations pertinentes

---

### Test 4 : Vérifier la gestion d'erreurs

**Objectif :** S'assurer que les erreurs sont bien gérées

**Étapes :**

**4a. Fichier non-PDF**
1. Essayez d'uploader un fichier .docx
2. **Résultat attendu :**  Message "Seuls les fichiers PDF sont acceptés"

**4b. Fichier trop volumineux**
1. Essayez d'uploader un PDF > 5MB
2. **Résultat attendu :**  Message "Fichier trop volumineux"

**4c. PDF vide ou scanné**
1. Uploadez un PDF scanné (image)
2. **Résultat attendu :**  Message "PDF illisible"

---

### Test 5 : Vérifier la persistance en base

**Objectif :** S'assurer que les analyses sont sauvegardées

**Étapes :**
1. Uploadez "CV Excellent"
2. Redémarrez Docker : `docker compose restart`
3. Uploadez à nouveau le même CV
4. **Résultat attendu :**  Message "en cache" (données persistées)

---

##  Tableau de scores attendus

| CV | Mots | Sections | Mots-clés | Dates | Score attendu |
|----|------|----------|-----------|-------|---------------|
| Excellent | 250+ | 6+ | 15+ | Oui | 80-90/100 |
| Moyen | 100-200 | 3-4 | 5-10 | Partiel | 50-65/100 |
| Faible | < 100 | 1-2 | 0-3 | Non | 20-40/100 |

---

##  Vérifier en base de données

Après avoir uploadé des CV, vérifiez qu'ils sont bien stockés :

```bash
# Se connecter à MySQL
docker exec -it <container_id> mysql -u root -p

# Dans MySQL
USE monapp;

# Voir toutes les analyses
SELECT 
    analysis_id,
    user_id,
    score_total,
    analyzed_at
FROM CV_Analysis
ORDER BY analyzed_at DESC;

# Voir les détails d'une analyse
SELECT 
    score_total,
    format_structure,
    contenu_textuel,
    lisibilite,
    optimisation_mots_cles,
    points_forts,
    recommandations
FROM CV_Analysis
WHERE analysis_id = 1;
```

---

##  Checklist de validation

### Fonctionnalités de base
- [ ] Upload d'un PDF fonctionne
- [ ] Extraction du texte réussie
- [ ] Score calculé et affiché
- [ ] Détails des 4 catégories affichés
- [ ] Points forts listés
- [ ] Points à améliorer listés
- [ ] Recommandations affichées

### Déterminisme
- [ ] Même CV = Même score (toujours)
- [ ] Message "en cache" affiché
- [ ] Hash stocké en base
- [ ] Pas de recalcul inutile

### Gestion d'erreurs
- [ ] Fichier non-PDF rejeté
- [ ] Fichier > 5MB rejeté
- [ ] PDF vide détecté
- [ ] Messages d'erreur clairs

### Performance
- [ ] Analyse en < 3 secondes
- [ ] Cache instantané (< 0.5s)
- [ ] Pas de lag dans l'interface

### Base de données
- [ ] Table CV_Analysis créée
- [ ] Données sauvegardées
- [ ] JSON parsé correctement
- [ ] Persistance après redémarrage

---

##  Problèmes courants et solutions

### Problème : Score toujours à 0

**Cause :** PDF scanné (image) sans texte extractible

**Solution :** Utilisez un PDF avec du texte sélectionnable

---

### Problème : "Résultat en cache" ne s'affiche jamais

**Cause :** Hash différent à chaque upload

**Vérification :**
```sql
SELECT cv_hash, COUNT(*) 
FROM CV_Analysis 
GROUP BY cv_hash 
HAVING COUNT(*) > 1;
```

Si aucun résultat → Le hash change (problème de lecture fichier)

---

### Problème : Scores incohérents

**Cause :** Règles d'analyse modifiées

**Solution :** Vider le cache :
```sql
DELETE FROM CV_Analysis;
```

---

## 📈 Améliorer les scores

Pour aider les utilisateurs à améliorer leur CV :

### Pour passer de 40 à 60/100 :
1. Ajouter des sections claires (EXPÉRIENCE, FORMATION, COMPÉTENCES)
2. Lister 5-10 compétences techniques
3. Ajouter email + téléphone
4. Formater les dates (2020-2023)

### Pour passer de 60 à 80/100 :
1. Utiliser des verbes d'action (développé, géré, créé...)
2. Quantifier les résultats (40%, 15 projets...)
3. Ajouter 10+ mots-clés techniques
4. Structurer avec des titres en majuscules

### Pour atteindre 90+/100 :
1. Ajouter des certifications
2. Optimiser la densité de mots-clés (2-4%)
3. Utiliser un format simple et linéaire
4. Éviter les tableaux et colonnes

---

##  Démonstration pour le projet scolaire

### Scénario de présentation :

1. **Introduction** (2 min)
   - Expliquer le problème des ATS
   - Montrer les statistiques (75% des entreprises)

2. **Démonstration live** (5 min)
   - Uploader "CV Faible" → Score 30/100
   - Montrer les recommandations
   - Uploader "CV Excellent" → Score 85/100
   - Re-uploader le même → Montrer le cache

3. **Explication technique** (3 min)
   - Montrer le code d'analyse (cvAnalyzer.js)
   - Expliquer le système de hash
   - Montrer la table en base de données

4. **Questions/Réponses** (2 min)

---

**Bonne chance pour votre projet ! **
