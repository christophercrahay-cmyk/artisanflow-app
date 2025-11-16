-- Fonction SQL pour supprimer un compte utilisateur
-- Optionnel mais recommandé pour une suppression propre et sécurisée
-- À exécuter dans Supabase SQL Editor

CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
  deleted_counts json;
BEGIN
  -- Récupérer l'ID de l'utilisateur connecté
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non authentifié';
  END IF;

  -- Supprimer toutes les données de l'utilisateur
  -- Les FK CASCADE supprimeront automatiquement les données liées
  
  -- Supprimer les clients (cascade → projects → project_photos, notes, devis, factures)
  DELETE FROM public.clients WHERE user_id = current_user_id;
  
  -- Supprimer les settings
  DELETE FROM public.brand_settings WHERE user_id = current_user_id;
  
  -- Note: La suppression du compte auth.users doit être faite via Supabase Admin API
  -- ou manuellement dans le Dashboard (pour des raisons de sécurité)
  
  -- Retourner un résumé
  SELECT json_build_object(
    'success', true,
    'message', 'Données utilisateur supprimées avec succès',
    'user_id', current_user_id
  ) INTO deleted_counts;
  
  RETURN deleted_counts;
  
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Erreur suppression compte: %', SQLERRM;
END;
$$;

-- Commentaire
COMMENT ON FUNCTION delete_user_account() IS 'Supprime toutes les données d''un utilisateur (sauf le compte auth qui doit être supprimé manuellement)';

-- Message de confirmation
SELECT '✅ Fonction delete_user_account() créée' as status;

