# 🔧 Guide - Adaptation Edge Function pour Factures

## ✅ Modifications effectuées

L'Edge Function `ai-devis-conversational` a été adaptée pour gérer les factures en plus des devis.

## 📋 Changements principaux

### 1. Interface AIResponse
- Ajout du champ optionnel `facture?: DevisJSON`
- Le champ `devis` reste pour compatibilité
- La réponse contient soit `devis` soit `facture` selon le type

### 2. Paramètre `type`
- Accepte `type: 'devis'` ou `type: 'facture'` dans les requêtes
- Par défaut : `'devis'` (pour compatibilité)
- Stocké dans la session (`devis_ai_sessions.type`)

### 3. Paramètre `devis_id` (optionnel)
- Pour les factures, peut être liée à un devis existant
- Le contexte du devis est ajouté à la transcription si fourni

### 4. Prompts GPT adaptés
- **Pour factures** : Prompt spécialisé pour facturation
  - Questions adaptées (travaux réalisés, modifications, acomptes, etc.)
  - Contexte de devis si disponible
- **Pour devis** : Prompt original conservé

### 5. Réponses selon le type
- Si `type === 'facture'` → retourne `response.facture`
- Si `type === 'devis'` → retourne `response.devis`

## 🔄 Actions supportées

### `action: 'start'`
```json
{
  "action": "start",
  "type": "facture",  // ou "devis"
  "devis_id": "uuid", // optionnel pour factures
  "transcription": "...",
  "notes": [...],
  "project_id": "uuid",
  "client_id": "uuid",
  "user_id": "uuid"
}
```

### `action: 'answer'`
```json
{
  "action": "answer",
  "session_id": "uuid",
  "reponses": ["réponse 1", "réponse 2"],
  "type": "facture"  // optionnel, récupéré depuis session si absent
}
```

### `action: 'finalize'`
```json
{
  "action": "finalize",
  "session_id": "uuid",
  "type": "facture"  // optionnel, récupéré depuis session si absent
}
```

## 📝 Structure de la réponse

### Pour devis
```json
{
  "status": "ready",
  "devis": {
    "titre": "...",
    "lignes": [...],
    "total_ht": 1000,
    "total_ttc": 1200
  },
  "questions": [],
  "session_id": "uuid",
  "tour_count": 1
}
```

### Pour factures
```json
{
  "status": "ready",
  "facture": {
    "titre": "...",
    "lignes": [...],
    "total_ht": 1000,
    "total_ttc": 1200
  },
  "questions": [],
  "session_id": "uuid",
  "tour_count": 1
}
```

## 🗄️ Base de données

### Table `devis_ai_sessions`
- Nouveau champ `type` (TEXT) : `'devis'` ou `'facture'`
- Stocké aussi dans `context_json.type` pour historique

### Table `devis_temp_ai`
- Utilisée pour les deux types (structure identique)
- Le type est déterminé par la session associée

## 🚀 Déploiement

1. **Vérifier la colonne `type` dans `devis_ai_sessions`**
   ```sql
   ALTER TABLE devis_ai_sessions ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'devis';
   ```

2. **Déployer l'Edge Function**
   ```bash
   supabase functions deploy ai-devis-conversational
   ```

3. **Tester**
   - Générer un devis IA (vérifier que `devis` est retourné)
   - Générer une facture IA (vérifier que `facture` est retourné)

## ⚠️ Notes importantes

- **Compatibilité** : Les anciennes requêtes sans `type` fonctionnent toujours (défaut = `'devis'`)
- **Structure identique** : Les factures utilisent la même structure JSON que les devis
- **Contexte devis** : Si `devis_id` est fourni pour une facture, le contexte est automatiquement ajouté

---

**Version** : 1.0  
**Date** : 2025-11-13










