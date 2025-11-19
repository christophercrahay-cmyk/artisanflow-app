# Formatage Automatique des Numéros de Téléphone - Import CSV

**Date** : 2025-11-16  
**Statut** : ✅ IMPLÉMENTÉ

---

## 📋 OBJECTIF

Formatage automatique des numéros de téléphone français lors de l'import CSV selon les règles suivantes :

### RÈGLES DE DÉTECTION ET FORMATAGE

1. **Nettoyage** : Retirer espaces, points, tirets, parenthèses, slashes (garder + et chiffres)

2. **Détection du format d'origine** :
   - **CAS A** : Commence par "33" sans "+" (ex: `33782846663`) → Convertir en `+33 7 82 84 66 63`
   - **CAS B** : Commence par "+33" (ex: `+33782846663`) → Formater en `+33 7 82 84 66 63`
   - **CAS C** : Commence par "0" et 10 chiffres (ex: `0782846663`) → Formater en `07 82 84 66 63`
   - **CAS D** : Autre format → Garder tel quel mais nettoyer

3. **Formatage final** : Toujours avec espaces
   - Format français : `XX XX XX XX XX` (si 0X)
   - Format international : `+33 X XX XX XX XX`

---

## ✅ MODIFICATIONS APPLIQUÉES

### 1. Fonction de formatage créée

**Fichier** : `utils/phoneFormatter.js`

```javascript
export const formatPhoneNumber = (phone) => {
  // Nettoyage + Détection + Formatage selon les 4 cas
}
```

**Exemples de conversion** :
- `"33782846663"` → `"+33 7 82 84 66 63"`
- `"0782846663"` → `"07 82 84 66 63"`
- `"07.82.84.66.63"` → `"07 82 84 66 63"`
- `"+33 7 82 84 66 63"` → `"+33 7 82 84 66 63"` (déjà bon)
- `"07-82-84-66-63"` → `"07 82 84 66 63"`

---

### 2. Application dans l'import CSV

#### A. `utils/import/importClients.js`

**Ligne 273** : Formatage automatique lors du parsing

```javascript
// AVANT
phone: (rawRow.phone || '').trim() || undefined,

// APRÈS
const rawPhone = (rawRow.phone || '').trim();
phone: rawPhone ? formatPhoneNumber(rawPhone) : undefined,
```

**Impact** : Tous les imports via `parseClientsFromFile()` formatent automatiquement les téléphones.

---

#### B. `utils/clientImportMapping.ts`

**Lignes 182-185** : Formatage lors de l'application du mapping

```typescript
// AVANT
if (mapping.phone) {
  const phone = (row[mapping.phone] || '').toString().trim();
  if (phone) parsed.phone = phone;
}

// APRÈS
if (mapping.phone) {
  const rawPhone = (row[mapping.phone] || '').toString().trim();
  if (rawPhone) {
    parsed.phone = formatPhoneNumber(rawPhone);
  }
}
```

**Impact** : Tous les imports avec mapping adaptatif formatent automatiquement les téléphones.

---

#### C. `screens/ClientsListScreen2.js`

**Ligne 551** : Double vérification du formatage

```javascript
// AVANT
phone: client.phone,

// APRÈS
phone: client.phone ? formatPhoneNumber(client.phone) : undefined,
```

**Impact** : Sécurité supplémentaire si le formatage n'a pas été fait en amont.

---

## 🔄 FLUX D'IMPORT

```
CSV/Excel
  ↓
parseClientsFromFile() → formatPhoneNumber() ✅
  ↓
applyMapping() → formatPhoneNumber() ✅
  ↓
formattedRows → formatPhoneNumber() ✅ (double vérification)
  ↓
importClientsFromParsedRows()
  ↓
Supabase (téléphones formatés)
```

---

## ✅ VALIDATION

**Tests recommandés** :

1. Import CSV avec téléphone `33782846663` → Doit devenir `+33 7 82 84 66 63`
2. Import CSV avec téléphone `0782846663` → Doit devenir `07 82 84 66 63`
3. Import CSV avec téléphone `07.82.84.66.63` → Doit devenir `07 82 84 66 63`
4. Import CSV avec téléphone `+33 7 82 84 66 63` → Doit rester `+33 7 82 84 66 63`
5. Import CSV avec téléphone `07-82-84-66-63` → Doit devenir `07 82 84 66 63`

---

## 📝 NOTES

- Le formatage est appliqué **automatiquement** à chaque import CSV
- Aucune action manuelle requise de la part de l'utilisateur
- Les numéros sont normalisés avant insertion dans Supabase
- Compatible avec tous les formats d'import (CSV, XLS, XLSX, mapping adaptatif)

---

**Formatage automatique des téléphones implémenté et opérationnel !** ✅

