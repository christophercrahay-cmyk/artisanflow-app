# Système de Signature Électronique des Devis - Documentation

## Vue d'ensemble

Ce système permet aux clients de signer électroniquement leurs devis via un lien public sécurisé. La signature est conforme à la **Signature Électronique Simple (SES)** selon le règlement eIDAS.

## Architecture

### 1. Base de données

**Table `devis`** - Colonnes ajoutées :
- `signature_token` : Token unique pour le lien de signature
- `signature_status` : `'pending'` ou `'signed'`
- `signed_at` : Date/heure de signature
- `signed_by_name` : Nom du signataire
- `signed_by_email` : Email du signataire

**Table `devis_signatures`** - Log des signatures :
- Stocke toutes les signatures avec l'image en base64
- Permet l'audit et la traçabilité
- RLS activé pour isolation multi-tenant

### 2. Services

**`services/devis/signatureService.js`** :
- `generateSignatureLink(devisId)` : Génère un lien de signature unique
- `markDevisAsSigned(params)` : Enregistre la signature
- `validateSignatureToken(devisId, token)` : Valide un token pour l'écran public
- `getDevisSignatureInfo(devisId)` : Récupère les infos de signature pour l'artisan

### 3. Écrans

**`screens/SignDevisScreen.js`** :
- Écran public accessible via deep link `/sign/:devisId/:token`
- Formulaire : nom, email, checkbox d'acceptation
- Canvas de signature (WebView avec HTML5 Canvas)
- Validation et enregistrement de la signature

**`screens/SignDevisSuccessScreen.js`** :
- Écran de confirmation après signature réussie

### 4. Intégration PDF

**`utils/utils/pdf.js`** :
- `buildDevisHTML()` accepte maintenant un paramètre `signature`
- Si `signature_status === 'signed'`, le PDF affiche :
  - Bloc "Signé électroniquement"
  - Nom et email du signataire
  - Date/heure de signature
  - Image de la signature

## Flow utilisateur

### Pour l'artisan :
1. Ouvrir un devis dans l'app
2. Cliquer sur "Générer le lien de signature"
3. Copier/partager le lien avec le client

### Pour le client :
1. Ouvrir le lien reçu (ex: `https://artisanflowsignatures.netlify.app/sign/xxx/yyy`)
2. Vérifier les informations du devis
3. Remplir nom et email
4. Cocher la case d'acceptation
5. Signer sur le canvas
6. Cliquer sur "Signer le devis"
7. Voir la confirmation

## Sécurité

- **Token unique** : Chaque devis a un token unique et non prévisible
- **Validation** : Le token est vérifié avant d'afficher le formulaire
- **RLS** : Toutes les requêtes respectent l'isolation multi-tenant
- **Statut** : Un devis signé ne peut pas être re-signé

## Prochaines étapes

1. ✅ Migrations SQL créées
2. ✅ Service de signature créé
3. ✅ Écran de signature créé
4. ✅ Intégration PDF terminée
5. ⏳ Ajout de la navigation (routes publiques)
6. ⏳ UI artisan (badge statut, bouton générer lien)
7. ⏳ Installation de `react-native-webview` si nécessaire
8. ⏳ Configuration des deep links
9. ⏳ Tests complets

## Notes techniques

- Le canvas de signature utilise WebView avec HTML5 Canvas
- L'image de signature est stockée en base64 dans `devis_signatures`
- Le PDF généré inclut automatiquement la signature si le devis est signé
- Le système est compatible avec tous les templates PDF existants

