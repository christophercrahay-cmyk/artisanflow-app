import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useSafeTheme } from '../theme/useSafeTheme';

// Écrans
import DashboardScreen from '../screens/DashboardScreen';
import ClientsListScreen from '../screens/ClientsListScreen';
import ClientDetailScreen from '../screens/ClientDetailScreen';
import ProjectDetailScreen from '../screens/ProjectDetailScreen';
import ProjectCreateScreen from '../screens/ProjectCreateScreen';
import CaptureHubScreen from '../screens/CaptureHubScreen';
import DocumentsScreen from '../screens/DocumentsScreen';
import SettingsScreen from '../screens/SettingsScreen';

// QA Test Runner & Debug Logs (dev only)
let QATestRunnerScreen = null;
let DebugLogsScreen = null;
if (__DEV__) {
  QATestRunnerScreen = require('../screens/QATestRunnerScreen').default;
  DebugLogsScreen = require('../screens/DebugLogsScreen').default;
}

const Tab = createBottomTabNavigator();
const ClientsStack = createNativeStackNavigator();
const CaptureStack = createNativeStackNavigator();
const ProStack = createNativeStackNavigator();

// Stack Clients (ClientsList → ClientDetail → ProjectDetail → ProjectCreate)
function ClientsStackNavigator() {
  return (
    <ClientsStack.Navigator screenOptions={{ headerShown: false }}>
      <ClientsStack.Screen name="ClientsList" component={ClientsListScreen} />
      <ClientsStack.Screen name="ClientDetail" component={ClientDetailScreen} />
      <ClientsStack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
      <ClientsStack.Screen name="ProjectCreate" component={ProjectCreateScreen} />
    </ClientsStack.Navigator>
  );
}

// Stack Capture (CaptureHub → ProjectCreate)
function CaptureStackNavigator() {
  return (
    <CaptureStack.Navigator screenOptions={{ headerShown: false }}>
      <CaptureStack.Screen name="CaptureHub" component={CaptureHubScreen} />
      <CaptureStack.Screen name="ProjectCreate" component={ProjectCreateScreen} />
    </CaptureStack.Navigator>
  );
}

// Stack Pro
function ProStackNavigator() {
  return (
    <ProStack.Navigator screenOptions={{ headerShown: false }}>
      <ProStack.Screen name="Documents" component={DocumentsScreen} />
      <ProStack.Screen name="Settings" component={SettingsScreen} />
      {__DEV__ && QATestRunnerScreen && (
        <ProStack.Screen name="QATestRunner" component={QATestRunnerScreen} />
      )}
      {__DEV__ && DebugLogsScreen && (
        <ProStack.Screen name="DebugLogs" component={DebugLogsScreen} />
      )}
    </ProStack.Navigator>
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
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textSecondary,
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
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Accueil',
          tabBarIcon: ({ color, size }) => <Feather name="home" size={24} color={color} strokeWidth={2.5} />,
        }}
      />
      <Tab.Screen
        name="ClientsTab"
        component={ClientsStackNavigator}
        options={{
          tabBarLabel: 'Clients',
          tabBarIcon: ({ color, size }) => <Feather name="users" size={24} color={color} strokeWidth={2.5} />,
        }}
      />
      <Tab.Screen
        name="CaptureTab"
        component={CaptureStackNavigator}
        options={{
          tabBarLabel: 'Capture',
          tabBarIcon: ({ color, size }) => <Feather name="camera" size={24} color={color} strokeWidth={2.5} />,
        }}
      />
      <Tab.Screen
        name="ProTab"
        component={ProStackNavigator}
        options={{
          tabBarLabel: 'Documents',
          tabBarIcon: ({ color, size }) => <Feather name="file-text" size={24} color={color} strokeWidth={2.5} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <SafeAreaProvider>
      <TabNavigator />
    </SafeAreaProvider>
  );
}

