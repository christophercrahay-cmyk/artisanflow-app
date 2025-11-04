# 📋 INSTRUCTIONS FINALES - ArtisanFlow V3

## 🎯 OBJECTIF
Configurer votre Supabase pour que l'app ArtisanFlow fonctionne à 100%.

---

## ⚡ ACTION IMMÉDIATE

### Dans Supabase (2 minutes)

**1. Ouvrir SQL Editor**
- Aller sur https://supabase.com/dashboard
- Sélectionner projet ArtisanFlow
- Cliquer "SQL Editor" (menu gauche)

**2. Cas A : Base VIDE (nouvelle installation)**
```
Exécuter : INIT_SUPABASE.sql
→ Crée toutes les tables avec la bonne structure
→ Inclut : clients, projects, photos, notes, devis, factures, brand_settings
→ Crée les buckets : project-photos, voices, docs
→ Configure les politiques Storage
```

**3. Cas B : Base EXISTANTE avec données**
```
Exécuter : FIX_COLONNES_MANQUANTES.sql  ⚠️ RECOMMANDÉ
→ Ajoute toutes les colonnes manquantes
→ Ne supprime aucune donnée
→ Sûr à exécuter plusieurs fois
```

**Alternative : Scripts individuels**
Si préférez exécuter séparément :
```
1. ADD_CLIENT_ID_TO_PROJECT_PHOTOS.sql
2. FIX_NOTES_CLIENT_ID.sql
3. ADD_PDF_URL_TO_DOCS.sql
4. CREATE_BRAND_SETTINGS.sql
```

**4. Vérifier Bucket "docs"**
- Storage → Buckets
- Si `docs` existe : ✅ OK
- Si manquant : Créer "docs" (public)

---

## 🚀 RELANCER L'APP

```bash
npx expo start -c
```

---

## ✅ TESTER

### 1. Navigation
- Tab Clients → Détail → Chantier ✅
- Tab Capture → Photo ✅
- Tab Documents → Voir devis ✅
- Tab Documents → Paramètres ⚙️ ✅

### 2. Fonctionnalités
- Créer client ✅
- Créer chantier ✅
- Capturer photo ✅
- Note vocale ✅
- Devis IA automatique ✅
- PDF génération ✅

### 3. QA Runner (BONUS)
- 10 taps sur "Documents" dans l'onglet Documents
- Lancer "Run Full Flow" ✅

---

## 🐛 SI ÇA MARCHE PAS

### Erreur : "Could not find 'client_id' column"
→ Exécuter `ADD_CLIENT_ID_TO_PROJECT_PHOTOS.sql`

### Erreur : "relation 'brand_settings' does not exist"
→ Exécuter `CREATE_BRAND_SETTINGS.sql`

### Erreur : "bucket 'docs' does not exist"
→ Créer bucket "docs" public dans Storage

### Erreur : "null value in column 'client_id'"
→ Exécuter `FIX_NOTES_CLIENT_ID.sql`

---

## 📚 DOCUMENTATION

- **FIX_FINAL_SUPABASE.md** - Tous les scripts à exécuter
- **GUIDE_SUPABASE.md** - Guide détaillé SQL
- **README_QA.md** - Tests QA
- **UTILISATION_QA.txt** - Mode d'emploi rapide

---

## 🎉 STATUT

**✅ TOUT EST PRÊT**

- Code implémenté ✅
- SQL scripts prêts ✅
- Documentation complète ✅
- QA runner fonctionnel ✅

---

**VOTRE ACTION** : Exécuter INIT_SUPABASE.sql dans Supabase  
**DURÉE** : 2 minutes  
**RISQUE** : Aucun

