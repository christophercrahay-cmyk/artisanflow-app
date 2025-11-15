/**
 * Utilitaires de mapping adaptatif pour l'import de clients
 * Détecte automatiquement les colonnes et propose un mapping intelligent
 */

/**
 * En-tête normalisé avec nom original et nom normalisé
 */
export interface NormalizedHeader {
  original: string;
  normalized: string;
  index: number;
}

/**
 * Mapping d'un champ client vers une colonne du fichier
 */
export interface ClientFieldMapping {
  name?: string; // Nom de la colonne (ou null pour ignorer)
  phone?: string;
  email?: string;
  address?: string;
  postalCode?: string;
  city?: string;
}

/**
 * Résultat de la détection de colonnes
 */
export interface DetectedColumns {
  availableHeaders: NormalizedHeader[];
  autoMapping: ClientFieldMapping;
}

/**
 * Client parsé depuis une ligne avec mapping
 */
export interface ParsedClient {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  postalCode?: string;
  city?: string;
}

/**
 * Normalise un nom de colonne pour la comparaison
 * - trim
 * - minuscule
 * - suppression accents
 * - remplacement espaces par underscore
 */
export function normalizeHeader(header: string): string {
  if (!header) return '';
  return header
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/\s+/g, '_'); // Remplace espaces par underscore
}

/**
 * Détecte les colonnes disponibles et propose un mapping automatique
 */
export function detectColumns(headers: string[]): DetectedColumns {
  // Normaliser tous les headers
  const availableHeaders: NormalizedHeader[] = headers.map((header, index) => ({
    original: header,
    normalized: normalizeHeader(header),
    index,
  }));

  // Règles d'auto-mapping (par ordre de priorité)
  const autoMapping: ClientFieldMapping = {};

  // name : priorité "nom complet" > "nom" > "raison sociale"
  const nameCandidates = availableHeaders.filter((h) => {
    const n = h.normalized;
    return (
      n.includes('nom_complet') ||
      n.includes('nomcomplet') ||
      (n.includes('nom') && !n.includes('prenom')) ||
      n.includes('raison_sociale') ||
      n.includes('raisonsociale')
    );
  });
  if (nameCandidates.length > 0) {
    // Prioriser "nom_complet" ou "nom complet"
    const nomComplet = nameCandidates.find((h) =>
      h.normalized.includes('nom_complet') || h.normalized.includes('nomcomplet')
    );
    autoMapping.name = nomComplet?.original || nameCandidates[0].original;
  }

  // phone : "telephone" > "tel" > "mobile"
  const phoneCandidates = availableHeaders.filter((h) => {
    const n = h.normalized;
    return (
      n.includes('telephone') ||
      n.includes('tel') ||
      n.includes('mobile') ||
      n.includes('portable')
    );
  });
  if (phoneCandidates.length > 0) {
    const telephone = phoneCandidates.find((h) => h.normalized.includes('telephone'));
    autoMapping.phone = telephone?.original || phoneCandidates[0].original;
  }

  // email : "email" > "courriel" > "mail"
  const emailCandidates = availableHeaders.filter((h) => {
    const n = h.normalized;
    return n.includes('email') || n.includes('courriel') || n.includes('mail');
  });
  if (emailCandidates.length > 0) {
    const email = emailCandidates.find((h) => h.normalized.includes('email'));
    autoMapping.email = email?.original || emailCandidates[0].original;
  }

  // address : "adresse"
  const addressCandidates = availableHeaders.filter((h) => {
    const n = h.normalized;
    return n.includes('adresse') || n.includes('rue') || n.includes('street');
  });
  if (addressCandidates.length > 0) {
    autoMapping.address = addressCandidates[0].original;
  }

  // postalCode : "code_postal" > "cp"
  const postalCodeCandidates = availableHeaders.filter((h) => {
    const n = h.normalized;
    return (
      n.includes('code_postal') ||
      n.includes('codepostal') ||
      n.includes('cp') ||
      n.includes('zip')
    );
  });
  if (postalCodeCandidates.length > 0) {
    const codePostal = postalCodeCandidates.find(
      (h) => h.normalized.includes('code_postal') || h.normalized.includes('codepostal')
    );
    autoMapping.postalCode = codePostal?.original || postalCodeCandidates[0].original;
  }

  // city : "ville" > "localite"
  const cityCandidates = availableHeaders.filter((h) => {
    const n = h.normalized;
    return n.includes('ville') || n.includes('localite') || n.includes('commune');
  });
  if (cityCandidates.length > 0) {
    autoMapping.city = cityCandidates[0].original;
  }

  return {
    availableHeaders,
    autoMapping,
  };
}

/**
 * Applique un mapping à une ligne brute pour produire un ParsedClient
 * @param row - Ligne brute du fichier (objet avec clés = noms de colonnes)
 * @param mapping - Mapping à appliquer
 * @returns ParsedClient ou null si le nom est manquant
 */
export function applyMapping(row: Record<string, any>, mapping: ClientFieldMapping): ParsedClient | null {
  const name = mapping.name ? (row[mapping.name] || '').toString().trim() : '';
  
  // Nom obligatoire
  if (!name) {
    return null;
  }

  const parsed: ParsedClient = {
    name,
  };

  if (mapping.phone) {
    const phone = (row[mapping.phone] || '').toString().trim();
    if (phone) parsed.phone = phone;
  }

  if (mapping.email) {
    const email = (row[mapping.email] || '').toString().trim();
    if (email) parsed.email = email;
  }

  if (mapping.address) {
    const address = (row[mapping.address] || '').toString().trim();
    if (address) parsed.address = address;
  }

  if (mapping.postalCode) {
    const postalCode = (row[mapping.postalCode] || '').toString().trim();
    if (postalCode) parsed.postalCode = postalCode;
  }

  if (mapping.city) {
    const city = (row[mapping.city] || '').toString().trim();
    if (city) parsed.city = city;
  }

  return parsed;
}

/**
 * Calcule une signature stable des headers pour la mémoire utilisateur
 * @param headers - Liste des en-têtes
 * @returns Signature (hash simple basé sur les headers triés)
 */
export function computeHeadersSignature(headers: string[]): string {
  // Trier et normaliser pour avoir une signature stable
  const normalized = headers.map(normalizeHeader).sort().join('|');
  
  // Hash simple (pour production, utiliser crypto.subtle ou une lib)
  // Ici on utilise une fonction de hash simple basée sur le contenu
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return `headers_${Math.abs(hash).toString(36)}`;
}

