/**
 * Génère un aperçu HTML d'un template avec des données d'exemple
 * Utilisé pour afficher un aperçu du template dans le modal de sélection
 */

// Note: Ce fichier n'est pas utilisé actuellement mais peut servir pour générer des aperçus HTML
// import { buildDevisHTML } from './utils/pdf';

/**
 * Génère un aperçu HTML d'un template avec des données d'exemple
 * @param {string} templateId - ID du template à prévisualiser
 * @returns {string} HTML de l'aperçu
 */
export function generateTemplatePreviewHTML(templateId) {
  // Données d'exemple pour l'aperçu
  const exampleData = {
    number: 'DE-2025-0001',
    dateISO: new Date().toLocaleDateString('fr-FR'),
    company: {
      name: 'Mon Entreprise',
      siret: '123 456 789 00012',
      address: '123 rue de la République',
      phone: '01 23 45 67 89',
      email: 'contact@entreprise.fr',
    },
    client: {
      name: 'Jean Dupont',
      address: '45 avenue des Champs',
      phone: '06 12 34 56 78',
      email: 'jean.dupont@email.fr',
    },
    project: {
      title: 'Rénovation salle de bain',
      address: '45 avenue des Champs',
    },
    lignes: [
      {
        designation: 'Carrelage mural',
        quantity: 15,
        unit: 'm²',
        unitPriceHT: 45.00,
      },
      {
        designation: 'Carrelage sol',
        quantity: 8,
        unit: 'm²',
        unitPriceHT: 35.00,
      },
      {
        designation: 'Main d\'œuvre',
        quantity: 12,
        unit: 'h',
        unitPriceHT: 45.00,
      },
    ],
    tva: 20,
    logoUrl: null,
    template: templateId,
  };

  return buildDevisHTML(exampleData);
}

