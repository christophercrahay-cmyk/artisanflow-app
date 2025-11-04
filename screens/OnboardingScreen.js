import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSafeTheme } from '../theme/useSafeTheme';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const ONBOARDING_DATA = [
  {
    id: 1,
    icon: 'book-open',
    title: 'Bienvenue sur ArtisanFlow',
    subtitle: 'Votre carnet de chantier intelligent.',
    description: 'Centralisez vos chantiers, clients et documents au même endroit. Simple, rapide, efficace.',
    color: '#1D4ED8',
  },
  {
    id: 2,
    icon: 'camera',
    title: 'Capturez tout',
    description: 'Photos, notes vocales et texte. Notez chaque détail du chantier en quelques secondes, sans rien oublier.',
    color: '#1D4ED8',
  },
  {
    id: 3,
    icon: 'folder',
    title: 'Organisez vos chantiers',
    description: 'Suivez l\'avancement, préparez vos devis et factures en quelques clics.',
    color: '#1D4ED8',
  },
];

export default function OnboardingScreen({ onComplete }) {
  const insets = useSafeAreaInsets();
  const theme = useSafeTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const styles = React.useMemo(() => getStyles(theme), [theme]);

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  const handleFinish = async () => {
    try {
      await AsyncStorage.setItem('@onboarding_completed', 'true');
      onComplete();
    } catch (err) {
      console.error('Erreur sauvegarde onboarding:', err);
      onComplete();
    }
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / width);
        setCurrentIndex(index);
      },
    }
  );

  const renderSlide = (item, index) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.5, 1, 0.5],
      extrapolate: 'clamp',
    });

    return (
      <View key={item.id} style={styles.slide}>
        <Animated.View
          style={[
            styles.iconContainer,
            { transform: [{ scale }], opacity },
            { backgroundColor: item.color + '20' },
          ]}
        >
          <Feather name={item.icon} size={80} color={item.color} strokeWidth={2.5} />
        </Animated.View>

        <View style={styles.content}>
          <Text style={styles.title}>{item.title}</Text>
          {item.subtitle && (
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          )}
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Skip button */}
      <TouchableOpacity
        style={styles.skipButton}
        onPress={handleSkip}
        activeOpacity={0.7}
      >
        <Text style={styles.skipText}>Passer</Text>
      </TouchableOpacity>

      {/* Slides */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {ONBOARDING_DATA.map((item, index) => renderSlide(item, index))}
      </ScrollView>

      {/* Indicators */}
      <View style={styles.indicatorsContainer}>
        {ONBOARDING_DATA.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              currentIndex === index && styles.indicatorActive,
            ]}
          />
        ))}
      </View>

      {/* Bottom buttons */}
      <View style={styles.bottomContainer}>
        {currentIndex > 0 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              const prevIndex = currentIndex - 1;
              setCurrentIndex(prevIndex);
              scrollViewRef.current?.scrollTo({
                x: prevIndex * width,
                animated: true,
              });
            }}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={20} color={theme.colors.text} />
            <Text style={styles.backButtonText}>Précédent</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.nextButton,
            { backgroundColor: ONBOARDING_DATA[currentIndex].color },
          ]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>
            {currentIndex === ONBOARDING_DATA.length - 1 ? 'Commencer' : 'Suivant'}
          </Text>
          {currentIndex < ONBOARDING_DATA.length - 1 && (
            <Feather name="arrow-right" size={20} color={theme.colors.text} />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Hook pour détecter si l'onboarding est nécessaire
export const useOnboarding = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  React.useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const completed = await AsyncStorage.getItem('@onboarding_completed');
      setShowOnboarding(completed !== 'true');
    } catch (err) {
      console.error('Erreur lecture onboarding:', err);
      setShowOnboarding(true); // Par sécurité, afficher l'onboarding
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('@onboarding_completed', 'true');
      setShowOnboarding(false);
    } catch (err) {
      console.error('Erreur sauvegarde onboarding:', err);
    }
  };

  return { isLoading, showOnboarding, completeOnboarding };
};


const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: theme.spacing.lg,
    zIndex: 10,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  skipText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxxl,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xxl,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h1,
    fontSize: 32,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    ...theme.typography.h2,
    fontSize: 24,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    color: theme.colors.accent,
  },
  description: {
    ...theme.typography.body,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    color: theme.colors.textSecondary,
    maxWidth: 320,
  },
  indicatorsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.lg,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.border,
  },
  indicatorActive: {
    width: 24,
    backgroundColor: theme.colors.accent,
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  backButtonText: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text,
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.md,
  },
  nextButtonText: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.text,
  },
});

