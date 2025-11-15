# 🚀 Guide d'Implémentation - Actions Urgentes

**Date** : 13 novembre 2025  
**Temps total estimé** : 12-16h  
**Objectif** : Rendre ArtisanFlow conforme pour lancement janvier 2025

---

## 📋 Checklist globale

- [ ] **Action 1** : Mentions légales PDF (4-6h)
- [ ] **Action 2** : Pages CGU / Confidentialité (2-3h)
- [ ] **Action 3** : Onboarding essai gratuit (3-4h)
- [ ] **Action 4** : Fallback RevenueCat (1h)
- [ ] **Action 5** : Feedback transcription Whisper (2h)

---

## 🔴 ACTION 1 : Mentions légales PDF (4-6h)

### Étape 1.1 : Base de données (5 min)

```bash
# Ouvrir Supabase SQL Editor
# Exécuter : sql/add_legal_fields_to_brand_settings.sql
```

**Résultat** : 8 nouvelles colonnes dans `brand_settings`

---

### Étape 1.2 : Écran Paramètres (1-2h)

**Fichier** : `screens/SettingsScreen.js`

**Instructions** : Suivre `docs/PATCH_SETTINGS_LEGAL_FIELDS.md`

**Changements** :
1. Ajouter 8 états (ligne 53)
2. Charger depuis DB (ligne 103)
3. Sauvegarder (ligne 260-280)
4. Ajouter section UI "Mentions légales"
5. Import Picker

**Test** :
- [ ] Aller dans Paramètres
- [ ] Remplir TVA intra, assurance RCP, etc.
- [ ] Sauvegarder
- [ ] Recharger → vérifier persistance

---

### Étape 1.3 : Template PDF (2-3h)

**Fichier** : `utils/utils/pdf.js`

**Instructions** : Suivre `docs/PATCH_PDF_TEMPLATE_LEGAL.md`

**Changements** :
1. Ajouter fonction `formatLegalForm` (avant ligne 26)
2. Créer variable `legalBlock` (ligne 211)
3. Modifier objet `company` (ligne 282-288)
4. Insérer `legalBlock` dans HTML (ligne 217)
5. Ajouter styles CSS `.legal-item`

**Test** :
- [ ] Générer un devis PDF
- [ ] Vérifier présence TVA intra
- [ ] Vérifier CGV complètes
- [ ] Vérifier assurance RCP/décennale

---

### Étape 1.4 : Validation juridique (1h)

⚠️ **IMPORTANT** : Faire valider par un avocat / expert-comptable

**Envoyer** :
- 1 devis PDF généré
- 1 facture PDF générée

**Points à valider** :
- [ ] TVA intra conforme
- [ ] CGV conformes (délai rétractation, pénalités)
- [ ] Assurances mentionnées correctement
- [ ] Mentions secteur BTP (si applicable)

---

## 🔴 ACTION 2 : Pages CGU / Confidentialité (2-3h)

### Étape 2.1 : Créer les pages sur le site web

**Domaine** : `artisanflow.app`

**Pages à créer** :
1. `/cgu` (Conditions Générales d'Utilisation)
2. `/confidentialite` (Politique de Confidentialité)

**Contenu minimal CGU** :

```markdown
# Conditions Générales d'Utilisation - ArtisanFlow

## 1. Objet
ArtisanFlow est une application mobile permettant aux artisans...

## 2. Accès au service
- Abonnement : 19,99€/mois
- Essai gratuit : 7 jours
- Résiliation : Possible à tout moment

## 3. Propriété intellectuelle
Tous les contenus de l'application sont protégés...

## 4. Données personnelles
Voir notre Politique de Confidentialité...

## 5. Responsabilité
L'utilisateur reste responsable des devis/factures générés...

## 6. Résiliation
Résiliation possible à tout moment depuis les paramètres...

## 7. Droit applicable
Droit français. Juridiction compétente : Paris.

Dernière mise à jour : [DATE]
Contact : contact@artisanflow.app
```

**Contenu minimal Confidentialité** :

```markdown
# Politique de Confidentialité - ArtisanFlow

## 1. Données collectées
- Email, nom, prénom
- Données entreprise (SIRET, etc.)
- Données clients/chantiers/photos
- Enregistrements vocaux (transcription)

## 2. Utilisation des données
- Fonctionnement de l'application
- Génération de devis/factures
- Transcription vocale (OpenAI Whisper)
- Analyse IA (OpenAI GPT-4o-mini)

## 3. Hébergement
- Supabase (Irlande, UE)
- Conformité RGPD

## 4. Partage des données
- OpenAI (transcription/IA) - Anonymisé
- Aucun autre partage

## 5. Durée de conservation
- Données actives : Durée d'abonnement
- Suppression : Possible à tout moment

## 6. Droits des utilisateurs (RGPD)
- Droit d'accès
- Droit de rectification
- Droit à l'effacement
- Droit d'opposition
- Droit à la portabilité

Contact : privacy@artisanflow.app

Dernière mise à jour : [DATE]
```

**Outils recommandés** :
- Générateur CGU : https://www.legalstart.fr/
- Template RGPD : https://www.cnil.fr/

---

### Étape 2.2 : Mettre à jour les liens dans l'app

**Fichier** : `screens/PaywallScreen.tsx`

**Lignes 329 & 336** :

```typescript
// AVANT
onPress={() => Linking.openURL('https://artisanflow.app/cgu')}
onPress={() => Linking.openURL('https://artisanflow.app/confidentialite')}

// APRÈS (vérifier que les URLs fonctionnent)
onPress={() => Linking.openURL('https://artisanflow.app/cgu')}
onPress={() => Linking.openURL('https://artisanflow.app/confidentialite')}
```

**Test** :
- [ ] Ouvrir PaywallScreen
- [ ] Cliquer sur "Conditions Générales d'Utilisation"
- [ ] Vérifier ouverture navigateur → page CGU
- [ ] Cliquer sur "Politique de Confidentialité"
- [ ] Vérifier ouverture navigateur → page Confidentialité

---

## 🟠 ACTION 3 : Onboarding essai gratuit (3-4h)

### Étape 3.1 : Créer l'écran OnboardingPaywall

**Fichier** : `screens/OnboardingPaywallScreen.tsx`

```typescript
// screens/OnboardingPaywallScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '../theme/theme2';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OnboardingPaywallScreen({ navigation }) {
  const theme = useThemeColors();

  const handleStart = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Marquer l'onboarding comme vu
    await AsyncStorage.setItem('onboarding_paywall_seen', 'true');
    
    // Rediriger vers le paywall
    navigation.replace('Paywall');
  };

  const features = [
    { icon: 'mic', title: 'Notes vocales', desc: 'Transcription automatique' },
    { icon: 'cpu', title: 'Devis IA', desc: 'Génération en 30 secondes' },
    { icon: 'file', title: 'PDF pro', desc: 'Envoi direct aux clients' },
    { icon: 'users', title: 'Gestion complète', desc: 'Clients, chantiers, photos' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Bienvenue sur ArtisanFlow 👋
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
          L'assistant IA qui fait gagner 2h/jour aux artisans
        </Text>
      </View>

      <View style={styles.features}>
        {features.map((feature, index) => (
          <View key={index} style={[styles.feature, { backgroundColor: theme.colors.surfaceAlt }]}>
            <Feather name={feature.icon} size={32} color={theme.colors.primary} />
            <View style={styles.featureText}>
              <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
                {feature.title}
              </Text>
              <Text style={[styles.featureDesc, { color: theme.colors.textMuted }]}>
                {feature.desc}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={[styles.trial, { backgroundColor: theme.colors.primarySoft }]}>
        <Feather name="gift" size={24} color={theme.colors.primary} />
        <Text style={[styles.trialText, { color: theme.colors.text }]}>
          <Text style={{ fontWeight: '700' }}>7 jours d'essai gratuit</Text>
          {'\n'}
          Puis 19,99€/mois • Résiliable à tout moment
        </Text>
      </View>

      <TouchableOpacity
        onPress={handleStart}
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
      >
        <Text style={styles.buttonText}>Démarrer mon essai gratuit</Text>
        <Feather name="arrow-right" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  header: { marginTop: 32, marginBottom: 40 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 12 },
  subtitle: { fontSize: 16, lineHeight: 24 },
  features: { gap: 16, marginBottom: 32 },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  featureDesc: { fontSize: 14 },
  trial: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 24,
  },
  trialText: { flex: 1, fontSize: 14, lineHeight: 20 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
```

---

### Étape 3.2 : Ajouter route dans navigation

**Fichier** : `navigation/AppNavigator.js` (ou équivalent)

```javascript
<Stack.Screen
  name="OnboardingPaywall"
  component={OnboardingPaywallScreen}
  options={{ headerShown: false }}
/>
```

---

### Étape 3.3 : Afficher au 1er lancement

**Fichier** : `App.js`

**Après login réussi** (autour ligne 60-80) :

```javascript
useEffect(() => {
  const checkOnboarding = async () => {
    const seen = await AsyncStorage.getItem('onboarding_paywall_seen');
    if (!seen && session) {
      // Première connexion → afficher onboarding
      navigation.navigate('OnboardingPaywall');
    }
  };
  
  if (session) {
    checkOnboarding();
  }
}, [session]);
```

**Test** :
- [ ] Créer nouveau compte
- [ ] Vérifier affichage onboarding
- [ ] Cliquer "Démarrer mon essai"
- [ ] Vérifier redirection vers paywall
- [ ] Se déconnecter/reconnecter
- [ ] Vérifier que l'onboarding ne s'affiche plus

---

## 🟠 ACTION 4 : Fallback RevenueCat (1h)

**Fichier** : `App.js`

**Ligne 66-73** :

```javascript
// AVANT
if (initialSession) {
  initRevenueCat(initialSession.user.id).catch((err) => {
    logger.error('App', 'Erreur RevenueCat', err);
  });
}

// APRÈS (non-bloquant)
if (initialSession) {
  initRevenueCat(initialSession.user.id).catch((err) => {
    logger.error('App', 'Erreur RevenueCat (non-bloquant)', err);
    
    // ✅ Mode graceful : app continue de fonctionner
    // Les features seront accessibles en mode "essai étendu"
    
    Alert.alert(
      '⚠️ Erreur de connexion',
      'Impossible de vérifier votre abonnement. Vous pouvez continuer à utiliser l\'app normalement.',
      [{ text: 'OK' }]
    );
  });
}
```

**Test** :
- [ ] Désactiver Internet
- [ ] Lancer l'app
- [ ] Vérifier que l'app fonctionne quand même
- [ ] Vérifier message d'avertissement
- [ ] Réactiver Internet
- [ ] Vérifier reprise normale

---

## 🟠 ACTION 5 : Feedback transcription Whisper (2h)

### Étape 5.1 : Installer dépendance

```bash
npm install react-native-progress
```

---

### Étape 5.2 : Créer le composant

**Fichier** : `components/TranscriptionFeedback.tsx` (déjà créé ✅)

---

### Étape 5.3 : Intégrer dans VoiceRecorder

**Instructions** : Suivre `docs/INTEGRATION_TRANSCRIPTION_FEEDBACK.md`

**Changements** :
1. Import TranscriptionFeedback
2. Ajouter composant dans JSX (après bouton enregistrement)
3. Améliorer statuts dans `uploadAndSave` :
   - "Upload du fichier audio..." (10%)
   - "Transcription en cours..." (40%)
   - "Analyse du contenu..." (70%)
   - "Traitement terminé !" (100%)

**Test** :
- [ ] Enregistrer une note vocale
- [ ] Vérifier affichage feedback
- [ ] Vérifier progress bar qui avance
- [ ] Vérifier étapes qui se complètent
- [ ] Vérifier disparition après 1 seconde

---

## 🧪 Tests finaux (1-2h)

### Test 1 : Flow complet PDF

1. [ ] Ouvrir Paramètres
2. [ ] Remplir tous les champs légaux
3. [ ] Sauvegarder
4. [ ] Créer un devis
5. [ ] Générer PDF
6. [ ] Vérifier TOUTES les mentions légales présentes

### Test 2 : Flow onboarding

1. [ ] Créer nouveau compte
2. [ ] Vérifier onboarding s'affiche
3. [ ] Compléter essai gratuit
4. [ ] Vérifier accès app

### Test 3 : Flow transcription

1. [ ] Enregistrer note vocale
2. [ ] Vérifier feedback visible
3. [ ] Attendre fin transcription
4. [ ] Vérifier note sauvegardée

---

## 📊 Métriques de succès

| Critère | Avant | Après | Cible |
|---------|-------|-------|-------|
| Conformité PDF | 40% | 100% | 100% |
| Conversion paywall | ? | ? | >20% |
| Abandon transcription | ~50% | <20% | <20% |
| Crashes RevenueCat | ? | 0% | 0% |

---

## ✅ Validation finale

- [ ] Toutes les actions implémentées
- [ ] Tous les tests passés
- [ ] Validation juridique OK
- [ ] Tests iOS + Android
- [ ] Zero linter errors

---

**Prochaine étape** : Sprint 1 (Refactoring + Monitoring OpenAI)

**Date cible lancement** : Mi-janvier 2025 🚀

