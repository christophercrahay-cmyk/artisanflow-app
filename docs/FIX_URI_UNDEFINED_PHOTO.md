# 🔧 Fix : URI Undefined Upload Photo & Vocal

**Date** : 6 novembre 2025  
**Fichier corrigé** : `hooks/useAttachCaptureToProject.ts`

---

## 🐛 Erreurs

**Photo** :
```
ERROR The "uri" argument must be a string
Compression de l'image: undefined
```

**Vocal** :
```
ERROR The "uri" argument must be a string
Erreur upload vocal
```

---

## 🔍 Cause

La structure de `capture` varie selon le workflow :

**Ancien système** :
```javascript
capture = {
  type: 'photo',
  fileUri: 'file://...'  // Direct
}
```

**Nouveau système** :
```javascript
capture = {
  type: 'photo',
  data: {
    fileUri: 'file://...'  // Nested
  }
}
```

**Le code** appelait `capture.fileUri` → `undefined` ❌

---

## ✅ Solution

Protection pour les 2 formats :

```typescript
// ✅ Supporte les 2 structures
const fileUri = capture.data?.fileUri || capture.fileUri;

if (!fileUri) {
  throw new Error('URI manquant');
}

// Puis utiliser fileUri
await compressImage(fileUri);
```

---

## 📝 Fonctions Corrigées

### attachPhoto
- ✅ `fileUri` : depuis `data.fileUri` ou `fileUri` direct
- ✅ Validation + log si manquant

### attachAudio
- ✅ `fileUri` : depuis `data.fileUri` ou `fileUri` direct
- ✅ `durationMs` : depuis `data.durationMs` ou `durationMs` direct
- ✅ Validation + log

### attachNote
- ✅ `content` : depuis `data.content` ou `content` direct
- ✅ Validation + log

---

## 🎯 Test

**Photo** : ✅ Fonctionne  
**Vocal** : ✅ Fonctionne (durationMs corrigé)  
**Note** : ✅ Fonctionne depuis le début

---

**Tous les uploads fonctionnent maintenant !** ✅

