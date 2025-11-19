import { supabase } from '../supabase';
import type { Project } from '@/types';

interface RPCResponse {
  project_id: string;
  project_name: string;
  project_address_line: string | null;
  project_postal_code: string | null;
  project_city: string | null;
  project_status: string;
  client_id: string;
  client_name: string;
  client_phone: string | null;
  client_email: string | null;
  photos: Array<{
    photo_id: string;
    url: string;
    created_at: string;
  }> | null;
  documents: Array<{
    document_id: string;
    type: 'devis' | 'facture';
    numero: string;
    montant_ttc: number;
    status: string;
    pdf_url: string;
    created_at: string;
  }> | null;
}

export async function getProjectByToken(token: string): Promise<Project | null> {
  try {
    // Vérifier que Supabase est configuré
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Supabase not configured');
      return null;
    }

    const { data, error } = await supabase.rpc('get_public_chantier', {
      p_share_token: token,
    });

    if (error) {
      console.error('Error fetching project:', error);
      return null;
    }

    // La fonction RPC retourne une TABLE (array), prendre le premier élément
    if (!data || !Array.isArray(data) || data.length === 0) {
      return null;
    }

    const row = data[0] as RPCResponse;

    // Vérifier que les données essentielles existent
    if (!row.project_id || !row.project_name || !row.client_name) {
      console.error('Invalid data structure from RPC');
      return null;
    }

    // Transformer les documents en devis et factures séparés
    const documents = row.documents || [];
    const devis = documents
      .filter((doc) => doc.type === 'devis')
      .map((doc) => ({
        id: doc.document_id,
        numero: doc.numero,
        pdf_url: doc.pdf_url,
        amount_ttc: doc.montant_ttc,
        status: doc.status === 'signe' ? ('signed' as const) : ('draft' as const),
        created_at: doc.created_at,
      }));

    const factures = documents
      .filter((doc) => doc.type === 'facture')
      .map((doc) => ({
        id: doc.document_id,
        numero: doc.numero,
        pdf_url: doc.pdf_url,
        amount_ttc: doc.montant_ttc,
        status: doc.status,
        created_at: doc.created_at,
      }));

    // Transformer les photos
    const photos = (row.photos || []).map((photo) => ({
      id: photo.photo_id,
      url: photo.url,
      created_at: photo.created_at,
    }));

    // Construire l'objet Project selon l'interface TypeScript
    const project: Project = {
      id: row.project_id,
      name: row.project_name,
      address: row.project_address_line || '',
      postal_code: row.project_postal_code || undefined,
      city: row.project_city || undefined,
      client: {
        name: row.client_name,
        city: row.project_city || undefined,
      },
      photos: photos,
      devis: devis,
      factures: factures,
    };

    return project;
  } catch (error) {
    console.error('Unexpected error:', error);
    return null;
  }
}

