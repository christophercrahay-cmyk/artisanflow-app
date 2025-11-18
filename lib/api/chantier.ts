import { supabase } from '../supabase';
import type { Project } from '@/types';

export async function getProjectByToken(token: string): Promise<Project | null> {
  try {
    const { data, error } = await supabase.rpc('get_public_chantier', {
      p_share_token: token,
    });

    if (error) {
      console.error('Error fetching project:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error:', error);
    return null;
  }
}

