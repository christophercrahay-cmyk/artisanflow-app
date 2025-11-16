# 🧪 GUIDE DE TEST : IA Devis Automatique

## ✅ PRÉ-REQUIS COMPLETS

- ✅ Supabase configuré (migration terminée)
- ✅ Colonne `client_id` ajoutée à la table `notes`
- ✅ App Expo démarrée
- ✅ Téléphone connecté et app ouverte

---

## 🎯 SCÉNARIO DE TEST

### **Étape 1 : Créer/Vérifier un Client et un Chantier**

Dans l'app :
1. Onglet **"Clients"**
2. Vérifier qu'il y a au moins **1 client** existant
3. Si aucun → Créer un nouveau client (nom, téléphone)
4. Cliquer sur le client pour ouvrir sa fiche
5. Vérifier qu'il y a au moins **1 chantier (project)**
6. Si aucun → Créer un nouveau chantier

---

### **Étape 2 : Enregistrer une Note Vocale en ANGLAIS**

**⚠️ IMPORTANT : Whisper est configuré en anglais !**

1. Cliquer sur un **chantier** pour ouvrir sa fiche
2. Section **"Note vocale"**
3. Cliquer sur **"🎙️ Enregistrer"**
4. Attendre le démarrage de l'enregistrement (bouton devient rouge "⏹️ Stop")
5. **Parler clairement en anglais** :

#### **📝 Exemples de transcriptions à tester** :

**Exemple 1 - Simple** :
```
"Replace 3 outlets, install 2 switches, and add one hour of labor."
```

**Exemple 2 - Complet** :
```
"Install 8 outlets, 2 dimmers, replace 4 LED spots, and 6 hours of labor."
```

**Exemple 3 - Avec prix** :
```
"Change 5 outlets, 3 switches, add one hour of work."
```

6. Cliquer sur **"⏹️ Stop"** pour arrêter l'enregistrement
7. Cliquer sur **"☁️ Envoyer"**

---

### **Étape 3 : Observer le Résultat**

#### **✅ COMPORTEMENT ATTENDU** :

Une fois l'enregistrement envoyé :

1. **Transcription Whisper** : Le texte en anglais apparaît
2. **Analyse IA** : L'app détecte automatiquement les prestations
3. **Alerte de confirmation** :
   ```
   🎯 Devis automatique généré ✅
   
   Note vocale envoyée ✅
   
   🧠 4 prestation(s) détectée(s)
   
   Total HT: 348.00 €
   Total TTC: 417.60 €
   
   📄 Devis DEV-2025-XXXX créé.
   
   [OK]
   ```

4. **En arrière-plan** :
   - Le devis est créé dans Supabase
   - Lien vers le chantier et le client
   - Numéro unique généré
   - Statut "brouillon" par défaut

---

### **Étape 4 : Vérifier le Devis Créé**

#### **Option A : Dans l'app** 
1. Onglet **"Pro"** (ou Dashboard Pro)
2. Vérifier la carte **"Devis en attente"** → nombre +1
3. OU retourner dans le chantier
4. Scroller jusqu'à la section **"Devis"**
5. ✅ Un nouveau devis devrait apparaître

#### **Option B : Dans Supabase**
1. Aller sur https://supabase.com/dashboard
2. Table Editor → table `devis`
3. ✅ Vérifier les nouvelles lignes
4. Colonnes importantes :
   - `numero` : DEV-2025-XXXX
   - `montant_ht` : 348.00
   - `montant_ttc` : 417.60
   - `transcription` : texte transcrit
   - `notes` : "Devis généré automatiquement..."

---

## 🔍 CAS PARTICULIERS

### **Cas 1 : Aucune prestation détectée**

**Transcription** :
```
"Hello, this is a test to see if the app works."
```

**Résultat attendu** :
```
Note vocale envoyée ✅

Transcription:
Hello, this is a test to see if the app works.
```

**⚠️ Aucun devis créé** (normal, pas de prestation détectable)

---

### **Cas 2 : Transcription échoue (Expo Go)**

**Si vous êtes en Expo Go** (sans build natif) :

**Résultat** :
```
Note vocale envoyée ✅

(Pas de transcription affichée)
```

**⚠️ Aucun devis créé** (Whisper indisponible dans Expo Go)

**Solution** : Faire un build natif Android

---

### **Cas 3 : Erreur Supabase**

**Message** :
```
Erreur
Colonne manquante dans Supabase...
```

**Cause** : Migration incomplète  
**Solution** : Re-exécuter `FIX_NOTES_CLIENT_ID.sql`

---

## 🐛 DEBUGGING

### **Vérifier les Logs**

Dans le terminal Expo, chercher :

**Logs positifs** :
```
[VoiceRecorder] 🧠 Analyse IA de la transcription...
[VoiceRecorder] ✅ Prestations détectées: [{ designation: 'Outlets', quantity: 3, ... }]
[insertAutoQuote] Devis créé: { id: '...', numero: 'DEV-2025-1234', ... }
```

**Logs d'erreur** :
```
[VoiceRecorder] ⚠️ Échec création devis automatique
[insertAutoQuote] Erreur Supabase: ...
```

---

### **Vérifier la Configuration Whisper**

Le modèle `ggml-tiny.en.bin` est téléchargé au premier lancement.

Logs attendus :
```
[VoiceRecorder] Téléchargement du modèle Whisper...
[VoiceRecorder] Modèle téléchargé: ...
[VoiceRecorder] Initialisation du contexte Whisper...
```

---

## ✅ CRITÈRES DE RÉUSSITE

Le test est réussi si :

1. ✅ L'enregistrement vocal fonctionne
2. ✅ Whisper transcrit l'audio en texte anglais
3. ✅ L'IA détecte automatiquement les prestations
4. ✅ Un devis est créé dans Supabase
5. ✅ L'alerte affiche les bonnes informations (HT, TTC, nombre de prestations)
6. ✅ Le devis apparaît dans l'onglet Pro ou dans le chantier
7. ✅ Aucune erreur dans les logs

---

## 🎉 RÉSULTAT FINAL ATTENDU

**Avant** :
- L'utilisateur doit créer manuellement les devis
- Tout est fait à la main

**Après** :
- L'utilisateur **parle simplement**
- Le devis est **créé automatiquement en < 2 secondes**
- Plus besoin de saisir les lignes manuellement
- Gain de temps énorme pour l'artisan !

---

## 📞 SUPPORT

Si ça ne fonctionne pas :

1. Vérifier les logs dans le terminal
2. Vérifier la structure dans Supabase (table `notes` et `devis`)
3. Vérifier que Whisper est bien initialisé (build natif requis)
4. Vérifier que la transcription est en anglais

**Temps de test total** : ~5 minutes  
**Temps de traitement IA** : ~1-2 secondes  
**Taux de réussite attendu** : 80%+ sur transcriptions propres

