# 🚀 COMMANDES DE DÉPLOIEMENT - IA CONVERSATIONNELLE

**Pour** : ChatGPT (Développeur)  
**Temps estimé** : 15 minutes

---

## 📋 **PRÉREQUIS**

- ✅ Compte Supabase actif
- ✅ Clé OpenAI disponible
- ✅ Supabase CLI installé (`npm install -g supabase`)

---

## 🎯 **ÉTAPE 1 : DÉPLOYER LES TABLES SQL** (2 min)

### **1.1 Ouvrir Supabase Dashboard**

```
https://supabase.com/dashboard
→ Projet ArtisanFlow
→ SQL Editor (menu gauche)
→ New query
```

### **1.2 Copier-coller le script**

```bash
# Ouvrir le fichier :
sql/create_ai_devis_tables.sql

# Copier TOUT le contenu
# Coller dans SQL Editor
# Cliquer "Run" (ou Ctrl+Enter)
```

### **1.3 Vérifier le résultat**

Tu devrais voir :

```sql
✅ Tables IA conversationnelle créées avec succès !
sessions_table: 1
temp_devis_table: 1
price_stats_table: 1
```

---

## ⚙️ **ÉTAPE 2 : DÉPLOYER L'EDGE FUNCTION** (10 min)

### **2.1 Récupérer le PROJECT_ID**

```
Supabase Dashboard
→ Settings (menu gauche)
→ General
→ Copier "Reference ID"
```

Exemple : `abc123xyz456`

### **2.2 Login Supabase CLI**

```bash
supabase login
```

Une page web s'ouvrira pour te connecter.

### **2.3 Lier le projet**

```bash
cd C:\Users\Chris\Desktop\MVP_Artisan\artisanflow

supabase link --project-ref <PROJECT_ID>
```

Remplace `<PROJECT_ID>` par ton Reference ID.

Exemple :
```bash
supabase link --project-ref abc123xyz456
```

### **2.4 Configurer les secrets**

**Récupérer les valeurs** :

1. **OPENAI_API_KEY** : Dans `config/openai.js` (ligne 2)
2. **SUPABASE_URL** : Supabase Dashboard → Settings → API → Project URL
3. **SUPABASE_ANON_KEY** : Supabase Dashboard → Settings → API → anon public

**Configurer via CLI** :

```bash
supabase secrets set OPENAI_API_KEY=sk-proj-...
supabase secrets set SUPABASE_URL=https://xxx.supabase.co
supabase secrets set SUPABASE_ANON_KEY=eyJ...
```

**OU via Dashboard** (alternative) :

```
Supabase Dashboard
→ Edge Functions
→ Settings
→ Add secret
```

### **2.5 Déployer la fonction**

```bash
supabase functions deploy ai-devis-conversational
```

Tu devrais voir :

```
✅ Deployed Function ai-devis-conversational
URL: https://xxx.supabase.co/functions/v1/ai-devis-conversational
Version: 1
```

---

## 🧪 **ÉTAPE 3 : TESTER L'EDGE FUNCTION** (3 min)

### **3.1 Test manuel via curl**

```bash
curl -X POST https://xxx.supabase.co/functions/v1/ai-devis-conversational \
  -H "Authorization: Bearer <SUPABASE_ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "start",
    "transcription": "Installation de 8 prises encastrées dans le salon",
    "project_id": "test-project-id",
    "client_id": "test-client-id",
    "user_id": "test-user-id"
  }'
```

**Résultat attendu** :

```json
{
  "status": "questions" | "ready",
  "devis": {
    "titre": "...",
    "lignes": [...],
    "total_ht": 360.00,
    ...
  },
  "questions": ["...", "..."],
  "session_id": "uuid",
  "tour_count": 1
}
```

### **3.2 Vérifier dans Supabase**

```sql
-- Dans SQL Editor
SELECT * FROM devis_ai_sessions ORDER BY created_at DESC LIMIT 5;
SELECT * FROM devis_temp_ai ORDER BY created_at DESC LIMIT 5;
```

Tu devrais voir les sessions créées.

---

## 📱 **ÉTAPE 4 : TESTER DANS L'APP** (5 min)

### **4.1 Lancer l'app**

```bash
cd C:\Users\Chris\Desktop\MVP_Artisan\artisanflow

npm run start:safe
```

### **4.2 Tester le workflow**

1. **Se connecter** avec `test@artisanflow.app` / `Test1234`
2. **Créer un projet** (ou utiliser un existant)
3. **Enregistrer une note vocale** :
   ```
   "Installation de 8 prises encastrées et 3 interrupteurs dans le salon"
   ```
4. **Naviguer** vers `DevisAIConversational` (à intégrer dans VoiceRecorder)
5. **Vérifier** :
   - ✅ Devis affiché
   - ✅ Questions affichées (si pertinent)
   - ✅ Possibilité de répondre
   - ✅ Bouton "Créer le devis" fonctionnel

---

## 🐛 **DÉPANNAGE**

### **Erreur : "OPENAI_API_KEY non configurée"**

```bash
# Vérifier les secrets
supabase secrets list

# Reconfigurer si nécessaire
supabase secrets set OPENAI_API_KEY=sk-proj-...
```

### **Erreur : "Failed to deploy function"**

```bash
# Vérifier les logs
supabase functions logs ai-devis-conversational

# Redéployer
supabase functions deploy ai-devis-conversational --no-verify-jwt
```

### **Erreur : "Session introuvable"**

```sql
-- Vérifier que les tables existent
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('devis_ai_sessions', 'devis_temp_ai');

-- Si vide, réexécuter create_ai_devis_tables.sql
```

---

## 📊 **VÉRIFICATION FINALE**

### **Checklist** :

- [ ] Tables SQL créées dans Supabase
- [ ] Edge Function déployée
- [ ] Secrets configurés
- [ ] Test curl réussi
- [ ] Test app réussi
- [ ] Session créée dans `devis_ai_sessions`
- [ ] Devis temporaire dans `devis_temp_ai`

---

## 🎊 **SUCCÈS !**

Si tous les tests passent, **l'IA conversationnelle est opérationnelle** !

**Prochaine étape** : Intégrer le bouton dans `VoiceRecorder.js` pour un accès direct.

---

## 📝 **COMMANDES UTILES**

```bash
# Voir les logs de la fonction
supabase functions logs ai-devis-conversational --tail

# Lister les fonctions déployées
supabase functions list

# Supprimer une fonction (si besoin)
supabase functions delete ai-devis-conversational

# Redéployer après modification
supabase functions deploy ai-devis-conversational
```

---

**Besoin d'aide ?** Consulte `IA_CONVERSATIONNELLE_IMPLEMENTATION.md` ! 📚

