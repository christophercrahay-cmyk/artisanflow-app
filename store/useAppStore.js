// store/useAppStore.js - Store centralisé Zustand amélioré
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../supabaseClient';
import logger from '../utils/logger';

export const useAppStore = create(
  persist(
    (set, get) => ({
      // ========================================
      // STATE
      // ========================================
      
      // Selection actuelle
      currentClient: null,
      currentProject: null,
      
      // Données
      clients: [],
      projects: [],
      photos: [],
      notes: [],
      devis: [],
      factures: [],
      
      // Loading states
      loadingClients: false,
      loadingProjects: false,
      loadingPhotos: false,
      loadingNotes: false,
      loadingDevis: false,
      loadingFactures: false,
      
      // Errors
      error: null,
      
      // User
      user: null,

      // ========================================
      // SETTERS SIMPLES
      // ========================================
      
      setCurrentClient: (client) => {
        logger.info('Store', `Client sélectionné: ${client?.name || client?.id}`);
        set({ currentClient: client });
      },
      
      setCurrentProject: (project) => {
        logger.info('Store', `Project sélectionné: ${project?.name || project?.id}`);
        set({ currentProject: project });
      },
      
      setUser: (user) => set({ user }),
      
      setError: (error) => {
        logger.error('Store', 'Erreur enregistrée', error);
        set({ error });
      },
      
      clearError: () => set({ error: null }),
      
      clearClient: () => set({ currentClient: null }),
      clearProject: () => set({ currentProject: null }),
      clearAll: () => set({ 
        currentClient: null, 
        currentProject: null,
        projects: [],
        photos: [],
        notes: [],
      }),

      // ========================================
      // CLIENTS
      // ========================================
      
      loadClients: async () => {
        try {
          set({ loadingClients: true, error: null });
          
          // ✅ Récupérer l'utilisateur connecté pour isolation multi-tenant
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            throw new Error('Utilisateur non authentifié');
          }
          
          const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('user_id', user.id) // ✅ Filtre obligatoire pour isolation utilisateurs
            .order('created_at', { ascending: false });
          
          if (error) {throw error;}
          
          logger.success('Store', `${data?.length || 0} clients chargés`);
          set({ clients: data || [], loadingClients: false });
          
          return data;
        } catch (error) {
          logger.error('Store', 'Erreur chargement clients', error);
          set({ error, loadingClients: false });
          throw error;
        }
      },
      
      addClient: async (clientData) => {
        try {
          // Récupérer l'utilisateur connecté pour RLS
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            throw new Error('Utilisateur non authentifié');
          }
          
          // Ajouter user_id si manquant
          const dataWithUserId = {
            ...clientData,
            user_id: clientData.user_id || user.id,
          };
          
          const { data, error } = await supabase
            .from('clients')
            .insert([dataWithUserId])
            .select()
            .single();
          
          if (error) {throw error;}
          
          logger.success('Store', `Client créé: ${data.name}`);
          
          // Recharger la liste
          await get().loadClients();
          
          return data;
        } catch (error) {
          logger.error('Store', 'Erreur création client', error);
          set({ error });
          throw error;
        }
      },
      
      updateClient: async (id, updates) => {
        try {
          const { data, error } = await supabase
            .from('clients')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
          
          if (error) {throw error;}
          
          logger.success('Store', `Client modifié: ${id}`);
          
          // Mettre à jour localement
          set(state => ({
            clients: state.clients.map(c => c.id === id ? data : c)
          }));
          
          return data;
        } catch (error) {
          logger.error('Store', 'Erreur modification client', error);
          set({ error });
          throw error;
        }
      },
      
      deleteClient: async (id) => {
        try {
          const { error } = await supabase
            .from('clients')
            .delete()
            .eq('id', id);
          
          if (error) {throw error;}
          
          logger.success('Store', `Client supprimé: ${id}`);
          
          // Retirer localement
          set(state => ({
            clients: state.clients.filter(c => c.id !== id)
          }));
        } catch (error) {
          logger.error('Store', 'Erreur suppression client', error);
          set({ error });
          throw error;
        }
      },

      // ========================================
      // PROJECTS
      // ========================================
      
      loadProjects: async (clientId = null) => {
        try {
          set({ loadingProjects: true, error: null });
          
          // ✅ Récupérer l'utilisateur connecté pour isolation multi-tenant
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            throw new Error('Utilisateur non authentifié');
          }
          
          let query = supabase
            .from('projects')
            .select('*')
            .eq('user_id', user.id) // ✅ Filtre obligatoire pour isolation utilisateurs
            .order('created_at', { ascending: false });
          
          if (clientId) {
            query = query.eq('client_id', clientId);
          }
          
          const { data, error } = await query;
          
          if (error) {throw error;}
          
          logger.success('Store', `${data?.length || 0} projects chargés`);
          set({ projects: data || [], loadingProjects: false });
          
          return data;
        } catch (error) {
          logger.error('Store', 'Erreur chargement projects', error);
          set({ error, loadingProjects: false });
          throw error;
        }
      },
      
      addProject: async (projectData) => {
        try {
          // Validation : client_id est obligatoire
          if (!projectData.client_id) {
            throw new Error('Un client est obligatoire pour créer un chantier');
          }

          // Récupérer l'utilisateur connecté pour RLS
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            throw new Error('Utilisateur non authentifié');
          }
          
          // Ajouter user_id si manquant
          const dataWithUserId = {
            ...projectData,
            user_id: projectData.user_id || user.id,
          };
          
          const { data, error } = await supabase
            .from('projects')
            .insert([dataWithUserId])
            .select()
            .single();
          
          if (error) {throw error;}
          
          logger.success('Store', `Project créé: ${data.name}`);
          
          // Recharger la liste
          await get().loadProjects(projectData.client_id);
          
          return data;
        } catch (error) {
          logger.error('Store', 'Erreur création project', error);
          set({ error });
          throw error;
        }
      },
      
      updateProject: async (id, updates) => {
        try {
          const { data, error } = await supabase
            .from('projects')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
          
          if (error) {throw error;}
          
          logger.success('Store', `Project modifié: ${id}`);
          
          set(state => ({
            projects: state.projects.map(p => p.id === id ? data : p)
          }));
          
          return data;
        } catch (error) {
          logger.error('Store', 'Erreur modification project', error);
          set({ error });
          throw error;
        }
      },
      
      deleteProject: async (id) => {
        try {
          const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id);
          
          if (error) {throw error;}
          
          logger.success('Store', `Project supprimé: ${id}`);
          
          set(state => ({
            projects: state.projects.filter(p => p.id !== id)
          }));
        } catch (error) {
          logger.error('Store', 'Erreur suppression project', error);
          set({ error });
          throw error;
        }
      },

      // ========================================
      // PHOTOS
      // ========================================
      
      loadPhotos: async (projectId) => {
        try {
          set({ loadingPhotos: true, error: null });
          
          // ✅ Récupérer l'utilisateur connecté pour isolation multi-tenant
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            throw new Error('Utilisateur non authentifié');
          }
          
          const { data, error } = await supabase
            .from('project_photos')
            .select('*')
            .eq('project_id', projectId)
            .eq('user_id', user.id) // ✅ Filtre obligatoire pour isolation utilisateurs
            .order('created_at', { ascending: false });
          
          if (error) {throw error;}
          
          logger.success('Store', `${data?.length || 0} photos chargées`);
          set({ photos: data || [], loadingPhotos: false });
          
          return data;
        } catch (error) {
          logger.error('Store', 'Erreur chargement photos', error);
          set({ error, loadingPhotos: false });
          throw error;
        }
      },

      // ========================================
      // NOTES
      // ========================================
      
      loadNotes: async (projectId) => {
        try {
          set({ loadingNotes: true, error: null });
          
          // ✅ Récupérer l'utilisateur connecté pour isolation multi-tenant
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            throw new Error('Utilisateur non authentifié');
          }
          
          const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('project_id', projectId)
            .eq('user_id', user.id) // ✅ Filtre obligatoire pour isolation utilisateurs
            .order('created_at', { ascending: false });
          
          if (error) {throw error;}
          
          logger.success('Store', `${data?.length || 0} notes chargées`);
          set({ notes: data || [], loadingNotes: false });
          
          return data;
        } catch (error) {
          logger.error('Store', 'Erreur chargement notes', error);
          set({ error, loadingNotes: false });
          throw error;
        }
      },

      // ========================================
      // HELPERS STRICTS
      // ========================================
      
      requireClient: () => {
        const c = get().currentClient;
        if (!c?.id) {
          logger.warn('Store', 'Client requis mais non sélectionné');
          throw new Error('NO_CLIENT_SELECTED');
        }
        return c;
      },

      requireProject: () => {
        const p = get().currentProject;
        if (!p?.id) {
          logger.warn('Store', 'Project requis mais non sélectionné');
          throw new Error('NO_PROJECT_SELECTED');
        }
        return p;
      },
    }),
    {
      name: 'artisanflow-app-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // On persiste uniquement le minimum
        currentClient: state.currentClient
          ? {
              id: state.currentClient.id,
              name: state.currentClient.name || state.currentClient.nom,
            }
          : null,
        currentProject: state.currentProject
          ? {
              id: state.currentProject.id,
              name: state.currentProject.name || state.currentProject.nom,
            }
          : null,
        user: state.user,
      }),
    }
  )
);
