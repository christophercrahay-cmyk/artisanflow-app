import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Sharing from 'expo-sharing';
import { supabase } from '../supabaseClient';
import { useAppStore } from '../store/useAppStore';
import PhotoUploader from '../PhotoUploader';
import VoiceRecorder from '../VoiceRecorder';
import DevisFactures from '../DevisFactures';
import { generateDevisPDF } from '../utils/utils/pdf';
import { useSafeTheme } from '../theme/useSafeTheme';
import { Feather } from '@expo/vector-icons';
import logger from '../utils/logger';
import { showSuccess, showError } from '../components/Toast';

export default function ProjectDetailScreen({ route }) {
  const insets = useSafeAreaInsets();
  const theme = useSafeTheme();
  const { projectId } = route.params;
  const [project, setProject] = useState(null);
  const [client, setClient] = useState(null);
  const [showPDFForm, setShowPDFForm] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const [companyName, setCompanyName] = useState('Mon Entreprise');
  const [companySiret, setCompanySiret] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [pdfLines, setPdfLines] = useState([
    { designation: 'Main d\'œuvre', quantity: '1', unit: 'jour', unitPriceHT: '300' },
  ]);
  const [tvaPercent, setTvaPercent] = useState('20');
  const [showTextNoteModal, setShowTextNoteModal] = useState(false);
  const [textNote, setTextNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const styles = useMemo(() => getStyles(theme), [theme]);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      const { data: projData, error: projErr } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projErr) {
        console.error('Erreur chargement projet:', projErr);
        showError('Impossible de charger le projet');
        return;
      }
      
      if (projData) {
        setProject(projData);
        useAppStore.getState().setCurrentProject(projData);
        
        if (projData.client_id) {
          const { data: clientData, error: clientErr } = await supabase
            .from('clients')
            .select('*')
            .eq('id', projData.client_id)
            .single();
          
          if (clientErr) {
            console.error('Erreur chargement client:', clientErr);
          } else if (clientData) {
            setClient(clientData);
            useAppStore.getState().setCurrentClient(clientData);
          }
        }
      }
    } catch (err) {
      console.error('Exception chargement données:', err);
      showError('Erreur lors du chargement');
    }
  };

  const handleGeneratePDF = async () => {
    if (!client || !project) {
      showError('Client ou chantier introuvable');
      return;
    }

    try {
      setGeneratingPDF(true);

      const company = {
        name: companyName.trim(),
        siret: companySiret.trim(),
        address: companyAddress.trim(),
        phone: companyPhone.trim(),
        email: companyEmail.trim(),
      };

      const clientData = {
        name: client.name,
        address: client.address,
        phone: client.phone,
        email: client.email,
      };

      const projectData = {
        title: project.name,
        address: project.address,
      };

      const lignes = pdfLines
        .filter((l) => l.designation.trim())
        .map((l) => ({
          designation: l.designation.trim(),
          quantity: parseFloat(l.quantity) || 0,
          unit: l.unit.trim(),
          unitPriceHT: parseFloat(l.unitPriceHT) || 0,
        }));

      const { pdfUrl, number, localUri } = await generateDevisPDF({
        company,
        client: clientData,
        project: projectData,
        lignes,
        tva: parseFloat(tvaPercent) || 20,
      });

      try {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable && localUri) {
          await Sharing.shareAsync(localUri, {
            mimeType: 'application/pdf',
            dialogTitle: `Devis ${number}`,
          });
        } else {
          if (pdfUrl) {
            const canOpen = await Linking.canOpenURL(pdfUrl);
            if (canOpen) {
              await Linking.openURL(pdfUrl);
            }
          }
        }
      } catch (shareErr) {
        console.error('Erreur partage PDF:', shareErr);
      }

      Alert.alert(
        'PDF généré ✅',
        `Le devis ${number} a été créé et ouvert.`,
        [{ text: 'OK', onPress: () => setShowPDFForm(false) }]
      );
    } catch (err) {
      console.error('Erreur génération PDF:', err);
      showError(err.message || 'Impossible de générer le PDF');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleAddTextNote = async () => {
    if (!textNote.trim()) {
      showError('Saisissez votre note');
      return;
    }

    // Ne pas vider le texte en cas d'erreur
    const noteTextToSave = textNote.trim();

    try {
      setSavingNote(true);
      logger.info('ProjectDetail', 'Enregistrement note texte', { projectId });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      const noteData = {
        project_id: projectId,
        client_id: project?.client_id,
        user_id: user.id,
        type: 'text',
        transcription: noteTextToSave, // Utiliser transcription pour les notes texte aussi
      };

      const { error } = await supabase.from('notes').insert([noteData]);
      if (error) {
        logger.error('ProjectDetail', 'Erreur insertion note', error);
        throw error;
      }

      logger.success('ProjectDetail', 'Note texte enregistrée');
      showSuccess(`Note ajoutée au chantier "${project.name}"`);
      
      // Reset seulement en cas de succès
      setShowTextNoteModal(false);
      setTextNote('');
    } catch (err) {
      logger.error('ProjectDetail', 'Exception note texte', err);
      showError(err.message || 'Erreur lors de l\'enregistrement de la note. Vérifiez votre connexion.');
      // Ne pas vider textNote en cas d'erreur pour que l'utilisateur ne perde pas son texte
    } finally {
      setSavingNote(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'planned':
        return { icon: 'clock', label: 'Planifié', color: theme.colors.warning };
      case 'in_progress':
        return { icon: 'play-circle', label: 'En cours', color: theme.colors.accent };
      case 'done':
        return { icon: 'check-circle', label: 'Terminé', color: theme.colors.success };
      default:
        return { icon: 'help-circle', label: status, color: theme.colors.textSecondary };
    }
  };

  if (!project) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text style={styles.loading}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusConfig = getStatusConfig(project.status || project.status_text);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.projectHeader}>
              <View style={styles.avatarContainer}>
                <Feather name="folder" size={32} color={theme.colors.accent} strokeWidth={2.5} />
              </View>
              <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
                <Text style={styles.detailTitle}>{project.name}</Text>
                {project.address ? (
                  <View style={styles.infoRow}>
                    <Feather name="map-pin" size={16} color={theme.colors.textSecondary} />
                    <Text style={styles.detailLine}>{project.address}</Text>
                  </View>
                ) : null}
                {client ? (
                  <View style={styles.infoRow}>
                    <Feather name="user" size={16} color={theme.colors.textSecondary} />
                    <Text style={styles.detailLine}>{client.name}</Text>
                  </View>
                ) : null}
                <View style={styles.statusRow}>
                  <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
                    <Feather name={statusConfig.icon} size={14} color={statusConfig.color} />
                    <Text style={[styles.statusText, { color: statusConfig.color }]}>
                      {statusConfig.label}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        }
        data={[1]}
        keyExtractor={() => 'single'}
        renderItem={() => (
          <View style={styles.content}>
            <View style={styles.journalSection}>
              <View style={styles.journalHeader}>
                <Feather name="book-open" size={20} color={theme.colors.accent} />
                <Text style={styles.journalTitle}>Journal de chantier</Text>
              </View>
              <Text style={styles.journalSubtitle}>
                Capturez les événements de ce chantier
              </Text>
              <TouchableOpacity
                style={styles.addNoteButton}
                onPress={() => setShowTextNoteModal(true)}
                activeOpacity={0.7}
              >
                <Feather name="edit-3" size={18} color={theme.colors.text} strokeWidth={2.5} />
                <Text style={styles.addNoteButtonText}>Ajouter une note texte</Text>
              </TouchableOpacity>
            </View>

            <PhotoUploader projectId={projectId} />
            <VoiceRecorder projectId={projectId} />
            
            <TouchableOpacity
              style={styles.pdfButton}
              onPress={() => setShowPDFForm(true)}
              activeOpacity={0.7}
            >
              <Feather name="file-text" size={20} color={theme.colors.text} strokeWidth={2.5} />
              <Text style={styles.pdfButtonText}>Générer un devis PDF</Text>
            </TouchableOpacity>

            <DevisFactures projectId={projectId} clientId={project?.client_id} type="devis" />
            <DevisFactures projectId={projectId} clientId={project?.client_id} type="facture" />
            <View style={{ height: insets.bottom }} />
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />

      {/* Modale formulaire PDF */}
      <Modal visible={showPDFForm} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeader}>
              <Feather name="file-text" size={24} color={theme.colors.accent} />
              <Text style={styles.modalTitle}>Générer un devis PDF</Text>
            </View>
            
            <Text style={styles.label}>Entreprise</Text>
            <TextInput
              style={styles.input}
              placeholder="Nom entreprise"
              placeholderTextColor={theme.colors.textMuted}
              value={companyName}
              onChangeText={setCompanyName}
            />
            <TextInput
              style={styles.input}
              placeholder="SIRET"
              placeholderTextColor={theme.colors.textMuted}
              value={companySiret}
              onChangeText={setCompanySiret}
            />
            <TextInput
              style={styles.input}
              placeholder="Adresse"
              placeholderTextColor={theme.colors.textMuted}
              value={companyAddress}
              onChangeText={setCompanyAddress}
            />
            <TextInput
              style={styles.input}
              placeholder="Téléphone"
              placeholderTextColor={theme.colors.textMuted}
              value={companyPhone}
              onChangeText={setCompanyPhone}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="email-address"
              value={companyEmail}
              onChangeText={setCompanyEmail}
            />

            <Text style={styles.label}>Lignes du devis</Text>
            {pdfLines.map((line, idx) => (
              <View key={idx} style={styles.lineRow}>
                <TextInput
                  style={[styles.lineInput, { flex: 3 }]}
                  placeholder="Désignation"
                  placeholderTextColor={theme.colors.textMuted}
                  value={line.designation}
                  onChangeText={(v) => {
                    const newLines = [...pdfLines];
                    newLines[idx].designation = v;
                    setPdfLines(newLines);
                  }}
                />
                <TextInput
                  style={[styles.lineInput, { flex: 1 }]}
                  placeholder="Qté"
                  placeholderTextColor={theme.colors.textMuted}
                  value={line.quantity}
                  onChangeText={(v) => {
                    const newLines = [...pdfLines];
                    newLines[idx].quantity = v;
                    setPdfLines(newLines);
                  }}
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.lineInput, { flex: 1 }]}
                  placeholder="Unité"
                  placeholderTextColor={theme.colors.textMuted}
                  value={line.unit}
                  onChangeText={(v) => {
                    const newLines = [...pdfLines];
                    newLines[idx].unit = v;
                    setPdfLines(newLines);
                  }}
                />
                <TextInput
                  style={[styles.lineInput, { flex: 1.5 }]}
                  placeholder="P.U. HT"
                  placeholderTextColor={theme.colors.textMuted}
                  value={line.unitPriceHT}
                  onChangeText={(v) => {
                    const newLines = [...pdfLines];
                    newLines[idx].unitPriceHT = v;
                    setPdfLines(newLines);
                  }}
                  keyboardType="numeric"
                />
              </View>
            ))}

            <TouchableOpacity
              style={styles.addLineButton}
              onPress={() =>
                setPdfLines([...pdfLines, { designation: '', quantity: '', unit: '', unitPriceHT: '' }])
              }
              activeOpacity={0.7}
            >
              <Feather name="plus-circle" size={18} color={theme.colors.accent} />
              <Text style={styles.addLineText}>Ajouter une ligne</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="TVA %"
              placeholderTextColor={theme.colors.textMuted}
              value={tvaPercent}
              onChangeText={setTvaPercent}
              keyboardType="numeric"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.generateButton, generatingPDF && { opacity: 0.6 }]}
                onPress={handleGeneratePDF}
                disabled={generatingPDF}
                activeOpacity={0.7}
              >
                {generatingPDF ? (
                  <ActivityIndicator color={theme.colors.text} />
                ) : (
                  <>
                    <Feather name="check-circle" size={20} color={theme.colors.text} />
                    <Text style={styles.generateButtonText}>Générer PDF</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelModalButton}
                onPress={() => setShowPDFForm(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelModalText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>

      {/* Modal note texte */}
      <Modal
        visible={showTextNoteModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          if (!savingNote) {
            setShowTextNoteModal(false);
            setTextNote('');
          }
        }}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxHeight: '80%' }]}>
              <View style={styles.modalHeader}>
                <Feather name="edit-3" size={24} color={theme.colors.accent} />
                <Text style={styles.modalTitle}>Note texte</Text>
              </View>
              
              <TextInput
                placeholder="Saisissez votre note..."
                placeholderTextColor={theme.colors.textMuted}
                value={textNote}
                onChangeText={setTextNote}
                multiline
                numberOfLines={8}
                editable={!savingNote}
                style={{
                  backgroundColor: theme.colors.surfaceElevated,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 16,
                  color: theme.colors.text, // Texte blanc visible
                  marginBottom: 16,
                  textAlignVertical: 'top',
                  minHeight: 150,
                  maxHeight: 300,
                }}
                autoFocus
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  onPress={handleAddTextNote}
                  disabled={savingNote || !textNote.trim()}
                  style={[styles.generateButton, (savingNote || !textNote.trim()) && { opacity: 0.6 }]}
                  activeOpacity={0.7}
                >
                  {savingNote ? (
                    <ActivityIndicator color={theme.colors.text} />
                  ) : (
                    <>
                      <Feather name="check-circle" size={20} color={theme.colors.text} />
                      <Text style={styles.generateButtonText}>Enregistrer</Text>
                    </>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => {
                    if (!savingNote) {
                      setShowTextNoteModal(false);
                      setTextNote('');
                    }
                  }}
                  disabled={savingNote}
                  style={[styles.cancelModalButton, savingNote && { opacity: 0.6 }]}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelModalText}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background,
  },
  loading: { 
    ...theme.typography.body,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    color: theme.colors.textSecondary,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailTitle: { 
    ...theme.typography.h2,
    fontSize: 24,
    marginBottom: theme.spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  detailLine: { 
    ...theme.typography.bodySmall,
    marginLeft: theme.spacing.xs,
  },
  statusRow: {
    marginTop: theme.spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: theme.spacing.xs,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
  },
  journalSection: {
    marginBottom: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  journalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  journalTitle: {
    ...theme.typography.h4,
    marginLeft: theme.spacing.sm,
  },
  journalSubtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  addNoteButton: {
    backgroundColor: theme.colors.accent + '20',
    borderWidth: 1,
    borderColor: theme.colors.accent + '40',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  addNoteButtonText: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.text,
  },
  pdfButton: {
    ...theme.buttons.primary,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginVertical: theme.spacing.lg,
  },
  pdfButtonText: { 
    ...theme.typography.body,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '90%',
    padding: theme.spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalTitle: { 
    ...theme.typography.h3,
    marginLeft: theme.spacing.sm,
  },
  label: { 
    ...theme.typography.caption,
    marginBottom: theme.spacing.sm,
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
  },
  input: {
    ...theme.input,
    marginBottom: theme.spacing.md,
  },
  lineRow: { 
    flexDirection: 'row', 
    gap: theme.spacing.sm, 
    marginBottom: theme.spacing.sm,
  },
  lineInput: {
    ...theme.input,
    minHeight: 48,
  },
  addLineButton: {
    backgroundColor: theme.colors.accent + '20',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  addLineText: { 
    ...theme.typography.caption,
    color: theme.colors.accent,
    fontWeight: '700',
  },
  modalActions: { 
    flexDirection: 'row', 
    gap: theme.spacing.md, 
    marginTop: theme.spacing.lg,
  },
  generateButton: {
    ...theme.buttons.primary,
    flex: 1,
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  generateButtonText: {
    ...theme.buttons.primaryText,
  },
  cancelModalButton: {
    ...theme.buttons.secondary,
    flex: 1,
  },
  cancelModalText: { 
    ...theme.buttons.secondaryText,
    color: theme.colors.error,
  },
});
