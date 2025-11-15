/**
 * Types pour le système d'import universel basé sur GPT
 * Compatible avec tous les formats d'export (Obat, Tolteck, EBP, Excel, etc.)
 */

/**
 * Résumé des entités détectées dans le fichier
 */
export interface ImportSummary {
  clients: number;
  projects: number;
  quotes: number;
  invoices: number;
  line_items: number;
  articles: number;
  notes: number;
  unknown_rows: number;
}

/**
 * Client détecté dans le fichier
 */
export interface ImportClient {
  external_id?: string | null;
  name: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  postal_code?: string | null;
  city?: string | null;
  country?: string | null;
  type?: 'particulier' | 'professionnel' | null;
  status?: 'client' | 'prospect' | 'contact' | null;
}

/**
 * Projet/Chantier détecté dans le fichier
 */
export interface ImportProject {
  external_id?: string | null;
  title: string;
  client_name?: string | null;
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
}

/**
 * Devis détecté dans le fichier
 */
export interface ImportQuote {
  external_id?: string | null;
  title?: string | null;
  client_name?: string | null;
  project_title?: string | null;
  date?: string | null;
  total_ht?: number | null;
  total_ttc?: number | null;
  currency?: string | null;
}

/**
 * Facture détectée dans le fichier
 */
export interface ImportInvoice {
  external_id?: string | null;
  client_name?: string | null;
  project_title?: string | null;
  date?: string | null;
  total_ht?: number | null;
  total_ttc?: number | null;
  currency?: string | null;
}

/**
 * Ligne de devis/facture détectée
 */
export interface ImportLineItem {
  parent_type?: 'quote' | 'invoice' | null;
  parent_ref?: string | null;
  description: string;
  quantity?: number | null;
  unit?: string | null;
  unit_price_ht?: number | null;
  total_ht?: number | null;
  vat_rate?: number | null;
}

/**
 * Article/Catalogue détecté dans le fichier
 */
export interface ImportArticle {
  reference?: string | null;
  label: string;
  family?: string | null;
  unit?: string | null;
  unit_price_ht?: number | null;
  vat_rate?: number | null;
}

/**
 * Note détectée dans le fichier
 */
export interface ImportNote {
  content: string;
}

/**
 * Entités détectées dans le fichier
 */
export interface ImportEntities {
  clients: ImportClient[];
  projects: ImportProject[];
  quotes: ImportQuote[];
  invoices: ImportInvoice[];
  line_items: ImportLineItem[];
  articles: ImportArticle[];
  notes: ImportNote[];
}

/**
 * Analyse complète retournée par /ai/import/analyze
 */
export interface ImportAnalysis {
  summary: ImportSummary;
  entities: ImportEntities;
}

/**
 * Résultat de l'import (/ai/import/process)
 */
export interface ImportProcessResult {
  status: 'ok' | 'error';
  imported?: {
    clients: number;
    projects: number;
    quotes: number;
    invoices: number;
    line_items: number;
    articles: number;
    notes: number;
  };
  error?: string;
  message?: string;
}

/**
 * Payload pour /ai/import/analyze
 */
export interface ImportAnalyzeRequest {
  fileUrl?: string;
  fileId?: string;
  bucketName?: string;
}

/**
 * Payload pour /ai/import/process
 */
export interface ImportProcessRequest {
  analysis: ImportAnalysis;
  userId?: string; // Optionnel si récupéré depuis l'auth
}

