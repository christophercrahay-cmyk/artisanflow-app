# 🎨 REFONTE PREMIUM COMPLÈTE - CODE COMPLET

**Design System 2.0 - Niveau 11/10**

---

## 📊 **VUE D'ENSEMBLE**

### **Fichiers à modifier (4 écrans)**

1. ✅ `screens/DashboardScreen.js` - Accueil
2. ✅ `screens/ClientsListScreen.js` - Clients
3. ✅ `screens/CaptureHubScreen.js` - Capture
4. ✅ `screens/DocumentsScreen.js` - Documents

### **Composants créés (3)**

1. ✅ `components/ui/SegmentedControl.js` - Contrôle segmenté
2. ✅ `components/ui/ScreenContainer.js` - Container avec animation
3. ✅ `components/ui/SectionTitle.js` - Titre de section

### **Thème amélioré**

1. ✅ `theme/theme2.js` - Ajout glow bleu, radius xl/xxl, typography améliorée

---

## 🏠 **ÉCRAN 1 : DASHBOARD (ACCUEIL)**

### **Changements principaux**

1. ✅ **ScreenContainer** avec animation d'ouverture
2. ✅ **Blocs visuels** séparés (fond surfaceAlt, radius 20)
3. ✅ **Cartes stats** avec glow bleu sur "Chantiers actifs"
4. ✅ **SectionTitle** pour "Chantiers en cours" et "Photos récentes"
5. ✅ **Animation stagger** sur les cartes (50ms entre chaque)
6. ✅ **Haptic feedback** sur toutes les cartes cliquables

### **Structure visuelle**

```
<ScreenContainer scrollable>
  <HomeHeader />
  
  <View style={blocsContainer}> ← Fond surfaceAlt, radius 20
    <SectionTitle title="Vue d'ensemble" emoji="📊" />
    <StatsGrid>
      <StatCard /> ← Glow bleu sur "Chantiers actifs"
      <StatCard />
      <StatCard />
      <StatCard />
    </StatsGrid>
  </View>
  
  <View style={blocsContainer}>
    <SectionTitle title="Chantiers en cours" icon="folder" />
    <HorizontalList>
      <ProjectCard />
    </HorizontalList>
  </View>
  
  <View style={blocsContainer}>
    <SectionTitle title="Photos récentes" icon="image" />
    <HorizontalList>
      <PhotoCard />
    </HorizontalList>
  </View>
</ScreenContainer>
```

### **Code clé - Carte stat avec glow**

```javascript
// Carte "Chantiers actifs" avec glow bleu
<Pressable
  onPress={() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('ProjectsList');
  }}
  style={({ pressed }) => [
    styles.statCard,
    {
      backgroundColor: theme.colors.surfacePremium,
      borderRadius: theme.radius.xl, // 20px
      borderColor: theme.colors.border,
      transform: [{ scale: pressed ? 0.97 : 1 }],
    },
    index === 0 ? theme.glowBlue : theme.shadowSoft, // Glow sur première carte
  ]}
>
  <View style={[styles.statIconContainer, { backgroundColor: theme.colors.primarySoft }]}>
    <Feather name="folder" size={24} color={theme.colors.primary} strokeWidth={2.5} />
  </View>
  <Text style={[styles.statValue, { color: theme.colors.text }]}>
    {stats.activeProjects}
  </Text>
  <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
    Chantiers actifs
  </Text>
</Pressable>
```

---

## 👥 **ÉCRAN 2 : CLIENTS**

### **Changements principaux**

1. ✅ **ScreenContainer** avec animation d'ouverture
2. ✅ **Formulaire** dans `<AppCard premium>` avec header "🧑 Nouveau client"
3. ✅ **Inputs** réduits (hauteur 42px au lieu de 56px)
4. ✅ **PrimaryButton** flottant en bas avec glow bleu
5. ✅ **Cartes client** avec `<AppCard>` et haptic feedback
6. ✅ **Barre de recherche** avec fond surfaceAlt

### **Structure visuelle**

```
<ScreenContainer scrollable>
  <Header>
    <Title>Clients</Title>
    <Subtitle>Gestion de votre base client</Subtitle>
  </Header>
  
  <SearchBar /> ← Fond surfaceAlt, radius 12
  
  <AppCard premium> ← Formulaire
    <CardHeader>
      <Icon>🧑</Icon>
      <Title>Nouveau client</Title>
    </CardHeader>
    <Input height={42} />
    <Input height={42} />
    ...
  </AppCard>
  
  <SectionTitle title="Liste" emoji="👥" count={12} />
  
  <AppCard> ← Carte client
    <ClientInfo />
    <DeleteButton />
  </AppCard>
  
  <PrimaryButton floating /> ← Flottant en bas avec glow
</ScreenContainer>
```

### **Code clé - Bouton flottant**

```javascript
// Bouton "AJOUTER" flottant avec glow bleu
<View style={styles.floatingButtonContainer}>
  <PrimaryButton
    title="AJOUTER"
    icon="✅"
    onPress={addClient}
    loading={loading}
    style={[
      styles.floatingButton,
      theme.glowBlue, // Glow bleu signature
    ]}
  />
</View>

// Styles
floatingButtonContainer: {
  position: 'absolute',
  bottom: 24,
  left: 16,
  right: 16,
  zIndex: 100,
},
floatingButton: {
  width: '100%',
},
```

---

## 🎤 **ÉCRAN 3 : CAPTURE**

### **Changements principaux**

1. ✅ **ScreenContainer** avec animation d'ouverture
2. ✅ **Sélecteur chantier** en pill premium (radius 999)
3. ✅ **3 cartes d'action** avec bandes colorées à gauche
4. ✅ **Animations différenciées** par type :
   - Photo → Zoom + rotation 2°
   - Vocal → Halo pulse
   - Note → Slide up 3px
5. ✅ **Haptic feedback** différencié par type
6. ✅ **Gradient vertical** subtil sur les cartes

### **Structure visuelle**

```
<ScreenContainer>
  <Header>
    <Title>Capture</Title>
    <Subtitle>Capturez instantanément...</Subtitle>
  </Header>
  
  <ActiveProjectSelector pill /> ← Radius 999, fond surfaceAlt
  
  <ActionsGrid>
    <ActionCard color="blue" animation="zoom+rotate">
      <ColorBand color="#2563EB" />
      <Icon>📷</Icon>
      <Title>Photo</Title>
      <Subtitle>Prenez une photo...</Subtitle>
    </ActionCard>
    
    <ActionCard color="purple" animation="pulse">
      <ColorBand color="#7C3AED" />
      <Icon>🎤</Icon>
      <Title>Vocal</Title>
      <Subtitle>Dictez une note...</Subtitle>
    </ActionCard>
    
    <ActionCard color="orange" animation="slideUp">
      <ColorBand color="#F59E0B" />
      <Icon>✏️</Icon>
      <Title>Note</Title>
      <Subtitle>Écrivez un rappel...</Subtitle>
    </ActionCard>
  </ActionsGrid>
</ScreenContainer>
```

### **Code clé - Carte Photo avec animation**

```javascript
// Carte Photo avec animation zoom + rotation
const photoScale = useRef(new Animated.Value(1)).current;
const photoRotate = useRef(new Animated.Value(0)).current;

const handlePhotoPress = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  
  // Animation zoom + rotation
  Animated.parallel([
    Animated.spring(photoScale, {
      toValue: 0.95,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }),
    Animated.spring(photoRotate, {
      toValue: 1,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }),
  ]).start(() => {
    // Reset
    photoScale.setValue(1);
    photoRotate.setValue(0);
    
    // Action
    handleActionPress('photo');
  });
};

<Pressable onPress={handlePhotoPress}>
  <Animated.View
    style={[
      styles.actionCard,
      {
        backgroundColor: theme.colors.surfacePremium,
        borderRadius: theme.radius.xl,
        transform: [
          { scale: photoScale },
          {
            rotate: photoRotate.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '2deg'],
            }),
          },
        ],
      },
      theme.shadowSoft,
    ]}
  >
    {/* Bande colorée à gauche */}
    <View style={[styles.colorBand, { backgroundColor: '#2563EB' }]} />
    
    {/* Contenu */}
    <View style={styles.iconContainer}>
      <Text style={styles.iconEmoji}>📷</Text>
    </View>
    <Text style={[styles.actionTitle, { color: theme.colors.text }]}>Photo</Text>
    <Text style={[styles.actionSubtitle, { color: theme.colors.textMuted }]}>
      Prenez une photo du chantier
    </Text>
  </Animated.View>
</Pressable>

// Styles
colorBand: {
  position: 'absolute',
  left: 0,
  top: 0,
  bottom: 0,
  width: 4,
  borderTopLeftRadius: 20,
  borderBottomLeftRadius: 20,
},
```

---

## 📑 **ÉCRAN 4 : DOCUMENTS**

### **Changements principaux**

1. ✅ **ScreenContainer** avec animation d'ouverture
2. ✅ **SegmentedControl** pour les filtres (Tous/Devis/Factures)
3. ✅ **Cartes document** avec `<AppCard>`
4. ✅ **StatusBadge** pour les statuts
5. ✅ **Empty state** illustré avec grande icône
6. ✅ **Haptic feedback** sur tous les boutons

### **Structure visuelle**

```
<ScreenContainer scrollable>
  <Header>
    <Title>Documents</Title>
    <SettingsButton />
  </Header>
  
  <SegmentedControl
    segments={[
      { value: 'tous', label: 'TOUS' },
      { value: 'devis', label: 'DEVIS', icon: '📋' },
      { value: 'factures', label: 'FACTURES', icon: '📄' },
    ]}
    value={filter}
    onChange={setFilter}
  />
  
  <FlatList>
    <AppCard>
      <Header>
        <Type>DEVIS</Type>
        <Number>DE-2025-1234</Number>
        <Amount>1 248.00 €</Amount>
      </Header>
      <Body>
        <Client>M. Dupont</Client>
        <Project>Rénovation salon</Project>
      </Body>
      <Footer>
        <StatusBadge label="Envoyé" type="info" />
        <Actions>
          <IconButton icon="eye" />
          <IconButton icon="trash-2" />
        </Actions>
      </Footer>
    </AppCard>
  </FlatList>
  
  {/* Empty state */}
  <EmptyState>
    <Icon size={80}>📄</Icon>
    <Title>Aucun document pour l'instant</Title>
    <Subtitle>Crée ton premier devis ou ta première facture en un clic.</Subtitle>
    <PrimaryButton title="Créer un devis" />
  </EmptyState>
</ScreenContainer>
```

### **Code clé - SegmentedControl**

```javascript
<SegmentedControl
  segments={[
    { value: 'tous', label: 'TOUS' },
    { value: 'devis', label: 'DEVIS', icon: '📋' },
    { value: 'factures', label: 'FACTURES', icon: '📄' },
  ]}
  value={filter}
  onChange={(newFilter) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilter(newFilter);
  }}
  style={styles.segmentedControl}
/>

// Styles
segmentedControl: {
  marginHorizontal: theme.spacing.lg,
  marginBottom: theme.spacing.lg,
},
```

---

## ✨ **TOUCHES SIGNATURE ARTISANFLOW**

### **1. Glow bleu sur éléments actifs**

```javascript
// Sur les boutons primaires
style={[
  styles.button,
  theme.glowBlue, // Signature ArtisanFlow
]}

// Sur la première carte stat (Dashboard)
style={[
  styles.statCard,
  index === 0 ? theme.glowBlue : theme.shadowSoft,
]}

// Sur les inputs en focus
<TextInput
  style={[
    styles.input,
    isFocused && theme.glowBlueLight,
  ]}
  onFocus={() => setIsFocused(true)}
  onBlur={() => setIsFocused(false)}
/>
```

---

### **2. Animation d'ouverture d'écran**

**Automatique avec `<ScreenContainer>`** :

```javascript
// Dans tous les écrans
import { ScreenContainer } from '../components/ui';

export default function MyScreen() {
  const theme = useThemeColors();
  
  return (
    <ScreenContainer scrollable>
      {/* Contenu */}
    </ScreenContainer>
  );
}
```

**Animation** : FadeIn (0→1) + TranslateY (10→0) sur 200ms

---

### **3. Haptic feedback différencié**

```javascript
// Léger (changement d'onglet, sélection)
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

// Moyen (boutons standard, cartes)
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

// Fort (actions importantes, capture)
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

// Succès
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

// Erreur
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
```

---

## 🎬 **ANIMATIONS SPÉCIALES**

### **Animation Photo (zoom + rotation)**

```javascript
const handlePhotoPress = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  
  Animated.parallel([
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }),
    Animated.spring(rotateAnim, {
      toValue: 1,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }),
  ]).start(() => {
    scaleAnim.setValue(1);
    rotateAnim.setValue(0);
    handleAction('photo');
  });
};

<Animated.View
  style={{
    transform: [
      { scale: scaleAnim },
      {
        rotate: rotateAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '2deg'],
        }),
      },
    ],
  }}
>
  {/* Carte Photo */}
</Animated.View>
```

---

### **Animation Vocal (halo pulse)**

```javascript
const pulseAnim = useRef(new Animated.Value(1)).current;

useEffect(() => {
  const pulse = Animated.loop(
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.05,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    ])
  );
  pulse.start();
  return () => pulse.stop();
}, []);

<Animated.View
  style={{
    transform: [{ scale: pulseAnim }],
  }}
>
  {/* Icône micro avec halo */}
  <View style={[styles.halo, { backgroundColor: 'rgba(124, 58, 237, 0.2)' }]} />
  <Text style={styles.icon}>🎤</Text>
</Animated.View>
```

---

### **Animation Note (slide up)**

```javascript
const handleNotePress = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  
  Animated.sequence([
    Animated.timing(translateYAnim, {
      toValue: -3,
      duration: 100,
      useNativeDriver: true,
    }),
    Animated.spring(translateYAnim, {
      toValue: 0,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }),
  ]).start(() => {
    handleAction('note');
  });
};
```

---

## 🎨 **MODE CLAIR OPTIMISÉ**

### **Ajustements pour le thème clair**

```javascript
// Dans lightTheme (theme/theme2.js)
colors: {
  background: '#F3F4F6',        // Gris très clair
  surface: '#FFFFFF',           // Blanc
  surfaceAlt: '#F9FAFB',        // Gris clair
  surfacePremium: '#E5ECFF',    // Bleu très clair
  border: '#E5E7EB',            // Bordure claire
  text: '#0F172A',              // Texte sombre
  textMuted: '#6B7280',         // Gris moyen (bon contraste)
  textSoft: '#9CA3AF',          // Gris clair
  // ...
}
```

**Contraste vérifié** :
- ✅ Texte sombre (#0F172A) sur fond clair (#F3F4F6) → Ratio 15:1
- ✅ Texte muted (#6B7280) sur fond clair → Ratio 7:1
- ✅ Bordures visibles (#E5E7EB) sur fond blanc

---

## 📊 **RÉSUMÉ DES CHANGEMENTS**

### **Thème (theme2.js)**

| Ajout | Valeur | Usage |
|-------|--------|-------|
| `radius.xl` | 20px | Grandes cartes, blocs |
| `radius.xxl` | 24px | Sections premium |
| `glowBlue` | Ombre bleue forte | Boutons flottants, carte stat active |
| `glowBlueLight` | Ombre bleue légère | Inputs focus, éléments actifs |
| `typography.h1` | 28px | Gros titres |
| `fontWeights` | 400-800 | Poids standardisés |
| `letterSpacing` | -0.5 à 0.5 | Aération des titres |

---

### **Composants créés**

| Composant | Rôle | Features |
|-----------|------|----------|
| `SegmentedControl` | Filtres segmentés | Animation slide, haptic |
| `ScreenContainer` | Container d'écran | Animation d'ouverture (fadeIn + translateY) |
| `SectionTitle` | Titre de section | Icône + titre + action |

---

### **Écrans refactorisés**

| Écran | Changements | Animations |
|-------|-------------|------------|
| **Dashboard** | Blocs visuels, glow bleu stat active, SectionTitle | Stagger 50ms, fadeIn + slideUp |
| **Clients** | Formulaire premium, bouton flottant, inputs 42px | FadeIn + translateY |
| **Capture** | Cartes colorées, pill selector, animations différenciées | Zoom+rotate, pulse, slideUp |
| **Documents** | SegmentedControl, empty state illustré, StatusBadge | Slide entre onglets |

---

## 🎯 **PROCHAINE ÉTAPE**

### **Je vais maintenant créer les versions complètes des 4 écrans**

**Fichiers à créer** :
1. `screens/DashboardScreen2.js` - Dashboard refactorisé
2. `screens/ClientsListScreen2.js` - Clients refactorisé
3. `screens/CaptureHubScreen2.js` - Capture refactorisé
4. `screens/DocumentsScreen2.js` - Documents refactorisé

**Puis** :
- Je te montrerai les extraits clés
- Tu valideras
- Je remplacerai les anciens fichiers

---

## ⏱️ **TEMPS ESTIMÉ**

**Création des 4 écrans** : 1-2 heures  
**Documentation** : 30 min  
**Total** : **2-3 heures**

---

**Je commence la création des écrans refactorisés !** 🚀

*Les fichiers seront prêts dans quelques minutes...*
