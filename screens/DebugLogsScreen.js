import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Sharing from 'expo-sharing';
import logger from '../utils/logger';
import { useSafeTheme } from '../theme/useSafeTheme';
import { Feather } from '@expo/vector-icons';

export default function DebugLogsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const theme = useSafeTheme();
  const [logs, setLogs] = useState('');
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);

  const styles = useMemo(() => getStyles(theme), [theme]);

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadLogs();
      }, 2000); // Refresh toutes les 2s
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const allLogs = await logger.getLogs();
      setLogs(allLogs);
    } catch (err) {
      console.error('Erreur chargement logs:', err);
      Alert.alert('Erreur', 'Impossible de charger les logs');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    Alert.alert(
      'Effacer logs',
      'Tous les logs seront supprimés. Continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Effacer',
          style: 'destructive',
          onPress: async () => {
            await logger.clearLogs();
            await loadLogs();
            Alert.alert('✅ OK', 'Logs effacés');
          },
        },
      ]
    );
  };

  const handleExport = async () => {
    try {
      const exportedLogs = await logger.exportLogs();
      
      if (!exportedLogs || exportedLogs === 'Aucun log pour le moment') {
        Alert.alert('Aucun log', 'Rien à exporter');
        return;
      }

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync({
          message: exportedLogs,
          mimeType: 'text/plain',
        });
      } else {
        Alert.alert('Export', exportedLogs);
      }
    } catch (err) {
      console.error('Erreur export:', err);
      Alert.alert('Erreur', 'Export impossible');
    }
  };

  const filteredLogs = filter
    ? logs
        .split('\n')
        .filter(line => line.toLowerCase().includes(filter.toLowerCase()))
        .join('\n')
    : logs;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
            <Feather name="arrow-left" size={24} color={theme.colors.accent} strokeWidth={2.5} />
            <Text style={styles.backBtnText}>Retour</Text>
          </TouchableOpacity>
          
          <View style={styles.headerTitle}>
            <Text style={styles.title}>Debug / Journal</Text>
            <Text style={styles.subtitle}>Logs système ArtisanFlow</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, autoRefresh && styles.actionButtonActive]}
            onPress={() => setAutoRefresh(!autoRefresh)}
            activeOpacity={0.7}
          >
            <Feather 
              name="refresh-cw" 
              size={20} 
              color={autoRefresh ? theme.colors.text : theme.colors.textSecondary} 
              strokeWidth={2.5}
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={loadLogs}
            activeOpacity={0.7}
          >
            <Feather name="download" size={20} color={theme.colors.accent} strokeWidth={2.5} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonDanger]}
            onPress={handleExport}
            activeOpacity={0.7}
          >
            <Feather name="share-2" size={20} color={theme.colors.info} strokeWidth={2.5} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonDanger]}
            onPress={handleClear}
            activeOpacity={0.7}
          >
            <Feather name="trash-2" size={20} color={theme.colors.error} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Filtre */}
        <View style={styles.filterContainer}>
          <Feather name="search" size={18} color={theme.colors.textSecondary} />
          <TextInput
            style={styles.filterInput}
            placeholder="Filtrer les logs..."
            placeholderTextColor={theme.colors.textMuted}
            value={filter}
            onChangeText={setFilter}
          />
          {filter ? (
            <TouchableOpacity onPress={() => setFilter('')} activeOpacity={0.7}>
              <Feather name="x" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Logs */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}
        onContentSizeChange={(contentWidth, contentHeight) => {
          if (autoRefresh) {
            // Auto-scroll vers bas si auto-refresh
            // Note : scrollViewRef nécessaire pour implémenter
          }
        }}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.accent} />
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        ) : logs ? (
          <View style={styles.logsContainer}>
            <Text style={styles.logsText}>
              {filteredLogs || logs}
            </Text>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Feather name="file-text" size={64} color={theme.colors.textMuted} />
            <Text style={styles.emptyText}>Aucun log pour le moment</Text>
          </View>
        )}
      </ScrollView>

      <View style={{ height: insets.bottom }} />
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  backBtnText: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.accent,
    marginLeft: theme.spacing.xs,
  },
  headerTitle: {
    flex: 1,
  },
  title: {
    ...theme.typography.h2,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonActive: {
    backgroundColor: theme.colors.accent + '20',
    borderColor: theme.colors.accent,
  },
  actionButtonDanger: {
    borderColor: theme.colors.error + '40',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  filterInput: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.text,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xxl,
  },
  loadingText: {
    ...theme.typography.bodySecondary,
    marginTop: theme.spacing.md,
  },
  logsContainer: {
    padding: theme.spacing.md,
  },
  logsText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: theme.colors.text,
    lineHeight: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xxl,
  },
  emptyText: {
    ...theme.typography.bodySecondary,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
});

