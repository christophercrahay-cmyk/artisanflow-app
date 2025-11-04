import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../supabaseClient';
import * as Sharing from 'expo-sharing';
import * as Linking from 'expo-linking';
import { useSafeTheme } from '../theme/useSafeTheme';
import { Feather } from '@expo/vector-icons';
import { showSuccess, showError } from '../components/Toast';

export default function DocumentsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const theme = useSafeTheme();
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [tapCount, setTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);

  const styles = useMemo(() => getStyles(theme), [theme]);

  useEffect(() => {
    loadDocuments();
  }, [filterType]);

  const handleTitleTap = () => {
    const now = Date.now();
    if (now - lastTapTime < 500) {
      const newCount = tapCount + 1;
      setTapCount(newCount);
      if (newCount >= 10) {
        if (__DEV__) {
          navigation.navigate('QATestRunner');
        }
        setTapCount(0);
      }
    } else {
      setTapCount(1);
    }
    setLastTapTime(now);
  };

  const loadDocuments = async () => {
    try {
      setLoading(true);

      if (filterType === 'devis') {
        const { data, error } = await supabase
          .from('devis')
          .select('*, projects(name), clients(name)')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setDocuments((data || []).map(d => ({ ...d, type: 'devis' })));
      } else if (filterType === 'factures') {
        const { data, error } = await supabase
          .from('factures')
          .select('*, projects(name), clients(name)')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setDocuments((data || []).map(d => ({ ...d, type: 'facture' })));
      } else {
        const [devisRes, facturesRes] = await Promise.all([
          supabase.from('devis').select('*, projects(name), clients(name)').order('created_at', { ascending: false }),
          supabase.from('factures').select('*, projects(name), clients(name)').order('created_at', { ascending: false }),
        ]);

        if (devisRes.error) throw devisRes.error;
        if (facturesRes.error) throw facturesRes.error;

        const allDocs = [
          ...(devisRes.data || []).map(d => ({ ...d, type: 'devis' })),
          ...(facturesRes.data || []).map(d => ({ ...d, type: 'facture' })),
        ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        setDocuments(allDocs);
      }
    } catch (err) {
      console.error('Erreur chargement documents:', err);
      showError('Impossible de charger les documents');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPDF = async (url) => {
    if (!url) {
      Alert.alert('Erreur', 'URL PDF manquante');
      return;
    }

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(url);
        } else {
          showError('Impossible d\'ouvrir le PDF');
        }
      }
    } catch (err) {
      console.error('Erreur ouverture PDF:', err);
      showError('Impossible d\'ouvrir le PDF');
    }
  };

  const deleteDocument = async (id, type) => {
    Alert.alert(
      'Supprimer ce document ?',
      'Cette action est définitive.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const table = type === 'devis' ? 'devis' : 'factures';
              const { error } = await supabase.from(table).delete().eq('id', id);
              if (error) throw error;
              await loadDocuments();
              showSuccess('Document supprimé');
            } catch (err) {
              console.error('Erreur suppression:', err);
              showError('Impossible de supprimer le document');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <TouchableOpacity onPress={handleTitleTap}>
                <Text style={styles.title}>Documents</Text>
                <Text style={styles.subtitle}>Devis & Factures</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
              {__DEV__ && (
                <TouchableOpacity
                  style={styles.settingsButton}
                  onPress={() => navigation.navigate('DebugLogs')}
                  activeOpacity={0.7}
                >
                  <Feather name="terminal" size={24} color={theme.colors.info} strokeWidth={2.5} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => navigation.navigate('Settings')}
                activeOpacity={0.7}
              >
                <Feather name="settings" size={24} color={theme.colors.accent} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Filtres */}
        <View style={styles.filters}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterType === 'all' && styles.filterButtonActive,
            ]}
            onPress={() => setFilterType('all')}
            activeOpacity={0.7}
          >
            <Feather 
              name="list" 
              size={16} 
              color={filterType === 'all' ? theme.colors.text : theme.colors.textSecondary} 
              strokeWidth={2.5}
            />
            <Text style={[
              styles.filterButtonText,
              filterType === 'all' && styles.filterButtonTextActive,
            ]}>
              Tous
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterType === 'devis' && styles.filterButtonActive,
            ]}
            onPress={() => setFilterType('devis')}
            activeOpacity={0.7}
          >
            <Feather 
              name="file-text" 
              size={16} 
              color={filterType === 'devis' ? theme.colors.text : theme.colors.textSecondary} 
              strokeWidth={2.5}
            />
            <Text style={[
              styles.filterButtonText,
              filterType === 'devis' && styles.filterButtonTextActive,
            ]}>
              Devis
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterType === 'factures' && styles.filterButtonActive,
            ]}
            onPress={() => setFilterType('factures')}
            activeOpacity={0.7}
          >
            <Feather 
              name="file-check" 
              size={16} 
              color={filterType === 'factures' ? theme.colors.text : theme.colors.textSecondary} 
              strokeWidth={2.5}
            />
            <Text style={[
              styles.filterButtonText,
              filterType === 'factures' && styles.filterButtonTextActive,
            ]}>
              Factures
            </Text>
          </TouchableOpacity>
        </View>

        {/* Liste documents */}
        {documents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="file" size={64} color={theme.colors.textMuted} />
            <Text style={styles.emptyText}>Aucun document</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {documents.map((doc) => {
              const isDevis = doc.type === 'devis';
              const icon = isDevis ? 'file-text' : 'file-check';
              const clientName = doc.clients?.name || 'Client inconnu';
              const projectName = doc.projects?.name || 'Chantier inconnu';

              return (
                <View key={doc.id} style={[styles.card, { borderLeftWidth: 4, borderLeftColor: isDevis ? theme.colors.accent : theme.colors.warning }]}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardIconContainer}>
                      <Feather 
                        name={icon} 
                        size={24} 
                        color={isDevis ? theme.colors.accent : theme.colors.warning} 
                        strokeWidth={2.5}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{doc.numero}</Text>
                      <View style={styles.cardInfoRow}>
                        <Feather name="user" size={12} color={theme.colors.textSecondary} />
                        <Text style={styles.cardClient}>{clientName}</Text>
                      </View>
                      <View style={styles.cardInfoRow}>
                        <Feather name="folder" size={12} color={theme.colors.textSecondary} />
                        <Text style={styles.cardProject}>{projectName}</Text>
                      </View>
                    </View>
                    <Text style={styles.cardAmount}>
                      {Number(doc.montant_ttc || 0).toFixed(2)} €
                    </Text>
                  </View>

                  <View style={styles.cardFooter}>
                    <View style={[styles.badge, { 
                      backgroundColor: doc.statut === 'envoyé' ? theme.colors.success + '20' : 
                                      doc.statut === 'signé' ? theme.colors.accent + '20' :
                                      theme.colors.surfaceElevated 
                    }]}>
                      <Text style={[styles.cardStatus, {
                        color: doc.statut === 'envoyé' ? theme.colors.success :
                               doc.statut === 'signé' ? theme.colors.accent :
                               theme.colors.textSecondary
                      }]}>{doc.statut || 'brouillon'}</Text>
                    </View>
                    <View style={styles.cardActions}>
                      {doc.pdf_url && (
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleViewPDF(doc.pdf_url)}
                          activeOpacity={0.7}
                        >
                          <Feather name="eye" size={16} color={theme.colors.accent} strokeWidth={2.5} />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => deleteDocument(doc.id, doc.type)}
                        activeOpacity={0.7}
                      >
                        <Feather name="trash-2" size={16} color={theme.colors.error} strokeWidth={2.5} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: insets.bottom + 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    ...theme.typography.body,
    marginTop: theme.spacing.lg,
    color: theme.colors.textSecondary,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingsButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  title: {
    ...theme.typography.h1,
    fontSize: 32,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.bodySmall,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  filterButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  filterButtonActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  filterButtonText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  filterButtonTextActive: {
    color: theme.colors.text,
  },
  list: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  card: {
    backgroundColor: '#1E293B', // Premium dark gray
    borderWidth: 1,
    borderColor: '#334155', // Bordure fine discrète
    borderRadius: 16, // Plus arrondi
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md, // Ombre plus prononcée
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  cardTitle: {
    ...theme.typography.h4,
    fontSize: 16,
    marginBottom: theme.spacing.xs,
  },
  cardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  cardClient: {
    ...theme.typography.bodySmall,
    marginLeft: theme.spacing.xs,
  },
  cardProject: {
    ...theme.typography.bodySmall,
    marginLeft: theme.spacing.xs,
    fontSize: 12,
  },
  cardAmount: {
    ...theme.typography.h4,
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.success,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  badge: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  cardStatus: {
    ...theme.typography.caption,
    fontSize: 10,
  },
  cardActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  deleteButton: {
    backgroundColor: theme.colors.error + '20',
    borderColor: theme.colors.error + '40',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl * 2,
  },
  emptyText: {
    ...theme.typography.body,
    marginTop: theme.spacing.lg,
    color: theme.colors.textSecondary,
  },
});
