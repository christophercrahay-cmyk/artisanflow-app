# 🧪 INSTRUCTIONS : TESTER L'IA DEVIS AUTOMATIQUE

## ✅ CE QUI A ÉTÉ IMPLÉMENTÉ

### **Bouton "🧠 Générer Devis IA"**
Un nouveau bouton vert est maintenant visible sur **chaque note vocale avec transcription**.

**Localisation** : Dans la section "Note vocale" d'un chantier, sous chaque transcription affichée.

---

## 🎯 COMMENT TESTER

### **Étape 1 : Vérifier que vous avez une note avec transcription**

1. Ouvrir l'app
2. Aller sur onglet **"Clients"**
3. Sélectionner un client
4. Aller sur un chantier
5. Scroller jusqu'à **"Note vocale"**

### **Étape 2 : Cliquer sur le bouton IA**

Si vous voyez une note avec transcription, vous devriez voir 2 boutons :
- **"✏️ Modifier"** (bleu)
- **"🧠 Générer Devis IA"** (vert) ← **NOUVEAU**

Cliquez sur **"🧠 Générer Devis IA"**.

### **Étape 3 : Observer le résultat**

**Si l'IA détecte des prestations** :
```
🎯 Devis automatique généré ✅

3 prestation(s) détectée(s)

Total HT: 348.00 €
Total TTC: 417.60 €

📄 Devis DEV-2025-XXXX créé.
```

**Si l'IA ne détecte rien** :
```
ℹ️ Info
Aucune prestation détectée dans cette transcription.
```

---

## 🧪 TESTER AVEC VOTRE TRANSCRIPTION FRANÇAISE

Vous avez inséré cette note dans Supabase :
```
"Remplacer 8 prises électriques Schneider, installer 2 interrupteurs va-et-vient, prévoir 6 heures de main d'œuvre, fournitures comprises"
```

**Problème** : Cette note est en **français**, et l'IA a des patterns limités.

### **Patterns Actuels Supportés**
- ✅ `8 prises` → Détecté
- ✅ `2 interrupteurs` → Détecté
- ✅ `6 heures` → Détecté
- ⚠️ `interrupteurs va-et-vient` → Peut être détecté comme "interrupteurs" + "va-et-vient"
- ❌ `prises électriques` → Peut être confondu

**Résultat Attendu** : L'IA devrait détecter **~3 prestations**.

---

## 🔍 SI ÇA NE MARCHE PAS

### **Vérifier les Logs dans le Terminal Expo**

Chercher :
```
[VoiceRecorder] 🧠 Analyse IA de la transcription...
[VoiceRecorder] ✅ Prestations détectées: [...]
[insertAutoQuote] Devis créé: {...}
```

### **Vérifier les Patterns**

Ouvrir `utils/ai_quote_generator.js` et vérifier les patterns regex (lignes 66-92).

Si votre texte utilise des termes non prévus, ajouter un pattern correspondant.

### **Exemple d'Ajout**

Si vous dites **"changer 5 prises"**, ajouter :
```javascript
/(changer|remplacer)\s+(\d+)\s+(prise|prises)/gi,
```

---

## ✅ WORKFLOW COMPLET

**L'IA fonctionne maintenant dans 2 cas** :

### **Cas 1 : Upload Nouvelle Note (Automatique)**
1. User enregistre note vocale
2. Clique "☁️ Envoyer"
3. Whisper transcrit (si build natif)
4. **IA crée devis automatiquement** ✅

### **Cas 2 : Note Existante (Manuel)**
1. Note déjà dans la DB
2. User clique "🧠 Générer Devis IA"
3. **IA crée devis manuellement** ✅

---

## 🐛 DÉPANNAGE

### Problème : Le bouton n'apparaît pas

**Cause** : Aucune note avec transcription  
**Solution** : Créer une note avec transcription

### Problème : "Aucune prestation détectée"

**Cause** : Patterns regex ne matchent pas  
**Solution** : Vérifier le texte ou ajouter patterns manquants

### Problème : Erreur Supabase

**Cause** : Colonnes manquantes ou IDs invalides  
**Solution** : Exécuter `FIX_NOTES_CLIENT_ID.sql` ou vérifier store

---

## 🎉 RÉSULTAT ATTENDU

Après avoir cliqué "🧠 Générer Devis IA" sur votre note française :

**Devis créé avec** :
- 8 prises × 15 € = 120 €
- 2 interrupteurs × 12 € = 24 €
- 6 heures × 45 € = 270 €
- **Total HT** : 414 €
- **Total TTC** : 496.80 €

**Le devis apparaît dans** :
- Section "Devis" du chantier
- Onglet "Pro" → Carte "Devis en attente"

---

## 📞 SI BESOIN

Relancer l'app :
```bash
npx expo start --clear
```

Vérifier les logs dans le terminal Expo.

**Good luck ! 🚀**

