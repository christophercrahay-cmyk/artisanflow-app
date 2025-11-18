/**
 * DocumentsScreen 2.0 - Refonte Premium
 * Design System 2.0 - Niveau 11/10
 * 
 * Améliorations :
 * - Design harmonisé avec cartes compactes
 * - Tag statut normalisé avec couleurs
 * - Recherche intelligente avec debounce
 * - Filtres améliorés (tabs + boutons pill)
 * - Animations d'apparition (fade + slide Y, stagger)
 * - Performance FlatList optimisée
 * - Actions cliquables (carte, tag édition)
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { impactAsync } from '../utils/hapticsService';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { useThemeColors } from '../theme/theme2';
import { ScreenContainer, AFDialog } from '../components/ui';
import SearchBar from '../components/SearchBar';
import { COLORS } from '../theme/colors';
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

// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Composant Tag Statut normalisé
const StatusTag = ({ status, onPress }) => {
  const theme = useThemeColors();
  
  const statusConfig = {
    edition: { color: '#3B82F6', bg: '#3B82F620', icon: '✏️', label: 'Édition' },
    pret: { color: '#6366F1', bg: '#6366F120', icon: '📄', label: 'Prêt' },
    envoye: { color: '#F97316', bg: '#F9731620', icon: '📤', label: 'Envoyé' },
    signe: { color: '#10B981', bg: '#10B98120', icon: '✔️', label: 'Signé' },
    refuse: { color: '#EF4444', bg: '#EF444420', icon: '❌', label: 'Refusé' },
    brouillon: { color: '#6B7280', bg: '#6B728020', icon: '📝', label: 'Brouillon' },
    accepte: { color: '#10B981', bg: '#10B98120', icon: '✅', label: 'Accepté' },
  };

  const config = statusConfig[status] || { color: '#6B7280', bg: '#6B728020', icon: '', label: status };

  const tagStyle = {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: config.bg,
  };

  const tagTextStyle = {
    marginLeft: config.icon ? 6 : 0,
    fontWeight: '600',
    fontSize: 12,
    color: config.color,
  };

  const content = (
    <View style={tagStyle}>
      {config.icon && <Text style={{ fontSize: 12 }}>{config.icon}</Text>}
      <Text style={tagTextStyle}>{config.label}</Text>
    </View>
  );

  if (onPress && status === 'edition') {
    return (
      <Pressable onPress={onPress}>
        {content}
      </Pressable>
    );
  }

  return content;
};

// Composant Carte Document avec animation
const DocumentCard = ({ document, index, onPress, onShare, onEdit, theme }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const styles = getCardStyles(theme);

  const formatPrice = (price) => {
    if (!price) return '0,00 €';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(price);
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <Pressable
        onPress={() => onPress(document)}
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
        ]}
      >
        {/* Header : Type + Prix */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.docType}>
              {document.type === 'devis' ? 'DEVIS' : 'FACTURE'}
            </Text>
            <Text style={styles.docNumber} numberOfLines={1}>
              {document.number}
            </Text>
          </View>
          <Text style={styles.amount}>
            {formatPrice(document.total_ttc)}
          </Text>
        </View>

        {/* Body : Client + Projet */}
        <View style={styles.cardBody}>
          <Text style={styles.clientName} numberOfLines={1}>
            {document.client_name}
          </Text>
          <Text style={styles.projectTitle} numberOfLines={1}>
            {document.project_title}
          </Text>
        </View>

        {/* Footer : Tag + Actions */}
        <View style={styles.cardFooter}>
          <StatusTag
            status={document.status}
            onPress={document.status === 'edition' ? () => onEdit(document) : null}
          />
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onPress(document);
              }}
              style={styles.actionButton}
              activeOpacity={0.7}
            >
              <Feather name="eye" size={18} color={COLORS.iconSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onShare(document);
              }}
              style={styles.actionButton}
              activeOpacity={0.7}
            >
              <Feather name="share-2" size={18} color={COLORS.iconSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default function DocumentsScreen2({ navigation }) {
  const theme = useThemeColors();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('tous'); // tous, devis, factures
  const [refreshing, setRefreshing] = useState(false);
  const [companyName, setCompanyName] = useState('Mon Entreprise');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('tous');
  const [editDialogDevis, setEditDialogDevis] = useState(null); // Pour le dialog "Devis en édition"
  const [shareDialogDocument, setShareDialogDocument] = useState(null); // Pour le dialog de partage
  const [shareDialogPdfUri, setShareDialogPdfUri] = useState(null); // URI du PDF pour le partage
  const [sortBy, setSortBy] = useState('date_desc');

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

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
        showError('Utilisateur non connecté');
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
          status: d.statut,
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
          status: f.statut,
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
      showError('Impossible de charger les documents');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filtrage et tri des documents
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

    // 3. Recherche textuelle (case-insensitive)
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase().trim();
      result = result.filter(doc =>
        doc.number?.toLowerCase().includes(query) ||
        doc.client_name?.toLowerCase().includes(query) ||
        doc.project_title?.toLowerCase().includes(query) ||
        doc.status?.toLowerCase().includes(query) ||
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
  }, [documents, filter, statusFilter, debouncedSearchQuery, sortBy]);

  const openDocument = async (document) => {
    try {
      impactAsync();
      
      if (document.pdf_url) {
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
          logger.warn('DocumentsScreen', 'Échec téléchargement PDF, génération à la volée', {
            error: downloadError.message,
            pdf_url: document.pdf_url,
          });
        }
      }

      if (document.type === 'devis') {
        if (document.status === 'edition' || document.status === 'brouillon') {
          const { data: lignes } = await supabase
            .from('devis_lignes')
            .select('id')
            .eq('devis_id', document.id);

          if (lignes && lignes.length > 0) {
            setEditDialogDevis(document);
            return;
          } else {
            showError('Ce devis ne contient pas de lignes détaillées.\n\nUtilisez le bouton "Générer devis IA" pour créer un devis structuré.');
            return;
          }
        }

        const { data: lignes } = await supabase
          .from('devis_lignes')
          .select('id')
          .eq('devis_id', document.id);

        if (!lignes || lignes.length === 0) {
          showError('Ce devis ne contient pas de lignes détaillées.\n\nUtilisez le bouton "Générer devis IA" pour créer un devis structuré.');
          return;
        }

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
        showError('Génération PDF pour les factures à venir');
      }
    } catch (error) {
      logger.error('DocumentsScreen', 'Erreur ouverture document', error);
      showError(getErrorMessage(error, 'load'));
    }
  };

  const shareDocument = async (document) => {
    try {
      let pdfUri = null;
      
      if (document.pdf_url) {
        pdfUri = await getLocalPdfUri(document);
      } else if (document.type === 'devis') {
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

      setShareDialogDocument(document);
      setShareDialogPdfUri(pdfUri);
    } catch (error) {
      logger.error('DocumentsScreen', 'Erreur partage document', error);
      showError(getErrorMessage(error, 'upload'));
    }
  };

  const editDocument = (document) => {
    if (document.type === 'devis' && (document.status === 'edition' || document.status === 'brouillon')) {
      navigation.navigate('EditDevis', { devisId: document.id });
    }
  };

  const renderDocument = useCallback(({ item, index }) => (
    <DocumentCard
      document={item}
      index={index}
      onPress={openDocument}
      onShare={shareDocument}
      onEdit={editDocument}
      theme={theme}
    />
  ), [theme]);

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

  const statusFilters = ['tous', 'edition', 'pret', 'envoye', 'signe'];
  const statusLabels = {
    tous: 'Tous',
    edition: 'Édition',
    pret: 'Prêt',
    envoye: 'Envoyé',
    signe: 'Signé',
  };

  return (
    <ScreenContainer>
      <FlatList
        style={styles.flatList}
        data={filteredDocuments}
        renderItem={renderDocument}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          loadDocuments();
        }}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.colors.text }]}>
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
            <View style={styles.searchContainer}>
              <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Rechercher (numéro, client, projet)"
              />
            </View>

            {/* Tabs : Tous / Devis / Factures */}
            <View style={styles.tabsContainer}>
              {['tous', 'devis', 'factures'].map((tab) => (
                <Pressable
                  key={tab}
                  onPress={() => {
                    impactAsync();
                    setFilter(tab);
                  }}
                  style={({ pressed }) => [
                    styles.tab,
                    filter === tab && styles.tabActive,
                    pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
                  ]}
                >
                  <Text style={[
                    styles.tabText,
                    filter === tab && styles.tabTextActive,
                  ]}>
                    {tab === 'tous' ? 'Tous' : tab === 'devis' ? 'Devis' : 'Factures'}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Filtres de statut (boutons pill) */}
            <View style={styles.statusFiltersContainer}>
              {statusFilters.map((status) => (
                <Pressable
                  key={status}
                  onPress={() => {
                    impactAsync();
                    setStatusFilter(status);
                  }}
                  style={({ pressed }) => [
                    styles.statusFilterButton,
                    statusFilter === status && styles.statusFilterButtonActive(status),
                    pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] },
                  ]}
                >
                  <Text style={[
                    styles.statusFilterText,
                    statusFilter === status && styles.statusFilterTextActive,
                  ]}>
                    {statusLabels[status]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconContainer, { 
              backgroundColor: '#1C1F24',
              borderRadius: 20,
            }]}>
              <Text style={styles.emptyIcon}>📄</Text>
            </View>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              Aucun document pour l'instant
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.textMuted }]}>
              Crée ton premier devis ou ta première facture en un clic.
            </Text>
          </View>
        }
      />

      {/* Dialog "Devis en édition" */}
      <AFDialog
        visible={!!editDialogDevis}
        title="Devis en édition"
        message="Que souhaitez-vous faire ?"
        onRequestClose={() => setEditDialogDevis(null)}
        actions={[
          {
            label: 'Annuler',
            variant: 'secondary',
            onPress: () => setEditDialogDevis(null),
          },
          {
            label: 'Générer le PDF',
            variant: 'primary',
            onPress: async () => {
              if (!editDialogDevis) return;
              
              const ok = await requireProOrPaywall(navigation, 'Export PDF');
              if (!ok) {
                setEditDialogDevis(null);
                return;
              }
              
              const result = await generateDevisPDFFromDB(editDialogDevis.id);
              if (result.localUri) {
                const isAvailable = await Sharing.isAvailableAsync();
                if (isAvailable) {
                  await Sharing.shareAsync(result.localUri, {
                    mimeType: 'application/pdf',
                    dialogTitle: `Devis ${editDialogDevis.number}`,
                  });
                }
              }
              setEditDialogDevis(null);
            },
          },
          {
            label: 'Modifier les prix',
            variant: 'secondary',
            onPress: () => {
              if (!editDialogDevis) return;
              navigation.navigate('EditDevis', { devisId: editDialogDevis.id });
              setEditDialogDevis(null);
            },
          },
        ]}
      />

      {/* Dialog de partage */}
      <AFDialog
        visible={!!shareDialogDocument}
        title={`Partager ${shareDialogDocument?.type === 'devis' ? 'Devis' : 'Facture'} ${shareDialogDocument?.number || ''}`}
        message="Choisissez le mode de partage"
        onRequestClose={() => {
          setShareDialogDocument(null);
          setShareDialogPdfUri(null);
        }}
        actions={[
          {
            label: 'Annuler',
            variant: 'secondary',
            onPress: () => {
              setShareDialogDocument(null);
              setShareDialogPdfUri(null);
            },
          },
          {
            label: '📧 Email',
            variant: 'primary',
            onPress: async () => {
              if (!shareDialogDocument || !shareDialogPdfUri) return;
              try {
                await shareViaEmail(shareDialogDocument, shareDialogPdfUri, companyName);
                showSuccess('Email ouvert');
              } catch (error) {
                showError(error.message || 'Impossible d\'ouvrir l\'email');
              }
              setShareDialogDocument(null);
              setShareDialogPdfUri(null);
            },
          },
          {
            label: '💬 WhatsApp',
            variant: 'primary',
            onPress: async () => {
              if (!shareDialogDocument || !shareDialogPdfUri) return;
              try {
                await shareViaWhatsApp(shareDialogDocument, shareDialogPdfUri, shareDialogDocument.client_phone);
                showSuccess('WhatsApp ouvert');
              } catch (error) {
                showError(error.message || 'Impossible d\'ouvrir WhatsApp');
              }
              setShareDialogDocument(null);
              setShareDialogPdfUri(null);
            },
          },
          {
            label: '📱 SMS',
            variant: 'primary',
            onPress: async () => {
              if (!shareDialogDocument || !shareDialogPdfUri) return;
              try {
                await shareViaSMS(shareDialogDocument, shareDialogPdfUri, shareDialogDocument.client_phone);
                showSuccess('SMS ouvert');
              } catch (error) {
                showError(error.message || 'Impossible d\'ouvrir le SMS');
              }
              setShareDialogDocument(null);
              setShareDialogPdfUri(null);
            },
          },
          {
            label: '📤 Autre',
            variant: 'secondary',
            onPress: async () => {
              if (!shareDialogDocument || !shareDialogPdfUri) return;
              try {
                await shareGeneric(shareDialogPdfUri, shareDialogDocument);
              } catch (error) {
                showError(error.message || 'Impossible de partager');
              }
              setShareDialogDocument(null);
              setShareDialogPdfUri(null);
            },
          },
        ]}
      />
    </ScreenContainer>
  );
}

const getCardStyles = (theme) => StyleSheet.create({
  card: {
    backgroundColor: '#15171C',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  docType: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  docNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.iconMoney,
  },
  cardBody: {
    marginBottom: 12,
  },
  clientName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  projectTitle: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  actionButton: {
    padding: 6,
  },
});

const getStyles = (theme) => StyleSheet.create({
  flatList: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  settingsButton: {
    padding: 4,
  },
  searchContainer: {
    marginHorizontal: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 8,
    backgroundColor: '#1C1F24',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: '#3E7BFA',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  statusFiltersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  statusFilterButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1F242C',
  },
  statusFilterButtonActive: (status) => {
    const colors = {
      edition: '#3B82F6',
      pret: '#6366F1',
      envoye: '#F97316',
      signe: '#10B981',
    };
    return {
      backgroundColor: colors[status] || '#3E7BFA',
    };
  },
  statusFilterText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  statusFilterTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.8,
  },
});
