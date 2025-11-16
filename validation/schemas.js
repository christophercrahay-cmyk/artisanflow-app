import { z } from 'zod';

/**
 * Schémas de validation Zod pour ArtisanFlow
 */

// ========================================
// SCHEMAS RÉUTILISABLES
// ========================================

export const phoneSchema = z
  .string()
  .regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Numéro de téléphone français invalide')
  .optional()
  .or(z.literal(''));

export const emailSchema = z
  .string()
  .email('Email invalide')
  .optional()
  .or(z.literal(''));

export const uuidSchema = z.string().uuid('UUID invalide');

export const dateSchema = z.coerce.date();

export const positiveNumberSchema = z.number().positive('Doit être positif');

// ========================================
// CLIENT
// ========================================

export const clientSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  phone: phoneSchema,
  email: emailSchema,
  address: z.string().min(5, "L'adresse doit contenir au moins 5 caractères"),
  postalCode: z
    .string()
    .regex(/^\d{5}$/, 'Code postal invalide (5 chiffres)')
    .optional()
    .or(z.literal('')),
  city: z.string().optional(),
  user_id: uuidSchema.optional(),
});

export const clientUpdateSchema = clientSchema.partial();

// ========================================
// PROJECT
// ========================================

export const projectSchema = z.object({
  client_id: uuidSchema,
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  address: z.string().optional(),
  status: z.enum(['active', 'pause', 'completed']).default('active'),
  status_text: z.string().optional(),
  notes: z.string().optional(),
  user_id: uuidSchema.optional(),
});

export const projectUpdateSchema = projectSchema.partial().omit({ client_id: true });

// ========================================
// PHOTO
// ========================================

export const photoSchema = z.object({
  project_id: uuidSchema.optional(),
  client_id: uuidSchema,
  url: z.string().url('URL invalide'),
  user_id: uuidSchema.optional(),
});

// ========================================
// NOTE VOCALE
// ========================================

export const noteSchema = z.object({
  project_id: uuidSchema,
  client_id: uuidSchema,
  type: z.enum(['voice', 'text']).default('voice'),
  storage_path: z.string().optional(),
  transcription: z.string().optional(),
  duration_ms: z.number().int().positive().optional(),
  analysis_data: z.string().optional(), // JSON stringifié
  user_id: uuidSchema.optional(),
});

// ========================================
// DEVIS
// ========================================

export const devisSchema = z.object({
  project_id: uuidSchema,
  client_id: uuidSchema,
  numero: z.string().min(1, 'Numéro requis'),
  date_creation: dateSchema.optional(),
  date_validite: dateSchema.optional(),
  montant_ht: z.number().nonnegative('Montant HT doit être positif ou nul'),
  tva_percent: z.number().min(0).max(100, 'TVA doit être entre 0 et 100'),
  montant_ttc: z.number().nonnegative('Montant TTC doit être positif ou nul'),
  statut: z.enum(['brouillon', 'envoye', 'accepte', 'refuse']).default('brouillon'),
  notes: z.string().optional(),
  transcription: z.string().optional(),
  pdf_url: z.string().url().optional().or(z.literal('')),
  user_id: uuidSchema.optional(),
});

export const devisUpdateSchema = devisSchema.partial().omit({ 
  project_id: true, 
  client_id: true 
});

// ========================================
// FACTURE
// ========================================

export const factureSchema = z.object({
  project_id: uuidSchema,
  client_id: uuidSchema,
  devis_id: uuidSchema.optional(),
  numero: z.string().min(1, 'Numéro requis'),
  date_creation: dateSchema.optional(),
  date_echeance: dateSchema.optional(),
  montant_ht: z.number().nonnegative('Montant HT doit être positif ou nul'),
  tva_percent: z.number().min(0).max(100, 'TVA doit être entre 0 et 100'),
  montant_ttc: z.number().nonnegative('Montant TTC doit être positif ou nul'),
  statut: z.enum(['brouillon', 'envoye', 'paye', 'impayee']).default('brouillon'),
  notes: z.string().optional(),
  transcription: z.string().optional(),
  pdf_url: z.string().url().optional().or(z.literal('')),
  user_id: uuidSchema.optional(),
});

export const factureUpdateSchema = factureSchema.partial().omit({ 
  project_id: true, 
  client_id: true 
});

// ========================================
// AUTH
// ========================================

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

export const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  passwordConfirm: z.string(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['passwordConfirm'],
});

// ========================================
// HELPER - VALIDER DES DONNÉES
// ========================================

/**
 * Valide des données avec un schéma Zod
 * @param {object} schema - Schéma Zod
 * @param {object} data - Données à valider
 * @returns {object} { success: boolean, data?: object, errors?: object }
 */
export function validate(schema, data) {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = {};
      error.errors.forEach(err => {
        const field = err.path.join('.');
        errors[field] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { _error: 'Erreur de validation inconnue' } };
  }
}

/**
 * Valide de manière asynchrone (avec .parseAsync)
 */
export async function validateAsync(schema, data) {
  try {
    const validData = await schema.parseAsync(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = {};
      error.errors.forEach(err => {
        const field = err.path.join('.');
        errors[field] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { _error: 'Erreur de validation inconnue' } };
  }
}

