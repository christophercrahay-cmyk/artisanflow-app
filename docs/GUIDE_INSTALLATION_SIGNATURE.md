# Guide d'installation - Système de Signature Électronique

## 📋 Checklist d'installation

### ✅ Étape 1 : Migration SQL (OBLIGATOIRE)

1. **Ouvrir Supabase Dashboard**
   - Aller sur https://app.supabase.com
   - Sélectionner votre projet ArtisanFlow

2. **Exécuter la migration SQL**
   - Aller dans **SQL Editor**
   - Ouvrir le fichier `sql/add_signature_devis.sql`
   - **Copier tout le contenu** du fichier
   - **Coller dans l'éditeur SQL** de Supabase
   - Cliquer sur **Run** (ou F5)

3. **Vérifier que ça a fonctionné**
   - Aller dans **Table Editor**
   - Vérifier que la table `devis` a bien les nouvelles colonnes :
     - `signature_token`
     - `signature_status`
     - `signed_at`
     - `signed_by_name`
     - `signed_by_email`
   - Vérifier que la table `devis_signatures` existe

---

### ✅ Étape 2 : Installer les dépendances (OBLIGATOIRE)

Ouvrir un terminal dans le dossier du projet et exécuter :

```bash
npx expo install react-native-webview
```

**Pourquoi ?** L'écran de signature utilise WebView pour le canvas de signature.

---

### ✅ Étape 3 : Configurer l'URL de base (IMPORTANT)

1. **Ouvrir** `services/devis/signatureService.js`

2. **Trouver la ligne** (vers la ligne 8) :
   ```javascript
   const SIGN_BASE_URL = __DEV__ 
     ? 'https://artisanflow.app/sign' // À adapter selon votre domaine
     : 'https://artisanflow.app/sign';
   ```

3. **Remplacer** par votre URL réelle :
   - Si vous avez un domaine : `https://votre-domaine.com/sign`
   - Sinon, pour l'instant, laissez `https://artisanflow.app/sign` (vous devrez configurer le routage plus tard)

---

### ✅ Étape 4 : Configurer les Deep Links (OPTIONNEL mais recommandé)

Pour que les liens de signature fonctionnent directement depuis un navigateur ou un SMS :

1. **Ouvrir** `app.json`

2. **Ajouter** dans la section `expo` (après la ligne `"scheme": "artisanflow"`) :

```json
"expo": {
  "scheme": "artisanflow",
  "android": {
    "intentFilters": [
      {
        "action": "VIEW",
        "data": [
          {
            "scheme": "https",
            "host": "artisanflow.app",
            "pathPrefix": "/sign"
          },
          {
            "scheme": "artisanflow",
            "host": "sign"
          }
        ],
        "category": ["BROWSABLE", "DEFAULT"]
      }
    ]
  },
  "ios": {
    "associatedDomains": ["applinks:artisanflow.app"]
  }
}
```

**Note** : Remplacez `artisanflow.app` par votre domaine réel si vous en avez un.

---

### ✅ Étape 5 : Gérer le routage des Deep Links (OPTIONNEL)

Si vous voulez que les liens `https://artisanflow.app/sign/:devisId/:token` ouvrent directement l'app :

1. **Ouvrir** `App.js`

2. **Ajouter** ce code après les imports (vers la ligne 20) :

```javascript
import * as Linking from 'expo-linking';

// Gérer les deep links de signature
useEffect(() => {
  const subscription = Linking.addEventListener('url', (event) => {
    const { url } = event;
    if (url.includes('/sign/')) {
      const parts = url.split('/sign/')[1].split('/');
      if (parts.length >= 2) {
        const devisId = parts[0];
        const token = parts[1];
        // Navigation vers l'écran de signature
        // Note: Vous devrez adapter selon votre structure de navigation
        navigation.navigate('SignDevis', { devisId, token });
      }
    }
  });

  // Vérifier si l'app a été ouverte via un deep link
  Linking.getInitialURL().then((url) => {
    if (url && url.includes('/sign/')) {
      const parts = url.split('/sign/')[1].split('/');
      if (parts.length >= 2) {
        const devisId = parts[0];
        const token = parts[1];
        navigation.navigate('SignDevis', { devisId, token });
      }
    }
  });

  return () => subscription.remove();
}, []);
```

**Note** : Cette partie est optionnelle. Vous pouvez aussi simplement copier le lien et l'ouvrir manuellement dans l'app pour tester.

---

### ✅ Étape 6 : Tester le système

1. **Redémarrer l'app** :
   ```bash
   npm start
   ```

2. **Tester dans l'app** :
   - Ouvrir un devis existant (ou en créer un)
   - Aller dans l'écran d'édition du devis (`EditDevisScreen`)
   - Cliquer sur **"Générer le lien de signature"**
   - Copier le lien affiché
   - Ouvrir ce lien dans un navigateur (ou partager avec un autre appareil)
   - Remplir le formulaire et signer
   - Vérifier que le devis est marqué comme "signé" dans l'app
   - Générer le PDF et vérifier qu'il contient la signature

---

## 🐛 Problèmes courants

### Erreur "WebView is not defined"
→ Vous n'avez pas installé `react-native-webview`. Exécutez : `npx expo install react-native-webview`

### Erreur "Table devis_signatures does not exist"
→ La migration SQL n'a pas été exécutée. Retournez à l'Étape 1.

### Le lien de signature ne fonctionne pas
→ Vérifiez que `SIGN_BASE_URL` dans `signatureService.js` correspond à votre configuration.
→ Pour tester sans deep links, vous pouvez ouvrir manuellement l'écran `SignDevis` avec les paramètres `devisId` et `token`.

### Le PDF ne contient pas la signature
→ Vérifiez que le devis a bien `signature_status = 'signed'` dans Supabase.
→ Vérifiez que la table `devis_signatures` contient bien une entrée pour ce devis.

---

## 📝 Résumé rapide

**Actions obligatoires** :
1. ✅ Exécuter `sql/add_signature_devis.sql` dans Supabase
2. ✅ Installer `react-native-webview` : `npx expo install react-native-webview`
3. ✅ Configurer `SIGN_BASE_URL` dans `signatureService.js`

**Actions optionnelles** :
4. ⚪ Configurer les deep links dans `app.json`
5. ⚪ Ajouter le routage dans `App.js`

**Tester** :
6. ✅ Générer un lien de signature depuis l'app
7. ✅ Signer un devis via le lien
8. ✅ Vérifier le PDF signé

---

## 🎯 Ordre d'exécution recommandé

1. **Migration SQL** (5 min) → Le plus important
2. **Installation dépendance** (2 min) → Nécessaire pour que l'app compile
3. **Configuration URL** (1 min) → Pour que les liens fonctionnent
4. **Test** (10 min) → Vérifier que tout marche
5. **Deep links** (optionnel) → Pour améliorer l'expérience utilisateur

---

## 💡 Astuce

Pour tester rapidement sans configurer les deep links :
- Générez le lien de signature dans l'app
- Copiez le lien (ex: `https://artisanflow.app/sign/xxx/yyy`)
- Dans l'app, naviguez manuellement vers `SignDevis` avec les paramètres `devisId` et `token` extraits du lien

