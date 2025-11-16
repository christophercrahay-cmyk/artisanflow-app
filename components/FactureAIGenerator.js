/**
 * FactureAIGenerator - Générateur de facture IA avec Design System 2.0
 * Basé sur DevisAIGenerator2, adapté pour les factures
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme2';
import { startFactureSession, answerQuestions, createFactureFromAI } from '../services/aiConversationalService';
import { normalizeKey } from '../services/aiLearningService';
import { supabase } from '../supabaseClient';
import VoiceRecorderSimple from './VoiceRecorderSimple';
import { AppCard } from './ui/AppCard';
import { PrimaryButton } from './ui/PrimaryButton';
import { StatusBadge } from './ui/StatusBadge';
import { IASectionHeader } from './ia/IASectionHeader';
import { showSuccess, showError } from '../components/Toast';
import logger from '../utils/logger';
import { requireProOrPaywall } from '../utils/proAccess';

export default function FactureAIGenerator({ projectId, clientId, onFactureCreated, navigation, devisId = null }) {
  const theme = useThemeColors();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [reponses, setReponses] = useState({});
  const [answerMode, setAnswerMode] = useState('text');
  const [recordingQuestion, setRecordingQuestion] = useState(null);
  const [avgPrices, setAvgPrices] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [validating, setValidating] = useState(false);

  const styles = getStyles(theme);

  // ═══════════════════════════════════════════════════════════
  // FONCTION : COLORISATION DES PRIX (LOGIQUE MÉTIER PRÉSERVÉE)
  // ═══════════════════════════════════════════════════════════
  
  const getPriceColor = (description, price) => {
    if (!avgPrices || !description || typeof price !== 'number') {
      return undefined;
    }

    const key = normalizeKey(description);
    const stats = avgPrices[key];

    if (!stats || !stats.avg || stats.avg <= 0) {
      return undefined;
    }

    const diffPercent = ((price - stats.avg) / stats.avg) * 100;

    // Utiliser les couleurs du nouveau thème
    if (Math.abs(diffPercent) <= 10) {return theme.colors.priceCoherent;}
    if (Math.abs(diffPercent) <= 20) {return theme.colors.priceLimit;}
    if (diffPercent > 20) {return theme.colors.priceTooHigh;}
    if (diffPercent < -20) {return theme.colors.priceTooLow;}

    return undefined;
  };

  // ═══════════════════════════════════════════════════════════
  // FONCTION : GÉNÉRER LA FACTURE (LOGIQUE MÉTIER PRÉSERVÉE)
  // ═══════════════════════════════════════════════════════════
  
  const handleGenerateFacture = async () => {
    // Vérifier l'accès Pro
    if (navigation) {
      const ok = await requireProOrPaywall(navigation, 'Génération facture IA');
      if (!ok) return;
    }

    try {
      setLoading(true);

      // Récupérer toutes les notes du chantier
      const { data: notes, error: notesError } = await supabase
        .from('notes')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (notesError) {throw notesError;}

      if (!notes || notes.length === 0) {
        Alert.alert('Aucune note', 'Enregistrez d\'abord des notes vocales sur ce chantier');
        return;
      }

      console.log(`📝 ${notes.length} notes trouvées`);

      // Récupérer le user_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {throw new Error('Utilisateur non connecté');}

      // Charger le profil IA de l'utilisateur
      try {
        const { data: profile, error: profileError } = await supabase
          .from('ai_profiles')
          .select('avg_prices')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') {
          console.warn('[FactureAI] Erreur chargement profil IA:', profileError);
        }

        if (profile?.avg_prices) {
          setAvgPrices(profile.avg_prices);
          console.log('[FactureAI] ✅ Profil IA chargé:', Object.keys(profile.avg_prices).length, 'types de prix');
        } else {
          console.log('[FactureAI] ℹ️ Pas de profil IA pour cet utilisateur');
          setAvgPrices(null);
        }
      } catch (profileErr) {
        console.warn('[FactureAI] Exception chargement profil IA (non bloquant):', profileErr);
        setAvgPrices(null);
      }

      // Démarrer la session IA avec toutes les notes
      const result = await startFactureSession(null, projectId, clientId, user.id, notes, devisId);

      console.log('✅ Résultat IA facture reçu:', result);

      // Vérifier que le résultat est valide
      // L'Edge Function peut retourner "devis" même pour facture, on adapte
      if (!result || (!result.facture && !result.devis)) {
        throw new Error('Résultat IA invalide');
      }

      // Adapter le résultat : si devis est retourné, on l'utilise comme facture
      const adaptedResult = {
        ...result,
        facture: result.facture || result.devis, // Utiliser facture si présent, sinon devis
      };

      setAiResult(adaptedResult);
      setSessionId(result.session_id);

      // Initialiser les réponses vides
      const initialReponses = {};
      if (result.questions) {
        result.questions.forEach((_, index) => {
          initialReponses[index] = '';
        });
      }
      setReponses(initialReponses);

      // Ouvrir la modal APRÈS avoir tout initialisé
      setShowModal(true);

    } catch (error) {
      console.error('Erreur génération facture:', error);
      Alert.alert('Erreur', error.message || 'Impossible de générer la facture');
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // FONCTION : RÉPONDRE AUX QUESTIONS (LOGIQUE MÉTIER PRÉSERVÉE)
  // ═══════════════════════════════════════════════════════════
  
  const handleSubmitReponses = async () => {
    try {
      setLoading(true);

      // Convertir l'objet en tableau
      const reponsesArray = Object.values(reponses);

      // Vérifier qu'il y a au moins une réponse
      if (reponsesArray.every(r => !r.trim())) {
        Alert.alert('Réponses manquantes', 'Veuillez répondre à au moins une question');
        return;
      }

      // Envoyer les réponses à l'IA (même fonction que pour devis)
      const result = await answerQuestions(sessionId, reponsesArray);

      console.log('✅ Réponses traitées:', result);

      // Adapter le résultat : si devis est retourné, on l'utilise comme facture
      const adaptedResult = {
        ...result,
        facture: result.facture || result.devis, // Utiliser facture si présent, sinon devis
      };

      setAiResult(adaptedResult);

      // Réinitialiser les réponses
      const newReponses = {};
      if (result.questions) {
        result.questions.forEach((_, index) => {
          newReponses[index] = '';
        });
      }
      setReponses(newReponses);

    } catch (error) {
      console.error('Erreur envoi réponses:', error);
      Alert.alert('Erreur', error.message || 'Impossible d\'envoyer les réponses');
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // FONCTION : VALIDER LA FACTURE (LOGIQUE MÉTIER PRÉSERVÉE)
  // ═══════════════════════════════════════════════════════════
  
  const handleValiderFacture = async () => {
    try {
      setValidating(true);

      // Créer la facture définitive
      const facture = await createFactureFromAI(
        sessionId,
        aiResult.facture,
        projectId,
        clientId,
        devisId
      );

      console.log('✅ Facture créée:', facture.numero);

      // Fermer la modal
      setShowModal(false);

      // Callback pour rafraîchir l'écran parent
      if (onFactureCreated) {
        onFactureCreated();
      }

      Alert.alert('Succès', `Facture ${facture.numero} créée avec succès`);

    } catch (error) {
      console.error('Erreur validation facture:', error);
      Alert.alert('Erreur', error.message || 'Impossible de créer la facture');
    } finally {
      setValidating(false);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // FONCTION : ENREGISTREMENT VOCAL (LOGIQUE MÉTIER PRÉSERVÉE)
  // ═══════════════════════════════════════════════════════════
  
  const handleVoiceRecorded = (transcription) => {
    if (recordingQuestion !== null) {
      setReponses({
        ...reponses,
        [recordingQuestion]: transcription,
      });
      setRecordingQuestion(null);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <>
      {/* Bouton de génération */}
      <PrimaryButton
        title={loading ? "Génération..." : "Générer facture IA"}
        icon="🤖"
        onPress={handleGenerateFacture}
        disabled={loading}
        loading={loading}
        style={styles.generateButton}
      />

      {/* Modal de génération */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowModal(false)}
      >
        <KeyboardAvoidingView
          style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Génération Facture IA
            </Text>
            <TouchableOpacity
              onPress={() => setShowModal(false)}
              style={styles.closeButton}
            >
              <Feather name="x" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.modalContent} 
            contentContainerStyle={styles.modalContentContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {aiResult && (
              <>
                {/* Status Badge */}
                <StatusBadge
                  label={aiResult.status === 'ready' ? 'Facture prête' : 'Questions en attente'}
                  type={aiResult.status === 'ready' ? 'success' : 'warning'}
                  icon={aiResult.status === 'ready' ? '✅' : '⏳'}
                  style={styles.statusBadge}
                />

                {/* Section Header IA */}
                <IASectionHeader
                  title={aiResult.facture.titre}
                  subtitle={aiResult.facture.description}
                />

                {/* Facture */}
                <AppCard premium style={styles.factureCard}>
                  {/* Lignes */}
                  {aiResult.facture.lignes.map((ligne, index) => {
                    const priceColor = getPriceColor(ligne.description, ligne.prix_unitaire);
                    
                    return (
                      <View key={index} style={styles.ligneRow}>
                        <Text style={[styles.ligneDescription, { color: theme.colors.text }]}>
                          {ligne.description}
                        </Text>
                        <View style={styles.ligneDetails}>
                          <Text style={[styles.ligneQuantite, { color: theme.colors.textMuted }]}>
                            {ligne.quantite} {ligne.unite} ×{' '}
                            <Text style={[
                              styles.lignePrix,
                              priceColor ? { color: priceColor, fontWeight: '700' } : { color: theme.colors.text }
                            ]}>
                              {ligne.prix_unitaire.toFixed(2)}€
                            </Text>
                          </Text>
                          <Text style={[styles.ligneTotal, { color: theme.colors.text }]}>
                            {ligne.prix_total.toFixed(2)}€
                          </Text>
                        </View>
                      </View>
                    );
                  })}

                  {/* Séparateur */}
                  <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />

                  {/* Totaux */}
                  <View style={styles.totauxContainer}>
                    <View style={styles.totalRow}>
                      <Text style={[styles.totalLabel, { color: theme.colors.textMuted }]}>
                        Total HT
                      </Text>
                      <Text style={[styles.totalValue, { color: theme.colors.text }]}>
                        {aiResult.facture.total_ht.toFixed(2)}€
                      </Text>
                    </View>
                    <View style={styles.totalRow}>
                      <Text style={[styles.totalLabel, { color: theme.colors.textMuted }]}>
                        TVA ({aiResult.facture.tva_pourcent}%)
                      </Text>
                      <Text style={[styles.totalValue, { color: theme.colors.text }]}>
                        {aiResult.facture.tva_montant.toFixed(2)}€
                      </Text>
                    </View>
                    <View style={[styles.totalRow, styles.totalRowFinal]}>
                      <Text style={[styles.totalLabelFinal, { color: theme.colors.text }]}>
                        Total TTC
                      </Text>
                      <Text style={[styles.totalValueFinal, { color: theme.colors.success }]}>
                        {aiResult.facture.total_ttc.toFixed(2)}€
                      </Text>
                    </View>
                  </View>
                </AppCard>

                {/* Questions */}
                {aiResult.questions.length > 0 && (
                  <AppCard style={styles.questionsCard}>
                    <View style={styles.questionsHeader}>
                      <Feather name="help-circle" size={18} color={theme.colors.primary} />
                      <Text style={[styles.questionsTitle, { color: theme.colors.text }]}>
                        Questions de clarification
                      </Text>
                    </View>

                    {aiResult.questions.map((question, index) => (
                      <View key={index} style={styles.questionBlock}>
                        <Text style={[styles.questionText, { color: theme.colors.text }]}>
                          {index + 1}. {question}
                        </Text>

                        {/* Mode de réponse : Texte ou Vocal */}
                        <View style={styles.answerModeButtons}>
                          <Pressable
                            style={({ pressed }) => [
                              styles.modeButton,
                              {
                                backgroundColor: answerMode === 'text' 
                                  ? theme.colors.primary 
                                  : theme.colors.surface,
                                borderColor: theme.colors.border,
                                transform: [{ scale: pressed ? 0.97 : 1 }],
                              },
                            ]}
                            onPress={() => setAnswerMode('text')}
                          >
                            <Feather 
                              name="type" 
                              size={16} 
                              color={answerMode === 'text' ? theme.colors.primaryText : theme.colors.text} 
                            />
                            <Text style={[
                              styles.modeButtonText,
                              { color: answerMode === 'text' ? theme.colors.primaryText : theme.colors.text }
                            ]}>
                              Texte
                            </Text>
                          </Pressable>

                          <Pressable
                            style={({ pressed }) => [
                              styles.modeButton,
                              {
                                backgroundColor: answerMode === 'vocal' 
                                  ? theme.colors.primary 
                                  : theme.colors.surface,
                                borderColor: theme.colors.border,
                                transform: [{ scale: pressed ? 0.97 : 1 }],
                              },
                            ]}
                            onPress={() => setAnswerMode('vocal')}
                          >
                            <Feather 
                              name="mic" 
                              size={16} 
                              color={answerMode === 'vocal' ? theme.colors.primaryText : theme.colors.text} 
                            />
                            <Text style={[
                              styles.modeButtonText,
                              { color: answerMode === 'vocal' ? theme.colors.primaryText : theme.colors.text }
                            ]}>
                              Vocal
                            </Text>
                          </Pressable>
                        </View>

                        {/* Input Texte */}
                        {answerMode === 'text' && (
                          <TextInput
                            style={[
                              styles.reponseInput,
                              {
                                backgroundColor: theme.colors.surfaceAlt,
                                borderColor: theme.colors.border,
                                color: theme.colors.text,
                              }
                            ]}
                            placeholder="Votre réponse..."
                            placeholderTextColor={theme.colors.textSoft}
                            value={reponses[index] || ''}
                            onChangeText={(text) => setReponses({ ...reponses, [index]: text })}
                            multiline
                          />
                        )}

                        {/* Input Vocal */}
                        {answerMode === 'vocal' && (
                          <View style={styles.voiceInputContainer}>
                            {recordingQuestion === index ? (
                              <VoiceRecorderSimple
                                onTranscriptionComplete={(transcription) => {
                                  setReponses({ ...reponses, [index]: transcription });
                                  setRecordingQuestion(null);
                                }}
                                onCancel={() => setRecordingQuestion(null)}
                              />
                            ) : (
                              <TouchableOpacity
                                style={[
                                  styles.voiceButton,
                                  { backgroundColor: theme.colors.primarySoft, borderColor: theme.colors.primary }
                                ]}
                                onPress={() => setRecordingQuestion(index)}
                              >
                                <Feather name="mic" size={20} color={theme.colors.primary} />
                                <Text style={[styles.voiceButtonText, { color: theme.colors.primary }]}>
                                  {reponses[index] ? 'Ré-enregistrer' : 'Enregistrer une réponse'}
                                </Text>
                              </TouchableOpacity>
                            )}
                            {reponses[index] && (
                              <Text style={[styles.transcriptionPreview, { color: theme.colors.textMuted }]}>
                                {reponses[index]}
                              </Text>
                            )}
                          </View>
                        )}
                      </View>
                    ))}

                    {/* Bouton envoyer réponses */}
                    <PrimaryButton
                      title="Envoyer les réponses"
                      icon="📤"
                      onPress={handleSubmitReponses}
                      disabled={loading}
                      loading={loading}
                      style={styles.submitButton}
                    />
                  </AppCard>
                )}

                {/* Bouton validation finale */}
                {aiResult.status === 'ready' && (
                  <PrimaryButton
                    title="Créer la facture (brouillon)"
                    icon="✅"
                    onPress={handleValiderFacture}
                    disabled={validating}
                    loading={validating}
                    style={styles.validateButton}
                  />
                )}
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// STYLES (identique à DevisAIGenerator2)
// ═══════════════════════════════════════════════════════════

const getStyles = (theme) => StyleSheet.create({
  generateButton: {
    marginTop: theme.spacing.lg,
  },
  modalContainer: {
    flex: 1,
    paddingTop: 60,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: theme.typography.h2,
    fontWeight: '700',
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: 120,
  },
  statusBadge: {
    marginBottom: theme.spacing.lg,
  },
  factureCard: {
    marginTop: theme.spacing.lg,
  },
  ligneRow: {
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  ligneDescription: {
    fontSize: theme.typography.body,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  ligneDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ligneQuantite: {
    fontSize: theme.typography.small,
  },
  lignePrix: {
    fontSize: theme.typography.small,
    fontWeight: '700',
  },
  ligneTotal: {
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: theme.spacing.lg,
  },
  totauxContainer: {
    gap: theme.spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalRowFinal: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 2,
    borderTopColor: theme.colors.primary,
  },
  totalLabel: {
    fontSize: theme.typography.body,
  },
  totalValue: {
    fontSize: theme.typography.body,
    fontWeight: '600',
  },
  totalLabelFinal: {
    fontSize: theme.typography.h3,
    fontWeight: '700',
  },
  totalValueFinal: {
    fontSize: theme.typography.h3,
    fontWeight: '700',
  },
  questionsCard: {
    marginTop: theme.spacing.lg,
  },
  questionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  questionsTitle: {
    fontSize: theme.typography.h3,
    fontWeight: '700',
  },
  questionBlock: {
    marginBottom: theme.spacing.xl,
  },
  questionText: {
    fontSize: theme.typography.body,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    lineHeight: 22,
  },
  answerModeButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
  },
  modeButtonText: {
    fontSize: theme.typography.small,
    fontWeight: '600',
  },
  reponseInput: {
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.body,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  voiceInputContainer: {
    gap: theme.spacing.sm,
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    borderWidth: 1,
  },
  voiceButtonText: {
    fontSize: theme.typography.body,
    fontWeight: '600',
  },
  transcriptionPreview: {
    fontSize: theme.typography.small,
    fontStyle: 'italic',
    paddingHorizontal: theme.spacing.md,
  },
  submitButton: {
    marginTop: theme.spacing.lg,
  },
  validateButton: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xxl,
  },
});

