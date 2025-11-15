# 🎨 REFONTE PREMIUM - EXTRAITS CLÉS

**Code des parties essentielles pour validation**

---

## ✅ **FICHIERS CRÉÉS**

1. ✅ `theme/theme2.js` - Thème amélioré (glow, radius, typography)
2. ✅ `components/ui/SegmentedControl.js` - Contrôle segmenté animé
3. ✅ `components/ui/ScreenContainer.js` - Container avec animation d'ouverture
4. ✅ `components/ui/SectionTitle.js` - Titre de section
5. ✅ `screens/DashboardScreen2.js` - Dashboard refactorisé COMPLET

---

## 🏠 **DASHBOARD - EXTRAITS CLÉS**

### **Import et structure**

```javascript
import { useThemeColors } from '../theme/theme2';
import { ScreenContainer, SectionTitle, AppCard } from '../components/ui';
import * as Haptics from 'expo-haptics';

export default function DashboardScreen2({ navigation }) {
  const theme = useThemeColors();
  
  return (
    <ScreenContainer scrollable>
      <HomeHeader />
      
      {/* Bloc Stats avec glow bleu sur première carte */}
      <View style={[styles.bloc, { 
        backgroundColor: theme.colors.surfaceAlt, 
        borderRadius: theme.radius.xl 
      }]}>
        <SectionTitle title="Vue d'ensemble" emoji="📊" />
        <StatsGrid>
          <StatCard hasGlow={true} /> ← Glow bleu signature
          <StatCard />
          <StatCard />
          <StatCard />
        </StatsGrid>
      </View>
      
      {/* Autres blocs... */}
    </ScreenContainer>
  );
}
```

---

## 👥 **CLIENTS - EXTRAITS CLÉS**

### **Formulaire premium avec bouton flottant**

```javascript
import { useThemeColors } from '../theme/theme2';
import { ScreenContainer, AppCard, PrimaryButton } from '../components/ui';
import * as Haptics from 'expo-haptics';

export default function ClientsListScreen2({ navigation }) {
  const theme = useThemeColors();
  const [isFocused, setIsFocused] = useState(null);
  
  return (
    <ScreenContainer scrollable>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Clients</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
          Gestion de votre base client
        </Text>
      </View>

      {/* Barre de recherche */}
      <View style={[styles.searchContainer, { 
        backgroundColor: theme.colors.surfaceAlt,
        borderRadius: theme.radius.md,
      }]}>
        <Feather name="search" size={20} color={theme.colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Rechercher un client..."
          placeholderTextColor={theme.colors.textSoft}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Formulaire dans AppCard premium */}
      <AppCard premium style={styles.formCard}>
        {/* Header du formulaire */}
        <View style={[styles.formHeader, { 
          backgroundColor: theme.colors.surfaceAlt,
          borderRadius: theme.radius.md,
          marginBottom: theme.spacing.lg,
          padding: theme.spacing.md,
        }]}>
          <Text style={styles.formHeaderEmoji}>🧑</Text>
          <Text style={[styles.formHeaderText, { color: theme.colors.text }]}>
            Nouveau client
          </Text>
        </View>

        {/* Inputs réduits à 42px */}
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.surfaceAlt,
              borderColor: isFocused === 'name' ? theme.colors.primary : theme.colors.border,
              borderRadius: theme.radius.md,
              color: theme.colors.text,
              height: 42, // Réduit de 56 à 42
            },
            isFocused === 'name' && theme.glowBlueLight, // ✨ Glow au focus
          ]}
          placeholder="Nom *"
          placeholderTextColor={theme.colors.textSoft}
          value={name}
          onChangeText={setName}
          onFocus={() => {
            setIsFocused('name');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          onBlur={() => setIsFocused(null)}
        />
        
        {/* Autres inputs... */}
      </AppCard>

      {/* Liste clients */}
      {filteredClients.map((client) => (
        <Pressable
          key={client.id}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            navigation.navigate('ClientDetail', { clientId: client.id });
          }}
          style={({ pressed }) => [
            pressed && { transform: [{ scale: 0.98 }] },
          ]}
        >
          <AppCard style={styles.clientCard}>
            {/* Contenu client */}
          </AppCard>
        </Pressable>
      ))}

      {/* Bouton flottant avec glow bleu */}
      <View style={styles.floatingButtonContainer}>
        <PrimaryButton
          title="AJOUTER"
          icon="✅"
          onPress={addClient}
          loading={loading}
          style={[styles.floatingButton, theme.glowBlue]} // ✨ Glow signature
        />
      </View>
    </ScreenContainer>
  );
}

// Styles
const getStyles = (theme) => StyleSheet.create({
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  formHeaderEmoji: {
    fontSize: 20,
  },
  formHeaderText: {
    fontSize: theme.typography.h3,
    fontWeight: theme.fontWeights.bold,
  },
  input: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.body,
    borderWidth: 1,
    marginBottom: theme.spacing.md,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 24,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    zIndex: 100,
  },
  floatingButton: {
    width: '100%',
  },
});
```

---

## 🎤 **CAPTURE - EXTRAITS CLÉS**

### **Sélecteur pill + cartes colorées**

```javascript
import { useThemeColors } from '../theme/theme2';
import { ScreenContainer } from '../components/ui';
import * as Haptics from 'expo-haptics';

export default function CaptureHubScreen2({ navigation }) {
  const theme = useThemeColors();
  
  // Animations différenciées
  const photoScale = useRef(new Animated.Value(1)).current;
  const photoRotate = useRef(new Animated.Value(0)).current;
  const vocalPulse = useRef(new Animated.Value(1)).current;
  const noteTranslateY = useRef(new Animated.Value(0)).current;

  // Animation pulse pour Vocal
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(vocalPulse, {
          toValue: 1.03,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(vocalPulse, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Handler Photo (zoom + rotation)
  const handlePhotoPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    Animated.parallel([
      Animated.spring(photoScale, { toValue: 0.95, useNativeDriver: true }),
      Animated.spring(photoRotate, { toValue: 1, useNativeDriver: true }),
    ]).start(() => {
      photoScale.setValue(1);
      photoRotate.setValue(0);
      handleAction('photo');
    });
  };

  // Handler Note (slide up)
  const handleNotePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Animated.sequence([
      Animated.timing(noteTranslateY, {
        toValue: -3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(noteTranslateY, {
        toValue: 0,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start(() => {
      handleAction('note');
    });
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { 
          color: theme.colors.text,
          letterSpacing: theme.letterSpacing.wide,
        }]}>
          Capture
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
          Capturez instantanément vos données de chantier
        </Text>
      </View>

      {/* Sélecteur pill premium */}
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setShowProjectSelector(true);
        }}
        style={({ pressed }) => [
          styles.selectorPill,
          {
            backgroundColor: pressed ? theme.colors.primarySoft : theme.colors.surfaceAlt,
            borderRadius: theme.radius.round, // 999px
            borderColor: theme.colors.border,
          },
          theme.shadowSoft,
        ]}
      >
        <Feather name="folder" size={20} color={theme.colors.primary} />
        <View style={styles.selectorText}>
          <Text style={[styles.selectorLabel, { color: theme.colors.textSoft }]}>
            Chantier actif
          </Text>
          <Text style={[styles.selectorValue, { color: theme.colors.text }]}>
            {activeProject?.name || 'Sélectionner...'}
          </Text>
        </View>
        <Feather name="chevron-down" size={20} color={theme.colors.textMuted} />
      </Pressable>

      {/* 3 cartes d'action avec bandes colorées */}
      <View style={styles.actionsGrid}>
        {/* Carte Photo (bleu) */}
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
            {/* Bande colorée gauche */}
            <View style={[styles.colorBand, { backgroundColor: '#2563EB' }]} />
            
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(37, 99, 235, 0.15)' }]}>
              <Text style={styles.iconEmoji}>📷</Text>
            </View>
            <Text style={[styles.actionTitle, { color: theme.colors.text }]}>Photo</Text>
            <Text style={[styles.actionSubtitle, { color: theme.colors.textMuted }]}>
              Prenez une photo du chantier
            </Text>
          </Animated.View>
        </Pressable>

        {/* Carte Vocal (violet) avec pulse */}
        <Pressable onPress={handleVocalPress}>
          <Animated.View
            style={[
              styles.actionCard,
              {
                backgroundColor: theme.colors.surfacePremium,
                borderRadius: theme.radius.xl,
                transform: [{ scale: vocalPulse }],
              },
              theme.shadowSoft,
            ]}
          >
            <View style={[styles.colorBand, { backgroundColor: '#7C3AED' }]} />
            
            {/* Halo pulse */}
            <View style={[styles.halo, { backgroundColor: 'rgba(124, 58, 237, 0.2)' }]} />
            
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(124, 58, 237, 0.15)' }]}>
              <Text style={styles.iconEmoji}>🎤</Text>
            </View>
            <Text style={[styles.actionTitle, { color: theme.colors.text }]}>Vocal</Text>
            <Text style={[styles.actionSubtitle, { color: theme.colors.textMuted }]}>
              Dictez une note rapide
            </Text>
          </Animated.View>
        </Pressable>

        {/* Carte Note (orange) avec slide up */}
        <Pressable onPress={handleNotePress}>
          <Animated.View
            style={[
              styles.actionCard,
              {
                backgroundColor: theme.colors.surfacePremium,
                borderRadius: theme.radius.xl,
                transform: [{ translateY: noteTranslateY }],
              },
              theme.shadowSoft,
            ]}
          >
            <View style={[styles.colorBand, { backgroundColor: '#F59E0B' }]} />
            
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Text style={styles.iconEmoji}>✏️</Text>
            </View>
            <Text style={[styles.actionTitle, { color: theme.colors.text }]}>Note</Text>
            <Text style={[styles.actionSubtitle, { color: theme.colors.textMuted }]}>
              Écrivez un rappel
            </Text>
          </Animated.View>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

// Styles clés
const getStyles = (theme) => StyleSheet.create({
  selectorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  actionCard: {
    width: 110,
    height: 180,
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  colorBand: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  halo: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    top: '25%',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  iconEmoji: {
    fontSize: 32,
  },
});
```

---

## 📑 **DOCUMENTS - EXTRAITS CLÉS**

### **SegmentedControl + Empty State**

```javascript
import { useThemeColors } from '../theme/theme2';
import { ScreenContainer, SegmentedControl, AppCard, StatusBadge, PrimaryButton } from '../components/ui';
import * as Haptics from 'expo-haptics';

export default function DocumentsScreen2({ navigation }) {
  const theme = useThemeColors();
  const [filter, setFilter] = useState('tous');
  
  return (
    <ScreenContainer scrollable>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Documents</Text>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate('Settings');
          }}
        >
          <Feather name="settings" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* SegmentedControl animé */}
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

      {/* Liste documents */}
      <FlatList
        data={filteredDocuments}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              openDocument(item);
            }}
            style={({ pressed }) => [
              pressed && { transform: [{ scale: 0.98 }] },
            ]}
          >
            <AppCard style={styles.documentCard}>
              {/* Header */}
              <View style={styles.cardHeader}>
                <View>
                  <Text style={[styles.docType, { color: theme.colors.textMuted }]}>
                    {item.type === 'devis' ? 'DEVIS' : 'FACTURE'}
                  </Text>
                  <Text style={[styles.docNumber, { color: theme.colors.text }]}>
                    {item.number}
                  </Text>
                </View>
                <Text style={[styles.amount, { color: theme.colors.success }]}>
                  {item.total_ttc?.toFixed(2)} €
                </Text>
              </View>

              {/* Body */}
              <View style={styles.cardBody}>
                <Text style={[styles.clientName, { color: theme.colors.text }]}>
                  {item.client_name}
                </Text>
                <Text style={[styles.projectTitle, { color: theme.colors.textMuted }]}>
                  {item.project_title}
                </Text>
              </View>

              {/* Footer */}
              <View style={styles.cardFooter}>
                <StatusBadge
                  label={getStatusLabel(item.status)}
                  type={getStatusType(item.status)}
                />
                <View style={styles.actions}>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      openDocument(item);
                    }}
                  >
                    <Feather name="eye" size={20} color={theme.colors.textMuted} />
                  </TouchableOpacity>
                  {item.status === 'brouillon' && (
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        deleteDocument(item);
                      }}
                    >
                      <Feather name="trash-2" size={20} color={theme.colors.danger} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </AppCard>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {/* Grande icône illustrée */}
            <View style={[styles.emptyIconContainer, { 
              backgroundColor: theme.colors.surfaceAlt,
              borderRadius: theme.radius.xl,
            }]}>
              <Text style={styles.emptyIcon}>📄</Text>
            </View>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              Aucun document pour l'instant
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.textMuted }]}>
              Crée ton premier devis ou ta première facture en un clic.
            </Text>
            <PrimaryButton
              title="Créer un devis"
              icon="📋"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                navigation.navigate('ClientsTab');
              }}
              style={styles.emptyButton}
            />
          </View>
        }
      />
    </ScreenContainer>
  );
}

// Helper
const getStatusType = (status) => {
  switch (status) {
    case 'envoye': return 'info';
    case 'signe': return 'success';
    default: return 'default';
  }
};

// Styles clés
const getStyles = (theme) => StyleSheet.create({
  segmentedControl: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl * 2,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
  },
  emptyIcon: {
    fontSize: 80, // Grande icône
  },
  emptyTitle: {
    fontSize: theme.typography.h2,
    fontWeight: theme.fontWeights.bold,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: theme.typography.body,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
    opacity: 0.8,
    fontWeight: theme.fontWeights.medium,
  },
  emptyButton: {
    marginTop: theme.spacing.md,
  },
});
```

---

## ✨ **TOUCHES SIGNATURE (CODE)**

### **1. Glow bleu sur éléments actifs**

```javascript
// Sur boutons flottants
style={[
  styles.button,
  theme.glowBlue, // ✨ Signature ArtisanFlow
]}

// Sur inputs en focus
style={[
  styles.input,
  isFocused && theme.glowBlueLight,
]}

// Sur première carte stat
style={[
  styles.statCard,
  index === 0 ? theme.glowBlue : theme.shadowSoft,
]}
```

---

### **2. Animation d'ouverture d'écran**

```javascript
// Automatique avec ScreenContainer
<ScreenContainer scrollable>
  {/* Contenu */}
</ScreenContainer>

// Animation : fadeIn (0→1) + translateY (10→0) sur 200ms
```

---

### **3. Haptic feedback différencié**

```javascript
// Léger (onglets, sélection)
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

// Moyen (boutons, cartes)
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

// Fort (capture photo)
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

// Succès
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

// Erreur
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
```

---

## 📊 **RÉSUMÉ**

### **Ce qui est fait**

1. ✅ Thème amélioré (glow, radius, typography)
2. ✅ 3 composants helper (SegmentedControl, ScreenContainer, SectionTitle)
3. ✅ Dashboard refactorisé COMPLET
4. ✅ Extraits clés pour Clients, Capture, Documents

---

### **Ce qui reste à faire**

1. ⏳ Créer `ClientsListScreen2.js` complet
2. ⏳ Créer `CaptureHubScreen2.js` complet
3. ⏳ Créer `DocumentsScreen2.js` complet
4. ⏳ Tester et migrer

---

**Je continue avec les 3 autres écrans ?** 🚀

Ou tu veux tester le Dashboard d'abord ?


