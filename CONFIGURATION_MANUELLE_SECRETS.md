# 🔐 CONFIGURATION MANUELLE DES SECRETS EAS

**Problème** : La nouvelle version d'EAS CLI demande des prompts interactifs qu'on ne peut pas automatiser.

**Solution** : Tu dois exécuter les commandes **manuellement** dans ton terminal.

---

## 🚀 **MARCHE À SUIVRE (5 MINUTES)**

### **1. Ouvrir un terminal**

Dans Visual Studio Code :
- Appuie sur **`` Ctrl + ` ``** (backtick)
- Ou menu : `Terminal` → `Nouveau terminal`

---

### **2. Vérifier que tu es connecté**

```bash
npx eas-cli whoami
```

**Résultat attendu** : `chriskreepz` ✅

---

### **3. Créer les 3 variables d'environnement**

#### **Variable 1/3 : SUPABASE_URL**

```bash
npx eas-cli env:create
```

**Prompts interactifs** :
- `Name:` → Tape : `EXPO_PUBLIC_SUPABASE_URL`
- `Value:` → Colle : `https://upihalivqstavxijlwaj.supabase.co`
- `Type:` → Choisis : `string` (flèche bas + Entrée)
- `Visibility:` → Choisis : `Plaintext` (Entrée)
- `Environment:` → Choisis : `production` (Entrée)

---

#### **Variable 2/3 : SUPABASE_ANON_KEY**

```bash
npx eas-cli env:create
```

**Prompts interactifs** :
- `Name:` → Tape : `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `Value:` → Colle : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwaWhhbGl2cXN0YXZ4aWpsd2FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjIxMzksImV4cCI6MjA3NzMzODEzOX0.LiTut-3fm7XPAALAi6KQkS1hcwXUctUTPwER9V7cAzs`
- `Type:` → Choisis : `string`
- `Visibility:` → Choisis : `Sensitive` (IMPORTANT !)
- `Environment:` → Choisis : `production`

---

#### **Variable 3/3 : OPENAI_API_KEY**

```bash
npx eas-cli env:create
```

**Prompts interactifs** :
- `Name:` → Tape : `EXPO_PUBLIC_OPENAI_API_KEY`
- `Value:` → Colle : `[OPENAI_KEY_REDACTED]`
- `Type:` → Choisis : `string`
- `Visibility:` → Choisis : `Sensitive` (IMPORTANT !)
- `Environment:` → Choisis : `production`

---

### **4. Vérifier que les 3 variables sont créées**

```bash
npx eas-cli env:list
```

**Résultat attendu** :
```
┌─────────────────────────────────┬──────────┬────────────┬──────────────┐
│ Name                            │ Type     │ Visibility │ Environments │
├─────────────────────────────────┼──────────┼────────────┼──────────────┤
│ EXPO_PUBLIC_SUPABASE_URL        │ string   │ Plaintext  │ production   │
│ EXPO_PUBLIC_SUPABASE_ANON_KEY   │ string   │ Sensitive  │ production   │
│ EXPO_PUBLIC_OPENAI_API_KEY      │ string   │ Sensitive  │ production   │
└─────────────────────────────────┴──────────┴────────────┴──────────────┘
```

---

## ✅ **C'EST FAIT !**

Une fois les 3 variables créées, tu peux lancer le build :

```bash
npx eas-cli build --platform android --profile production
```

**Durée** : 10-15 minutes

---

## 💡 **NOTES IMPORTANTES**

### **Visibility: Plaintext vs Sensitive**

- **Plaintext** : Visible en clair (pour URL Supabase, pas de problème)
- **Sensitive** : Masqué (pour les clés API, OBLIGATOIRE)

### **Environment: production**

Les variables seront utilisées **uniquement** pour les builds production (pas dev/preview).

---

## 🎯 **RÉSUMÉ**

1. ✅ EAS CLI installé et connecté (`chriskreepz`)
2. ⏳ **Tu dois créer manuellement les 3 variables** (5 minutes)
3. ⏳ Vérifier avec `npx eas-cli env:list`
4. ⏳ Lancer le build production

**TOTAL : 5 MINUTES DE TRAVAIL MANUEL** 🚀

---

## ❓ **BESOIN D'AIDE ?**

Si tu bloques sur un prompt :
- Utilise les flèches ↑↓ pour naviguer
- Appuie sur `Entrée` pour valider
- Si erreur, relance la commande `npx eas-cli env:create`

**Tu peux le faire ! C'est la dernière étape !** 💪


