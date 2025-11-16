import { supabase } from '../supabaseClient';
import logger from './logger';

/**
 * Queries Supabase avec pagination
 */

export async function fetchClientsPaginated(page = 0, pageSize = 20) {
  try {
    // ✅ Récupérer l'utilisateur connecté pour isolation multi-tenant
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    const from = page * pageSize;
    const to = from + pageSize - 1;
    
    const { data, error, count } = await supabase
      .from('clients')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id) // ✅ Filtre obligatoire pour isolation utilisateurs
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (error) {throw error;}
    
    logger.info('SupabaseQueries', `Clients chargés: ${from}-${to} sur ${count}`);
    
    return data || [];
  } catch (error) {
    logger.error('SupabaseQueries', 'Erreur fetchClientsPaginated', error);
    throw error;
  }
}

export async function fetchProjectsPaginated(clientId, page = 0, pageSize = 20) {
  try {
    // ✅ Récupérer l'utilisateur connecté pour isolation multi-tenant
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    const from = page * pageSize;
    const to = from + pageSize - 1;
    
    let query = supabase
      .from('projects')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id) // ✅ Filtre obligatoire pour isolation utilisateurs
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    
    const { data, error, count } = await query;
    
    if (error) {throw error;}
    
    logger.info('SupabaseQueries', `Projects chargés: ${from}-${to} sur ${count}`);
    
    return data || [];
  } catch (error) {
    logger.error('SupabaseQueries', 'Erreur fetchProjectsPaginated', error);
    throw error;
  }
}

export async function fetchPhotosPaginated(projectId, page = 0, pageSize = 20) {
  try {
    // ✅ Récupérer l'utilisateur connecté pour isolation multi-tenant
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    const from = page * pageSize;
    const to = from + pageSize - 1;
    
    const { data, error, count } = await supabase
      .from('project_photos')
      .select('*', { count: 'exact' })
      .eq('project_id', projectId)
      .eq('user_id', user.id) // ✅ Filtre obligatoire pour isolation utilisateurs
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (error) {throw error;}
    
    logger.info('SupabaseQueries', `Photos chargées: ${from}-${to} sur ${count}`);
    
    return data || [];
  } catch (error) {
    logger.error('SupabaseQueries', 'Erreur fetchPhotosPaginated', error);
    throw error;
  }
}

export async function fetchNotesPaginated(projectId, page = 0, pageSize = 20) {
  try {
    // ✅ Récupérer l'utilisateur connecté pour isolation multi-tenant
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    const from = page * pageSize;
    const to = from + pageSize - 1;
    
    const { data, error, count } = await supabase
      .from('notes')
      .select('*', { count: 'exact' })
      .eq('project_id', projectId)
      .eq('user_id', user.id) // ✅ Filtre obligatoire pour isolation utilisateurs
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (error) {throw error;}
    
    logger.info('SupabaseQueries', `Notes chargées: ${from}-${to} sur ${count}`);
    
    return data || [];
  } catch (error) {
    logger.error('SupabaseQueries', 'Erreur fetchNotesPaginated', error);
    throw error;
  }
}

