/**
 * EditDevisScreen - Édition des lignes de devis avec calcul automatique
 * Permet de modifier les prix, quantités, TVA et recalcule automatiquement les totaux
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '../theme/theme2';
import { supabase } from '../supabaseClient';
import { showSuccess, showError } from '../components/Toast';
import { getErrorMessage } from '../utils/errorMessages';
import logger from '../utils/logger';
import { ScreenContainer, AFInput } from '../components/ui';
import AFModal from '../components/ui/AFModal';
import { generateSignatureLink, getDevisSignatureInfo } from '../services/devis/signatureService';
import { finalizeDevis, unfinalizeDevis } from '../services/devis/devisService';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import { generateDevisPDFFromDB } from '../utils/utils/pdf';

export default function EditDevisScreen({ route, navigation }) {
  const { devisId } = route.params;
  const theme = useThemeColors();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [devis, setDevis] = useState(null);
  const [lignes, setLignes] = useState([]);
  const [tvaPercent, setTvaPercent] = useState(20);
  const [editingLigneId, setEditingLigneId] = useState(null);
  const [signatureInfo, setSignatureInfo] = useState(null);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  // États pour les modales
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [showUnfinalizeModal, setShowUnfinalizeModal] = useState(false);
  const [showDeleteLigneModal, setShowDeleteLigneModal] = useState(false);
  const [ligneToDelete, setLigneToDelete] = useState(null);

  const styles = useMemo(() => getStyles(theme), [theme]);

  // Charger le devis et ses lignes
  const loadDevis = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utilisateur non authentifié');
      }

      // Charger le devis
      const { data: devisData, error: devisError } = await supabase
        .from('devis')
        .select('*')
        .eq('id', devisId)
        .eq('user_id', user.id)
        .single();

      if (devisError) throw devisError;
      if (!devisData) throw new Error('Devis non trouvé');

      setDevis(devisData);
      setTvaPercent(devisData.tva_percent || 20);

      // Charger les lignes
      const { data: lignesData, error: lignesError } = await supabase
        .from('devis_lignes')
        .select('*')
        .eq('devis_id', devisId)
        .order('ordre', { ascending: true });

      if (lignesError) throw lignesError;
      setLignes(lignesData || []);

      // Charger les informations de signature
      if (devisData.signature_status === 'signed') {
        const sigInfo = await getDevisSignatureInfo(devisId);
        if (sigInfo.signature) {
          setSignatureInfo(sigInfo.signature);
        }
      }

    } catch (error) {
      logger.error('EditDevisScreen', 'Erreur chargement devis', error);
      showError(getErrorMessage(error, 'load'));
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [devisId, navigation]);

  useEffect(() => {
    loadDevis();
  }, [loadDevis]);

  // Calculer les totaux
  const calculateTotals = useCallback(() => {
    const totalHT = lignes.reduce((sum, ligne) => {
      const qty = parseFloat(ligne.quantite) || 0;
      const prix = parseFloat(ligne.prix_unitaire) || 0;
      return sum + (qty * prix);
    }, 0);

    const tva = parseFloat(tvaPercent) || 0;
    const tvaMontant = totalHT * (tva / 100);
    const totalTTC = totalHT + tvaMontant;

    return { totalHT, tvaMontant, totalTTC };
  }, [lignes, tvaPercent]);

  // Mettre à jour une ligne
  const updateLigne = (ligneId, field, value) => {
    setLignes(prevLignes => {
      return prevLignes.map(ligne => {
        if (ligne.id === ligneId) {
          const updated = { ...ligne, [field]: value };
          
          // Recalculer le prix_total si quantité ou prix_unitaire change
          if (field === 'quantite' || field === 'prix_unitaire') {
            const qty = parseFloat(updated.quantite) || 0;
            const prix = parseFloat(updated.prix_unitaire) || 0;
            updated.prix_total = qty * prix;
          }
          
          return updated;
        }
        return ligne;
      });
    });
  };

  // Sauvegarder les modifications
  const saveChanges = async () => {
    try {
      setSaving(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utilisateur non authentifié');
      }

      const { totalHT, tvaMontant, totalTTC } = calculateTotals();

      // Mettre à jour le devis (totaux et TVA)
      const { error: devisError } = await supabase
        .from('devis')
        .update({
          montant_ht: totalHT,
          tva_percent: parseFloat(tvaPercent) || 0,
          montant_ttc: totalTTC,
        })
        .eq('id', devisId);

      if (devisError) throw devisError;

      // Mettre à jour ou créer les lignes
      for (const ligne of lignes) {
        // Si c'est une ligne temporaire, l'insérer
        if (ligne.id.startsWith('temp-')) {
          const { error: insertError } = await supabase
            .from('devis_lignes')
            .insert({
              devis_id: devisId,
              description: ligne.description,
              quantite: parseFloat(ligne.quantite) || 0,
              unite: ligne.unite || 'unité',
              prix_unitaire: parseFloat(ligne.prix_unitaire) || 0,
              prix_total: parseFloat(ligne.prix_total) || 0,
              ordre: ligne.ordre || 0,
            });

          if (insertError) {
            logger.error('EditDevisScreen', 'Erreur insertion ligne', insertError);
          }
        } else {
          // Sinon, mettre à jour la ligne existante
          const { error: ligneError } = await supabase
            .from('devis_lignes')
            .update({
              description: ligne.description,
              quantite: parseFloat(ligne.quantite) || 0,
              unite: ligne.unite || 'unité',
              prix_unitaire: parseFloat(ligne.prix_unitaire) || 0,
              prix_total: parseFloat(ligne.prix_total) || 0,
              ordre: ligne.ordre || 0,
            })
            .eq('id', ligne.id);

          if (ligneError) {
            logger.error('EditDevisScreen', 'Erreur mise à jour ligne', ligneError);
          }
        }
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showSuccess('Devis modifié avec succès');
      navigation.goBack();
    } catch (error) {
      logger.error('EditDevisScreen', 'Erreur sauvegarde', error);
      showError(getErrorMessage(error, 'save'));
    } finally {
      setSaving(false);
    }
  };

  // Ajouter une nouvelle ligne
  const addLigne = () => {
    const newLigne = {
      id: `temp-${Date.now()}`,
      devis_id: devisId,
      description: '',
      quantite: 1,
      unite: 'unité',
      prix_unitaire: 0,
      prix_total: 0,
      ordre: lignes.length,
    };
    setLignes([...lignes, newLigne]);
    setEditingLigneId(newLigne.id);
  };

  // Supprimer une ligne
  // Gérer la génération du lien de signature
  const handleGenerateSignatureLink = async () => {
    try {
      setGeneratingLink(true);
      const link = await generateSignatureLink(devisId);
      
      // Extraire le token du lien pour le test direct
      const linkParts = link.split('/sign/');
      const token = linkParts.length > 1 ? linkParts[1].split('/')[1] : null;
      
      Alert.alert(
        'Lien de signature généré',
        'Que souhaitez-vous faire ?',
        [
          {
            text: 'Tester maintenant',
            onPress: () => {
              if (token) {
                navigation.navigate('SignDevis', { devisId, token });
              } else {
                showError('Impossible d\'extraire le token du lien');
              }
            },
          },
          {
            text: 'Copier le lien',
            onPress: async () => {
              try {
                await Clipboard.setStringAsync(link);
                showSuccess('Lien copié dans le presse-papiers !');
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              } catch (error) {
                console.error('Erreur copie presse-papiers:', error);
                // Fallback : afficher le lien si la copie échoue
                Alert.alert('Lien de signature', link, [
                  { text: 'OK' },
                ]);
                showError('Impossible de copier automatiquement. Lien affiché ci-dessus.');
              }
            },
          },
          {
            text: 'Partager',
            onPress: async () => {
              if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(link);
              } else {
                Alert.alert('Lien de signature', link, [
                  { text: 'OK' },
                ]);
                showSuccess('Lien affiché (partage non disponible)');
              }
            },
          },
          { text: 'Annuler', style: 'cancel' },
        ]
      );
    } catch (error) {
      logger.error('EditDevisScreen', 'Erreur génération lien signature', error);
      showError('Impossible de générer le lien de signature');
    } finally {
      setGeneratingLink(false);
    }
  };

  // Finaliser le devis (edition → pret)
  const handleFinalizeDevis = async () => {
    try {
      setFinalizing(true);
      
      // Vérifier qu'il y a au moins une ligne
      if (!lignes || lignes.length === 0) {
        showError('Vous devez ajouter au moins une ligne avant de finaliser le devis.');
        return;
      }

      // Afficher la modal de confirmation
      setShowFinalizeModal(true);
    } catch (error) {
      logger.error('EditDevisScreen', 'Erreur finalisation devis', error);
      showError('Erreur lors de la finalisation');
    } finally {
      setFinalizing(false);
    }
  };

  // Annuler la finalisation (pret → edition)
  const handleUnfinalizeDevis = async () => {
    setShowUnfinalizeModal(true);
  };

  const confirmUnfinalize = async () => {
    try {
      setShowUnfinalizeModal(false);
      const result = await unfinalizeDevis(devisId);
      
      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showSuccess('Devis remis en édition');
        await loadDevis();
      } else {
        showError(result.error || 'Impossible de revenir en édition');
      }
    } catch (error) {
      logger.error('EditDevisScreen', 'Erreur annulation finalisation', error);
      showError('Erreur lors de l\'annulation');
    }
  };

  const confirmFinalize = async () => {
    try {
      setShowFinalizeModal(false);
      setFinalizing(true);
      const result = await finalizeDevis(devisId);
      
      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showSuccess('Devis finalisé avec succès');
        await loadDevis();
      } else {
        showError(result.error || 'Impossible de finaliser le devis');
      }
    } catch (error) {
      logger.error('EditDevisScreen', 'Erreur finalisation devis', error);
      showError('Erreur lors de la finalisation');
    } finally {
      setFinalizing(false);
    }
  };

  // Voir le PDF signé
  const handleViewSignedPDF = async () => {
    try {
      const result = await generateDevisPDFFromDB(devisId);
      if (result.localUri) {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(result.localUri);
        } else {
          showError('Impossible d\'ouvrir le PDF');
        }
      }
    } catch (error) {
      logger.error('EditDevisScreen', 'Erreur génération PDF signé', error);
      showError('Impossible de générer le PDF signé');
    }
  };

  const deleteLigne = (ligneId) => {
    setLigneToDelete(ligneId);
    setShowDeleteLigneModal(true);
  };

  const confirmDeleteLigne = async () => {
    const ligneId = ligneToDelete;
    setShowDeleteLigneModal(false);
    setLigneToDelete(null);

    // Si c'est une ligne temporaire, juste la retirer de la liste
    if (ligneId.startsWith('temp-')) {
      setLignes(lignes.filter(l => l.id !== ligneId));
      return;
    }

    // Sinon, supprimer de la base
    try {
      const { error } = await supabase
        .from('devis_lignes')
        .delete()
        .eq('id', ligneId);

      if (error) throw error;
      setLignes(lignes.filter(l => l.id !== ligneId));
      showSuccess('Ligne supprimée');
    } catch (error) {
      showError(getErrorMessage(error, 'delete'));
    }
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>
            Chargement du devis...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  const { totalHT, tvaMontant, totalTTC } = calculateTotals();

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Modifier le devis
          </Text>
          <TouchableOpacity
            onPress={saveChanges}
            disabled={saving}
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Enregistrer</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Section Statut et Workflow */}
          <View style={[styles.section, { backgroundColor: theme.colors.surfaceAlt }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Statut du devis
            </Text>
            
            {/* Badge de statut */}
            <View style={styles.signatureStatusContainer}>
              {devis?.statut === 'edition' && (
                <View style={[styles.statusBadge, { backgroundColor: theme.colors.info + '20' }]}>
                  <Feather name="edit-3" size={16} color={theme.colors.info} />
                  <Text style={[styles.statusText, { color: theme.colors.info }]}>
                    En édition
                  </Text>
                </View>
              )}
              {devis?.statut === 'pret' && (
                <View style={[styles.statusBadge, { backgroundColor: theme.colors.warning + '20' }]}>
                  <Feather name="check" size={16} color={theme.colors.warning} />
                  <Text style={[styles.statusText, { color: theme.colors.warning }]}>
                    Prêt à envoyer
                  </Text>
                </View>
              )}
              {devis?.statut === 'envoye' && (
                <View style={[styles.statusBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Feather name="send" size={16} color={theme.colors.primary} />
                  <Text style={[styles.statusText, { color: theme.colors.primary }]}>
                    Envoyé - En attente de signature
                  </Text>
                </View>
              )}
              {devis?.statut === 'signe' && (
                <View style={[styles.statusBadge, { backgroundColor: theme.colors.success + '20' }]}>
                  <Feather name="check-circle" size={16} color={theme.colors.success} />
                  <Text style={[styles.statusText, { color: theme.colors.success }]}>
                    Signé le {devis.signed_at ? new Date(devis.signed_at).toLocaleDateString('fr-FR') : ''}
                  </Text>
                </View>
              )}
            </View>

            {/* Informations de signature si signé */}
            {devis?.statut === 'signe' && devis.signed_by_name && (
              <View style={styles.signatureDetails}>
                <Text style={[styles.signatureDetailText, { color: theme.colors.textMuted }]}>
                  Signé par : <Text style={{ fontWeight: '600' }}>{devis.signed_by_name}</Text>
                </Text>
                {devis.signed_by_email && (
                  <Text style={[styles.signatureDetailText, { color: theme.colors.textMuted }]}>
                    Email : {devis.signed_by_email}
                  </Text>
                )}
              </View>
            )}

            {/* Boutons d'action selon le statut */}
            <View style={styles.signatureActions}>
              {/* STATUT: EDITION → Bouton "Finaliser" */}
              {devis?.statut === 'edition' && (
                <TouchableOpacity
                  style={[styles.signatureButton, { backgroundColor: theme.colors.success }]}
                  onPress={handleFinalizeDevis}
                  disabled={finalizing || lignes.length === 0}
                >
                  {finalizing ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Feather name="check" size={18} color="#FFFFFF" />
                      <Text style={styles.signatureButtonText}>
                        Finaliser le devis
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {/* STATUT: PRET → Boutons "Générer lien" + "Revenir en édition" */}
              {devis?.statut === 'pret' && (
                <>
                  <TouchableOpacity
                    style={[styles.signatureButton, { backgroundColor: theme.colors.primary }]}
                    onPress={handleGenerateSignatureLink}
                    disabled={generatingLink}
                  >
                    {generatingLink ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Feather name="send" size={18} color="#FFFFFF" />
                        <Text style={styles.signatureButtonText}>
                          Générer le lien de signature
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.signatureButtonSecondary, { 
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.surface,
                    }]}
                    onPress={handleUnfinalizeDevis}
                  >
                    <Feather name="edit-3" size={18} color={theme.colors.textMuted} />
                    <Text style={[styles.signatureButtonSecondaryText, { color: theme.colors.textMuted }]}>
                      Revenir en édition
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {/* STATUT: ENVOYE → Bouton "Renvoyer le lien" */}
              {devis?.statut === 'envoye' && (
                <TouchableOpacity
                  style={[styles.signatureButton, { backgroundColor: theme.colors.primary }]}
                  onPress={handleGenerateSignatureLink}
                  disabled={generatingLink}
                >
                  {generatingLink ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Feather name="refresh-cw" size={18} color="#FFFFFF" />
                      <Text style={styles.signatureButtonText}>
                        Renvoyer le lien
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
              
              {/* STATUT: SIGNE → Bouton "Voir le PDF signé" */}
              {devis?.statut === 'signe' && (
                <TouchableOpacity
                  style={[styles.signatureButton, { backgroundColor: theme.colors.success }]}
                  onPress={handleViewSignedPDF}
                >
                  <Feather name="file-text" size={18} color="#FFFFFF" />
                  <Text style={styles.signatureButtonText}>
                    Voir le PDF signé
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Message d'aide selon le statut */}
            {devis?.statut === 'edition' && (
              <Text style={[styles.helpText, { color: theme.colors.textMuted }]}>
                💡 Finalisez le devis pour pouvoir l'envoyer au client
              </Text>
            )}
            {devis?.statut === 'pret' && (
              <Text style={[styles.helpText, { color: theme.colors.textMuted }]}>
                💡 Générez le lien de signature et envoyez-le à votre client
              </Text>
            )}
            {devis?.statut === 'envoye' && (
              <Text style={[styles.helpText, { color: theme.colors.textMuted }]}>
                ⏳ En attente de la signature du client
              </Text>
            )}
          </View>

          {/* TVA */}
          <View style={[styles.section, { backgroundColor: theme.colors.surfaceAlt }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              TVA (%)
            </Text>
            <AFInput
              icon="percent"
              value={tvaPercent.toString()}
              onChangeText={(text) => {
                const num = parseFloat(text) || 0;
                if (num >= 0 && num <= 100) {
                  setTvaPercent(num);
                }
              }}
              keyboardType="numeric"
              placeholder="20"
              containerStyle={{ marginBottom: 0 }}
            />
          </View>

          {/* Lignes */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Lignes de devis
              </Text>
              <TouchableOpacity
                onPress={addLigne}
                style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
              >
                <Feather name="plus" size={20} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Ajouter</Text>
              </TouchableOpacity>
            </View>

            {lignes.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="file-text" size={48} color={theme.colors.textMuted} />
                <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                  Aucune ligne
                </Text>
                <Text style={[styles.emptySubtext, { color: theme.colors.textMuted }]}>
                  Ajoutez des lignes pour détailler le devis
                </Text>
              </View>
            ) : (
              lignes.map((ligne, index) => (
                <LigneItem
                  key={ligne.id}
                  ligne={ligne}
                  index={index}
                  theme={theme}
                  styles={styles}
                  isEditing={editingLigneId === ligne.id}
                  onEdit={() => setEditingLigneId(ligne.id)}
                  onSave={() => setEditingLigneId(null)}
                  onUpdate={(field, value) => updateLigne(ligne.id, field, value)}
                  onDelete={() => deleteLigne(ligne.id)}
                />
              ))
            )}
          </View>

          {/* Totaux */}
          <View style={[styles.totauxSection, { backgroundColor: theme.colors.surfaceAlt }]}>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: theme.colors.textMuted }]}>
                Total HT
              </Text>
              <Text style={[styles.totalValue, { color: theme.colors.text }]}>
                {totalHT.toFixed(2)} €
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: theme.colors.textMuted }]}>
                TVA ({tvaPercent}%)
              </Text>
              <Text style={[styles.totalValue, { color: theme.colors.text }]}>
                {tvaMontant.toFixed(2)} €
              </Text>
            </View>
            <View style={[styles.totalRow, styles.totalRowFinal]}>
              <Text style={[styles.totalLabelFinal, { color: theme.colors.text }]}>
                Total TTC
              </Text>
              <Text style={[styles.totalValueFinal, { color: theme.colors.success }]}>
                {totalTTC.toFixed(2)} €
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modales */}
      <AFModal
        visible={showFinalizeModal}
        title="Finaliser le devis ?"
        message="Le devis sera marqué comme prêt à envoyer. Vous pourrez ensuite générer le lien de signature.\n\nVous pourrez toujours revenir en édition si nécessaire."
        onCancel={() => setShowFinalizeModal(false)}
        onConfirm={confirmFinalize}
        confirmLabel={finalizing ? 'Finalisation...' : 'Finaliser'}
        cancelLabel="Annuler"
      />

      <AFModal
        visible={showUnfinalizeModal}
        title="Revenir en édition ?"
        message="Le devis repassera en mode édition. Le lien de signature (si généré) restera valide."
        onCancel={() => setShowUnfinalizeModal(false)}
        onConfirm={confirmUnfinalize}
        confirmLabel="Revenir en édition"
        cancelLabel="Annuler"
      />

      <AFModal
        visible={showDeleteLigneModal}
        title="Supprimer cette ligne ?"
        message="Cette action est irréversible."
        onCancel={() => {
          setShowDeleteLigneModal(false);
          setLigneToDelete(null);
        }}
        onConfirm={confirmDeleteLigne}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        danger={true}
      />
    </ScreenContainer>
  );
}

// Composant pour une ligne de devis
function LigneItem({ ligne, index, theme, styles, isEditing, onEdit, onSave, onUpdate, onDelete }) {
  const [localDescription, setLocalDescription] = useState(ligne.description || '');
  const [localQuantite, setLocalQuantite] = useState(ligne.quantite?.toString() || '1');
  const [localUnite, setLocalUnite] = useState(ligne.unite || 'unité');
  const [localPrix, setLocalPrix] = useState(ligne.prix_unitaire?.toString() || '0');

  useEffect(() => {
    setLocalDescription(ligne.description || '');
    setLocalQuantite(ligne.quantite?.toString() || '1');
    setLocalUnite(ligne.unite || 'unité');
    setLocalPrix(ligne.prix_unitaire?.toString() || '0');
  }, [ligne]);

  const handleSave = () => {
    onUpdate('description', localDescription || '');
    onUpdate('quantite', parseFloat(localQuantite) || 0);
    onUpdate('unite', localUnite || 'unité');
    onUpdate('prix_unitaire', parseFloat(localPrix) || 0);
    onSave();
  };

  const prixTotal = (parseFloat(localQuantite) || 0) * (parseFloat(localPrix) || 0);

  return (
    <View style={[styles.ligneCard, { backgroundColor: theme.colors.surfaceAlt }]}>
      {isEditing ? (
        <>
          <AFInput
            icon="file-text"
            value={localDescription}
            onChangeText={setLocalDescription}
            placeholder="Description"
            multiline
            containerStyle={{ marginBottom: 12 }}
          />
          <View style={styles.ligneInputsRow}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.textMuted }]}>Qté</Text>
              <AFInput
                icon="hash"
                value={localQuantite}
                onChangeText={(text) => {
                  setLocalQuantite(text);
                  onUpdate('quantite', parseFloat(text) || 0);
                }}
                keyboardType="numeric"
                placeholder="1"
                containerStyle={{ marginBottom: 0 }}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.textMuted }]}>Unité</Text>
              <AFInput
                icon="ruler"
                value={localUnite}
                onChangeText={(text) => {
                  setLocalUnite(text);
                  onUpdate('unite', text);
                }}
                placeholder="unité"
                containerStyle={{ marginBottom: 0 }}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.textMuted }]}>Prix unit.</Text>
              <AFInput
                icon="euro"
                value={localPrix}
                onChangeText={(text) => {
                  setLocalPrix(text);
                  onUpdate('prix_unitaire', parseFloat(text) || 0);
                }}
                keyboardType="numeric"
                placeholder="0.00"
                containerStyle={{ marginBottom: 0 }}
              />
            </View>
          </View>
          <View style={styles.ligneActions}>
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.actionButton, { backgroundColor: theme.colors.success }]}
            >
              <Feather name="check" size={18} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Valider</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onDelete}
              style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
            >
              <Feather name="trash-2" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <View style={styles.ligneHeader}>
            <Text style={[styles.ligneDescription, { color: theme.colors.text }]}>
              {ligne.description || 'Ligne sans description'}
            </Text>
            <TouchableOpacity
              onPress={onEdit}
              style={styles.editButton}
            >
              <Feather name="edit-2" size={18} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.ligneDetails}>
            <Text style={[styles.ligneDetailText, { color: theme.colors.textMuted }]}>
              {ligne.quantite || 0} {ligne.unite || 'unité'} × {(ligne.prix_unitaire || 0).toFixed(2)} €
            </Text>
            <Text style={[styles.ligneTotal, { color: theme.colors.text }]}>
              {(ligne.prix_total || 0).toFixed(2)} €
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  tvaInput: {
    borderWidth: 1,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: 16,
    marginTop: theme.spacing.sm,
  },
  ligneCard: {
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
  },
  ligneHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  ligneDescription: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  editButton: {
    padding: theme.spacing.xs,
  },
  ligneDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ligneDetailText: {
    fontSize: 14,
  },
  ligneTotal: {
    fontSize: 16,
    fontWeight: '700',
  },
  ligneInputsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    marginBottom: theme.spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: 14,
    marginBottom: theme.spacing.sm,
  },
  inputSmall: {
    borderWidth: 1,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    fontSize: 14,
  },
  ligneActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    flex: 1,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: theme.spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: theme.spacing.xs,
  },
  totauxSection: {
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.lg,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  totalRowFinal: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  totalLabel: {
    fontSize: 14,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalLabelFinal: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalValueFinal: {
    fontSize: 18,
    fontWeight: '800',
  },
  signatureStatusContainer: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  signatureDetails: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  signatureDetailText: {
    fontSize: 13,
  },
  signatureActions: {
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  signatureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
  },
  signatureButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  signatureButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    marginTop: theme.spacing.sm,
  },
  signatureButtonSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 12,
    marginTop: theme.spacing.md,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

