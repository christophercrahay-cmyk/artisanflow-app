# 🔄 GUIDE DE MIGRATION - DESIGN SYSTEM 2.0

**Migration progressive vers le nouveau design system**

---

## 🎯 **OBJECTIF**

Migrer progressivement tous les écrans vers le Design System 2.0 **SANS casser l'app**.

---

## 📋 **ÉTAPES DE MIGRATION**

### **ÉTAPE 1 : Installer les dépendances**

```bash
npx expo install expo-haptics
```

**Vérifier** : `expo-haptics` est bien dans `package.json`

---

### **ÉTAPE 2 : Tester le nouveau composant DevisAIGenerator**

#### **A. Utiliser la version 2 (test)**

**Fichier** : `screens/ProjectDetailScreen.js`

**Modifier l'import** :
```javascript
// AVANT
import DevisAIGenerator from '../components/DevisAIGenerator';

// APRÈS (test)
import DevisAIGenerator from '../components/DevisAIGenerator2';
```

**Tester** :
1. Relancer l'app : `npx expo start --tunnel`
2. Ouvrir un chantier
3. Cliquer "Générer devis IA"
4. **Vérifier** : Modal s'affiche avec le nouveau design
5. **Vérifier** : Haptic feedback fonctionne
6. **Vérifier** : Colorisation des prix fonctionne
7. **Vérifier** : Création du devis fonctionne

---

#### **B. Si OK : Remplacer définitivement**

```bash
# Sauvegarder l'ancien (au cas où)
mv components/DevisAIGenerator.js components/DevisAIGenerator.old.js

# Activer le nouveau
mv components/DevisAIGenerator2.js components/DevisAIGenerator.js
```

**Remettre l'import d'origine** :
```javascript
import DevisAIGenerator from '../components/DevisAIGenerator';
```

---

#### **C. Si problème : Rollback**

```bash
# Restaurer l'ancien
mv components/DevisAIGenerator.old.js components/DevisAIGenerator.js

# Supprimer le nouveau (ou garder pour debug)
rm components/DevisAIGenerator2.js
```

---

### **ÉTAPE 3 : Migrer DashboardScreen**

**Fichier** : `screens/DashboardScreen.js`

#### **Changements à faire**

**1. Importer le nouveau thème**
```javascript
// AVANT
import { useSafeTheme } from '../theme/useSafeTheme';
const theme = useSafeTheme();

// APRÈS
import { useThemeColors } from '../theme/theme2';
const theme = useThemeColors();
```

**2. Remplacer les couleurs hardcodées**
```javascript
// AVANT
backgroundColor: '#1E293B'

// APRÈS
backgroundColor: theme.colors.surfacePremium
```

**3. Utiliser les composants UI**
```javascript
// AVANT
<View style={styles.statCard}>
  {/* Contenu */}
</View>

// APRÈS
<AppCard premium style={styles.statCard}>
  {/* Contenu */}
</AppCard>
```

**4. Ajouter haptic feedback**
```javascript
import * as Haptics from 'expo-haptics';

const handlePress = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  // ... logique existante
};
```

---

### **ÉTAPE 4 : Migrer CaptureHubScreen**

**Fichier** : `screens/CaptureHubScreen.js`

#### **Changements à faire**

**1. Importer le nouveau thème**
```javascript
import { useThemeColors } from '../theme/theme2';
const theme = useThemeColors();
```

**2. Remplacer les boutons d'action**
```javascript
// AVANT
<TouchableOpacity style={styles.actionButton} onPress={...}>
  <Feather name="camera" size={42} color={theme.colors.accent} />
  <Text style={styles.actionLabel}>Photo</Text>
  <Text style={styles.actionSubtitle}>Prenez une photo...</Text>
</TouchableOpacity>

// APRÈS
<Pressable
  onPress={() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handleActionPress('photo');
  }}
  style={({ pressed }) => [
    styles.actionButton,
    { transform: [{ scale: pressed ? 0.97 : 1 }] }
  ]}
>
  <Feather name="camera" size={42} color={theme.colors.primary} />
  <Text style={[styles.actionLabel, { color: theme.colors.text }]}>Photo</Text>
  <Text style={[styles.actionSubtitle, { color: theme.colors.textMuted }]}>
    Prenez une photo...
  </Text>
</Pressable>
```

---

### **ÉTAPE 5 : Migrer ClientsListScreen**

**Fichier** : `screens/ClientsListScreen.js`

#### **Changements à faire**

**1. Importer le nouveau thème**
```javascript
import { useThemeColors } from '../theme/theme2';
import { AppCard, PrimaryButton } from '../components/ui';
const theme = useThemeColors();
```

**2. Remplacer le formulaire**
```javascript
// AVANT
<View style={styles.formContainer}>
  {/* Champs */}
</View>

// APRÈS
<AppCard premium style={styles.formContainer}>
  {/* Champs */}
</AppCard>
```

**3. Remplacer le bouton "AJOUTER"**
```javascript
// AVANT
<TouchableOpacity style={styles.primaryButton} onPress={addClient}>
  <Feather name="check" size={20} color={theme.colors.text} />
  <Text style={styles.primaryButtonText}>AJOUTER</Text>
</TouchableOpacity>

// APRÈS
<PrimaryButton
  title="AJOUTER"
  icon="✅"
  onPress={addClient}
  loading={loading}
/>
```

---

### **ÉTAPE 6 : Migrer DocumentsScreen**

**Fichier** : `screens/DocumentsScreen.js`

#### **Changements à faire**

**1. Importer le nouveau thème**
```javascript
import { useThemeColors } from '../theme/theme2';
import { AppCard, StatusBadge } from '../components/ui';
const theme = useThemeColors();
```

**2. Remplacer les cartes document**
```javascript
// AVANT
<View style={styles.card}>
  {/* Contenu */}
</View>

// APRÈS
<AppCard style={styles.card}>
  {/* Contenu */}
</AppCard>
```

**3. Remplacer les badges statut**
```javascript
// AVANT
<TouchableOpacity
  style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}
  onPress={() => openStatusMenu(item)}
>
  <Text style={[styles.statusText, { color: statusStyle.color }]}>
    {getStatusLabel(item.status)}
  </Text>
</TouchableOpacity>

// APRÈS
<TouchableOpacity onPress={() => openStatusMenu(item)}>
  <StatusBadge
    label={getStatusLabel(item.status)}
    type={getStatusType(item.status)}
  />
</TouchableOpacity>

// Ajouter fonction helper
const getStatusType = (status) => {
  switch (status) {
    case 'envoye': return 'info';
    case 'signe': return 'success';
    default: return 'default';
  }
};
```

---

## ⚠️ **PRÉCAUTIONS**

### **À NE PAS FAIRE**

❌ **Migrer tous les écrans en même temps** (risque de tout casser)  
❌ **Supprimer l'ancien thème** (garder pour compatibilité)  
❌ **Changer la logique métier** (uniquement le visuel)  
❌ **Oublier de tester** (tester après chaque migration)

---

### **À FAIRE**

✅ **Migrer un écran à la fois**  
✅ **Tester après chaque migration**  
✅ **Garder les anciens fichiers** (.old.js)  
✅ **Committer après chaque étape**  
✅ **Documenter les changements**

---

## 🧪 **CHECKLIST DE MIGRATION**

### **Par écran**

- [ ] Import du nouveau thème (`useThemeColors`)
- [ ] Remplacement des couleurs hardcodées
- [ ] Utilisation des composants UI (AppCard, PrimaryButton, etc.)
- [ ] Ajout haptic feedback
- [ ] Ajout animations (scale, opacity)
- [ ] Test de l'écran (fonctionnel + visuel)
- [ ] Commit des changements

---

### **Global**

- [ ] Tous les écrans migrés
- [ ] Ancien thème supprimé (ou marqué deprecated)
- [ ] Documentation mise à jour
- [ ] Tests complets (dark + light)
- [ ] Build de production OK
- [ ] Déploiement

---

## 📊 **ORDRE DE MIGRATION RECOMMANDÉ**

1. ✅ **DevisAIGenerator** (FAIT)
2. ⏳ **DashboardScreen** (Accueil) - Impact visuel fort
3. ⏳ **CaptureHubScreen** (Capture) - Écran central
4. ⏳ **ClientsListScreen** (Clients) - Formulaire important
5. ⏳ **DocumentsScreen** (Documents) - Liste importante
6. ⏳ **ProjectDetailScreen** (Détail chantier)
7. ⏳ **SettingsScreen** (Paramètres)
8. ⏳ **Autres écrans** (secondaires)

**Temps estimé** : 1-2 heures par écran = **2-3 jours** pour tout migrer

---

## 🚀 **RÉSULTAT FINAL**

### **Après migration complète**

✅ **Thème adaptatif** : Dark/light selon le mode du téléphone  
✅ **Design cohérent** : Même style sur tous les écrans  
✅ **Feel premium** : Haptic feedback + animations fluides  
✅ **Code propre** : Composants réutilisables  
✅ **Maintenabilité** : Changements centralisés  
✅ **Modernité** : Design 2026, bleu électrique

---

**Guide de migration prêt !** 🚀

**Commence par tester DevisAIGenerator2** ✅

