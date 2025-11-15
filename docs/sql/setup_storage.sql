-- Script pour configurer Supabase Storage
-- À exécuter dans le SQL Editor de Supabase

-- 1. Créer le bucket project-photos s'il n'existe pas déjà
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-photos', 'project-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Créer le bucket voices pour les enregistrements audio
INSERT INTO storage.buckets (id, name, public)
VALUES ('voices', 'voices', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Créer des politiques permissives pour Storage (RLS est activé par défaut)
-- Pour project-photos
DROP POLICY IF EXISTS "Public Access project-photos" ON storage.objects;
CREATE POLICY "Public Access project-photos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'project-photos');

DROP POLICY IF EXISTS "Public Upload project-photos" ON storage.objects;
CREATE POLICY "Public Upload project-photos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'project-photos');

DROP POLICY IF EXISTS "Public Delete project-photos" ON storage.objects;
CREATE POLICY "Public Delete project-photos" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'project-photos');

-- Pour voices
DROP POLICY IF EXISTS "Public Access voices" ON storage.objects;
CREATE POLICY "Public Access voices" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'voices');

DROP POLICY IF EXISTS "Public Upload voices" ON storage.objects;
CREATE POLICY "Public Upload voices" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'voices');

DROP POLICY IF EXISTS "Public Delete voices" ON storage.objects;
CREATE POLICY "Public Delete voices" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'voices');

-- Message de confirmation
SELECT 'Buckets et politiques configurés ✅' as status;

