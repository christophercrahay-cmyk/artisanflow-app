// utils/ai_quote_generator.js
// Module d'analyse intelligente pour générer des devis à partir de transcriptions vocales

/**
 * Base de données de prix moyens par prestation
 * (prix unitaire HT en euros)
 */
const PRICE_DATABASE = {
  // Électricité
  'prise': 15.0,
  'prises': 15.0,
  'prise électrique': 15.0,
  'interrupteur': 12.0,
  'interrupteurs': 12.0,
  'va-et-vient': 18.0,
  'double-allumage': 22.0,
  'spot led': 25.0,
  'spots led': 25.0,
  'spot': 25.0,
  'spots': 25.0,
  'plafonnier': 35.0,
  'applique': 45.0,
  'lustre': 120.0,
  
  // Plomberie
  'robinet': 80.0,
  'mitigeur': 120.0,
  'évier': 200.0,
  'lavabo': 150.0,
  'douche': 350.0,
  'baignoire': 800.0,
  'wc': 250.0,
  'radiateur': 300.0,
  
  // Main d'œuvre (par heure)
  'heure': 45.0,
  'heures': 45.0,
  'jour': 300.0,
  'jours': 300.0,
  'main d\'œuvre': 45.0,
  'main d\'oeuvre': 45.0,
  
  // Divers
  'peinture': 25.0,
  'carrelage': 35.0,
  'parquet': 50.0,
  'placo': 20.0,
  'isolation': 15.0,
  'fenêtre': 400.0,
  'porte': 250.0,
};

/**
 * Analyse une transcription vocale et extrait les prestations
 * @param {string} transcription - Le texte transcrit par Whisper
 * @returns {Array} Tableau d'objets { designation, quantity, unitPriceHT, unit }
 */
export function extractServicesFromTranscription(transcription) {
  if (!transcription || typeof transcription !== 'string') {
    console.log('[extractServices] Transcription vide ou invalide');
    return [];
  }

  const text = transcription.toLowerCase().trim();
  console.log('[extractServices] Analyse de:', text);
  
  // Expressions régulières pour détecter les quantités et prestations
  const quantityPatterns = [
    /(\d+)\s*(prise|prises)/gi,
    /(remplacer|remplacement)\s+(\d+)\s+(prise|prises)/gi,
    /(\d+)\s*(spot|spots)\s*(led)?/gi,
    /(\d+)\s*(interrupteur|interrupteurs)/gi,
    /(\d+)\s*(va-et-vient)/gi,
    /(installer|installation)\s+(\d+)\s+(interrupteur|interrupteurs)/gi,
    /(\d+)\s*(heure|heures)/gi,
    /(\d+)\s*(jour|jours)/gi,
    /(\d+)\s*(robinet|robinets)/gi,
    /(\d+)\s*(mitigeur|mitigeurs)/gi,
    /(\d+)\s*(évier|éviers)/gi,
    /(\d+)\s*(lavabo|lavabos)/gi,
    /(\d+)\s*(wc)/gi,
    /(\d+)\s*(radiateur|radiateurs)/gi,
    /(\d+)\s*(fenêtre|fenêtres)/gi,
    /(\d+)\s*(porte|portes)/gi,
    /(\d+)\s*(placo)/gi,
    /(\d+)\s*(carrelage)/gi,
    /(\d+)\s*(parquet)/gi,
    /(\d+)\s*(peinture)/gi,
    /(remplacement|pose|installation)\s+(de\s+)?(\d+)\s+(\w+)/gi,
    /(\d+)\s*(m2|m²)/gi, // Mètres carrés
    // Support français
    /(\d+)\s*(prise électrique|prises électriques)/gi,
    /(\d+)\s*(heures? de main d'œuvre)/gi,
  ];

  const services = [];
  const foundItems = new Set(); // Pour éviter les doublons

  quantityPatterns.forEach((pattern) => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      // Gérer les différents formats de regex (groupes variables)
      // match[0] = match complet, match[1+] = groupes capturés
      // Exemple: /(\d+)\s*(prise)/ -> match[1]=qty, match[2]=keyword
      // Exemple: /(remplacer)\s+(\d+)\s+(prise)/ -> match[1]=verbe, match[2]=qty, match[3]=keyword
      
      // Détecter automatiquement quel groupe contient la quantité
      let quantityStr = null;
      let keyword = '';
      
      // Chercher le groupe avec des chiffres (quantité)
      for (let i = 1; i < match.length; i++) {
        if (match[i] && /^\d+$/.test(match[i])) {
          if (!quantityStr) {
            quantityStr = match[i];
            // Le keyword est souvent dans match[i+1] (après le nombre)
            keyword = match[i + 1] || keyword;
          }
        } else if (match[i] && /^[a-zéèêàâçù]+/.test(match[i]) && i > 1 && !keyword) {
          // Mots français, probablement keyword (prendre le premier mot non numérique)
          keyword = match[i];
        }
      }
      
      const quantity = quantityStr ? parseInt(quantityStr, 10) : NaN;
      const unit = match[4] === 'm2' || match[4] === 'm²' ? 'm²' : 
                   keyword.match(/(heure|heures|jour|jours)/i) ? keyword : 'unité';
      
      console.log(`[extractServices] Match trouvé: qty=${quantity}, keyword="${keyword}", match=${JSON.stringify(match)}`);
      
      // Trouver le prix unitaire correspondant
      let unitPriceHT = null;
      for (const [key, price] of Object.entries(PRICE_DATABASE)) {
        if (keyword.includes(key) || key.includes(keyword)) {
          unitPriceHT = price;
          break;
        }
      }

      // Si aucun prix trouvé, utiliser un prix moyen par défaut
      if (!unitPriceHT) {
        unitPriceHT = keyword.match(/(heure|heures|jour|jours)/i) 
          ? PRICE_DATABASE.heure 
          : 30.0; // Prix moyen par défaut
      }

      // Créer une désignation lisible
      const designation = keyword.match(/(heure|heures)/i)
        ? 'Main d\'œuvre'
        : keyword.match(/(jour|jours)/i)
        ? 'Main d\'œuvre (jour)'
        : unit === 'm²'
        ? 'Travaux'
        : `${keyword.charAt(0).toUpperCase() + keyword.slice(1)}`;

      // Valider avant d'ajouter
      if (isNaN(quantity) || quantity <= 0) {
        console.warn(`[extractServices] Quantité invalide ignorée: ${quantity}`);
        continue; // Ignorer ce match
      }
      
      // Générer une clé unique pour éviter les doublons
      const uniqueKey = `${designation}-${quantity}-${unitPriceHT}`;
      if (!foundItems.has(uniqueKey)) {
        foundItems.add(uniqueKey);
        services.push({
          designation,
          quantity,
          unitPriceHT,
          unit,
        });
      }
    }
  });

  // Recherche de prix totaux mentionnés dans le texte
  const pricePattern = /(\d+)\s*(euro|euros|€|eur)/gi;
  if (services.length === 0 && pricePattern.test(text)) {
    // Si on trouve un prix mais aucune prestation, créer un devis générique
    const priceMatch = text.match(/(\d+)\s*(euro|euros|€|eur)/i);
    if (priceMatch) {
      const totalPrice = parseFloat(priceMatch[1]);
      services.push({
        designation: 'Prestation chantier',
        quantity: 1,
        unitPriceHT: totalPrice,
        unit: 'lot',
      });
    }
  }

  console.log('[extractServices] Résultat:', services.length, 'prestation(s) détectée(s)');
  if (services.length > 0) {
    console.log('[extractServices] Détails:', services);
  }
  return services;
}

/**
 * Calcule les montants HT, TVA et TTC
 * @param {Array} services - Tableau de prestations
 * @param {number} tvaPercent - Pourcentage de TVA (défaut: 20%)
 * @returns {Object} { totalHT, tva, totalTTC }
 */
export function calculateTotals(services, tvaPercent = 20) {
  const totalHT = services.reduce((sum, service) => {
    return sum + (service.quantity * service.unitPriceHT);
  }, 0);

  const tva = (totalHT * tvaPercent) / 100;
  const totalTTC = totalHT + tva;

  return {
    totalHT: parseFloat(totalHT.toFixed(2)),
    tva: parseFloat(tva.toFixed(2)),
    totalTTC: parseFloat(totalTTC.toFixed(2)),
  };
}

/**
 * Génère un devis automatique complet à partir d'une transcription
 * @param {string} transcription - Le texte transcrit
 * @param {string} projectId - UUID du chantier
 * @param {string} clientId - UUID du client
 * @param {number} tvaPercent - Pourcentage de TVA (défaut: 20%)
 * @returns {Object|null} { services, totals } ou null si aucune prestation détectée
 */
export function generateQuoteFromTranscription(transcription, projectId, clientId, tvaPercent = 20) {
  const services = extractServicesFromTranscription(transcription);
  
  if (services.length === 0) {
    return null;
  }

  const totals = calculateTotals(services, tvaPercent);

  return {
    services,
    totals,
  };
}

/**
 * Génère un numéro de devis unique (format: DEV-YYYY-XXXX)
 * @returns {string}
 */
export function generateQuoteNumber() {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `DEV-${year}-${randomSuffix}`;
}

