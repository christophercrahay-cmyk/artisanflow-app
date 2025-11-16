/**
 * TemplatesScreen - Gestion des templates de devis réutilisables
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
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme2';
import { ScreenContainer, AppCard, PrimaryButton } from '../components/ui';
import { 
  getTemplates, 
  getTemplateWithLignes, 
  createTemplate, 
  updateTemplate, 
  deleteTemplate 
} from '../services/templateService';
import { showSuccess, showError } from '../components/Toast';
import logger from '../utils/logger';

export default function TemplatesScreen({ navigation }) {
  const theme = useThemeColors();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  
  // Formulaire
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [lignes, setLignes] = useState([]);
  
  // Ligne en cours d'édition
  const [editingLigne, setEditingLigne] = useState(null);
  const [ligneDesc, setLigneDesc] = useState('');
  const [ligneQty, setLigneQty] = useState('1');
  const [ligneUnite, setLigneUnite] = useState('unité');
  const [lignePrixUnit, setLignePrixUnit] = useState('');

  const styles = useMemo(() => getStyles(theme), [theme]);

  useFocusEffect(
    useCallback(() => {
      loadTemplates();
    }, [])
  );

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await getTemplates();
      setTemplates(data);
    } catch (error) {
      logger.error('TemplatesScreen', 'Erreur chargement templates', error);
      showError('Impossible de charger les templates');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    resetForm();
    setEditingTemplate(null);
    setShowModal(true);
  };

  const openEditModal = async (templateId) => {
    try {
      const template = await getTemplateWithLignes(templateId);
      setName(template.name);
      setDescription(template.description || '');
      setCategory(template.category || '');
      setLignes(template.lignes || []);
      setEditingTemplate(template);
      setShowModal(true);
    } catch (error) {
      logger.error('TemplatesScreen', 'Erreur chargement template', error);
      showError('Impossible de charger le template');
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setCategory('');
    setLignes([]);
    setEditingLigne(null);
    resetLigneForm();
  };

  const resetLigneForm = () => {
    setLigneDesc('');
    setLigneQty('1');
    setLigneUnite('unité');
    setLignePrixUnit('');
  };

  const addLigne = () => {
    if (!ligneDesc.trim() || !lignePrixUnit.trim()) {
      showError('Description et prix unitaire requis');
      return;
    }

    const quantite = parseFloat(ligneQty) || 1;
    const prixUnitaire = parseFloat(lignePrixUnit) || 0;
    const prixTotal = quantite * prixUnitaire;

    if (editingLigne !== null) {
      // Modifier ligne existante
      const newLignes = [...lignes];
      newLignes[editingLigne] = {
        description: ligneDesc.trim(),
        quantite,
        unite: ligneUnite.trim(),
        prix_unitaire: prixUnitaire,
        prix_total: prixTotal,
      };
      setLignes(newLignes);
      setEditingLigne(null);
    } else {
      // Ajouter nouvelle ligne
      setLignes([
        ...lignes,
        {
          description: ligneDesc.trim(),
          quantite,
          unite: ligneUnite.trim(),
          prix_unitaire: prixUnitaire,
          prix_total: prixTotal,
        },
      ]);
    }

    resetLigneForm();
  };

  const editLigne = (index) => {
    const ligne = lignes[index];
    setLigneDesc(ligne.description);
    setLigneQty(ligne.quantite.toString());
    setLigneUnite(ligne.unite);
    setLignePrixUnit(ligne.prix_unitaire.toString());
    setEditingLigne(index);
  };

  const deleteLigne = (index) => {
    Alert.alert(
      'Supprimer la ligne',
      'Voulez-vous vraiment supprimer cette ligne ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            const newLignes = lignes.filter((_, i) => i !== index);
            setLignes(newLignes);
          },
        },
      ]
    );
  };

  const saveTemplate = async () => {
    if (!name.trim()) {
      showError('Le nom du template est requis');
      return;
    }

    if (lignes.length === 0) {
      showError('Ajoutez au moins une ligne au template');
      return;
    }

    try {
      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, {
          name,
          description,
          category,
          lignes,
        });
        showSuccess('Template mis à jour');
      } else {
        await createTemplate({
          name,
          description,
          category,
          lignes,
        });
        showSuccess('Template créé');
      }

      setShowModal(false);
      resetForm();
      await loadTemplates();
    } catch (error) {
      logger.error('TemplatesScreen', 'Erreur sauvegarde template', error);
      showError(error.message || 'Impossible de sauvegarder le template');
    }
  };

  const handleDelete = (templateId, templateName) => {
    Alert.alert(
      'Supprimer le template',
      `Voulez-vous vraiment supprimer "${templateName}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTemplate(templateId);
              showSuccess('Template supprimé');
              await loadTemplates();
            } catch (error) {
              logger.error('TemplatesScreen', 'Erreur suppression template', error);
              showError('Impossible de supprimer le template');
            }
          },
        },
      ]
    );
  };

  const totalTemplate = useMemo(() => {
    return lignes.reduce((sum, ligne) => sum + (ligne.prix_total || 0), 0);
  }, [lignes]);

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Templates de devis
        </Text>
        <TouchableOpacity
          onPress={openCreateModal}
          style={styles.addButton}
        >
          <Feather name="plus" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Liste des templates */}
      {templates.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
            Aucun template pour l'instant
          </Text>
          <PrimaryButton
            title="Créer un template"
            icon="➕"
            onPress={openCreateModal}
            style={styles.emptyButton}
          />
        </View>
      ) : (
        <FlatList
          data={templates}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <AppCard style={styles.templateCard}>
              <View style={styles.templateHeader}>
                <View style={styles.templateInfo}>
                  <Text style={[styles.templateName, { color: theme.colors.text }]}>
                    {item.name}
                  </Text>
                  {item.category && (
                    <Text style={[styles.templateCategory, { color: theme.colors.textMuted }]}>
                      {item.category}
                    </Text>
                  )}
                  {item.description && (
                    <Text style={[styles.templateDesc, { color: theme.colors.textMuted }]}>
                      {item.description}
                    </Text>
                  )}
                </View>
                <View style={styles.templateActions}>
                  <TouchableOpacity
                    onPress={() => openEditModal(item.id)}
                    style={styles.actionButton}
                  >
                    <Feather name="edit" size={20} color={theme.colors.accent} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(item.id, item.name)}
                    style={styles.actionButton}
                  >
                    <Feather name="trash-2" size={20} color={theme.colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            </AppCard>
          )}
        />
      )}

      {/* Modal création/édition */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => {
          setShowModal(false);
          resetForm();
        }}
      >
        <KeyboardAvoidingView
          style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {editingTemplate ? 'Modifier le template' : 'Nouveau template'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowModal(false);
                resetForm();
              }}
            >
              <Feather name="x" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Informations du template */}
            <AppCard style={styles.formCard}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Informations
              </Text>
              
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.colors.surfaceAlt,
                  color: theme.colors.text,
                  borderRadius: theme.radius.md,
                }]}
                placeholder="Nom du template *"
                placeholderTextColor={theme.colors.textSoft}
                value={name}
                onChangeText={setName}
              />

              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.colors.surfaceAlt,
                  color: theme.colors.text,
                  borderRadius: theme.radius.md,
                }]}
                placeholder="Catégorie (ex: Plomberie, Électricité)"
                placeholderTextColor={theme.colors.textSoft}
                value={category}
                onChangeText={setCategory}
              />

              <TextInput
                style={[styles.input, styles.textArea, { 
                  backgroundColor: theme.colors.surfaceAlt,
                  color: theme.colors.text,
                  borderRadius: theme.radius.md,
                }]}
                placeholder="Description (optionnelle)"
                placeholderTextColor={theme.colors.textSoft}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
            </AppCard>

            {/* Lignes du template */}
            <AppCard style={styles.formCard}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Lignes ({lignes.length})
              </Text>

              {/* Liste des lignes */}
              {lignes.map((ligne, index) => (
                <View key={index} style={[styles.ligneItem, {
                  backgroundColor: theme.colors.surfaceAlt,
                  borderRadius: theme.radius.md,
                }]}>
                  <View style={styles.ligneInfo}>
                    <Text style={[styles.ligneDesc, { color: theme.colors.text }]}>
                      {ligne.description}
                    </Text>
                    <Text style={[styles.ligneDetails, { color: theme.colors.textMuted }]}>
                      {ligne.quantite} {ligne.unite} × {ligne.prix_unitaire.toFixed(2)} € = {ligne.prix_total.toFixed(2)} €
                    </Text>
                  </View>
                  <View style={styles.ligneActions}>
                    <TouchableOpacity
                      onPress={() => editLigne(index)}
                      style={styles.ligneActionButton}
                    >
                      <Feather name="edit" size={16} color={theme.colors.accent} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => deleteLigne(index)}
                      style={styles.ligneActionButton}
                    >
                      <Feather name="trash-2" size={16} color={theme.colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {/* Formulaire d'ajout/modification de ligne */}
              <View style={[styles.ligneForm, {
                backgroundColor: theme.colors.surfaceAlt,
                borderRadius: theme.radius.md,
              }]}>
                <TextInput
                  style={[styles.input, styles.inputSmall, { color: theme.colors.text }]}
                  placeholder="Description *"
                  placeholderTextColor={theme.colors.textSoft}
                  value={ligneDesc}
                  onChangeText={setLigneDesc}
                />
                
                <View style={styles.ligneFormRow}>
                  <TextInput
                    style={[styles.input, styles.inputSmall, { color: theme.colors.text }]}
                    placeholder="Qté"
                    placeholderTextColor={theme.colors.textSoft}
                    keyboardType="numeric"
                    value={ligneQty}
                    onChangeText={setLigneQty}
                  />
                  
                  <TextInput
                    style={[styles.input, styles.inputSmall, { color: theme.colors.text }]}
                    placeholder="Unité"
                    placeholderTextColor={theme.colors.textSoft}
                    value={ligneUnite}
                    onChangeText={setLigneUnite}
                  />
                  
                  <TextInput
                    style={[styles.input, styles.inputSmall, { color: theme.colors.text }]}
                    placeholder="Prix unitaire *"
                    placeholderTextColor={theme.colors.textSoft}
                    keyboardType="numeric"
                    value={lignePrixUnit}
                    onChangeText={setLignePrixUnit}
                  />
                </View>

                <TouchableOpacity
                  onPress={addLigne}
                  style={[styles.addLigneButton, {
                    backgroundColor: editingLigne !== null ? theme.colors.accent : theme.colors.primary,
                    borderRadius: theme.radius.md,
                  }]}
                >
                  <Feather 
                    name={editingLigne !== null ? "check" : "plus"} 
                    size={18} 
                    color="#FFFFFF" 
                  />
                  <Text style={styles.addLigneButtonText}>
                    {editingLigne !== null ? 'Modifier' : 'Ajouter'} la ligne
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Total */}
              {lignes.length > 0 && (
                <View style={[styles.totalContainer, {
                  backgroundColor: theme.colors.primary + '15',
                  borderRadius: theme.radius.md,
                }]}>
                  <Text style={[styles.totalLabel, { color: theme.colors.text }]}>
                    Total HT:
                  </Text>
                  <Text style={[styles.totalAmount, { color: theme.colors.primary }]}>
                    {totalTemplate.toFixed(2)} €
                  </Text>
                </View>
              )}
            </AppCard>
          </ScrollView>

          {/* Bouton sauvegarder */}
          <View style={[styles.modalFooter, {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
          }]}>
            <PrimaryButton
              title={editingTemplate ? 'Enregistrer' : 'Créer le template'}
              icon="💾"
              onPress={saveTemplate}
              disabled={!name.trim() || lignes.length === 0}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScreenContainer>
  );
}

const getStyles = (theme) => StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.h1,
    fontWeight: theme.fontWeights.bold,
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  addButton: {
    padding: theme.spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.typography.body,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: theme.spacing.md,
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  templateCard: {
    marginBottom: theme.spacing.md,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: theme.typography.h3,
    fontWeight: theme.fontWeights.bold,
    marginBottom: theme.spacing.xs,
  },
  templateCategory: {
    fontSize: theme.typography.caption,
    fontWeight: theme.fontWeights.medium,
    marginBottom: theme.spacing.xs,
  },
  templateDesc: {
    fontSize: theme.typography.small,
  },
  templateActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    padding: theme.spacing.sm,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2E35',
  },
  modalTitle: {
    fontSize: theme.typography.h2,
    fontWeight: theme.fontWeights.bold,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  modalFooter: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
  },
  formCard: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.h3,
    fontWeight: theme.fontWeights.bold,
    marginBottom: theme.spacing.md,
  },
  input: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.body,
    marginBottom: theme.spacing.md,
  },
  inputSmall: {
    flex: 1,
    marginBottom: theme.spacing.sm,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  ligneForm: {
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  ligneFormRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  addLigneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  addLigneButtonText: {
    color: '#FFFFFF',
    fontSize: theme.typography.body,
    fontWeight: theme.fontWeights.semibold,
  },
  ligneItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  ligneInfo: {
    flex: 1,
  },
  ligneDesc: {
    fontSize: theme.typography.body,
    fontWeight: theme.fontWeights.semibold,
    marginBottom: theme.spacing.xs,
  },
  ligneDetails: {
    fontSize: theme.typography.small,
  },
  ligneActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  ligneActionButton: {
    padding: theme.spacing.xs,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  totalLabel: {
    fontSize: theme.typography.body,
    fontWeight: theme.fontWeights.semibold,
  },
  totalAmount: {
    fontSize: theme.typography.h2,
    fontWeight: theme.fontWeights.bold,
  },
});

