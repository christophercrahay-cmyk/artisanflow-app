import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useSafeTheme } from '../theme/useSafeTheme';
import { supabase } from '../supabaseClient';
import { showSuccess, showError } from '../components/Toast';
import { AFInput } from '../components/ui';
import { PendingCapture } from '../types/capture';
import { Client } from '../types';
import { useAttachCaptureToProject } from '../hooks/useAttachCaptureToProject';
import logger from '../utils/logger';
import { requireProOrPaywall } from '../utils/proAccess';
import ClientPicker from '../components/clients/ClientPicker';
import ClientSelectorField from '../components/clients/ClientSelectorField';
import { useRequireOnline } from '../utils/requireOnline';

interface ProjectCreateRouteParams {
  initialCapture?: PendingCapture;
  clientId?: string;
}

interface ProjectCreateScreenProps {
  route: { params?: ProjectCreateRouteParams };
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
    replace: (screen: string, params?: any) => void;
  };
}

/**
 * Écran de création de chantier avec support pour attacher une capture initiale
 */
export default function ProjectCreateScreen({ route, navigation }: ProjectCreateScreenProps) {
  const insets = useSafeAreaInsets();
  const theme = useSafeTheme();
  const { initialCapture, clientId: initialClientId } = route.params || {};
  const { attachCapture } = useAttachCaptureToProject();
  const { checkAndShowMessage } = useRequireOnline('Création de chantier');

  const [projectName, setProjectName] = useState('');
  const [projectAddress, setProjectAddress] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(initialClientId || null);
  const [clients, setClients] = useState<Client[]>([]);
  const [creating, setCreating] = useState(false);
  const [loadingClients, setLoadingClients] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientPicker, setShowClientPicker] = useState(false);

  const styles = getStyles(theme, insets);

  useEffect(() => {
    // ✅ S'assurer que le formulaire démarre vide (pas de projet en cache)
    logger.info('ProjectCreate', 'Écran monté - formulaire vide');
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoadingClients(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (error) {
        logger.error('ProjectCreate', 'Erreur chargement clients', error);
        showError('Impossible de charger les clients');
        return;
      }

      const clientsList = data || [];
      setClients(clientsList);

      // Si aucun client n'existe, afficher un message et empêcher la création
      if (clientsList.length === 0) {
        logger.warn('ProjectCreate', 'Aucun client trouvé');
        // Ne pas bloquer l'UI, mais afficher un message dans le formulaire
      } else if (initialClientId) {
        // Si un clientId initial est fourni (depuis la fiche client), pré-sélectionner ce client
        const clientExists = clientsList.find(c => c.id === initialClientId);
        if (clientExists) {
          setSelectedClientId(initialClientId);
          setSelectedClient(clientExists);
          // Pré-remplir le nom et l'adresse
          setProjectName(`Chantier - ${clientExists.name}`);
          if (clientExists.address) {
            setProjectAddress(clientExists.address);
          }
        }
      }
    } catch (err) {
      logger.error('ProjectCreate', 'Exception chargement clients', err);
    } finally {
      setLoadingClients(false);
    }
  };

  const handleCreateProject = async () => {
    // Vérifier la connexion
    if (!checkAndShowMessage()) {
      return;
    }

    // Vérifier l'accès Pro
    const ok = await requireProOrPaywall(navigation, 'Création projet');
    if (!ok) return;

    if (clients.length === 0) {
      showError('Créez d\'abord un client avant de créer un chantier');
      return;
    }

    if (!projectName.trim()) {
      showError('Le nom du chantier est obligatoire');
      return;
    }

    if (!selectedClientId) {
      showError('Sélectionnez un client');
      return;
    }

    try {
      setCreating(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utilisateur non authentifié');
      }

      // Créer le projet
      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert([
          {
            name: projectName.trim(),
            address: projectAddress.trim() || null,
            client_id: selectedClientId,
            user_id: user.id,
            status: 'active',
            status_text: 'active',
            archived: false,
          },
        ])
        .select()
        .single();

      if (projectError) {
        logger.error('ProjectCreate', 'Erreur création projet', projectError);
        throw projectError;
      }

      logger.success('ProjectCreate', 'Projet créé', { projectId: newProject.id });

      // Si une capture initiale est fournie, l'attacher au nouveau projet
      if (initialCapture && newProject && selectedClientId) {
        try {
          await attachCapture(initialCapture, newProject.id, selectedClientId, newProject.name);
          logger.success('ProjectCreate', 'Capture attachée au nouveau projet');
        } catch (attachErr: any) {
          logger.error('ProjectCreate', 'Erreur attachement capture', attachErr);
          // Ne pas bloquer la création si l'attachement échoue
          showError('Projet créé mais erreur lors de l\'attachement de la capture');
        }
      }

      showSuccess(`Chantier "${projectName}" créé avec succès`);

      // ✅ Nettoyer le formulaire
      setProjectName('');
      setProjectAddress('');
      
      // Navigation : remplacer l'écran actuel par le détail du nouveau projet (vide, 0 photo, 0 note)
      if (newProject) {
        navigation.replace('ProjectDetail', { projectId: newProject.id });
      } else {
        navigation.goBack();
      }
    } catch (err: any) {
      logger.error('ProjectCreate', 'Exception création projet', err);
      showError(err?.message || 'Impossible de créer le chantier');
    } finally {
      setCreating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Feather name="arrow-left" size={24} color={theme.colors.text} strokeWidth={2.5} />
            </TouchableOpacity>
            <Text style={styles.title}>Nouveau chantier</Text>
            {initialCapture && (
              <View style={styles.captureBadge}>
                <Feather
                  name={initialCapture.type === 'photo' ? 'camera' : initialCapture.type === 'audio' ? 'mic' : 'edit-3'}
                  size={16}
                  color={theme.colors.accent}
                />
                <Text style={styles.captureBadgeText}>
                  {initialCapture.type === 'photo' ? 'Photo' : initialCapture.type === 'audio' ? 'Vocal' : 'Note'} à attacher
                </Text>
              </View>
            )}
          </View>

          <View style={styles.form}>
            {/* Sélection client */}
            <View style={styles.field}>
              {loadingClients ? (
                <ActivityIndicator size="small" color={theme.colors.accent} />
              ) : clients.length === 0 ? (
                <View style={styles.noClientsContainer}>
                  <Feather name="alert-circle" size={20} color={theme.colors.error || '#EF4444'} />
                  <Text style={styles.noClientsText}>
                    Aucun client disponible. Créez d'abord un client avant de créer un chantier.
                  </Text>
                  <TouchableOpacity
                    style={styles.createClientButton}
                    onPress={() => {
                      navigation.navigate('ClientsList');
                    }}
                    activeOpacity={0.7}
                  >
                    <Feather name="user-plus" size={16} color={theme.colors.text} />
                    <Text style={styles.createClientButtonText}>Créer un client</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <ClientSelectorField
                  label="Client"
                  selectedClient={selectedClient}
                  onPress={() => setShowClientPicker(true)}
                  required
                />
              )}
            </View>

            {/* Nom du projet */}
            <View style={styles.field}>
              <Text style={styles.label}>Nom du chantier *</Text>
              <AFInput
                icon="briefcase"
                placeholder="Ex: Rénovation cuisine"
                value={projectName}
                onChangeText={setProjectName}
                autoCapitalize="words"
                editable={!creating}
              />
            </View>

            {/* Adresse */}
            <View style={styles.field}>
              <Text style={styles.label}>Adresse</Text>
              <AFInput
                icon="map-pin"
                placeholder="Adresse du chantier (optionnel)"
                value={projectAddress}
                onChangeText={setProjectAddress}
                multiline
                numberOfLines={2}
                editable={!creating}
              />
            </View>

            {/* Bouton créer */}
            <TouchableOpacity
              onPress={handleCreateProject}
              disabled={creating || !projectName.trim() || !selectedClientId || clients.length === 0}
              style={[
                styles.createButton,
                (creating || !projectName.trim() || !selectedClientId || clients.length === 0) && styles.createButtonDisabled,
              ]}
              activeOpacity={0.8}
            >
              {creating ? (
                <ActivityIndicator color={theme.colors.text} />
              ) : (
                <>
                  <Feather name="check" size={20} color={theme.colors.text} strokeWidth={2.5} />
                  <Text style={styles.createButtonText}>Créer le chantier</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Client Picker Modal */}
      <ClientPicker
        visible={showClientPicker}
        clients={clients}
        selectedClientId={selectedClientId}
        onSelectClient={(client) => {
          setSelectedClientId(client.id);
          setSelectedClient(client);
          // Pré-remplir le nom et l'adresse quand on change de client
          setProjectName(`Chantier - ${client.name}`);
          if (client.address) {
            setProjectAddress(client.address);
          } else {
            setProjectAddress('');
          }
        }}
        onClose={() => setShowClientPicker(false)}
        onCreateNew={() => {
          navigation.navigate('ClientsList');
        }}
      />
    </SafeAreaView>
  );
}

const getStyles = (theme: any, insets: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: insets.bottom + theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  backButton: {
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.h1,
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  captureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.accent + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    alignSelf: 'flex-start',
    marginTop: theme.spacing.sm,
  },
  captureBadgeText: {
    ...theme.typography.bodySmall,
    color: theme.colors.accent,
    fontWeight: '600',
  },
  form: {
    gap: theme.spacing.lg,
  },
  field: {
    marginBottom: theme.spacing.md,
  },
  label: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
  },
  clientScroll: {
    marginTop: theme.spacing.xs,
  },
  clientChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.sm,
  },
  clientChipSelected: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  clientChipText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  clientChipTextSelected: {
    color: theme.colors.text,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.accent,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.lg,
    ...theme.shadows.md,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.text,
    fontSize: 16,
  },
  noClientsContainer: {
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  noClientsText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  createClientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.xs,
  },
  createClientButtonText: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text,
    fontSize: 14,
  },
});

