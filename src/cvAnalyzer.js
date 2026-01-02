// Module d'analyse de CV pour compatibilité ATS
// Système 100% déterministe basé sur des règles

// Mots-clés techniques courants (pour scoring)
const TECH_KEYWORDS = [
  'javascript', 'python', 'java', 'react', 'node', 'sql', 'docker', 'kubernetes',
  'aws', 'azure', 'git', 'agile', 'scrum', 'api', 'rest', 'graphql', 'typescript',
  'html', 'css', 'angular', 'vue', 'mongodb', 'postgresql', 'mysql', 'redis',
  'ci/cd', 'devops', 'linux', 'bash', 'terraform', 'jenkins', 'gitlab'
];

// Verbes d'action valorisés par les ATS
const ACTION_VERBS = [
  'développé', 'conçu', 'créé', 'géré', 'dirigé', 'optimisé', 'amélioré',
  'implémenté', 'déployé', 'maintenu', 'coordonné', 'analysé', 'résolu',
  'automatisé', 'migré', 'intégré', 'testé', 'documenté', 'formé'
];

// Sections attendues dans un CV
const EXPECTED_SECTIONS = [
  'expérience', 'formation', 'compétence', 'diplôme', 'éducation',
  'projet', 'certification', 'langue'
];

/**
 * Analyse un CV et retourne un score de compatibilité ATS
 * @param {string} cvText - Texte extrait du CV
 * @returns {Object} Résultat de l'analyse avec scores et recommandations
 */
function analyzeCVForATS(cvText) {
  const textLower = cvText.toLowerCase();
  const lines = cvText.split('\n').filter(line => line.trim().length > 0);
  
  // 1. ANALYSE FORMAT ET STRUCTURE (25 points)
  let formatScore = 0;
  const formatDetails = [];
  
  // Longueur appropriée (1-3 pages = 300-2000 mots)
  const wordCount = cvText.split(/\s+/).length;
  if (wordCount >= 300 && wordCount <= 2000) {
    formatScore += 8;
    formatDetails.push('Longueur appropriée');
  } else if (wordCount < 300) {
    formatDetails.push('CV trop court (< 300 mots)');
  } else {
    formatDetails.push('CV trop long (> 2000 mots)');
  }
  
  // Sections identifiables
  const sectionsFound = EXPECTED_SECTIONS.filter(section => 
    textLower.includes(section)
  );
  formatScore += Math.min(sectionsFound.length * 2, 10);
  if (sectionsFound.length >= 3) {
    formatDetails.push(`${sectionsFound.length} sections identifiées`);
  }
  
  // Pas de caractères spéciaux problématiques
  const problematicChars = /[★●◆■▪►•]/g;
  if (!problematicChars.test(cvText)) {
    formatScore += 4;
    formatDetails.push('Pas de caractères spéciaux problématiques');
  }
  
  // Présence de dates (format année)
  const datePattern = /\b(19|20)\d{2}\b/g;
  const dates = cvText.match(datePattern);
  if (dates && dates.length >= 2) {
    formatScore += 3;
    formatDetails.push('Dates formatées correctement');
  }
  
  // 2. ANALYSE CONTENU TEXTUEL (25 points)
  let contentScore = 0;
  const contentDetails = [];
  
  // Mots-clés techniques présents
  const techKeywordsFound = TECH_KEYWORDS.filter(keyword => 
    textLower.includes(keyword)
  );
  contentScore += Math.min(techKeywordsFound.length * 1.5, 10);
  if (techKeywordsFound.length > 0) {
    contentDetails.push(`${techKeywordsFound.length} compétences techniques détectées`);
  }
  
  // Verbes d'action
  const actionVerbsFound = ACTION_VERBS.filter(verb => 
    textLower.includes(verb)
  );
  contentScore += Math.min(actionVerbsFound.length * 1, 8);
  if (actionVerbsFound.length > 0) {
    contentDetails.push(`${actionVerbsFound.length} verbes d'action utilisés`);
  }
  
  // Coordonnées (email, téléphone)
  const hasEmail = /@/.test(cvText);
  const hasPhone = /(\+33|0)[1-9](\s?\d{2}){4}/.test(cvText);
  if (hasEmail && hasPhone) {
    contentScore += 7;
    contentDetails.push('Coordonnées complètes');
  } else if (hasEmail || hasPhone) {
    contentScore += 3;
    contentDetails.push('Coordonnées partielles');
  }
  
  // 3. ANALYSE LISIBILITÉ (25 points)
  let readabilityScore = 0;
  const readabilityDetails = [];
  
  // Longueur moyenne des lignes (pas trop longues)
  const avgLineLength = lines.reduce((sum, line) => sum + line.length, 0) / lines.length;
  if (avgLineLength < 80) {
    readabilityScore += 8;
    readabilityDetails.push('Lignes de longueur appropriée');
  }
  
  // Hiérarchie (titres en majuscules ou avec ponctuation)
  const titlesPattern = /^[A-ZÀÉÈÊË\s]{3,}$/;
  const titlesFound = lines.filter(line => titlesPattern.test(line.trim()));
  if (titlesFound.length >= 2) {
    readabilityScore += 10;
    readabilityDetails.push('Hiérarchie claire avec titres');
  }
  
  // Pas de lignes trop courtes (éviter les colonnes)
  const shortLines = lines.filter(line => line.trim().length < 10 && line.trim().length > 0);
  if (shortLines.length < lines.length * 0.3) {
    readabilityScore += 7;
    readabilityDetails.push('Structure linéaire (pas de colonnes)');
  }
  
  // 4. OPTIMISATION MOTS-CLÉS (25 points)
  let keywordScore = 0;
  const keywordDetails = [];
  
  // Densité de mots-clés (ni trop, ni trop peu)
  const keywordDensity = (techKeywordsFound.length / wordCount) * 100;
  if (keywordDensity >= 1 && keywordDensity <= 5) {
    keywordScore += 10;
    keywordDetails.push('Densité de mots-clés optimale');
  } else if (keywordDensity > 0) {
    keywordScore += 5;
    keywordDetails.push('Densité de mots-clés acceptable');
  }
  
  // Résultats quantifiés (chiffres + %)
  const quantifiedResults = cvText.match(/\d+%|\d+\s*(ans|mois|projets|utilisateurs|clients)/gi);
  if (quantifiedResults && quantifiedResults.length >= 3) {
    keywordScore += 8;
    keywordDetails.push('Résultats quantifiés présents');
  }
  
  // Certifications ou diplômes mentionnés
  const certificationKeywords = ['certification', 'diplôme', 'licence', 'master', 'bac'];
  const hasCertifications = certificationKeywords.some(cert => textLower.includes(cert));
  if (hasCertifications) {
    keywordScore += 7;
    keywordDetails.push('Formations/certifications mentionnées');
  }
  
  // CALCUL SCORE TOTAL
  const scoreTotal = Math.min(formatScore + contentScore + readabilityScore + keywordScore, 100);
  
  // GÉNÉRATION DES POINTS FORTS
  const pointsForts = [];
  if (formatScore >= 20) pointsForts.push('Excellente structure et format');
  if (contentScore >= 20) pointsForts.push('Contenu riche et pertinent');
  if (readabilityScore >= 20) pointsForts.push('Très bonne lisibilité');
  if (keywordScore >= 20) pointsForts.push('Optimisation mots-clés efficace');
  if (techKeywordsFound.length >= 10) pointsForts.push(`${techKeywordsFound.length} compétences techniques identifiées`);
  if (actionVerbsFound.length >= 8) pointsForts.push('Bon usage de verbes d\'action');
  
  // GÉNÉRATION DES POINTS À AMÉLIORER
  const pointsAmelioration = [];
  if (formatScore < 15) pointsAmelioration.push('Améliorer la structure (ajouter des sections claires)');
  if (contentScore < 15) pointsAmelioration.push('Enrichir le contenu avec plus de mots-clés métier');
  if (readabilityScore < 15) pointsAmelioration.push('Simplifier la mise en page (éviter colonnes/tableaux)');
  if (keywordScore < 15) pointsAmelioration.push('Ajouter des résultats quantifiés (chiffres, %)');
  if (techKeywordsFound.length < 5) pointsAmelioration.push('Lister plus de compétences techniques');
  if (!hasEmail || !hasPhone) pointsAmelioration.push('Ajouter coordonnées complètes (email + téléphone)');
  
  // GÉNÉRATION DES RECOMMANDATIONS
  const recommandations = [];
  if (scoreTotal >= 80) {
    recommandations.push('Excellent CV ! Compatible avec la plupart des ATS');
    recommandations.push('Continuez à mettre à jour vos compétences régulièrement');
  } else if (scoreTotal >= 60) {
    recommandations.push('Bon CV, quelques ajustements recommandés');
    recommandations.push('Ajoutez plus de résultats chiffrés pour renforcer l\'impact');
  } else if (scoreTotal >= 40) {
    recommandations.push('CV acceptable mais nécessite des améliorations');
    recommandations.push('Restructurez avec des sections claires (Expérience, Formation, Compétences)');
    recommandations.push('Utilisez plus de verbes d\'action et de mots-clés métier');
  } else {
    recommandations.push('CV nécessite une refonte importante');
    recommandations.push('Utilisez un format simple et linéaire (pas de colonnes)');
    recommandations.push('Ajoutez des sections claires et des mots-clés pertinents');
  }
  
  return {
    score_total: Math.round(scoreTotal),
    format_structure: Math.round(formatScore),
    contenu_textuel: Math.round(contentScore),
    lisibilite: Math.round(readabilityScore),
    optimisation_mots_cles: Math.round(keywordScore),
    points_forts: pointsForts.length > 0 ? pointsForts : ['Aucun point fort majeur détecté'],
    points_amelioration: pointsAmelioration.length > 0 ? pointsAmelioration : ['Continuez vos efforts'],
    recommandations: recommandations,
    details: {
      format: formatDetails,
      content: contentDetails,
      readability: readabilityDetails,
      keywords: keywordDetails,
      stats: {
        word_count: wordCount,
        tech_keywords: techKeywordsFound.length,
        action_verbs: actionVerbsFound.length,
        sections: sectionsFound.length
      }
    }
  };
}

module.exports = { analyzeCVForATS };
