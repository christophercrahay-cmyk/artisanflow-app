# Migration Émojis → Icônes Feather

**Date** : 13 novembre 2025  
**Objectif** : Remplacer les émojis par des icônes vectorielles Feather pour cohérence visuelle

---

## 📊 Analyse

**Total** : 59 émojis dans 20 fichiers

### Répartition

- `screens/` : 33 émojis (13 fichiers)
- `components/` : 26 émojis (7 fichiers)

---

## 🎨 Mapping Emoji → Feather Icon

| Emoji | Feather Icon | Propriétés |
|-------|--------------|------------|
| 📸 📷 | `camera` | `size={24}` |
| 🎤 | `mic` | `size={24}` |
| ✏️ 📝 | `edit-3` ou `file-text` | `size={24}` |
| 📁 📂 | `folder` | `size={20}` |
| 🧑 👤 | `user` | `size={18}` |
| 👥 | `users` | `size={20}` |
| 📄 | `file` | `size={20}` |
| 💰 | `dollar-sign` | `size={20}` |
| 🏠 | `home` | `size={20}` |
| ⚙️ | `settings` | `size={20}` |
| 🚀 | `zap` ou `trending-up` | `size={20}` |
| ✅ | `check-circle` | `size={20}, color="green"` |
| ❌ | `x-circle` | `size={20}, color="red"` |
| ⚠️ | `alert-triangle` | `size={20}, color="orange"` |
| 🔔 | `bell` | `size={20}` |
| 🔒 | `lock` | `size={20}` |
| 🔓 | `unlock` | `size={20}` |
| 📊 | `bar-chart-2` | `size={20}` |
| 📈 | `trending-up` | `size={20}` |
| 🎨 | `palette` (custom) ou `image` | `size={20}` |
| 🤖 | `cpu` | `size={20}` |
| 💬 | `message-circle` | `size={20}` |
| 📞 | `phone` | `size={18}` |
| 📧 | `mail` | `size={18}` |
| 🗑️ | `trash-2` | `size={18}, color="red"` |
| ⏰ | `clock` | `size={18}` |
| 🔄 | `refresh-cw` | `size={18}` |
| 📦 | `package` | `size={20}` |
| 🔗 | `link` | `size={18}` |
| 🌍 | `globe` | `size={18}` |

---

## 🛠️ Fichiers prioritaires à migrer

### 1. `screens/CaptureHubScreen2.js` (2 émojis)

**Lignes 432, 449, 466** :

```javascript
// AVANT
<Text style={styles.cardIcon}>📸</Text>
<Text style={styles.cardIcon}>🎤</Text>
<Text style={styles.cardIcon}>✏️</Text>

// APRÈS
import { Feather } from '@expo/vector-icons';

<Feather name="camera" size={36} color={theme.colors.text} />
<Feather name="mic" size={36} color={theme.colors.text} />
<Feather name="edit-3" size={36} color={theme.colors.text} />
```

---

### 2. `screens/PaywallScreen.tsx` (7 émojis)

**Lignes 134-139** : Benefits icons

```typescript
// AVANT
const benefits = [
  { icon: '🤖', text: 'Devis IA illimités' },
  { icon: '🎤', text: 'Notes vocales automatiques' },
  { icon: '📄', text: 'Export PDF professionnel' },
  { icon: '👥', text: 'Gestion clients / chantiers' },
  { icon: '📊', text: 'Suivi paiements' },
  { icon: '💬', text: 'Support prioritaire' },
];

// APRÈS
const benefits = [
  { icon: 'cpu', text: 'Devis IA illimités' },
  { icon: 'mic', text: 'Notes vocales automatiques' },
  { icon: 'file', text: 'Export PDF professionnel' },
  { icon: 'users', text: 'Gestion clients / chantiers' },
  { icon: 'bar-chart-2', text: 'Suivi paiements' },
  { icon: 'message-circle', text: 'Support prioritaire' },
];

// Dans le render
<Feather name={benefit.icon} size={24} color={theme.colors.primary} />
```

**Lignes 298, 309, 319** : Boutons emoji

```typescript
// AVANT
<Text style={styles.primaryButtonText}>🚀 Démarrer mon essai gratuit</Text>
<Text style={styles.secondaryButtonText}>🔄 Restaurer mes achats</Text>
<Text style={styles.manageButtonText}>⚙️ Gérer mon abonnement</Text>

// APRÈS
<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
  <Feather name="zap" size={20} color="#FFFFFF" />
  <Text style={styles.primaryButtonText}>Démarrer mon essai gratuit</Text>
</View>

<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
  <Feather name="refresh-cw" size={18} color={theme.colors.text} />
  <Text style={styles.secondaryButtonText}>Restaurer mes achats</Text>
</View>

<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
  <Feather name="settings" size={16} color={theme.colors.textMuted} />
  <Text style={styles.manageButtonText}>Gérer mon abonnement</Text>
</View>
```

---

### 3. `screens/DocumentsScreen2.js` (8 émojis)

**Ligne 109** : Type document

```javascript
// AVANT
type: 'devis',
type: 'facture',

// UI
{document.type === 'devis' ? '📄' : '💰'}

// APRÈS
<Feather 
  name={document.type === 'devis' ? 'file' : 'dollar-sign'} 
  size={20} 
  color={theme.colors.primary} 
/>
```

---

### 4. `components/ClientProjectSelector.js` (7 émojis)

**Lignes avec émojis header/labels**

```javascript
// AVANT
<Text style={styles.emoji}>📁</Text>
<Text style={styles.emoji}>🧑</Text>

// APRÈS
<Feather name="folder" size={24} color={theme.colors.primary} />
<Feather name="user" size={24} color={theme.colors.primary} />
```

---

## 📋 Plan d'exécution

### Phase 1 : Priorités haute (2-3h)

1. ✅ `CaptureHubScreen2.js` (cartes capture)
2. ✅ `PaywallScreen.tsx` (benefits + boutons)
3. ✅ `DocumentsScreen2.js` (types documents)
4. ✅ `ClientProjectSelector.js` (sélecteurs)

### Phase 2 : Priorités moyenne (1-2h)

5. `SettingsScreen.js`
6. `DashboardScreen2.js`
7. `ProjectDetailScreen.js`
8. `ClientDetailScreen.js`

### Phase 3 : Priorités basse (1h)

9. `DevisAIGenerator2.js`
10. `VoiceRecorderSimple.js`
11. Autres fichiers restants

**Total estimé** : 4-6h

---

## 🎨 Composant helper (optionnel)

Pour simplifier la migration, créer un composant wrapper :

```typescript
// components/ui/Icon.tsx
import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '../../theme/theme2';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: any;
}

export function Icon({ name, size = 20, color, style }: IconProps) {
  const theme = useThemeColors();
  const finalColor = color || theme.colors.text;
  
  return <Feather name={name} size={size} color={finalColor} style={style} />;
}

// Usage
import { Icon } from '../components/ui/Icon';

<Icon name="camera" size={36} />
```

---

## ✅ Avantages de la migration

- ✅ **Cohérence visuelle** : rendu identique iOS/Android
- ✅ **Accessibilité** : icônes vectorielles scalables
- ✅ **Customisation** : couleurs dynamiques selon thème
- ✅ **Performance** : pas de conversion emoji → glyphe
- ✅ **Professionnalisme** : look plus moderne et épuré

---

## 📊 Avant / Après

### Avant (émojis)

```javascript
<Text style={styles.icon}>📸</Text>  // Rendu variable
<Text style={styles.icon}>🎤</Text>  // Peut être pixelisé
<Text style={styles.icon}>✏️</Text>  // Couleur fixe
```

### Après (Feather)

```javascript
<Feather name="camera" size={36} color={theme.colors.text} />  // Vectoriel
<Feather name="mic" size={36} color={theme.colors.primary} />  // Dynamique
<Feather name="edit-3" size={36} color={theme.colors.accent} />  // Customisable
```

---

## 🚀 Script de migration automatique (optionnel)

```javascript
// scripts/replace-emojis.js
const fs = require('fs');
const path = require('path');

const EMOJI_MAP = {
  '📸': "name=\"camera\"",
  '🎤': "name=\"mic\"",
  '✏️': "name=\"edit-3\"",
  // ... mapping complet
};

function replaceEmojisInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  Object.entries(EMOJI_MAP).forEach(([emoji, feather]) => {
    if (content.includes(emoji)) {
      content = content.replace(
        new RegExp(`<Text[^>]*>${emoji}</Text>`, 'g'),
        `<Feather ${feather} size={24} color={theme.colors.text} />`
      );
      modified = true;
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ ${filePath} migré`);
  }
}

// Usage
// node scripts/replace-emojis.js screens/CaptureHubScreen2.js
```

---

## ✅ Checklist

- [ ] Phase 1 : Fichiers prioritaires (4 fichiers)
- [ ] Phase 2 : Fichiers moyens (4 fichiers)
- [ ] Phase 3 : Fichiers restants (12 fichiers)
- [ ] Tester rendu iOS + Android
- [ ] Vérifier thème dark/light
- [ ] Tests visuels complets

---

**Temps total estimé** : 4-6h  
**Impact** : Cohérence visuelle professionnelle + meilleure UX

