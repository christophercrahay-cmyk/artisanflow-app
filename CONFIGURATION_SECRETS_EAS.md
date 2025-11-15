# 🔐 CONFIGURATION DES SECRETS EAS - GUIDE MANUEL

**Date** : 10 Novembre 2025  
**Objectif** : Configurer les variables d'environnement pour le build production

---

## ═══════════════════════════════════════════════
## PRÉREQUIS
## ═══════════════════════════════════════════════

### 1. Installer EAS CLI (si pas déjà fait)

```bash
npm install -g eas-cli
```

### 2. Se connecter à Expo

```bash
eas login
```

**Identifiants** : Ton compte Expo (chriskreepz)

---

## ═══════════════════════════════════════════════
## CONFIGURATION DES SECRETS (3 COMMANDES)
## ═══════════════════════════════════════════════

### ✅ Secret 1 : SUPABASE_URL

```bash
eas secret:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://upihalivqstavxijlwaj.supabase.co" --force
```

### ✅ Secret 2 : SUPABASE_ANON_KEY

```bash
eas secret:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwaWhhbGl2cXN0YXZ4aWpsd2FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjIxMzksImV4cCI6MjA3NzMzODEzOX0.LiTut-3fm7XPAALAi6KQkS1hcwXUctUTPwER9V7cAzs" --force
```

### ✅ Secret 3 : OPENAI_API_KEY

```bash
eas secret:create --name EXPO_PUBLIC_OPENAI_API_KEY --value "[OPENAI_KEY_REDACTED]" --force
```

---

## ═══════════════════════════════════════════════
## VÉRIFICATION
## ═══════════════════════════════════════════════

### Lister les secrets configurés

```bash
eas secret:list
```

**Résultat attendu** :
```
✔ Loaded secrets for project @chriskreepz/artisanflow-3rgvrambzo0tk8d1ddx2

Secrets for this account:

  • EXPO_PUBLIC_SUPABASE_URL
  • EXPO_PUBLIC_SUPABASE_ANON_KEY
  • EXPO_PUBLIC_OPENAI_API_KEY
```

---

## ═══════════════════════════════════════════════
## NOTES IMPORTANTES
## ═══════════════════════════════════════════════

1. **Les secrets sont stockés sur les serveurs Expo** (sécurisés)
2. **Ils ne sont jamais exposés dans le code** de l'APK
3. **Ils sont injectés uniquement pendant le build** EAS
4. **Tu peux les mettre à jour** avec `eas secret:create --force`
5. **Tu peux les supprimer** avec `eas secret:delete --name EXPO_PUBLIC_XXX`

---

## ═══════════════════════════════════════════════
## PROCHAINE ÉTAPE : BUILD PRODUCTION
## ═══════════════════════════════════════════════

Une fois les secrets configurés, tu peux lancer le build :

```bash
eas build --platform android --profile production
```

**Durée** : 10-15 minutes

**Résultat** : Un fichier `.aab` (Android App Bundle) prêt pour le Play Store

---

## ═══════════════════════════════════════════════
## ALTERNATIVE : SCRIPT AUTOMATIQUE
## ═══════════════════════════════════════════════

Si EAS CLI est installé, tu peux utiliser le script automatique :

```bash
powershell -ExecutionPolicy Bypass -File scripts/configure-eas-secrets.ps1
```

Ce script lit automatiquement le fichier `.env` et configure tous les secrets en une seule commande.

---

## ✅ **TU ES PRÊT !**

Une fois les 3 secrets configurés, ton app est **100% sécurisée** et prête pour la production ! 🚀


