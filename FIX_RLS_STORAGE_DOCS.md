# 🔒 FIX RLS STORAGE - BUCKET DOCS

**Date** : 10 Novembre 2025  
**Problème** : Upload PDF bloqué par RLS sur le bucket 'docs'

---

## ⚠️ ERREUR

```
new row violates row-level security policy
```

### Cause
Le bucket `docs` dans Supabase Storage a RLS activé, mais :
- Pas de policy configurée pour les uploads
- Ou policy mal configurée qui ne permet pas l'upload avec les métadonnées actuelles

---

## ✅ SOLUTION TEMPORAIRE APPLIQUÉE

**Fichier** : `utils/utils/pdf.js`

J'ai **désactivé l'upload dans Storage** temporairement :
- Le PDF est généré en local uniquement
- Le partage fonctionne via le fichier local
- Pas de stockage cloud pour l'instant

**Avantage** : L'app fonctionne sans erreur

**Inconvénient** : Les PDFs ne sont pas sauvegardés dans Supabase

---

## 🛠️ SOLUTION DÉFINITIVE (À FAIRE DANS SUPABASE)

### Option A : Désactiver RLS sur le bucket 'docs' (rapide mais moins sécurisé)

1. Va dans **Supabase Dashboard**
2. Storage → **docs** (ou crée le bucket s'il n'existe pas)
3. Settings → **Public bucket** : ✅ Activé
4. **RLS enabled** : ❌ Désactivé

**Commande SQL** :
```sql
-- Créer le bucket s'il n'existe pas
INSERT INTO storage.buckets (id, name, public)
VALUES ('docs', 'docs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Désactiver RLS
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

### Option B : Configurer les policies RLS (recommandé, plus sécurisé)

1. Va dans **Supabase Dashboard**
2. Storage → **docs** → **Policies**
3. Crée ces policies :

**Policy 1 : Upload** (INSERT)
```sql
CREATE POLICY "Users can upload their own PDFs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'docs' 
  AND (storage.foldername(name))[1] = 'devis'
  AND auth.uid()::text = (storage.foldername(name))[2]
);
```

**Policy 2 : Read** (SELECT)
```sql
CREATE POLICY "Users can read their own PDFs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'docs'
  AND (storage.foldername(name))[1] = 'devis'
  AND auth.uid()::text = (storage.foldername(name))[2]
);
```

**Policy 3 : Update** (UPDATE)
```sql
CREATE POLICY "Users can update their own PDFs"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'docs'
  AND (storage.foldername(name))[1] = 'devis'
  AND auth.uid()::text = (storage.foldername(name))[2]
);
```

**Policy 4 : Delete** (DELETE)
```sql
CREATE POLICY "Users can delete their own PDFs"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'docs'
  AND (storage.foldername(name))[1] = 'devis'
  AND auth.uid()::text = (storage.foldername(name))[2]
);
```

### Option C : Structure de chemin différente

**Modifier le code** pour utiliser le `user_id` dans le chemin :

```javascript
// Dans utils/utils/pdf.js
const { data: { user } } = await supabase.auth.getUser();
const path = `devis/${user.id}/${project.id}/${number}.pdf`;
```

Puis créer des policies simples :
```sql
CREATE POLICY "Users can manage their PDFs"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'docs' AND (storage.foldername(name))[1] = auth.uid()::text);
```

---

## 🔄 RÉACTIVER L'UPLOAD

Une fois les policies configurées dans Supabase, dans `utils/utils/pdf.js` :

**Remplacer** :
```javascript
logger.info('PDF', 'Upload dans Storage désactivé (problème RLS), utilisation du fichier local');
return { pdfUrl: null, number, localUri: uri };
```

**Par** :
```javascript
const { data: { user } } = await supabase.auth.getUser();
const path = `devis/${user.id}/${project.id}/${number}.pdf`;

const resp = await fetch(uri);
const arrayBuffer = await resp.arrayBuffer();
const bytes = new Uint8Array(arrayBuffer);

const { error: upErr } = await supabase.storage
  .from('docs')
  .upload(path, bytes, {
    contentType: 'application/pdf',
    upsert: true,
  });

if (upErr) {
  logger.error('PDF', 'Erreur upload', upErr);
  return { pdfUrl: null, number, localUri: uri };
}

const { data } = supabase.storage.from('docs').getPublicUrl(path);
const pdfUrl = data?.publicUrl;

await supabase
  .from('devis')
  .update({ pdf_url: pdfUrl })
  .eq('id', devisId);

logger.success('PDF', `PDF uploadé: ${pdfUrl}`);
return { pdfUrl, number, localUri: uri };
```

---

## 🧪 TEST

Une fois configuré :
1. Génère un devis avec l'IA
2. Ouvre l'onglet Documents
3. Clique sur le devis
4. Le PDF doit se partager sans erreur

---

**Pour l'instant, l'app fonctionne avec les PDFs en local uniquement.**

