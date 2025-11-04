import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Project } from '../types';
import { showError } from '../components/Toast';

interface ProjectWithClient extends Project {
  clients?: { name: string } | null;
}

/**
 * Hook pour charger la liste des projets (actifs en priorité)
 */
export function useProjectsList() {
  const [projects, setProjects] = useState<ProjectWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Utilisateur non authentifié');
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('*, clients(name)')
        .eq('user_id', user.id)
        .eq('archived', false)
        .order('status', { ascending: true }) // 'active' en premier
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setProjects((data || []) as ProjectWithClient[]);
    } catch (err: any) {
      console.error('[useProjectsList] Erreur:', err);
      setError(err.message || 'Erreur lors du chargement des projets');
      showError('Impossible de charger les projets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  return {
    projects,
    loading,
    error,
    refresh: loadProjects,
  };
}

