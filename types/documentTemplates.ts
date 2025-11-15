/**
 * Types et configuration pour les templates de documents PDF (devis/factures)
 */

/**
 * Identifiants des templates disponibles
 */
export type DocumentTemplateId =
  | 'minimal'
  | 'classique'
  | 'bandeBleue'
  | 'premiumNoirOr'
  | 'bleuElectrique'
  | 'graphite'
  | 'ecoVert'
  | 'chantierOrange'
  | 'architecte'
  | 'filigraneLogo';

/**
 * Configuration d'un template de document
 */
export interface DocumentTemplate {
  id: DocumentTemplateId;
  label: string;
  description: string;
}

/**
 * Configuration centralisée de tous les templates disponibles
 */
export const DOCUMENT_TEMPLATES: Record<DocumentTemplateId, DocumentTemplate> = {
  minimal: {
    id: 'minimal',
    label: 'Minimal',
    description: 'Template simple, très neutre, sans fioritures.',
  },
  classique: {
    id: 'classique',
    label: 'Classique',
    description: 'Mise en page standard type administratif.',
  },
  bandeBleue: {
    id: 'bandeBleue',
    label: 'Bande bleue',
    description: 'En-tête bleu avec le logo bien mis en avant.',
  },
  premiumNoirOr: {
    id: 'premiumNoirOr',
    label: 'Premium (noir & or)',
    description: 'Look haut de gamme, bandeau noir et accents dorés.',
  },
  bleuElectrique: {
    id: 'bleuElectrique',
    label: 'Bleu électrique',
    description: 'En-tête bleu électrique, adapté à À Contre Courant.',
  },
  graphite: {
    id: 'graphite',
    label: 'Graphite',
    description: 'Gris foncé, lignes fines, style moderne et sobre.',
  },
  ecoVert: {
    id: 'ecoVert',
    label: 'Éco / vert',
    description: 'Accents verts, idéal pour travaux énergie / éco.',
  },
  chantierOrange: {
    id: 'chantierOrange',
    label: 'Chantier (orange)',
    description: 'Codes couleur BTP, titres orange, très lisible.',
  },
  architecte: {
    id: 'architecte',
    label: 'Architecte',
    description: 'Police fine, beaucoup de blanc, look cabinet d\'étude.',
  },
  filigraneLogo: {
    id: 'filigraneLogo',
    label: 'Logo en filigrane',
    description: 'Template clair avec le logo en fond discret.',
  },
};

/**
 * Template par défaut
 */
export const DEFAULT_TEMPLATE: DocumentTemplateId = 'classique';

/**
 * Liste des templates disponibles (pour itération)
 */
export const AVAILABLE_TEMPLATES: DocumentTemplateId[] = [
  'minimal',
  'classique',
  'bandeBleue',
  'premiumNoirOr',
  'bleuElectrique',
  'graphite',
  'ecoVert',
  'chantierOrange',
  'architecte',
  'filigraneLogo',
];

/**
 * Vérifie si un template ID est valide
 */
export function isValidTemplateId(id: string): id is DocumentTemplateId {
  return AVAILABLE_TEMPLATES.includes(id as DocumentTemplateId);
}

/**
 * Récupère la configuration d'un template par son ID
 */
export function getTemplateConfig(id: DocumentTemplateId): DocumentTemplate {
  return DOCUMENT_TEMPLATES[id];
}

