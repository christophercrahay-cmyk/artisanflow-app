/**
 * DocumentsScreen 2.0 - Style Notion
 * Design System 2.0 - Niveau 11/10
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { impactAsync } from '../utils/hapticsService';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { useThemeColors } from '../theme/theme2';
import { ScreenContainer, AppCard, SegmentedControl, StatusBadge, PrimaryButton } from '../components/ui';
import { supabase } from '../supabaseClient';
import { generateDevisPDFFromDB } from '../utils/utils/pdf';
import logger from '../utils/logger';
import { 
  shareViaEmail, 
  shareViaWhatsApp, 
  shareViaSMS, 
  shareGeneric,
  getLocalPdfUri 
} from '../services/shareService';
import { showSuccess, showError } from '../components/Toast';
import { getErrorMessage, getDeleteConfirmationMessage } from '../utils/errorMessages';
import { requireProOrPaywall } from '../utils/proAccess';

export default function DocumentsScreen2({ navigation }) {
  const theme = useThemeColors();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('tous');
  const [refreshing, setRefreshing] = useState(false);
  const [companyName, setCompanyName] = useState('Mon Entreprise');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('tous'); // tous, brouillon, envoye, signe
  const [sortBy, setSortBy] = useState('date_desc'); // date_desc, date_asc, montant_desc, montant_asc

  const styles = useMemo(() => getStyles(theme), [theme]);

  useFocusEffect(
    useCallback(() => {
      loadDocuments();
      loadCompanySettings();
    }, [])
  );

  const loadCompanySettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('brand_settings')
        .select('company_name')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data?.company_name) {
        setCompanyName(data.company_name);
      }
    } catch (error) {
      logger.error('DocumentsScreen', 'Erreur chargement settings', error);
    }
  };

  const loadDocuments = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Erreur', 'Utilisateur non connecté');
        return;
      }

      const { data: devis, error: devisError } = await supabase
        .from('devis')
        .select(`*, projects!inner(id, name, user_id), clients(id, name, email, phone)`)
        .eq('projects.user_id', user.id)
        .order('created_at', { ascending: false });

      if (devisError) {
        logger.error('DocumentsScreen', 'Erreur chargement devis', devisError);
      }

      const { data: factures, error: facturesError } = await supabase
        .from('factures')
        .select(`*, projects!inner(id, name, user_id), clients(id, name, email, phone)`)
        .eq('projects.user_id', user.id)
        .order('created_at', { ascending: false });

      if (facturesError) {
        logger.error('DocumentsScreen', 'Erreur chargement factures', facturesError);
      }

      const allDocuments = [
        ...(devis || []).map(d => ({
          ...d,
          type: 'devis',
          number: d.numero,
          total_ttc: d.montant_ttc,
          status: normalizeStatus(d.statut),
          client_name: d.clients?.name || 'Client inconnu',
          client_email: d.clients?.email || null,
          client_phone: d.clients?.phone || null,
          project_title: d.projects?.name || 'Projet inconnu',
        })),
        ...(factures || []).map(f => ({
          ...f,
          type: 'facture',
          number: f.numero,
          total_ttc: f.montant_ttc,
          status: normalizeStatus(f.statut),
          client_name: f.clients?.name || 'Client inconnu',
          client_email: f.clients?.email || null,
          client_phone: f.clients?.phone || null,
          project_title: f.projects?.name || 'Projet inconnu',
        })),
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      logger.info('DocumentsScreen', `Documents chargés: ${allDocuments.length} (${devis?.length || 0} devis, ${factures?.length || 0} factures)`);
      setDocuments(allDocuments);
    } catch (error) {
      logger.error('DocumentsScreen', 'Exception chargement documents', error);
      Alert.alert('Erreur', 'Impossible de charger les documents');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const normalizeStatus = (status) => {
    const normalized = status?.toLowerCase() || 'brouillon';
    if (normalized.includes('envoy') || normalized === 'envoye') return 'envoye';
    if (normalized.includes('sign') || normalized === 'signe' || normalized === 'accepte') return 'signe';
    return 'brouillon';
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'brouillon': return 'Brouillon';
      case 'envoye': return 'Envoyé';
      case 'signe': return 'Signé';
      default: return status;
    }
  };

  const getStatusType = (status) => {
    switch (status) {
      case 'envoye': return 'info';
      case 'signe': return 'success';
      case 'brouillon': return 'warning';
      default: return 'default';
    }
  };

  // ✅ Filtrage et tri des documents
  const filteredDocuments = useMemo(() => {
    let result = [...documents];

    // 1. Filtre par type (devis/factures/tous)
    if (filter !== 'tous') {
      const typeMap = {
        'devis': 'devis',
        'factures': 'facture',
      };
      const targetType = typeMap[filter] || filter;
      result = result.filter(doc => doc.type === targetType);
    }

    // 2. Filtre par statut
    if (statusFilter !== 'tous') {
      result = result.filter(doc => doc.status === statusFilter);
    }

    // 3. Recherche textuelle
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(doc =>
        doc.number?.toLowerCase().includes(query) ||
        doc.client_name?.toLowerCase().includes(query) ||
        doc.project_title?.toLowerCase().includes(query) ||
        doc.total_ttc?.toString().includes(query)
      );
    }

    // 4. Tri
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date_asc':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'montant_desc':
          return (b.total_ttc || 0) - (a.total_ttc || 0);
        case 'montant_asc':
          return (a.total_ttc || 0) - (b.total_ttc || 0);
        case 'date_desc':
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

    return result;
  }, [documents, filter, statusFilter, searchQuery, sortBy]);

  const openDocument = async (document) => {
    try {
      impactAsync();
      
      if (document.pdf_url) {
        // ✅ Télécharger le PDF en local avant de partager (ExpoSharing ne supporte que file://)
        const fileName = `${document.type}_${document.number}.pdf`;
        const localUri = `${FileSystem.cacheDirectory}${fileName}`;
        
        logger.info('DocumentsScreen', 'Téléchargement PDF', { url: document.pdf_url, localUri });
        
        try {
        const downloadResult = await FileSystem.downloadAsync(document.pdf_url, localUri);
        
        if (downloadResult.status === 200) {
          const isAvailable = await Sharing.isAvailableAsync();
          if (isAvailable) {
            await Sharing.shareAsync(downloadResult.uri, {
              mimeType: 'application/pdf',
              dialogTitle: `${document.type === 'devis' ? 'Devis' : 'Facture'} ${document.number}`,
            });
              return;
          }
        } else {
            throw new Error(`Téléchargement échoué avec status ${downloadResult.status}`);
          }
        } catch (downloadError) {
          // ✅ Fallback : si le téléchargement échoue, générer le PDF à la volée
          logger.warn('DocumentsScreen', 'Échec téléchargement PDF, génération à la volée', {
            error: downloadError.message,
            pdf_url: document.pdf_url,
          });
          
          // Continuer avec la génération du PDF ci-dessous
        }
      }

      if (document.type === 'devis') {
        // Si c'est un brouillon, proposer d'éditer ou de générer le PDF
        if (document.status === 'brouillon') {
          const { data: lignes } = await supabase
            .from('devis_lignes')
            .select('id')
            .eq('devis_id', document.id);

          if (lignes && lignes.length > 0) {
            // Proposer d'éditer ou de générer le PDF
            Alert.alert(
              'Devis brouillon',
              'Que souhaitez-vous faire ?',
              [
                {
                  text: 'Modifier les prix',
                  onPress: () => navigation.navigate('EditDevis', { devisId: document.id }),
                },
                {
                  text: 'Générer le PDF',
                  onPress: async () => {
                    const ok = await requireProOrPaywall(navigation, 'Export PDF');
                    if (!ok) return;
                    
                    const result = await generateDevisPDFFromDB(document.id);
                    if (result.localUri) {
                      const isAvailable = await Sharing.isAvailableAsync();
                      if (isAvailable) {
                        await Sharing.shareAsync(result.localUri, {
                          mimeType: 'application/pdf',
                          dialogTitle: `Devis ${document.number}`,
                        });
                      }
                    }
                  },
                },
                { text: 'Annuler', style: 'cancel' },
              ]
            );
            return;
          } else {
            Alert.alert(
              'Aucune ligne',
              'Ce devis ne contient pas de lignes détaillées.\n\nUtilisez le bouton "Générer devis IA" pour créer un devis structuré.'
            );
            return;
          }
        }

        // Si ce n'est pas un brouillon, générer directement le PDF
        const { data: lignes } = await supabase
          .from('devis_lignes')
          .select('id')
          .eq('devis_id', document.id);

        if (!lignes || lignes.length === 0) {
          Alert.alert(
            'Aucune ligne',
            'Ce devis ne contient pas de lignes détaillées.\n\nUtilisez le bouton "Générer devis IA" pour créer un devis structuré.'
          );
          return;
        }

        // Vérifier l'accès Pro avant génération PDF
        const ok = await requireProOrPaywall(navigation, 'Export PDF');
        if (!ok) return;

        const result = await generateDevisPDFFromDB(document.id);
        if (result.localUri) {
          const isAvailable = await Sharing.isAvailableAsync();
          if (isAvailable) {
            await Sharing.shareAsync(result.localUri, {
              mimeType: 'application/pdf',
              dialogTitle: `Devis ${document.number}`,
            });
          }
        }
      } else {
        Alert.alert('Info', 'Génération PDF pour les factures à venir');
      }
    } catch (error) {
      logger.error('DocumentsScreen', 'Erreur ouverture document', error);
      showError(getErrorMessage(error, 'load'));
    }
  };

  const shareDocument = async (document) => {
    try {
      // Récupérer le PDF local
      let pdfUri = null;
      
      if (document.pdf_url) {
        pdfUri = await getLocalPdfUri(document);
      } else if (document.type === 'devis') {
        // Générer le PDF si pas encore créé
        const result = await generateDevisPDFFromDB(document.id);
        pdfUri = result.localUri;
      } else {
        showError('PDF non disponible pour cette facture');
        return;
      }

      if (!pdfUri) {
        showError('Impossible de récupérer le PDF');
        return;
      }

      // Afficher le menu de partage
      Alert.alert(
        `Partager ${document.type === 'devis' ? 'Devis' : 'Facture'} ${document.number}`,
        'Choisissez le mode de partage',
        [
          {
            text: '📧 Email',
            onPress: async () => {
              try {
                await shareViaEmail(document, pdfUri, companyName);
                showSuccess('Email ouvert');
              } catch (error) {
                showError(error.message || 'Impossible d\'ouvrir l\'email');
              }
            },
          },
          {
            text: '💬 WhatsApp',
            onPress: async () => {
              try {
                await shareViaWhatsApp(document, pdfUri, document.client_phone);
                showSuccess('WhatsApp ouvert');
              } catch (error) {
                showError(error.message || 'Impossible d\'ouvrir WhatsApp');
              }
            },
          },
          {
            text: '📱 SMS',
            onPress: async () => {
              try {
                await shareViaSMS(document, pdfUri, document.client_phone);
                showSuccess('SMS ouvert');
              } catch (error) {
                showError(error.message || 'Impossible d\'ouvrir le SMS');
              }
            },
          },
          {
            text: '📤 Autre',
            onPress: async () => {
              try {
                await shareGeneric(pdfUri, document);
              } catch (error) {
                showError(error.message || 'Impossible de partager');
              }
            },
          },
          {
            text: 'Annuler',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      logger.error('DocumentsScreen', 'Erreur partage document', error);
      showError(getErrorMessage(error, 'upload'));
    }
  };

  const deleteDocument = (document) => {
    const docType = document.type === 'devis' ? 'devis' : 'facture';
    Alert.alert(
      'Supprimer le document',
      getDeleteConfirmationMessage(`${docType.toUpperCase()} ${document.number}`, docType),
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const tableName = document.type === 'devis' ? 'devis' : 'factures';
              const { error } = await supabase
                .from(tableName)
                .delete()
                .eq('id', document.id);

              if (error) throw error;

              setDocuments(prev => prev.filter(doc => doc.id !== document.id));
              logger.success('DocumentsScreen', 'Document supprimé');
              showSuccess(`${docType === 'devis' ? 'Devis' : 'Facture'} supprimé`);
            } catch (error) {
              logger.error('DocumentsScreen', 'Erreur suppression', error);
              showError(getErrorMessage(error, 'delete'));
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>
            Chargement des documents...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <FlatList
        style={styles.flatList}
        data={filteredDocuments}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.colors.text, letterSpacing: theme.letterSpacing.wide }]}>
                Documents
              </Text>
              <TouchableOpacity
                onPress={() => {
                  impactAsync();
                  navigation.navigate('Settings');
                }}
                style={styles.settingsButton}
              >
                <Feather name="settings" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {/* Barre de recherche */}
            <View style={[styles.searchContainer, { 
              backgroundColor: theme.colors.surfaceAlt,
              borderRadius: theme.radius.md,
            }]}>
              <Feather name="search" size={20} color={theme.colors.textMuted} />
              <TextInput
                style={[styles.searchInput, { color: theme.colors.text }]}
                placeholder="Rechercher (numéro, client, projet, montant)..."
                placeholderTextColor={theme.colors.textSoft}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={styles.clearButton}
                >
                  <Feather name="x" size={18} color={theme.colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {/* SegmentedControl */}
            <SegmentedControl
              segments={[
                { value: 'tous', label: 'TOUS' },
                { value: 'devis', label: 'DEVIS', icon: '📋' },
                { value: 'factures', label: 'FACTURES', icon: '📄' },
              ]}
              value={filter}
              onChange={setFilter}
              style={styles.segmentedControl}
            />

            {/* Filtres et tri */}
            <View style={styles.filtersRow}>
              {/* Filtre par statut */}
              <View style={styles.filterGroup}>
                <Text style={[styles.filterLabel, { color: theme.colors.textMuted }]}>Statut:</Text>
                <View style={styles.filterButtons}>
                  {['tous', 'brouillon', 'envoye', 'signe'].map((status) => (
                    <TouchableOpacity
                      key={status}
                      onPress={() => setStatusFilter(status)}
                      style={[
                        styles.filterButton,
                        {
                          backgroundColor: statusFilter === status ? theme.colors.primary : theme.colors.surfaceAlt,
                          borderRadius: theme.radius.sm,
                        },
                      ]}
                    >
                      <Text style={[
                        styles.filterButtonText,
                        { color: statusFilter === status ? '#FFFFFF' : theme.colors.textMuted },
                      ]}>
                        {status === 'tous' ? 'Tous' : status === 'brouillon' ? 'Brouillon' : status === 'envoye' ? 'Envoyé' : 'Signé'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Tri */}
              <View style={styles.filterGroup}>
                <Text style={[styles.filterLabel, { color: theme.colors.textMuted }]}>Tri:</Text>
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      'Trier par',
                      'Choisissez le critère de tri',
                      [
                        { text: 'Date (récent)', onPress: () => setSortBy('date_desc') },
                        { text: 'Date (ancien)', onPress: () => setSortBy('date_asc') },
                        { text: 'Montant (décroissant)', onPress: () => setSortBy('montant_desc') },
                        { text: 'Montant (croissant)', onPress: () => setSortBy('montant_asc') },
                        { text: 'Annuler', style: 'cancel' },
                      ]
                    );
                  }}
                  style={[styles.sortButton, {
                    backgroundColor: theme.colors.surfaceAlt,
                    borderRadius: theme.radius.sm,
                  }]}
                >
                  <Feather 
                    name={sortBy.includes('montant') ? 'dollar-sign' : 'calendar'} 
                    size={16} 
                    color={theme.colors.textMuted} 
                  />
                  <Text style={[styles.sortButtonText, { color: theme.colors.textMuted }]}>
                    {sortBy === 'date_desc' ? 'Récent' : 
                     sortBy === 'date_asc' ? 'Ancien' : 
                     sortBy === 'montant_desc' ? 'Montant ↓' : 'Montant ↑'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => openDocument(item)}
            style={({ pressed }) => [
              pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 },
            ]}
          >
            <AppCard style={styles.documentCard}>
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
                  {item.total_ttc?.toFixed(2) || '0.00'} €
                </Text>
              </View>

              <View style={styles.cardBody}>
                <Text style={[styles.clientName, { color: theme.colors.text }]}>
                  {item.client_name}
                </Text>
                <Text style={[styles.projectTitle, { color: theme.colors.textMuted }]}>
                  {item.project_title}
                </Text>
              </View>

              <View style={styles.cardFooter}>
                <StatusBadge
                  label={getStatusLabel(item.status)}
                  type={getStatusType(item.status)}
                />
                <View style={styles.actions}>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      openDocument(item);
                    }}
                    style={styles.actionButton}
                  >
                    <Feather name="eye" size={20} color={theme.colors.textMuted} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      shareDocument(item);
                    }}
                    style={styles.actionButton}
                  >
                    <Feather name="share-2" size={20} color={theme.colors.accent} />
                  </TouchableOpacity>
                  {item.status === 'brouillon' && (
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        deleteDocument(item);
                      }}
                      style={styles.actionButton}
                    >
                      <Feather name="trash-2" size={20} color={theme.colors.danger} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </AppCard>
          </Pressable>
        )}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          loadDocuments();
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
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
                impactAsync();
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

const getStyles = (theme) => StyleSheet.create({
  flatList: {
    flex: 1,
  },
  listContent: {
    paddingBottom: theme.spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.body,
    fontWeight: theme.fontWeights.semibold,
  },
  loadingSubtext: {
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.small,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.h1,
    fontWeight: theme.fontWeights.bold,
  },
  settingsButton: {
    padding: theme.spacing.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.body,
    paddingVertical: theme.spacing.xs,
  },
  clearButton: {
    padding: theme.spacing.xs,
  },
  filtersRow: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  filterGroup: {
    gap: theme.spacing.xs,
  },
  filterLabel: {
    fontSize: theme.typography.caption,
    fontWeight: theme.fontWeights.medium,
    marginBottom: theme.spacing.xs,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  filterButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  filterButtonText: {
    fontSize: theme.typography.caption,
    fontWeight: theme.fontWeights.medium,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.xs,
    alignSelf: 'flex-start',
  },
  sortButtonText: {
    fontSize: theme.typography.caption,
    fontWeight: theme.fontWeights.medium,
  },
  segmentedControl: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  documentCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  docType: {
    fontSize: theme.typography.tiny,
    fontWeight: theme.fontWeights.semibold,
    marginBottom: 4,
  },
  docNumber: {
    fontSize: theme.typography.h3,
    fontWeight: theme.fontWeights.bold,
  },
  amount: {
    fontSize: theme.typography.h2,
    fontWeight: theme.fontWeights.bold,
  },
  cardBody: {
    marginBottom: theme.spacing.md,
  },
  clientName: {
    fontSize: theme.typography.body,
    fontWeight: theme.fontWeights.semibold,
    marginBottom: 4,
  },
  projectTitle: {
    fontSize: theme.typography.small,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    padding: theme.spacing.sm,
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
    fontSize: 80,
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

