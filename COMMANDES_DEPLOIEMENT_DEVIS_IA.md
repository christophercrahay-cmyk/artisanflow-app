# 🚀 COMMANDES DE DÉPLOIEMENT - MODULE DEVIS IA

## 📋 Checklist avant déploiement

### ✅ 1. Vérifier que les fichiers modifiés sont bien sauvegardés

Fichiers modifiés :
- `components/DevisAIGenerator.js`
- `supabase/functions/ai-devis-conversational/index.ts`
- `utils/utils/pdf.js`
- `DevisFactures.js`
- `screens/AuthScreen.js` (bonus : bouton œil pour le mot de passe)
- `screens/ProjectDetailScreen.js` (bonus : modal PDF corrigée)

---

## 🔧 ÉTAPE 1 : Redéployer l'Edge Function

```bash
# Se placer dans le dossier du projet
cd C:\Users\Chris\Desktop\MVP_Artisan\artisanflow

# Redéployer la fonction IA conversationnelle
supabase functions deploy ai-devis-conversational
```

**Résultat attendu** :
```
Deploying function ai-devis-conversational...
✓ Function deployed successfully
```

---

## 🗄️ ÉTAPE 2 : Vérifier les tables Supabase

### 2.1 Vérifier que `devis_lignes` existe

Aller dans **Supabase** > **SQL Editor** et exécuter :

```sql
-- Vérifier que la table existe
SELECT COUNT(*) as nb_lignes FROM devis_lignes;
```

**Si erreur "relation does not exist"**, exécuter le script :

```sql
-- Créer la table devis_lignes
CREATE TABLE IF NOT EXISTS public.devis_lignes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  devis_id UUID NOT NULL REFERENCES public.devis(id) ON DELETE CASCADE,
  
  description TEXT NOT NULL,
  quantite DECIMAL(10, 2) NOT NULL DEFAULT 1,
  unite TEXT DEFAULT 'unité',
  prix_unitaire DECIMAL(10, 2) NOT NULL,
  prix_total DECIMAL(10, 2) NOT NULL,
  
  ordre INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_devis_lignes_devis_id ON public.devis_lignes(devis_id);
CREATE INDEX IF NOT EXISTS idx_devis_lignes_ordre ON public.devis_lignes(devis_id, ordre);

ALTER TABLE public.devis_lignes DISABLE ROW LEVEL SECURITY;
```

### 2.2 Vérifier que `company_settings` existe et contient des données

```sql
-- Vérifier les paramètres entreprise
SELECT * FROM company_settings LIMIT 1;
```

**Si la table est vide**, insérer des données de test :

```sql
INSERT INTO company_settings (user_id, company_name, siret, address, phone, email)
VALUES (
  (SELECT id FROM auth.users LIMIT 1),
  'Mon Entreprise',
  '123 456 789 00012',
  '123 Rue de Test, 75001 Paris',
  '01 23 45 67 89',
  'contact@monentreprise.fr'
);
```

### 2.3 Vérifier que le champ `pdf_url` existe dans `devis`

```sql
-- Vérifier la structure de la table devis
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'devis';
```

**Si `pdf_url` n'existe pas**, l'ajouter :

```sql
ALTER TABLE public.devis ADD COLUMN IF NOT EXISTS pdf_url TEXT;
```

---

## 📦 ÉTAPE 3 : Vérifier Supabase Storage

### 3.1 Vérifier que le bucket `docs` existe

Aller dans **Supabase** > **Storage** > **Buckets**

**Si le bucket n'existe pas**, le créer :
1. Cliquer sur **"New bucket"**
2. Nom : `docs`
3. Cocher **"Public bucket"** ✅
4. Cliquer sur **"Create bucket"**

### 3.2 Vérifier les permissions du bucket

Le bucket `docs` doit être **public** pour que les URLs des PDF soient accessibles.

---

## 🔐 ÉTAPE 4 : Vérifier les variables d'environnement

Aller dans **Supabase** > **Edge Functions** > **Secrets**

Vérifier que ces variables sont définies :
- ✅ `OPENAI_API_KEY` : votre clé API OpenAI
- ✅ `SUPABASE_URL` : (auto-définie par Supabase)
- ✅ `SUPABASE_ANON_KEY` : (auto-définie par Supabase)

---

## 📱 ÉTAPE 5 : Tester sur le device

### 5.1 Démarrer le serveur Expo

```bash
# Démarrer avec tunnel (si besoin)
npx expo start --tunnel

# OU démarrer normalement
npx expo start
```

### 5.2 Recharger l'app sur le téléphone

- Secouer le téléphone
- Cliquer sur **"Reload"**

### 5.3 Tester le workflow complet

1. **Ouvrir un projet**
2. **Enregistrer des notes vocales** (2-3 notes)
3. **Cliquer sur "Générer devis IA"**
4. **Attendre l'analyse IA** (quelques secondes)
5. **Répondre aux questions** (texte ou vocal)
6. **Valider le devis** → il est créé dans la BDD
7. **Scroller jusqu'à la section "📋 Devis"**
8. **Cliquer sur "👁️ PDF"** → le PDF s'ouvre
9. **Vérifier le PDF** : lignes, montants, totaux
10. **Partager le PDF** (WhatsApp, email, etc.)

---

## 🐛 DÉPANNAGE

### Problème 1 : "Network request failed"

**Cause** : L'Edge Function n'est pas accessible

**Solution** :
1. Vérifier que la fonction est bien déployée :
   ```bash
   supabase functions list
   ```
2. Vérifier l'URL dans `services/aiConversationalService.js` (ligne 11) :
   ```javascript
   const EDGE_FUNCTION_URL = 'https://upihalivqstavxijlwaj.supabase.co/functions/v1/ai-devis-conversational';
   ```
3. Vérifier que l'URL correspond à votre projet Supabase

### Problème 2 : "Aucune ligne de devis trouvée"

**Cause** : Le devis n'a pas de lignes dans `devis_lignes`

**Solution** :
1. Vérifier dans Supabase :
   ```sql
   SELECT * FROM devis_lignes WHERE devis_id = '<id_du_devis>';
   ```
2. Si vide, le devis a été créé "à l'ancienne" (sans l'IA)
3. Utiliser le bouton "Générer devis IA" pour créer un nouveau devis structuré

### Problème 3 : PDF avec montants à 0,00 €

**Cause** : Les lignes ne sont pas récupérées correctement

**Solution** :
1. Vérifier que `generateDevisPDFFromDB` est bien appelée (et pas `generateDevisPDF`)
2. Vérifier les logs dans la console :
   ```javascript
   console.log('Lignes récupérées:', lignes);
   ```
3. Vérifier que les lignes ont bien des valeurs numériques (pas NULL)

### Problème 4 : "Devis introuvable"

**Cause** : L'ID du devis est invalide ou le devis a été supprimé

**Solution** :
1. Vérifier que le devis existe :
   ```sql
   SELECT * FROM devis WHERE id = '<id_du_devis>';
   ```
2. Vérifier que les jointures fonctionnent :
   ```sql
   SELECT d.*, p.title, c.name 
   FROM devis d
   LEFT JOIN projects p ON d.project_id = p.id
   LEFT JOIN clients c ON d.client_id = c.id
   WHERE d.id = '<id_du_devis>';
   ```

### Problème 5 : Champs de saisie illisibles

**Cause** : Les styles n'ont pas été appliqués

**Solution** :
1. Vérifier que `components/DevisAIGenerator.js` a bien été sauvegardé
2. Recharger l'app (secouer le téléphone → Reload)
3. Vérifier les styles dans le code (ligne 598-608)

---

## ✅ CHECKLIST FINALE

Avant de considérer le déploiement terminé, vérifier :

- [ ] L'Edge Function est déployée
- [ ] La table `devis_lignes` existe
- [ ] La table `company_settings` contient des données
- [ ] Le bucket `docs` existe et est public
- [ ] Les variables d'environnement sont définies
- [ ] L'app se recharge sans erreur
- [ ] Le bouton "Générer devis IA" fonctionne
- [ ] Les questions IA sont génériques
- [ ] Les champs de saisie sont lisibles
- [ ] Le devis est créé avec des lignes
- [ ] Le bouton "👁️ PDF" est visible
- [ ] Le PDF est généré avec les vraies lignes
- [ ] Les montants dans le PDF sont corrects
- [ ] Le PDF peut être partagé

---

## 📞 SUPPORT

Si un problème persiste après avoir suivi ce guide :

1. **Vérifier les logs de l'Edge Function** :
   - Supabase > Edge Functions > ai-devis-conversational > Logs

2. **Vérifier les logs de l'app** :
   - Terminal où tourne `npx expo start`
   - Console du navigateur (si web)

3. **Vérifier les données dans Supabase** :
   - SQL Editor > requêtes de vérification ci-dessus

4. **Consulter la documentation** :
   - `AMELIORATIONS_DEVIS_IA.md` : documentation complète
   - `GUIDE_TEST_DEVIS_IA.md` : guide de test détaillé
   - `RESUME_AMELIORATIONS_DEVIS_IA.txt` : résumé visuel

---

**Date** : 7 novembre 2025  
**Version** : 1.1.0  
**Status** : ✅ Prêt pour le déploiement

