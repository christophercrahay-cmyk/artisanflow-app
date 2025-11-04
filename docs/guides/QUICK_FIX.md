# ⚡ QUICK FIX : IA Devis

## ❌ PROBLÈME

Les logs montrent `montant_ht: null` lors de l'insertion de devis.

## 🔧 SOLUTION APPLIQUÉE

1. ✅ Ajout validation dans `insertAutoQuote`
2. ✅ Ajout logs détaillés partout
3. ✅ Bouton "🧠 Générer Devis IA" ajouté

## 🧪 TESTER

**Commande** :
```bash
npx expo start -c
```

**Dans l'app** :
1. Clients → Chantier
2. Note vocale → Cliquer "🧠 Générer Devis IA"
3. Observer les logs dans le terminal

**Logs attendus** :
```
[extractServices] Analyse de: remplacer 8 prises...
[extractServices] Match trouvé: qty=8, keyword="prises"
[VoiceRecorder] 💰 Totaux calculés: { totalHT: 414, ... }
[insertAutoQuote] Devis créé: {...}
```

**Si erreur** → M'envoyer les logs complets du terminal.

## 📊 FICHIERS

- ✅ `VoiceRecorder.js` - Bouton IA + logs
- ✅ `utils/ai_quote_generator.js` - Patterns FR + logs
- ✅ `utils/supabase_helpers.js` - Validation + logs

**PRÊT À TESTER** 🚀

