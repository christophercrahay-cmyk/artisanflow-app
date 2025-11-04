# 🔧 Solution : Colonne manquante dans project_photos

## ⚠️ Erreur

```
Could not find the 'client_id' column of 'project_photos' in the schema cache
```

---

## ✅ Solution (1 minute)

### Dans Supabase SQL Editor

1. **Ouvrir** : https://supabase.com/dashboard → SQL Editor
2. **Copier-coller** : Tout le contenu de `ADD_CLIENT_ID_TO_PROJECT_PHOTOS.sql`
3. **Cliquer** : RUN
4. ✅ **Confirmer** : "Migration terminée!"

---

## 🎯 Ce que fait le script

- Ajoute la colonne `client_id` à `project_photos`
- Remplit les photos existantes avec le `client_id` de leur projet
- Crée la contrainte de clé étrangère
- Ajoute l'index pour les performances

**Sécurité** : Peut être exécuté plusieurs fois sans problème (idempotent)

---

## 📚 Fichiers Référencés

- `ADD_CLIENT_ID_TO_PROJECT_PHOTOS.sql` - Script de migration
- `GUIDE_SQL_COLONNES_MANQUANTES.md` - Guide détaillé

---

**Votre action** : Exécuter le script SQL dans Supabase  
**Durée** : 30 secondes  
**Risque** : Aucun

