# 🧪 Guide de Test Final - ArtisanFlow

**Date** : 13 novembre 2025  
**Objectif** : Valider toutes les modifications avant lancement

---

## ✅ Modifications implémentées

1. ✅ Mentions légales PDF complètes
2. ✅ Feedback transcription Whisper visible
3. ✅ Fallback RevenueCat non-bloquant
4. ✅ Écran OnboardingPaywall créé
5. ✅ Système monitoring OpenAI ready

---

## 🧪 TESTS À FAIRE MAINTENANT

### Test 1 : Mentions légales PDF (CRITIQUE) ⭐

**Temps** : 5-7 minutes

#### Étapes

1. **Ouvrir l'app** → Onglet "Documents" (en bas à droite)
2. **Cliquer sur** "Documents" → "Settings" (icône ⚙️ en haut)
3. **Scroller vers le bas** → Section "Mentions légales" (icône 🛡️)
4. **Remplir tous les champs** :
   ```
   Forme juridique : SARL
   Capital social : 10000€
   TVA intra : FR12345678901
   Assurance RCP (assureur) : AXA
   Assurance RCP (police) : 123456789
   Assurance décennale (assureur) : MAIF
   Assurance décennale (police) : 987654321
   Qualification : RGE, Qualibat
   ```
5. **Sauvegarder** (bouton en bas)
6. **Vérifier message** : "✅ Succès - Paramètres sauvegardés"
7. **Retour** → Onglet "Clients"
8. **Créer un client** (ou utiliser existant)
9. **Créer un chantier** pour ce client
10. **Créer un devis** (avec au moins 2 lignes)
11. **Générer PDF**
12. **Ouvrir le PDF** et **VÉRIFIER** :

**✅ Checklist PDF :**
- [ ] Nom entreprise présent
- [ ] SIRET présent
- [ ] **TVA intra présent** : "TVA intra : FR12345678901"
- [ ] **Forme juridique** : "Forme juridique : SARL – Capital social : 10000€"
- [ ] **Assurance RCP** : "Assurance RCP : AXA – Police n°123456789"
- [ ] **Assurance décennale** : "Assurance décennale : MAIF – Police n°987654321"
- [ ] **Qualification** : "Qualification : RGE, Qualibat"
- [ ] **CGV complètes** :
  - "Validité : 30 jours"
  - "Conditions de paiement : Acompte 30%"
  - "Délai de rétractation : 14 jours"
  - "Pénalités de retard : 3 fois le taux d'intérêt légal"
  - "Indemnité forfaitaire : 40€"

**❌ Si une mention manque** → Me contacter immédiatement

**✅ Si tout est présent** → PDF conforme légalement ! 🎉

---

### Test 2 : Feedback transcription Whisper ⭐

**Temps** : 3-5 minutes

#### Étapes

1. **Ouvrir l'app** → Onglet "Capture"
2. **Sélectionner un chantier actif** (dropdown en haut)
3. **Cliquer sur** la carte "🎤 Vocal"
4. **Enregistrer une note vocale** :
   - Parler pendant 10-15 secondes
   - Ex : "Installer 3 prises électriques dans le salon, prévoir câblage apparent"
5. **Stop** → Attendre le traitement

**✅ Vérifier pendant le traitement** :
- [ ] **Bloc feedback visible** avec :
  - Icône (🎤 ou ☁️ ou 🧠)
  - Texte statut ("Transcription en cours...")
  - **Progress bar qui avance** (barre bleue)
  - Pourcentage (ex : "45%")
  - **3 étapes en bas** (Upload → Transcription → Analyse)
- [ ] Progress bar avance de 10% → 33% → 55% → 80% → 100%
- [ ] Statuts changent :
  - "Upload du fichier audio..."
  - "Transcription en cours avec Whisper..."
  - "Correction orthographique..."
  - "Analyse du contenu..."
  - "Traitement terminé !"
- [ ] Feedback disparaît après ~1 seconde

**✅ Vérifier après traitement** :
- [ ] Note apparaît dans la liste
- [ ] Transcription présente et correcte
- [ ] Badge analyse visible ("✅ Prestation" ou autre)

**❌ Si feedback invisible** → Vérifier import TranscriptionFeedback

---

### Test 3 : Fallback RevenueCat

**Temps** : 2 minutes

#### Étapes

1. **Désactiver Wi-Fi + données mobiles**
2. **Fermer l'app** (force quit)
3. **Réouvrir l'app**

**✅ Vérifier (en mode dev uniquement)** :
- [ ] App s'ouvre normalement (pas de crash)
- [ ] Message d'alerte visible : "⚠️ Erreur de connexion - Impossible de vérifier votre abonnement"
- [ ] Cliquer OK → App fonctionne normalement

**✅ En production (IAP_ENABLED=true)** :
- [ ] App s'ouvre sans alerte (silencieux)
- [ ] Features restent accessibles temporairement

**❌ Si crash** → Vérifier try/catch App.js ligne 74

---

### Test 4 : OnboardingPaywall (manuel)

**Temps** : 2 minutes

#### Test navigation directe

1. **Dans le code** (temporairement pour tester) :
   ```javascript
   // Dans App.js, ligne 170, remplacer :
   {session ? <AppNavigator /> : <AuthScreen />}
   
   // Par (TEMPORAIREMENT) :
   {session ? <OnboardingPaywallScreen navigation={/* ... */} /> : <AuthScreen />}
   ```

2. **Relancer l'app**

**✅ Vérifier** :
- [ ] Écran onboarding s'affiche
- [ ] Titre : "Bienvenue sur ArtisanFlow 👋"
- [ ] 4 features affichées avec icônes Feather
- [ ] Badge essai 7 jours visible
- [ ] Bouton "Démarrer mon essai gratuit"
- [ ] Bouton "Passer pour l'instant"

3. **Cliquer "Démarrer essai"** → Doit rediriger vers Paywall
4. **Retour** → Cliquer "Passer" → Doit retourner à l'app

5. **Remettre le code normal après test**

---

## 📊 Tests iOS + Android

### Test iOS (si disponible)

1. **Lancer sur iPhone** (simulator ou device)
2. **Tester les 4 tests ci-dessus**
3. **Vérifier rendu** :
   - Picker "Forme juridique" natif iOS
   - Progress bar smooth
   - Haptic feedback (si device réel)

### Test Android

1. **Lancer sur Android** (emulator ou device)
2. **Tester les 4 tests ci-dessus**
3. **Vérifier rendu** :
   - Picker "Forme juridique" natif Android
   - Progress bar smooth
   - Permissions micro OK

---

## 🐛 Problèmes possibles

### Problème 1 : Picker ne s'affiche pas

**Cause** : `@react-native-picker/picker` manquant  
**Solution** :
```bash
npm install @react-native-picker/picker
```

### Problème 2 : TranscriptionFeedback ne s'affiche pas

**Cause** : Import manquant ou fichier .tsx non reconnu  
**Solution** : Vérifier que le fichier est bien à `components/TranscriptionFeedback.tsx`

### Problème 3 : OnboardingPaywall crash

**Cause** : Route non ajoutée dans navigation  
**Solution** : Vérifier `navigation/AppNavigator.js` ligne 88-91

### Problème 4 : PDF sans mentions légales

**Cause** : Champs DB non créés  
**Solution** : Réexécuter `sql/add_legal_fields_to_brand_settings.sql`

---

## ✅ Validation finale

### Checklist développeur

- [ ] Aucune erreur de lint (`npm run lint`)
- [ ] Aucune erreur console importante
- [ ] App fonctionne hors-ligne
- [ ] PDF conformes (toutes mentions)
- [ ] Feedback transcription visible
- [ ] OnboardingPaywall navigable

### Checklist juridique

- [ ] PDF validé par avocat / expert-comptable
- [ ] CGU publiées sur web
- [ ] Confidentialité publiée sur web
- [ ] Liens fonctionnels depuis PaywallScreen

### Checklist stores

- [ ] Screenshots iOS (5-6 images)
- [ ] Screenshots Android (5-6 images)
- [ ] Description App Store (<4000 chars)
- [ ] Description Play Store (<4000 chars)
- [ ] Icône app (1024x1024)

---

## 📅 Timeline recommandée

### Aujourd'hui (13 nov) - Tests

- [ ] Tests 1-4 (30 min)
- [ ] Corriger bugs éventuels (1-2h)

### Demain (14 nov) - Web + Juridique

- [ ] Publier pages CGU / Confidentialité (2h)
- [ ] Envoyer docs à avocat (30min)

### Semaine prochaine (18-22 nov) - Polish

- [ ] Validation avocat (attendre retour)
- [ ] Screenshots stores (2h)
- [ ] Descriptions stores (1h)
- [ ] Tests beta utilisateurs (5-10 artisans)

### Début décembre - Soumission stores

- [ ] Soumettre à Apple App Store (délai : 24-48h)
- [ ] Soumettre à Google Play Store (délai : 1-3 jours)

### Mi-janvier 2025 - Lancement 🚀

- [ ] Communication (réseaux sociaux, email, etc.)
- [ ] Monitoring premier jour
- [ ] Support utilisateurs actif

---

## 🎯 Métriques de succès

### Technique

- ✅ **0 crash** au lancement
- ✅ **100% features** fonctionnelles
- ✅ **< 3s** génération PDF
- ✅ **< 10s** transcription Whisper

### Business

- 🎯 **50 installs** en semaine 1
- 🎯 **20% conversion** trial → paid
- 🎯 **< 10% churn** mois 1
- 🎯 **4.5+ étoiles** stores

---

## 📞 Support

**Si un test échoue** :

1. Vérifier logs console
2. Relire le guide d'implémentation correspondant
3. Vérifier que le script SQL a bien été exécuté
4. Me contacter avec :
   - Nom du test qui échoue
   - Message d'erreur (screenshot)
   - Logs console

---

## 🎉 Message final

**Tu y es presque ! 🚀**

Tous les dev critiques sont faits. Il ne reste que :
- 30 min de tests
- 2h de pages web
- Validation juridique

**Ensuite, tu lances !**

**Bon courage ! 💪**


