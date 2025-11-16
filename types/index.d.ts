/**
 * Types TypeScript globaux pour ArtisanFlow
 */

// ========================================
// DATABASE TYPES (Supabase)
// ========================================

export interface Client {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address: string;
  postalCode?: string | null;
  city?: string | null;
  user_id?: string | null;
  created_at?: string;
}

export interface Project {
  id: string;
  client_id: string;
  name: string;
  address?: string | null;
  status: 'active' | 'pause' | 'completed';
  status_text?: string | null;
  notes?: string | null;
  user_id?: string | null;
  created_at?: string;
}

export interface Photo {
  id: string;
  project_id?: string | null;
  client_id: string;
  url: string;
  user_id?: string | null;
  created_at?: string;
}

export interface Note {
  id: string;
  project_id: string;
  client_id: string;
  type: 'voice' | 'text';
  storage_path?: string | null;
  transcription?: string | null;
  duration_ms?: number | null;
  analysis_data?: string | null;
  user_id?: string | null;
  created_at?: string;
}

export interface Devis {
  id: string;
  project_id: string;
  client_id: string;
  numero: string;
  date_creation?: string;
  date_validite?: string | null;
  montant_ht: number;
  tva_percent: number;
  montant_ttc: number;
  statut: 'brouillon' | 'envoye' | 'accepte' | 'refuse';
  notes?: string | null;
  transcription?: string | null;
  pdf_url?: string | null;
  user_id?: string | null;
  created_at?: string;
}

export interface Facture {
  id: string;
  project_id: string;
  client_id: string;
  devis_id?: string | null;
  numero: string;
  date_creation?: string;
  date_echeance?: string | null;
  montant_ht: number;
  tva_percent: number;
  montant_ttc: number;
  statut: 'brouillon' | 'envoye' | 'paye' | 'impayee';
  notes?: string | null;
  transcription?: string | null;
  pdf_url?: string | null;
  user_id?: string | null;
  created_at?: string;
}

export interface BrandSettings {
  id: string;
  logo_url?: string | null;
  primary_color: string;
  secondary_color: string;
  company_name: string;
  company_siret?: string | null;
  company_address?: string | null;
  company_phone?: string | null;
  company_email?: string | null;
  tva_default: number;
  template_default: 'minimal' | 'classique' | 'bandeBleue' | 'premiumNoirOr' | 'bleuElectrique' | 'graphite' | 'ecoVert' | 'chantierOrange' | 'architecte' | 'filigraneLogo';
  devis_prefix: string;
  facture_prefix: string;
  user_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

// ========================================
// STORE TYPES
// ========================================

export interface AppState {
  currentClient: Client | null;
  currentProject: Project | null;
  clients: Client[];
  projects: Project[];
  photos: Photo[];
  notes: Note[];
  devis: Devis[];
  factures: Facture[];
  loadingClients: boolean;
  loadingProjects: boolean;
  loadingPhotos: boolean;
  loadingNotes: boolean;
  loadingDevis: boolean;
  loadingFactures: boolean;
  error: Error | null;
  user: User | null;
}

export interface AppActions {
  setCurrentClient: (client: Client | null) => void;
  setCurrentProject: (project: Project | null) => void;
  setUser: (user: User | null) => void;
  setError: (error: Error | null) => void;
  clearError: () => void;
  clearClient: () => void;
  clearProject: () => void;
  clearAll: () => void;
  loadClients: () => Promise<Client[]>;
  addClient: (data: Partial<Client>) => Promise<Client>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<Client>;
  deleteClient: (id: string) => Promise<void>;
  loadProjects: (clientId?: string) => Promise<Project[]>;
  addProject: (data: Partial<Project>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  loadPhotos: (projectId: string) => Promise<Photo[]>;
  loadNotes: (projectId: string) => Promise<Note[]>;
  requireClient: () => Client;
  requireProject: () => Project;
}

export type AppStore = AppState & AppActions;

// ========================================
// AUTH TYPES
// ========================================

export interface User {
  id: string;
  email?: string;
  name?: string;
  created_at?: string;
}

export interface AuthSession {
  user: User;
  access_token: string;
  refresh_token?: string;
}

// ========================================
// NAVIGATION TYPES
// ========================================

import { PendingCapture } from './capture';

export type RootStackParamList = {
  ClientsList: undefined;
  ClientDetail: { clientId: string };
  ProjectDetail: { projectId: string };
  ProjectCreate: { initialCapture?: PendingCapture; clientId?: string } | undefined;
  Documents: undefined;
  Settings: undefined;
  CaptureHub: undefined;
  ProDashboard: undefined;
  DebugLogs: undefined;
  QATestRunner: undefined;
};

// ========================================
// NOTIFICATION TYPES
// ========================================

export interface NotificationContent {
  title: string;
  body: string;
  data?: Record<string, any>;
  trigger?: NotificationTrigger | null;
}

export interface NotificationTrigger {
  date?: Date;
  seconds?: number;
  repeats?: boolean;
}

// ========================================
// VALIDATION TYPES
// ========================================

export interface ValidationResult<T = any> {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
}

// ========================================
// API RESPONSE TYPES
// ========================================

export interface SupabaseResponse<T = any> {
  data: T | null;
  error: SupabaseError | null;
}

export interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

// ========================================
// UTILITY TYPES
// ========================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type ID = string;
export type Timestamp = string;

