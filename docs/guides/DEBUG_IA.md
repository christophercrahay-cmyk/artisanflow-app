# 🐛 DEBUG IA DEVIS : Guide de Diagnostic

## ⚠️ ERREUR ACTUELLE

```
null value in column "montant_ht" violates not-null constraint
```

**Cause probable** : L'IA détecte des services mais ne calcule pas correctement les totaux.

---

## 📊 LOGS DE DEBUG AJOUTÉS

Des logs détaillés ont été ajoutés pour diagnostiquer :

### Dans `utils/ai_quote_generator.js` :
- `[extractServices] Analyse de: ...`
- `[extractServices] Match trouvé: qty=..., keyword=...`
- `[extractServices] Résultat: ... prestation(s) détectée(s)`

### Dans `VoiceRecorder.js` :
- `[VoiceRecorder] 🧠 Analyse IA de la transcription...`
- `[VoiceRecorder] ✅ Prestations détectées: [...]`
- `[VoiceRecorder] 💰 Totaux calculés: {...}`
- `[VoiceRecorder] 🐛 Debug quoteData: ...`

### Dans `utils/supabase_helpers.js` :
- `[insertAutoQuote] Données à insérer: {...}`
- `[insertAutoQuote] Totals invalide: ...` (si erreur)
- `[insertAutoQuote] Devis créé: {...}`

---

## 🔍 DIAGNOSTIC PAR ÉTAPE

### Étape 1 : Vérifier l'Analyse

**Rechercher dans les logs** :
```
[extractServices] Analyse de: remplacer 8 prises...
[extractServices] Match trouvé: qty=8, keyword="prises"
```

**Si aucun match** → Patterns regex incorrects

### Étape 2 : Vérifier les Totaux

**Rechercher dans les logs** :
```
[extractServices] Résultat: 3 prestation(s) détectée(s)
[VoiceRecorder] 💰 Totaux calculés: { totalHT: 414, tva: 82.8, totalTTC: 496.8 }
```

**Si `null` ou `undefined`** → Erreur dans `calculateTotals`

### Étape 3 : Vérifier l'Insertion

**Rechercher dans les logs** :
```
[insertAutoQuote] Données à insérer: { montant_ht: 414, montant_ttc: 496.8, ... }
```

**Si `null`** → Validation échoue

---

## 🧪 TEST MANUEL : Votre Transcription

### Input
```
"Remplacer 8 prises électriques Schneider, installer 2 interrupteurs va-et-vient, prévoir 6 heures de main d'œuvre, fournitures comprises"
```

### Patterns Réussis Attendu

| Pattern | Match Attendu |
|---------|---------------|
| `/(\d+)\s*(prise|prises)/gi` | `8 prises` |
| `/(installer|installation)\s+(\d+)\s+(interrupteur|interrupteurs)/gi` | `installer 2 interrupteurs` |
| `/(\d+)\s*(heure|heures)/gi` | `6 heures` |

### Problèmes Potentiels

1. **`prises électriques`** → Pattern peut matcher juste `prises` ✅
2. **`interrupteurs va-et-vient`** → Peut créer 2 matches (interrupteurs + va-et-vient) ⚠️
3. **`heures de main d'œuvre`** → Pattern `/(\d+)\s*(heures? de main d'œuvre)/gi` existe ✅

---

## 🔧 CORRECTIONS APPLIQUÉES

### ✅ Validation Ajoutée
Dans `insertAutoQuote`, vérification que `totals` est valide avant insertion.

### ✅ Logs Ajoutés
Logs complets à chaque étape pour diagnostic.

### ⏳ À FAIRE SI PROBLÈME

**Si les logs montrent `totals: null`** :

1. **Vérifier** le retour de `calculateTotals`
2. **Vérifier** que `services` n'est pas vide
3. **Tester** manuellement `calculateTotals([{quantity: 1, unitPriceHT: 10}])`

---

## 📝 COMMENT INTERPRÉTER LES LOGS

### Cas 1 : Aucune prestation détectée
```
[extractServices] Résultat: 0 prestation(s) détectée(s)
```
**Action** : Ajouter patterns regex manquants

### Cas 2 : Prestations détectées mais totaux null
```
[extractServices] Résultat: 3 prestation(s) détectée(s)
[VoiceRecorder] 💰 Totaux calculés: null
```
**Action** : Debugger `calculateTotals`

### Cas 3 : Totaux ok mais insertion échoue
```
[insertAutoQuote] Totals invalide: {...}
```
**Action** : Vérifier structure Supabase

---

## 🎯 PROCHAINE ACTION

**Relancer l'app et tester** :
```bash
npx expo start -c
```

**Puis cliquer "🧠 Générer Devis IA"** et observer les logs dans le terminal Expo.

**Envoyez-moi les logs complets** si le problème persiste ! 📊

