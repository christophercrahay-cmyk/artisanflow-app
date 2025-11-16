# Analyse Parcours Vocal → Devis PDF

**Date** : 13 novembre 2025  
**Objectif** : Identifier les frictions utilisateur et points d'amélioration

---

## 📍 Parcours actuel

### Étape 1 : Enregistrement vocal
**Fichier** : `VoiceRecorder.js` (lignes 114-202)

1. Utilisateur appuie sur "Enregistrer"
2. Permission micro demandée
3. Enregistrement audio (Audio.Recording)
4. Stop → Upload Supabase Storage (`voices/`)
5. **Transcription Whisper** (via `transcribeAudio()`)
   - Status affiché : setTranscriptionStatus (ligne 265)
   - Progress : setTranscriptionProgress (ligne 256)
   - ⚠️ **Problème** : Pas d'UI visible pour ce feedback
6. **Analyse GPT** (via `analyzeNote()`)
   - Extrait type de travaux, urgence, prix estimé
7. Sauvegarde en DB (`notes` table)

### Étape 2 : Génération devis IA
**Fichier** : `components/DevisAIGenerator2.js` (lignes 85-174)

1. Utilisateur clique sur "Générer devis IA"
2. Récupération de **toutes** les notes du chantier (ligne 96-100)
3. Appel `startDevisSession()` → envoie notes à GPT-4
4. IA retourne :
   - Devis structuré (lignes, prix)
   - Questions de clarification
5. **Modal de questions** s'ouvre
6. Utilisateur répond (texte ou vocal)
7. `answerQuestions()` affine le devis
8. `createDevisFromAI()` crée le devis en DB

### Étape 3 : Génération PDF
**Fichier** : `screens/DocumentsScreen2.js` + `utils/utils/pdf.js`

1. Utilisateur ouvre l'écran Documents
2. Clique sur "Voir PDF"
3. `generateDevisPDFFromDB()` génère le PDF
4. Partage ou prévisualisation

---

## 🚨 Frictions identifiées

### 🔴 Critique (bloquant adoption)

1. **Pas de feedback visuel durant transcription Whisper**
   - L'utilisateur ne voit pas que Whisper travaille
   - Risque d'abandon si > 10 secondes sans feedback
   - **Solution** : Ajouter ProgressBar + texte "Transcription en cours... 60%"

2. **2 étapes séparées non évidentes**
   - Enregistrer note vocale ≠ générer devis
   - L'artisan peut ne pas comprendre qu'il doit cliquer 2 fois
   - **Solution** : Bouton "Enregistrer ET générer devis" (parcours direct)

3. **Aucune validation avant création en DB**
   - Le devis est créé directement dans `devis` table
   - Pas de prévisualisation, pas d'annulation possible
   - **Solution** : Prévisualisation avec bouton "Valider le devis"

### 🟠 Important (impact UX)

4. **Questions multiples peuvent être lourdes**
   - Si l'IA pose 5-10 questions → friction
   - **Solution** : Limiter à 3 questions max + bouton "Passer"

5. **Pas de progress bar génération PDF**
   - Génération peut prendre 3-5 secondes
   - **Solution** : Loader avec "Génération du PDF..."

6. **Pas de retry si échec Whisper**
   - Si échec transcription → note vide sauvegardée
   - **Solution** : Bouton "Réessayer la transcription"

### 🟢 Nice-to-have

7. **Pas de synthèse vocale des questions IA**
   - Questions affichées en texte uniquement
   - **Solution** : TTS pour lire les questions (mains-libres)

8. **Pas de templates pré-remplis**
   - Chaque devis part de zéro
   - **Solution** : Templates "Plomberie", "Électricité", etc.

---

## ✅ Ce qui fonctionne bien

- ✅ Transcription Whisper fiable (français OK)
- ✅ Analyse GPT pertinente (type travaux, prix)
- ✅ Réponses vocales aux questions (bonne idée)
- ✅ Historique des notes conservé
- ✅ Sécurité multi-tenant (user_id filtré)

---

## 🎯 Plan d'action recommandé

### Sprint 0 (avant lancement)

1. **Ajouter feedback transcription visible**
   ```jsx
   {isTranscribing && (
     <View style={styles.transcriptionFeedback}>
       <ActivityIndicator />
       <Text>{transcriptionStatus}</Text>
       <ProgressBar progress={transcriptionProgress} />
     </View>
   )}
   ```

2. **Bouton "Générer devis immédiatement"**
   - Dans VoiceRecorder : ajouter checkbox "Générer le devis après l'enregistrement"
   - Si coché → appeler directement DevisAIGenerator

3. **Prévisualisation avant création**
   - Dans DevisAIGenerator2 : remplacer `createDevisFromAI()` direct par modal de prévisualisation
   - Bouton "Valider" → `createDevisFromAI()`

### Sprint 1 (post-lancement)

4. Limiter questions IA à 3 max
5. Progress bar génération PDF
6. Bouton retry transcription
7. Templates pré-remplis

---

## 📊 Métriques à suivre

- Temps moyen transcription (objectif : < 10s)
- Taux d'abandon entre vocal et devis (objectif : < 20%)
- Taux de modification manuelle du devis généré (objectif : < 50%)
- Nombre de questions IA par devis (objectif : ≤ 3)

---

**Prochaines étapes** : Implémenter Sprint 0 (points 1-3) avant janvier 2025.

