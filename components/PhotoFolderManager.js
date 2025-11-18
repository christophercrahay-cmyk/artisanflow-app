/**
 * PhotoFolderManager - Gestion des dossiers de photos de chantier
 * Permet de créer, modifier, supprimer et organiser les dossiers
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Alert,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme2';
import { supabase } from '../supabaseClient';
import { showSuccess, showError } from './Toast';
import logger from '../utils/logger';

export default function PhotoFolderManager({ projectId, onFolderSelect, selectedFolderId }) {
  const theme = useThemeColors();
  const [folders, setFolders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [folderName, setFolderName] = useState('');
  const [folderDescription, setFolderDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const styles = getStyles(theme);

  // Charger les dossiers
  const loadFolders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('project_photo_folders')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) {
        logger.error('PhotoFolderManager', 'Erreur chargement dossiers', error);
        return;
      }

      // Ajouter un dossier "Toutes les photos" en premier
      const allPhotosFolder = {
        id: null,
        name: 'Toutes les photos',
        description: 'Afficher toutes les photos',
        color: null,
      };

      setFolders([allPhotosFolder, ...(data || [])]);
    } catch (err) {
      logger.error('PhotoFolderManager', 'Exception chargement dossiers', err);
    }
  };

  useEffect(() => {
    if (projectId) {
      loadFolders();
    }
  }, [projectId]);

  // Créer un dossier
  const createFolder = async () => {
    if (!folderName.trim()) {
      showError('Le nom du dossier est requis');
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showError('Utilisateur non authentifié');
        return;
      }

      const { error } = await supabase
        .from('project_photo_folders')
        .insert({
          project_id: projectId,
          user_id: user.id,
          name: folderName.trim(),
          description: folderDescription.trim() || null,
        });

      if (error) {
        if (error.code === '23505') {
          showError('Un dossier avec ce nom existe déjà');
        } else {
          throw error;
        }
        return;
      }

      showSuccess('Dossier créé');
      setFolderName('');
      setFolderDescription('');
      setShowCreateModal(false);
      await loadFolders();
    } catch (err) {
      logger.error('PhotoFolderManager', 'Erreur création dossier', err);
      showError('Impossible de créer le dossier');
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un dossier
  const deleteFolder = async (folderId) => {
    Alert.alert(
      'Supprimer le dossier ?',
      'Les photos dans ce dossier seront déplacées vers "Toutes les photos".',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              // Déplacer les photos vers null (pas de dossier)
              const { error: updateError } = await supabase
                .from('project_photos')
                .update({ folder_id: null })
                .eq('folder_id', folderId);

              if (updateError) {
                logger.warn('PhotoFolderManager', 'Erreur déplacement photos', updateError);
              }

              // Supprimer le dossier
              const { error } = await supabase
                .from('project_photo_folders')
                .delete()
                .eq('id', folderId);

              if (error) throw error;

              showSuccess('Dossier supprimé');
              await loadFolders();
              
              // Si le dossier supprimé était sélectionné, revenir à "Toutes les photos"
              if (selectedFolderId === folderId && onFolderSelect) {
                onFolderSelect(null);
              }
            } catch (err) {
              logger.error('PhotoFolderManager', 'Erreur suppression dossier', err);
              showError('Impossible de supprimer le dossier');
            }
          },
        },
      ]
    );
  };

  return (
    <>
      {/* Sélecteur de dossier */}
      <View style={styles.container}>
        <FlatList
          horizontal
          data={folders}
          keyExtractor={(item) => item.id || 'all'}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.folderList}
          renderItem={({ item }) => {
            const isSelected = selectedFolderId === item.id;
            return (
              <TouchableOpacity
                style={[
                  styles.folderButton,
                  isSelected && styles.folderButtonSelected,
                  { backgroundColor: isSelected ? theme.colors.primary : theme.colors.surfaceAlt },
                ]}
                onPress={() => onFolderSelect && onFolderSelect(item.id)}
                activeOpacity={0.7}
              >
                <Feather
                  name="folder"
                  size={16}
                  color={isSelected ? theme.colors.primaryText : theme.colors.textMuted}
                />
                <Text
                  style={[
                    styles.folderButtonText,
                    { color: isSelected ? theme.colors.primaryText : theme.colors.text },
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
        <TouchableOpacity
          style={styles.addFolderButton}
          onPress={() => setShowCreateModal(true)}
          activeOpacity={0.7}
        >
          <Feather name="folder-plus" size={18} color={theme.colors.accent} />
        </TouchableOpacity>
      </View>

      {/* Modal création dossier */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Nouveau dossier
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCreateModal(false);
                  setFolderName('');
                  setFolderDescription('');
                }}
                style={styles.modalCloseButton}
              >
                <Feather name="x" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { color: theme.colors.text }]}>Nom du dossier *</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surfaceAlt,
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                },
              ]}
              value={folderName}
              onChangeText={setFolderName}
              placeholder="Ex: Avant travaux"
              placeholderTextColor={theme.colors.textMuted}
              autoFocus
            />

            <Text style={[styles.label, { color: theme.colors.text }]}>Description (optionnel)</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: theme.colors.surfaceAlt,
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                },
              ]}
              value={folderDescription}
              onChangeText={setFolderDescription}
              placeholder="Description du dossier"
              placeholderTextColor={theme.colors.textMuted}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: theme.colors.primary }]}
              onPress={createFolder}
              disabled={loading || !folderName.trim()}
            >
              <Text style={[styles.createButtonText, { color: theme.colors.primaryText }]}>
                {loading ? 'Création...' : 'Créer'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  folderList: {
    gap: theme.spacing.sm,
    paddingRight: theme.spacing.sm,
  },
  folderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  folderButtonSelected: {
    borderColor: theme.colors.primary,
  },
  folderButtonText: {
    fontSize: theme.typography.small,
    fontWeight: '600',
  },
  addFolderButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: theme.typography.h2,
    fontWeight: '700',
  },
  modalCloseButton: {
    padding: theme.spacing.xs,
  },
  label: {
    fontSize: theme.typography.body,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  input: {
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.body,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  createButton: {
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  createButtonText: {
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
});









