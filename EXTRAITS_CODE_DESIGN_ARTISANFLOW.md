# 📝 EXTRAITS DE CODE - DESIGN ARTISANFLOW

**Extraits de code complets pour le designer IA**

---

## 🎨 **THÈME COMPLET**

**Fichier** : `theme/Theme.js`

```javascript
export const Theme = {
  // ═══════════════════════════════════════════════════════════
  // COULEURS
  // ═══════════════════════════════════════════════════════════
  colors: {
    // Fonds
    background: '#0F1115',        // Fond principal (très sombre)
    surface: '#1A1D22',           // Cartes, modals, tab bar
    surfaceElevated: '#252A32',   // Inputs, éléments surélevés
    
    // Bordures
    border: '#2A2E35',            // Bordures principales
    borderLight: '#1E2126',       // Bordures légères
    
    // Textes
    text: '#F9FAFB',              // Texte principal (blanc cassé)
    textSecondary: '#D1D5DB',     // Texte secondaire (gris clair)
    textMuted: '#9CA3AF',         // Texte désactivé (gris moyen)
    
    // Accents (bleu principal)
    accent: '#1D4ED8',            // Couleur principale
    accentLight: '#60A5FA',       // Bleu clair (hover)
    accentDark: '#1E3A8A',        // Bleu foncé (pressed)
    accentHover: '#2563EB',       // Bleu hover
    
    // États sémantiques
    success: '#10B981',           // Vert (succès)
    successLight: '#34D399',      // Vert clair
    error: '#EF4444',             // Rouge (erreur)
    warning: '#F59E0B',           // Orange (avertissement)
    info: '#3B82F6',              // Bleu info
    
    // Overlay
    overlay: 'rgba(0, 0, 0, 0.75)',
    
    // Palette gris complète (Tailwind)
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
  },

  // ═══════════════════════════════════════════════════════════
  // SPACING
  // ═══════════════════════════════════════════════════════════
  spacing: {
    xs: 4,      // 4px
    sm: 8,      // 8px
    md: 12,     // 12px
    lg: 16,     // 16px
    xl: 24,     // 24px
    xxl: 32,    // 32px
    xxxl: 48,   // 48px
  },

  // ═══════════════════════════════════════════════════════════
  // BORDER RADIUS
  // ═══════════════════════════════════════════════════════════
  borderRadius: {
    sm: 4,      // Petits badges
    md: 8,      // Inputs, badges
    lg: 12,     // Cartes, boutons (LE PLUS UTILISÉ)
    xl: 16,     // Cartes premium
    round: 999, // Éléments circulaires
  },

  // ═══════════════════════════════════════════════════════════
  // SHADOWS
  // ═══════════════════════════════════════════════════════════
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
  },

  // ═══════════════════════════════════════════════════════════
  // TYPOGRAPHIE
  // ═══════════════════════════════════════════════════════════
  typography: {
    fontFamily: 'System',
    h1: {
      fontSize: 32,
      fontWeight: '800',
      color: '#F9FAFB',
      letterSpacing: -0.5,
      lineHeight: 40,
    },
    h2: {
      fontSize: 28,
      fontWeight: '700',
      color: '#F9FAFB',
      letterSpacing: -0.3,
      lineHeight: 36,
    },
    h3: {
      fontSize: 24,
      fontWeight: '700',
      color: '#F9FAFB',
      letterSpacing: -0.2,
      lineHeight: 32,
    },
    h4: {
      fontSize: 20,
      fontWeight: '600',
      color: '#F9FAFB',
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      color: '#F9FAFB',
      lineHeight: 24,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400',
      color: '#D1D5DB',
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: '500',
      color: '#D1D5DB',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      lineHeight: 16,
    },
  },

  // ═══════════════════════════════════════════════════════════
  // BOUTONS
  // ═══════════════════════════════════════════════════════════
  buttons: {
    primary: {
      backgroundColor: '#1D4ED8',
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#1D4ED8',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    primaryText: {
      color: '#F9FAFB',
      fontSize: 16,
      fontWeight: '700',
    },
    secondary: {
      backgroundColor: '#1A1D22',
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#2A2E35',
    },
    secondaryText: {
      color: '#F9FAFB',
      fontSize: 16,
      fontWeight: '600',
    },
    outline: {
      backgroundColor: 'transparent',
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: '#1D4ED8',
    },
    outlineText: {
      color: '#1D4ED8',
      fontSize: 16,
      fontWeight: '700',
    },
  },

  // ═══════════════════════════════════════════════════════════
  // CARTES
  // ═══════════════════════════════════════════════════════════
  card: {
    backgroundColor: '#1A1D22',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2E35',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },

  // ═══════════════════════════════════════════════════════════
  // INPUTS
  // ═══════════════════════════════════════════════════════════
  input: {
    backgroundColor: '#252A32',
    borderWidth: 1,
    borderColor: '#2A2E35',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#EAEAEA',
    minHeight: 56,
  },

  // ═══════════════════════════════════════════════════════════
  // ICÔNES
  // ═══════════════════════════════════════════════════════════
  icon: {
    size: {
      xs: 16,
      sm: 20,
      md: 24,
      lg: 32,
      xl: 48,
    },
    color: {
      active: '#1D4ED8',
      inactive: '#9CA3AF',
      accent: '#60A5FA',
    },
    strokeWidth: 2.5,
  },

  // ═══════════════════════════════════════════════════════════
  // BARRES
  // ═══════════════════════════════════════════════════════════
  tabBar: {
    backgroundColor: '#1A1D22',
    borderTopWidth: 1,
    borderTopColor: '#2A2E35',
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
  },
  header: {
    backgroundColor: '#1A1D22',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2E35',
    height: 60,
  },
};
```

---

## 🎨 **EXEMPLES DE STYLES PAR COMPOSANT**

### **Carte Stats (Dashboard)**

```javascript
statCard: {
  flex: 1,
  minWidth: '45%',
  backgroundColor: '#1E293B',      // Premium dark gray
  borderRadius: 16,                // Plus arrondi
  padding: 16,
  borderLeftWidth: 4,              // Bordure gauche colorée
  borderWidth: 1,
  borderColor: '#334155',          // Bordure fine discrète
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 8,
  elevation: 8,
}

statIconContainer: {
  width: 48,
  height: 48,
  borderRadius: 8,
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 12,
  backgroundColor: 'rgba(29, 78, 216, 0.2)', // Bleu transparent
}

statValue: {
  fontSize: 32,
  fontWeight: '700',
  color: '#F9FAFB',
  marginBottom: 4,
}

statLabel: {
  fontSize: 14,
  fontWeight: '400',
  color: '#D1D5DB',
}
```

---

### **Bouton d'action (Capture)**

```javascript
actionButton: {
  width: 110,
  height: 190,
  backgroundColor: '#1E293B',
  borderRadius: 20,
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 2,
  borderColor: 'rgba(29, 78, 216, 0.4)', // Bleu transparent
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 8,
  elevation: 8,
  paddingVertical: 16,
  paddingHorizontal: 8,
}

iconContainer: {
  width: 76,
  height: 76,
  borderRadius: 38,
  backgroundColor: 'rgba(29, 78, 216, 0.2)',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 12,
}

actionLabel: {
  fontSize: 16,
  fontWeight: '700',
  color: '#F9FAFB',
  marginTop: 8,
  marginBottom: 4,
}

actionSubtitle: {
  fontSize: 12,
  color: '#9CA3AF',
  textAlign: 'center',
  paddingHorizontal: 4,
  lineHeight: 16,
}
```

---

### **Carte Client**

```javascript
clientCard: {
  backgroundColor: '#1E293B',
  borderRadius: 16,
  padding: 16,
  marginBottom: 12,
  borderWidth: 1,
  borderColor: '#334155',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
  elevation: 4,
}

clientHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 8,
}

cardTitle: {
  fontSize: 20,
  fontWeight: '600',
  color: '#F9FAFB',
  marginLeft: 8,
}

clientRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 4,
}

cardLine: {
  fontSize: 14,
  fontWeight: '400',
  color: '#D1D5DB',
  marginLeft: 8,
}
```

---

### **Carte Document**

```javascript
card: {
  backgroundColor: '#1A1D22',
  borderRadius: 12,
  padding: 16,
  marginBottom: 12,
  borderWidth: 1,
  borderColor: '#2A2E35',
}

cardHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: 12,
}

docType: {
  fontSize: 12,
  fontWeight: '600',
  color: '#D1D5DB',
  marginBottom: 4,
}

docNumber: {
  fontSize: 18,
  fontWeight: '800',
  color: '#F9FAFB',
}

amount: {
  fontSize: 20,
  fontWeight: '800',
  color: '#10B981', // Vert (montant)
}

statusBadge: {
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 8,
  // Couleur dynamique selon statut
}
```

---

### **Input**

```javascript
input: {
  backgroundColor: '#252A32',
  borderWidth: 1,
  borderColor: '#2A2E35',
  borderRadius: 12,
  paddingHorizontal: 16,
  paddingVertical: 16,
  fontSize: 16,
  color: '#EAEAEA',
  minHeight: 56,
}

// Focus state (à ajouter)
inputFocused: {
  borderColor: '#1D4ED8', // Bleu accent
  borderWidth: 2,
}
```

---

### **Modal**

```javascript
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  justifyContent: 'flex-end',
}

modalContent: {
  backgroundColor: '#1A1D22',
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  maxHeight: '70%',
  padding: 16,
}

modalHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 16,
}

modalTitle: {
  fontSize: 20,
  fontWeight: '600',
  color: '#F9FAFB',
  marginLeft: 8,
}
```

---

### **EmptyState**

```javascript
container: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 48,
  paddingHorizontal: 24,
}

iconContainer: {
  width: 100,
  height: 100,
  borderRadius: 50,
  backgroundColor: '#252A32',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 16,
}

title: {
  fontSize: 24,
  fontWeight: '700',
  color: '#F9FAFB',
  textAlign: 'center',
  marginBottom: 8,
}

subtitle: {
  fontSize: 14,
  fontWeight: '400',
  color: '#D1D5DB',
  textAlign: 'center',
  lineHeight: 22,
  marginBottom: 24,
  maxWidth: 280,
}

button: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  backgroundColor: '#1D4ED8',
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderRadius: 8,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
  elevation: 4,
}
```

---

## ✨ **ANIMATIONS**

### **Fade-in + Slide-up (Stats Cards)**

```javascript
// Initialisation
const opacity = useRef(new Animated.Value(0)).current;
const translateY = useRef(new Animated.Value(10)).current;

// Animation
Animated.parallel([
  Animated.timing(opacity, {
    toValue: 1,
    duration: 400,
    useNativeDriver: true,
  }),
  Animated.spring(translateY, {
    toValue: 0,
    tension: 50,
    friction: 7,
    useNativeDriver: true,
  }),
]).start();

// Utilisation
<Animated.View
  style={{
    opacity: opacity,
    transform: [{ translateY: translateY }],
  }}
>
  {/* Contenu */}
</Animated.View>
```

---

### **Scale au press (Boutons)**

```javascript
// Initialisation
const scaleAnim = useRef(new Animated.Value(1)).current;

// Press in
const handlePressIn = () => {
  Animated.spring(scaleAnim, {
    toValue: 0.95,
    tension: 300,
    friction: 10,
    useNativeDriver: true,
  }).start();
};

// Press out
const handlePressOut = () => {
  Animated.spring(scaleAnim, {
    toValue: 1,
    tension: 300,
    friction: 10,
    useNativeDriver: true,
  }).start();
};

// Utilisation
<Pressable
  onPressIn={handlePressIn}
  onPressOut={handlePressOut}
>
  <Animated.View
    style={{
      transform: [{ scale: scaleAnim }],
    }}
  >
    {/* Contenu */}
  </Animated.View>
</Pressable>
```

---

### **Pulse continue (Horloge)**

```javascript
// Initialisation
const pulseAnim = useRef(new Animated.Value(1)).current;

// Animation loop
useEffect(() => {
  const pulseAnimation = Animated.loop(
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.05,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    ])
  );
  pulseAnimation.start();

  return () => pulseAnimation.stop();
}, []);

// Utilisation
<Animated.View
  style={{
    transform: [{ scale: pulseAnim }],
  }}
>
  <Feather name="clock" size={20} color={timeColor} />
</Animated.View>
```

---

### **Stagger (Apparition progressive)**

```javascript
// Initialisation (3 éléments)
const opacity1 = useRef(new Animated.Value(0)).current;
const opacity2 = useRef(new Animated.Value(0)).current;
const opacity3 = useRef(new Animated.Value(0)).current;

// Animation stagger
useEffect(() => {
  const animations = [
    Animated.timing(opacity1, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }),
    Animated.timing(opacity2, {
      toValue: 1,
      duration: 400,
      delay: 100,
      useNativeDriver: true,
    }),
    Animated.timing(opacity3, {
      toValue: 1,
      duration: 400,
      delay: 200,
      useNativeDriver: true,
    }),
  ];

  Animated.stagger(100, animations).start();
}, []);
```

---

## 🎨 **COULEURS SPÉCIALES**

### **Cartes premium (Dashboard, Clients)**

```javascript
// Fond
backgroundColor: '#1E293B' // Gris ardoise premium

// Bordure
borderColor: '#334155' // Gris moyen premium
borderWidth: 1

// Ombre
shadowColor: '#000'
shadowOffset: { width: 0, height: 4 }
shadowOpacity: 0.2
shadowRadius: 8
elevation: 8
```

---

### **Bouton devis IA (Violet)**

```javascript
backgroundColor: '#7C3AED' // Violet (différent du bleu principal)
```

---

### **Colorisation des prix (IA)**

```javascript
// Prix cohérent (±10%)
color: '#16A34A' // Vert
fontWeight: '700'

// Prix limite (±20%)
color: '#F59E0B' // Orange
fontWeight: '700'

// Prix trop cher (+20%)
color: '#DC2626' // Rouge
fontWeight: '700'

// Prix trop bas (-20%)
color: '#2563EB' // Bleu
fontWeight: '700'
```

---

### **Statuts de documents**

```javascript
// Brouillon
backgroundColor: '#444'
color: '#fff'

// Envoyé
backgroundColor: '#1E88E5'
color: '#fff'

// Signé
backgroundColor: '#2E7D32'
color: '#fff'
```

---

## 🏗️ **STRUCTURE HTML-LIKE**

### **Dashboard**

```
<SafeAreaView>
  <ScrollView>
    <HomeHeader>
      <Greeting>Bonjour</Greeting>
      <Clock>14:23:45</Clock>
      <Date>Samedi 9 novembre 2025</Date>
      <WeatherBadge>🌤️ 15°C Paris</WeatherBadge>
    </HomeHeader>

    <StatsGrid>
      <StatCard icon="folder" color="blue">
        <Value>5</Value>
        <Label>Chantiers actifs</Label>
      </StatCard>
      <StatCard icon="check-circle" color="green">
        <Value>12</Value>
        <Label>Terminés</Label>
      </StatCard>
      <StatCard icon="camera" color="lightblue">
        <Value>48</Value>
        <Label>Photos</Label>
      </StatCard>
      <StatCard icon="file-text" color="orange">
        <Value>23</Value>
        <Label>Documents</Label>
      </StatCard>
    </StatsGrid>

    <Section title="Chantiers en cours">
      <HorizontalList>
        <ProjectCard>
          <Icon>folder</Icon>
          <StatusBadge>🟢 En cours</StatusBadge>
          <Title>Rénovation salon</Title>
        </ProjectCard>
        {/* ... */}
      </HorizontalList>
    </Section>

    <Section title="Photos récentes">
      <HorizontalList>
        <PhotoCard src="..." />
        {/* ... */}
      </HorizontalList>
    </Section>
  </ScrollView>
</SafeAreaView>
```

---

### **Capture**

```
<SafeAreaView>
  <Header>
    <Title>Capture</Title>
    <Subtitle>Capturez instantanément...</Subtitle>
  </Header>

  <ActiveProjectSelector>
    <Icon>folder</Icon>
    <Label>Chantier actif</Label>
    <Value>Rénovation salon</Value>
    <Client>M. Dupont</Client>
    <Icon>chevron-down</Icon>
  </ActiveProjectSelector>

  <ActionsContainer>
    <ActionButton>
      <IconCircle>
        <Icon>camera</Icon>
      </IconCircle>
      <Label>Photo</Label>
      <Subtitle>Prenez une photo...</Subtitle>
    </ActionButton>

    <ActionButton>
      <IconCircle>
        <Icon>mic</Icon>
      </IconCircle>
      <Label>Vocal</Label>
      <Subtitle>Dictez une note...</Subtitle>
    </ActionButton>

    <ActionButton>
      <IconCircle>
        <Icon>edit-3</Icon>
      </IconCircle>
      <Label>Note</Label>
      <Subtitle>Écrivez un rappel...</Subtitle>
    </ActionButton>
  </ActionsContainer>
</SafeAreaView>
```

---

### **Clients**

```
<SafeAreaView>
  <Header>
    <Title>Clients</Title>
    <Subtitle>Gestion de votre base client</Subtitle>
  </Header>

  <ScrollView>
    <SearchBar>
      <Icon>search</Icon>
      <Input placeholder="Rechercher..." />
    </SearchBar>

    <FormCard title="Nouveau client">
      <Input placeholder="Nom *" />
      <Input placeholder="Téléphone" />
      <Input placeholder="Email" />
      <Input placeholder="Adresse *" />
      <Row>
        <Input placeholder="Code postal" />
        <Input placeholder="Ville" />
      </Row>
      <PrimaryButton>
        <Icon>check</Icon>
        <Text>AJOUTER</Text>
      </PrimaryButton>
    </FormCard>

    <Separator />

    <SectionHeader>
      <Icon>users</Icon>
      <Title>Liste (12)</Title>
    </SectionHeader>

    <ClientCard>
      <Icon>user</Icon>
      <Name>M. Dupont</Name>
      <Row><Icon>map-pin</Icon><Text>1 rue...</Text></Row>
      <Row><Icon>phone</Icon><Text>06...</Text></Row>
      <Row><Icon>mail</Icon><Text>email@...</Text></Row>
      <DeleteButton><Icon>trash-2</Icon></DeleteButton>
    </ClientCard>
  </ScrollView>
</SafeAreaView>
```

---

### **Documents**

```
<SafeAreaView>
  <Header>
    <Title>Documents</Title>
    <SettingsButton><Icon>settings</Icon></SettingsButton>
  </Header>

  <Filters>
    <FilterButton active>TOUS</FilterButton>
    <FilterButton>📋 DEVIS</FilterButton>
    <FilterButton>📄 FACTURES</FilterButton>
  </Filters>

  <FlatList>
    <DocumentCard>
      <Header>
        <Left>
          <Type>DEVIS</Type>
          <Number>DE-2025-1234</Number>
        </Left>
        <Amount>1 248.00 €</Amount>
      </Header>

      <Body>
        <ClientName>M. Dupont</ClientName>
        <ProjectTitle>Rénovation salon</ProjectTitle>
      </Body>

      <Footer>
        <StatusBadge color="blue">Envoyé</StatusBadge>
        <Actions>
          <IconButton><Icon>eye</Icon></IconButton>
          <IconButton><Icon>trash-2</Icon></IconButton>
        </Actions>
      </Footer>
    </DocumentCard>
  </FlatList>
</SafeAreaView>
```

---

## 🎯 **RÉSUMÉ POUR DESIGNER IA**

### **Style actuel**

- **Thème** : Sombre professionnel (optimisé terrain)
- **Couleur principale** : Bleu (#1D4ED8)
- **Typographie** : System (16px base)
- **Icônes** : Feather (minimaliste)
- **Animations** : Subtiles (fade, scale, slide)
- **Ombres** : Présentes mais sous-utilisées

---

### **Forces**

✅ Cohérence globale  
✅ Lisibilité excellente  
✅ Thème centralisé  
✅ Icônes professionnelles

---

### **Faiblesses**

⚠️ Design daté (2023)  
⚠️ Animations basiques  
⚠️ Pas de police custom  
⚠️ Manque de profondeur (ombres)  
⚠️ Couleurs premium hardcodées

---

### **Objectif refonte 2.0**

🎯 **Style premium 2026** :
- Dégradés subtils
- Police custom (Inter/Poppins)
- Animations fluides (Lottie)
- Micro-interactions (haptics)
- Profondeur (ombres prononcées)
- Illustrations (états vides)
- Transitions élégantes

---

**Document complet pour designer IA** ✅

