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
import { PendingCapture } from '../types/capture';
import { Client } from '../types';
import { useAttachCaptureToProject } from '../hooks/useAttachCaptureToProject';
import logger from '../utils/logger';

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

  const [projectName, setProjectName] = useState('');
  const [projectAddress, setProjectAddress] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(initialClientId || null);
  const [clients, setClients] = useState<Client[]>([]);
  const [creating, setCreating] = useState(false);
  const [loadingClients, setLoadingClients] = useState(true);

  const styles = getStyles(theme, insets);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoadingClients(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        logger.error('ProjectCreate', 'Erreur chargement clients', error);
        showError('Impossible de charger les clients');
        return;
      }

      setClients(data || []);
    } catch (err) {
      logger.error('ProjectCreate', 'Exception chargement clients', err);
    } finally {
      setLoadingClients(false);
    }
  };

  const handleCreateProject = async () => {
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

      // Navigation : retourner au détail du nouveau projet
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
              <Text style={styles.label}>Client *</Text>
              {loadingClients ? (
                <ActivityIndicator size="small" color={theme.colors.accent} />
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.clientScroll}>
                  {clients.map((client) => (
                    <TouchableOpacity
                      key={client.id}
                      onPress={() => setSelectedClientId(client.id)}
                      style={[
                        styles.clientChip,
                        selectedClientId === client.id && styles.clientChipSelected,
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.clientChipText,
                          selectedClientId === client.id && styles.clientChipTextSelected,
                        ]}
                      >
                        {client.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Nom du projet */}
            <View style={styles.field}>
              <Text style={styles.label}>Nom du chantier *</Text>
              <TextInput
                placeholder="Ex: Rénovation cuisine"
                placeholderTextColor={theme.colors.textMuted}
                value={projectName}
                onChangeText={setProjectName}
                style={styles.input}
                autoCapitalize="words"
                editable={!creating}
              />
            </View>

            {/* Adresse */}
            <View style={styles.field}>
              <Text style={styles.label}>Adresse</Text>
              <TextInput
                placeholder="Adresse du chantier (optionnel)"
                placeholderTextColor={theme.colors.textMuted}
                value={projectAddress}
                onChangeText={setProjectAddress}
                style={styles.input}
                multiline
                numberOfLines={2}
                editable={!creating}
              />
            </View>

            {/* Bouton créer */}
            <TouchableOpacity
              onPress={handleCreateProject}
              disabled={creating || !projectName.trim() || !selectedClientId}
              style={[
                styles.createButton,
                (creating || !projectName.trim() || !selectedClientId) && styles.createButtonDisabled,
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
});

