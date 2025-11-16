/**
 * Utilitaires d'authentification Supabase
 */

import { supabase } from '../supabaseClient';
import logger from './logger';

/**
 * Inscription (email/password)
 * Gère correctement l'email de confirmation selon la config Supabase
 */
export async function signUp(email, password) {
  try {
    logger.info('Auth', `Inscription: ${email}`);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Ne pas envoyer de redirection email (optionnel)
        // emailRedirectTo: undefined,
      },
    });

    if (error) {
      logger.error('Auth', 'Erreur inscription', error);
      throw error;
    }

    // Si session existe, l'utilisateur est auto-confirmé
    if (data.session) {
      logger.success('Auth', 'Inscription réussie (auto-confirmé)', { userId: data.user?.id });
    } else {
      logger.success('Auth', 'Inscription réussie (confirmation email requise)', { userId: data.user?.id });
    }
    
    return { user: data.user, session: data.session, error: null };
  } catch (err) {
    logger.error('Auth', 'Exception inscription', err);
    throw err;
  }
}

/**
 * Connexion (email/password)
 * Connexion directe pour les utilisateurs existants
 */
export async function signIn(email, password) {
  try {
    logger.info('Auth', `Connexion: ${email}`);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      logger.error('Auth', 'Erreur connexion', error);
      throw error;
    }

    logger.success('Auth', 'Connexion réussie', { userId: data.user?.id, email: data.user?.email });
    return { user: data.user, session: data.session, error: null };
  } catch (err) {
    logger.error('Auth', 'Exception connexion', err);
    throw err;
  }
}

/**
 * Déconnexion
 */
export async function signOut() {
  try {
    logger.info('Auth', 'Déconnexion');
    
    const { error } = await supabase.auth.signOut();

    if (error) {
      logger.error('Auth', 'Erreur déconnexion', error);
      throw error;
    }

    logger.success('Auth', 'Déconnexion réussie');
  } catch (err) {
    logger.error('Auth', 'Exception déconnexion', err);
    throw err;
  }
}

/**
 * Récupère l'utilisateur actuel
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      logger.error('Auth', 'Erreur getCurrentUser', error);
      return null;
    }

    return user;
  } catch (err) {
    logger.error('Auth', 'Exception getCurrentUser', err);
    return null;
  }
}

/**
 * Récupère la session actuelle
 */
export async function getCurrentSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      logger.error('Auth', 'Erreur getCurrentSession', error);
      return null;
    }

    return session;
  } catch (err) {
    logger.error('Auth', 'Exception getCurrentSession', err);
    return null;
  }
}

/**
 * Récupère user_id actuel (plus rapide que getCurrentUser())
 */
export function getCurrentUserId() {
  try {
    const session = supabase.auth.getSession();
    return session?.user?.id || null;
  } catch (err) {
    logger.error('Auth', 'Exception getCurrentUserId', err);
    return null;
  }
}

/**
 * Récupère l'utilisateur connecté ou throw une erreur
 * À utiliser pour les INSERT RLS
 */
export async function getCurrentUserOrThrow() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      logger.error('Auth', 'Utilisateur non authentifié', error);
      throw new Error('Utilisateur non authentifié');
    }
    
    return user;
  } catch (err) {
    logger.error('Auth', 'Exception getCurrentUserOrThrow', err);
    throw err;
  }
}

/**
 * Écoute les changements de session (pour navigation)
 */
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
      logger.success('Auth', 'User connecté', { userId: session?.user?.id });
    } else if (event === 'SIGNED_OUT') {
      logger.info('Auth', 'User déconnecté');
    } else if (event === 'TOKEN_REFRESHED') {
      logger.info('Auth', 'Token rafraîchi');
    }
    
    callback(event, session);
  });
}

