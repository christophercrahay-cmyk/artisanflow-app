import React, { useEffect, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useSafeTheme } from '../theme/useSafeTheme';
import { Animated } from 'react-native';
import { COLORS } from '../theme/colors';

// Écrans
import ClientsListScreen from '../screens/ClientsListScreen2';
import ClientDetailScreen from '../screens/ClientDetailScreen';
import ProjectDetailScreen from '../screens/ProjectDetailScreen';
import ProjectCreateScreen from '../screens/ProjectCreateScreen';
import ProjectsListScreen from '../screens/ProjectsListScreen';
import CaptureHubScreen from '../screens/CaptureHubScreen2';
import DocumentsScreen from '../screens/DocumentsScreen2';
import SettingsScreen from '../screens/SettingsScreen';
import TemplatesScreen from '../screens/TemplatesScreen';
import PhotoGalleryScreen from '../screens/PhotoGalleryScreen';
import EditDevisScreen from '../screens/EditDevisScreen';
import PaywallScreen from '../screens/PaywallScreen';
import OnboardingPaywallScreen from '../screens/OnboardingPaywallScreen';
import SignDevisScreen from '../screens/SignDevisScreen';
import SignDevisSuccessScreen from '../screens/SignDevisSuccessScreen';
import ImportDataScreen from '../screens/ImportDataScreen';

// QA Test Runner & Debug Logs (dev only)
let QATestRunnerScreen = null;
let DebugLogsScreen = null;
if (__DEV__) {
  QATestRunnerScreen = require('../screens/QATestRunnerScreen').default;
  DebugLogsScreen = require('../screens/DebugLogsScreen').default;
}

const Tab = createBottomTabNavigator();
const ClientsStack = createNativeStackNavigator();
const CaptureStack = createNativeStackNavigator(); // Utilisé pour HomeStackNavigator
const ProStack = createNativeStackNavigator();

// Stack Clients (ClientsList → ClientDetail → ProjectDetail → ProjectCreate)
function ClientsStackNavigator() {
  return (
    <ClientsStack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animation: 'fade', // Transition fade douce
      }}
    >
      <ClientsStack.Screen name="ClientsList" component={ClientsListScreen} />
      <ClientsStack.Screen name="ClientDetail" component={ClientDetailScreen} />
      <ClientsStack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
      <ClientsStack.Screen name="ProjectCreate" component={ProjectCreateScreen} />
      <ClientsStack.Screen 
        name="ImportData" 
        component={ImportDataScreen}
        options={{ headerShown: false }}
      />
    </ClientsStack.Navigator>
  );
}

// Stack Accueil (CaptureHub → ProjectCreate)
function HomeStackNavigator() {
  return (
    <CaptureStack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animation: 'fade', // Transition fade douce
      }}
    >
      <CaptureStack.Screen name="CaptureHub" component={CaptureHubScreen} />
      <CaptureStack.Screen name="ProjectCreate" component={ProjectCreateScreen} />
    </CaptureStack.Navigator>
  );
}

// Stack Pro
function ProStackNavigator() {
  return (
    <ProStack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animation: 'fade', // Transition fade douce
      }}
    >
      <ProStack.Screen name="Documents" component={DocumentsScreen} />
      <ProStack.Screen name="Settings" component={SettingsScreen} />
      <ProStack.Screen name="Templates" component={TemplatesScreen} />
      <ProStack.Screen 
        name="Paywall" 
        component={PaywallScreen}
        options={{ headerShown: false }}
      />
      <ProStack.Screen 
        name="OnboardingPaywall" 
        component={OnboardingPaywallScreen}
        options={{ headerShown: false }}
      />
      <ProStack.Screen name="EditDevis" component={EditDevisScreen} />
      <ProStack.Screen 
        name="ImportData" 
        component={ImportDataScreen}
        options={{ headerShown: false }}
      />
      {__DEV__ && QATestRunnerScreen && (
        <ProStack.Screen name="QATestRunner" component={QATestRunnerScreen} />
      )}
      {__DEV__ && DebugLogsScreen && (
        <ProStack.Screen name="DebugLogs" component={DebugLogsScreen} />
      )}
    </ProStack.Navigator>
  );
}

// Composant d'icône animé pour la tab bar
function AnimatedTabIcon({ name, color, size, focused }) {
  const scaleAnim = useRef(new Animated.Value(focused ? 1.1 : 1)).current;

  useEffect(() => {
    if (focused) {
      Animated.spring(scaleAnim, {
        toValue: 1.15,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }).start();
    }
  }, [focused]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Feather name={name} size={size} color={color} strokeWidth={2.5} />
    </Animated.View>
  );
}


// Navigation principale avec 3 onglets
function TabNavigator() {
  const insets = useSafeAreaInsets();
  const theme = useSafeTheme();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.iconSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: 10 + insets.bottom,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Accueil',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon name="home" color={color} size={24} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="ClientsTab"
        component={ClientsStackNavigator}
        options={{
          tabBarLabel: 'Clients',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon name="users" color={color} size={24} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="ProTab"
        component={ProStackNavigator}
        options={{
          tabBarLabel: 'Documents',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon name="file-text" color={color} size={24} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const RootStack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <SafeAreaProvider>
      <RootStack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      <RootStack.Screen name="Main" component={TabNavigator} />
      <RootStack.Screen name="PhotoGallery" component={PhotoGalleryScreen} />
      <RootStack.Screen name="ProjectsList" component={ProjectsListScreen} />
      <RootStack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
      {/* Écrans publics de signature */}
      <RootStack.Screen 
        name="SignDevis" 
        component={SignDevisScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen 
        name="SignDevisSuccess" 
        component={SignDevisSuccessScreen}
        options={{ headerShown: false }}
      />
      </RootStack.Navigator>
    </SafeAreaProvider>
  );
}

