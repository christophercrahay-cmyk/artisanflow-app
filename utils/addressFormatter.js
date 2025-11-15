/**
 * Utility pour formater les adresses client
 */

/**
 * Formate une adresse complète en string
 * @param {Object} params - Les champs d'adresse
 * @returns {string} Adresse formatée
 */
export function formatAddress({ address, postalCode, city }) {
  const parts = [address || ''];
  
  if (postalCode && city) {
    parts.push(`${postalCode} ${city}`);
  } else if (postalCode) {
    parts.push(postalCode);
  } else if (city) {
    parts.push(city);
  }
  
  return parts.filter(Boolean).join(', ');
}

/**
 * Prépare les données client pour insertion Supabase
 * Gère le cas où postal_code/city existent ou non dans le schéma
 * Ajoute automatiquement user_id si manquant
 * @param {Object} clientData - Données client
 * @param {string} userId - ID de l'utilisateur (optionnel, sera récupéré si manquant)
 * @returns {Promise<Object>} Données prêtes pour Supabase avec user_id
 */
export async function prepareClientData(clientData, userId = null) {
  const { address, postalCode, city, ...rest } = clientData;
  
  // Tenter d'inclure les colonnes si elles existent
  // Si erreur, Supabase retournera l'erreur et on concatènera
  const formattedAddress = formatAddress({ address, postalCode, city });
  
  // Récupérer user_id si non fourni
  let finalUserId = userId;
  if (!finalUserId) {
    try {
      const { getCurrentUser } = await import('./auth');
      const user = await getCurrentUser();
      if (user) {
        finalUserId = user.id;
      }
    } catch (err) {
      console.warn('[prepareClientData] Impossible de récupérer user_id:', err);
    }
  }
  
  return {
    ...rest,
    address: formattedAddress || null,
    user_id: finalUserId, // Nécessaire pour RLS
  };
}

