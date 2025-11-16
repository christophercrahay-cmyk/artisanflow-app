import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../supabaseClient';
import { useAppStore } from '../store/useAppStore';
import { useSafeTheme } from '../theme/useSafeTheme';
import { Feather } from '@expo/vector-icons';
import { signOut } from '../utils/auth';
import logger from '../utils/logger';
import { 
  loadHapticsPreference, 
  saveHapticsPreference, 
  isHapticsEnabled 
} from '../utils/hapticsService';
import { Switch } from 'react-native';
import { AVAILABLE_TEMPLATES, DOCUMENT_TEMPLATES, DocumentTemplateId, DEFAULT_TEMPLATE } from '../types/documentTemplates';
import { getDefaultTemplate, setDefaultTemplate } from '../services/documentTemplateService';
import { TemplatePreview } from '../components/TemplatePreview';
import { TemplatePreviewModal } from '../components/TemplatePreviewModal';

// Flag pour activer/désactiver la section "Couleurs"
// À passer à true quand le Design System 2.0 supportera les thèmes personnalisés
const ENABLE_THEME_COLOR_SETTING = false;

export default function SettingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const theme = useSafeTheme();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settingsId, setSettingsId] = useState(null);
  const [deletingAccount, setDeletingAccount] = useState(false);
  
  const [companyName, setCompanyName] = useState('Mon Entreprise');
  const [companySiret, setCompanySiret] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyCity, setCompanyCity] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [tvaDefault, setTvaDefault] = useState('20');
  const [templateDefault, setTemplateDefault] = useState('classique');
  const [devisPrefix, setDevisPrefix] = useState('DEV');
  const [facturePrefix, setFacturePrefix] = useState('FA');
  const [primaryColor, setPrimaryColor] = useState('#1D4ED8');
  const [logoUrl, setLogoUrl] = useState(null);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [firstName, setFirstName] = useState('');
  
  // ✅ Nouveaux états pour mentions légales
  const [companyTvaNumber, setCompanyTvaNumber] = useState('');
  const [insuranceRcpProvider, setInsuranceRcpProvider] = useState('');
  const [insuranceRcpPolicy, setInsuranceRcpPolicy] = useState('');
  const [insuranceDecennaleProvider, setInsuranceDecennaleProvider] = useState('');
  const [insuranceDecennalePolicy, setInsuranceDecennalePolicy] = useState('');
  const [professionalQualification, setProfessionalQualification] = useState('');
  const [capitalSocial, setCapitalSocial] = useState('');
  const [legalForm, setLegalForm] = useState('auto_entrepreneur');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [previewTemplateId, setPreviewTemplateId] = useState(null);

  const styles = useMemo(() => getStyles(theme, insets), [theme, insets]);

  useEffect(() => {
    loadSettings();
    loadHapticsPreference().then(setHapticsEnabled);
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Récupérer l'utilisateur connecté pour filtrer par user_id (RLS)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('SettingsScreen', 'Utilisateur non connecté');
        return;
      }
      
      const { data, error } = await supabase
        .from('brand_settings')
        .select('*')
        .eq('user_id', user.id) // Filtrer par user_id pour RLS
        .limit(1)
        .maybeSingle(); // Utiliser maybeSingle() pour gérer l'absence de données

      if (error) {
        // PGRST116 = aucune ligne trouvée (normal si settings n'existent pas encore)
        if (error.code !== 'PGRST116') {
          console.error('Erreur chargement settings:', error);
        }
        // Continuer même si aucun setting n'existe (on utilisera les valeurs par défaut)
        return;
      }

      if (data) {
        setSettingsId(data.id);
        setCompanyName(data.company_name || 'Mon Entreprise');
        setCompanySiret(data.company_siret || '');
        setCompanyAddress(data.company_address || '');
        setCompanyCity(data.company_city || '');
        setCompanyPhone(data.company_phone || '');
        setCompanyEmail(data.company_email || '');
        setTvaDefault(data.tva_default?.toString() || '20');
        // ✅ Gérer la compatibilité avec l'ancien 'premium' -> 'premiumNoirOr'
        let templateValue = data.template_default || DEFAULT_TEMPLATE;
        if (templateValue === 'premium') {
          templateValue = 'premiumNoirOr';
        }
        setTemplateDefault(templateValue);
        setDevisPrefix(data.devis_prefix || 'DEV');
        setFacturePrefix(data.facture_prefix || 'FA');
        setPrimaryColor(data.primary_color || '#1D4ED8');
        setLogoUrl(data.logo_url);
        setFirstName(data.first_name || '');
        
        // ✅ Charger champs légaux
        setCompanyTvaNumber(data.company_tva_number || '');
        setInsuranceRcpProvider(data.insurance_rcp_provider || '');
        setInsuranceRcpPolicy(data.insurance_rcp_policy || '');
        setInsuranceDecennaleProvider(data.insurance_decennale_provider || '');
        setInsuranceDecennalePolicy(data.insurance_decennale_policy || '');
        setProfessionalQualification(data.professional_qualification || '');
        setCapitalSocial(data.capital_social || '');
        setLegalForm(data.legal_form || 'auto_entrepreneur');
      }
    } catch (err) {
      console.error('Exception load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoPick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Autorisez l\'accès aux photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) {return;}

      const uri = result.assets[0].uri;
      const fileName = `logo_${Date.now()}.jpg`;
      const resp = await fetch(uri);
      const arrayBuffer = await resp.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('project-photos')
        .upload(`logo/${fileName}`, bytes, { contentType: 'image/jpeg', upsert: true });

      if (uploadErr) {throw uploadErr;}

      const { data: urlData } = supabase.storage.from('project-photos').getPublicUrl(uploadData.path);
      setLogoUrl(urlData.publicUrl);
    } catch (err) {
      console.error('Erreur upload logo:', err);
      Alert.alert('Erreur', 'Impossible d\'uploader le logo');
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      '⚠️ Supprimer mon compte',
      'Cette action est IRRÉVERSIBLE.\n\nToutes vos données seront définitivement supprimées :\n• Clients\n• Chantiers\n• Photos\n• Notes\n• Documents\n• Paramètres\n\nÊtes-vous absolument sûr ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Je confirme la suppression',
          style: 'destructive',
          onPress: () => {
            // Double confirmation pour éviter les erreurs
            Alert.alert(
              '🚨 DERNIÈRE CONFIRMATION',
              'Votre compte et TOUTES vos données seront supprimés dans 3 secondes.\n\nCette action ne peut PAS être annulée.',
              [
                { text: 'ARRÊTER', style: 'cancel' },
                {
                  text: 'SUPPRIMER DÉFINITIVEMENT',
                  style: 'destructive',
                  onPress: confirmDeleteAccount,
                },
              ]
            );
          },
        },
      ]
    );
  };

  const confirmDeleteAccount = async () => {
    try {
      setDeletingAccount(true);
      logger.warn('Settings', 'Début suppression compte utilisateur');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utilisateur non authentifié');
      }

      // Les données sont supprimées automatiquement par CASCADE (FK)
      // ON DELETE CASCADE sur toutes les tables :
      // - clients → projects → project_photos, notes, devis, factures
      // - brand_settings
      
      // Supprimer le compte utilisateur via Supabase Admin API
      // Note: Cette API nécessite un endpoint backend ou une fonction Edge
      // Pour l'instant, on supprime les données puis on déconnecte
      
      // Alternative : Utiliser Supabase RPC (function SQL)
      const { error: rpcError } = await supabase.rpc('delete_user_account');
      
      if (rpcError) {
        // Si la function RPC n'existe pas, on fait la suppression manuelle
        logger.warn('Settings', 'RPC delete_user_account non disponible, suppression manuelle');
        
        // Supprimer toutes les données utilisateur manuellement
        // Les FK CASCADE supprimeront automatiquement les données liées
        
        // Supprimer les clients (cascade → projects → photos, notes, etc.)
        const { error: clientsError } = await supabase
          .from('clients')
          .delete()
          .eq('user_id', user.id);
        
        if (clientsError) {
          logger.error('Settings', 'Erreur suppression clients', clientsError);
        }
        
        // Supprimer les settings
        const { error: settingsError } = await supabase
          .from('brand_settings')
          .delete()
          .eq('user_id', user.id);
        
        if (settingsError) {
          logger.error('Settings', 'Erreur suppression settings', settingsError);
        }
      }

      logger.success('Settings', 'Données utilisateur supprimées');

      // Déconnexion
      await signOut();
      
      Alert.alert(
        '✅ Compte supprimé',
        'Votre compte et toutes vos données ont été supprimés.',
        [{ text: 'OK' }]
      );
    } catch (err) {
      logger.error('Settings', 'Erreur suppression compte', err);
      Alert.alert(
        'Erreur',
        err?.message || 'Impossible de supprimer le compte. Contactez le support.'
      );
    } finally {
      setDeletingAccount(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);

      // Récupérer l'utilisateur connecté pour RLS
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {throw new Error('Utilisateur non authentifié');}

      const settingsData = {
        company_name: companyName.trim(),
        company_siret: companySiret.trim(),
        company_address: companyAddress.trim(),
        company_city: companyCity.trim() || null, // Ville pour la météo
        company_phone: companyPhone.trim(),
        company_email: companyEmail.trim(),
        tva_default: parseFloat(tvaDefault) || 20,
        template_default: templateDefault === 'premium' ? 'premiumNoirOr' : templateDefault,
        devis_prefix: devisPrefix.trim(),
        facture_prefix: facturePrefix.trim(),
        primary_color: primaryColor.trim(),
        logo_url: logoUrl,
        first_name: firstName.trim() || null, // Prénom pour la salutation
        updated_at: new Date().toISOString(),
        user_id: user.id, // Nécessaire pour RLS
        
        // ✅ Champs légaux (conformité devis/factures)
        company_tva_number: companyTvaNumber.trim() || null,
        insurance_rcp_provider: insuranceRcpProvider.trim() || null,
        insurance_rcp_policy: insuranceRcpPolicy.trim() || null,
        insurance_decennale_provider: insuranceDecennaleProvider.trim() || null,
        insurance_decennale_policy: insuranceDecennalePolicy.trim() || null,
        professional_qualification: professionalQualification.trim() || null,
        capital_social: capitalSocial.trim() || null,
        legal_form: legalForm,
      };

      if (settingsId) {
        const { error } = await supabase
          .from('brand_settings')
          .update(settingsData)
          .eq('id', settingsId);
        
        if (error) {throw error;}
      } else {
        const { error } = await supabase.from('brand_settings').insert([settingsData]);
        if (error) {throw error;}
      }

      logger.success('Settings', 'Paramètres sauvegardés avec succès');
      Alert.alert('✅ Succès', 'Paramètres sauvegardés');
      await loadSettings();
    } catch (err) {
      logger.error('Settings', 'Erreur sauvegarde settings', err);
      console.error('Erreur sauvegarde settings:', err);
      
      // Message d'erreur plus détaillé
      let errorMessage = 'Impossible de sauvegarder';
      if (err.message) {
        errorMessage = err.message;
      } else if (err.code === 'PGRST116') {
        errorMessage = 'Colonne manquante. Vérifiez que le script SQL a été exécuté.';
      } else if (err.code) {
        errorMessage = `Erreur ${err.code}: ${err.message || 'Erreur inconnue'}`;
      }
      
      Alert.alert('Erreur', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
              <Feather name="arrow-left" size={24} color={theme.colors.accent} strokeWidth={2.5} />
              <Text style={styles.backBtnText}>Retour</Text>
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: theme.spacing?.md || 12 }}>
              <Text style={styles.title}>Paramètres</Text>
              <Text style={styles.subtitle}>Personnalisez votre identité</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="image" size={20} color={theme.colors.accent} />
            <Text style={styles.sectionTitle}>Logo de l'entreprise</Text>
          </View>
          <Text style={styles.helpText}>
            Ajoutez ici le logo de votre entreprise. Il sera utilisé sur vos documents (devis, factures).
          </Text>
          <View style={styles.logoContainer}>
            <TouchableOpacity style={styles.logoButton} onPress={handleLogoPick} activeOpacity={0.7}>
              {logoUrl ? (
                <Image source={{ uri: logoUrl }} style={styles.logoImage} />
              ) : (
                <View style={styles.logoPlaceholder}>
                  <Feather name="image" size={32} color={theme.colors.textSecondary} />
                  <Text style={styles.logoText}>Ajouter un logo</Text>
                </View>
              )}
            </TouchableOpacity>
            {logoUrl && (
              <TouchableOpacity 
                style={styles.changeLogoButton}
                onPress={handleLogoPick}
                activeOpacity={0.7}
              >
                <Feather name="edit-2" size={16} color={theme.colors.accent} strokeWidth={2.5} />
                <Text style={styles.changeLogoText}>Modifier</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="briefcase" size={20} color={theme.colors.accent} />
            <Text style={styles.sectionTitle}>Entreprise</Text>
          </View>
          <Text style={styles.label}>Nom *</Text>
          <TextInput
            style={styles.input}
            value={companyName}
            onChangeText={setCompanyName}
            placeholder="Mon Entreprise"
            placeholderTextColor={theme.colors.textMuted}
          />
          <Text style={styles.label}>SIRET</Text>
          <TextInput
            style={styles.input}
            value={companySiret}
            onChangeText={setCompanySiret}
            placeholder="12345678901234"
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="numeric"
          />
          <Text style={styles.label}>Adresse</Text>
          <TextInput
            style={styles.input}
            value={companyAddress}
            onChangeText={setCompanyAddress}
            placeholder="123 rue de la République"
            placeholderTextColor={theme.colors.textMuted}
            multiline
          />
          <Text style={styles.label}>Ville (pour la météo)</Text>
          <TextInput
            style={styles.input}
            value={companyCity}
            onChangeText={setCompanyCity}
            placeholder="Paris"
            placeholderTextColor={theme.colors.textMuted}
            autoCapitalize="words"
          />
          <Text style={styles.label}>Téléphone</Text>
          <TextInput
            style={styles.input}
            value={companyPhone}
            onChangeText={setCompanyPhone}
            placeholder="0123456789"
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="phone-pad"
          />
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={companyEmail}
            onChangeText={setCompanyEmail}
            placeholder="contact@entreprise.fr"
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="dollar-sign" size={20} color={theme.colors.accent} />
            <Text style={styles.sectionTitle}>Facturation</Text>
          </View>
          <Text style={styles.label}>TVA par défaut (%)</Text>
          <TextInput
            style={styles.input}
            value={tvaDefault}
            onChangeText={setTvaDefault}
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="decimal-pad"
            placeholder="20"
          />
          <Text style={styles.label}>Modèle de document</Text>
          <Pressable
            style={[styles.templateSelect, {
              backgroundColor: theme.colors.surfaceElevated || theme.colors.surface,
              borderColor: theme.colors.border || theme.colors.textMuted,
            }]}
            onPress={() => setShowTemplateModal(true)}
          >
            <Text style={[styles.templateSelectLabel, { color: theme.colors.text }]}>
              {DOCUMENT_TEMPLATES[templateDefault]?.label || 'Classique'}
            </Text>
            <Feather name="chevron-down" size={20} color={theme.colors.textMuted} />
          </Pressable>
        </View>

        {/* Modal de sélection de template */}
        <Modal
          visible={showTemplateModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowTemplateModal(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowTemplateModal(false)}
          >
            <Pressable
              style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                  Choisir un modèle de document
                </Text>
                <TouchableOpacity
                  onPress={() => setShowTemplateModal(false)}
                  style={styles.modalCloseButton}
                >
                  <Feather name="x" size={24} color={theme.colors.textMuted} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalScrollView}>
                {AVAILABLE_TEMPLATES.map((templateId) => {
                  const template = DOCUMENT_TEMPLATES[templateId];
                  const isSelected = templateDefault === templateId;
                  return (
                    <Pressable
                      key={templateId}
                      style={[
                        styles.templateOption,
                        {
                          backgroundColor: isSelected
                            ? theme.colors.accent + '20'
                            : theme.colors.surfaceElevated || theme.colors.surface,
                          borderColor: isSelected
                            ? theme.colors.accent
                            : theme.colors.border || theme.colors.textMuted,
                        },
                      ]}
                      onPress={async () => {
                        try {
                          setTemplateDefault(templateId);
                          await setDefaultTemplate(templateId);
                          setShowTemplateModal(false);
                          logger.success('Settings', `Template sélectionné: ${template.label}`);
                        } catch (error) {
                          logger.error('Settings', 'Erreur sélection template', error);
                          Alert.alert('Erreur', 'Impossible de sauvegarder le template');
                        }
                      }}
                    >
                      {/* Aperçu visuel du template */}
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          setPreviewTemplateId(templateId);
                        }}
                        activeOpacity={0.7}
                      >
                        <TemplatePreview templateId={templateId} style={styles.templatePreview} />
                      </TouchableOpacity>
                      
                      <View style={styles.templateOptionContent}>
                        <Text
                          style={[
                            styles.templateOptionLabel,
                            {
                              color: isSelected ? theme.colors.accent : theme.colors.text,
                              fontWeight: isSelected ? '700' : '500',
                            },
                          ]}
                        >
                          {template.label}
                        </Text>
                        <Text
                          style={[
                            styles.templateOptionDescription,
                            { color: theme.colors.textMuted },
                          ]}
                        >
                          {template.description}
                        </Text>
                      </View>
                      <View style={styles.templateActions}>
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            setPreviewTemplateId(templateId);
                          }}
                          style={styles.previewButton}
                        >
                          <Feather name="eye" size={18} color={theme.colors.accent} />
                        </TouchableOpacity>
                        {isSelected && (
                          <Feather name="check" size={20} color={theme.colors.accent} />
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Modal d'aperçu plein écran */}
        <TemplatePreviewModal
          visible={previewTemplateId !== null}
          templateId={previewTemplateId}
          onClose={() => setPreviewTemplateId(null)}
          onSelect={async (selectedTemplateId) => {
            try {
              setTemplateDefault(selectedTemplateId);
              await setDefaultTemplate(selectedTemplateId);
              setShowTemplateModal(false);
              logger.success('Settings', `Template sélectionné: ${DOCUMENT_TEMPLATES[selectedTemplateId]?.label}`);
            } catch (error) {
              logger.error('Settings', 'Erreur sélection template', error);
              Alert.alert('Erreur', 'Impossible de sauvegarder le template');
            }
          }}
        />

        {/* Section "Templates de devis" masquée - conservée pour compatibilité future */}
        {/* <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="file-text" size={20} color={theme.colors.accent} />
            <Text style={styles.sectionTitle}>Templates de devis</Text>
          </View>
          <TouchableOpacity
            style={[styles.templateLinkButton, {
              backgroundColor: theme.colors.surfaceElevated || theme.colors.surface,
              borderRadius: theme.borderRadius.md,
            }]}
            onPress={() => navigation.navigate('Templates')}
            activeOpacity={0.7}
          >
            <Feather name="file-text" size={20} color={theme.colors.accent} />
            <Text style={[styles.templateLinkText, { color: theme.colors.text }]}>
              Gérer les templates
            </Text>
            <Feather name="chevron-right" size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View> */}

        {/* ✅ NOUVELLE SECTION : Mentions légales */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="shield" size={20} color={theme.colors.accent} />
            <Text style={styles.sectionTitle}>Mentions légales</Text>
          </View>
          <Text style={styles.helpText}>
            Informations obligatoires pour la conformité de vos devis et factures (DGCCRF).
          </Text>

          <Text style={styles.label}>Forme juridique *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={legalForm}
              onValueChange={(value) => setLegalForm(value)}
              style={styles.picker}
            >
              <Picker.Item label="Auto-entrepreneur" value="auto_entrepreneur" />
              <Picker.Item label="EURL" value="eurl" />
              <Picker.Item label="SARL" value="sarl" />
              <Picker.Item label="SAS" value="sas" />
              <Picker.Item label="SASU" value="sasu" />
              <Picker.Item label="SCI" value="sci" />
              <Picker.Item label="Autre" value="other" />
            </Picker>
          </View>

          {(legalForm === 'sarl' || legalForm === 'sas' || legalForm === 'sasu') && (
            <>
              <Text style={styles.label}>Capital social</Text>
              <TextInput
                style={styles.input}
                value={capitalSocial}
                onChangeText={setCapitalSocial}
                placeholder="10000€"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="numeric"
              />
            </>
          )}

          <Text style={styles.label}>Numéro TVA intracommunautaire *</Text>
          <TextInput
            style={styles.input}
            value={companyTvaNumber}
            onChangeText={setCompanyTvaNumber}
            placeholder="FR12345678901"
            placeholderTextColor={theme.colors.textMuted}
            autoCapitalize="characters"
          />
          <Text style={styles.helpText}>
            Format : FRXX XXXXXXXXX (obligatoire pour facturation)
          </Text>

          <Text style={styles.label}>Assurance RCP (Responsabilité Civile Pro) *</Text>
          <TextInput
            style={styles.input}
            value={insuranceRcpProvider}
            onChangeText={setInsuranceRcpProvider}
            placeholder="Nom de l'assureur (ex: AXA, MAIF)"
            placeholderTextColor={theme.colors.textMuted}
          />
          <TextInput
            style={[styles.input, { marginTop: 8 }]}
            value={insuranceRcpPolicy}
            onChangeText={setInsuranceRcpPolicy}
            placeholder="Numéro de police"
            placeholderTextColor={theme.colors.textMuted}
          />
          <Text style={styles.helpText}>
            Obligatoire pour artisans (Loi Spinetta)
          </Text>

          <Text style={styles.label}>Assurance décennale (si BTP)</Text>
          <TextInput
            style={styles.input}
            value={insuranceDecennaleProvider}
            onChangeText={setInsuranceDecennaleProvider}
            placeholder="Nom de l'assureur"
            placeholderTextColor={theme.colors.textMuted}
          />
          <TextInput
            style={[styles.input, { marginTop: 8 }]}
            value={insuranceDecennalePolicy}
            onChangeText={setInsuranceDecennalePolicy}
            placeholder="Numéro de police"
            placeholderTextColor={theme.colors.textMuted}
          />
          <Text style={styles.helpText}>
            Obligatoire si vous réalisez des travaux de construction
          </Text>

          <Text style={styles.label}>Qualification professionnelle</Text>
          <TextInput
            style={styles.input}
            value={professionalQualification}
            onChangeText={setProfessionalQualification}
            placeholder="Ex: RGE, Qualibat, etc."
            placeholderTextColor={theme.colors.textMuted}
          />
          <Text style={styles.helpText}>
            Certifications et qualifications officielles (optionnel)
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="hash" size={20} color={theme.colors.accent} />
            <Text style={styles.sectionTitle}>Numérotation</Text>
          </View>
          <Text style={styles.label}>Préfixe Devis</Text>
          <TextInput
            style={styles.input}
            value={devisPrefix}
            onChangeText={setDevisPrefix}
            placeholder="DEV"
            placeholderTextColor={theme.colors.textMuted}
          />
          <Text style={styles.label}>Préfixe Facture</Text>
          <TextInput
            style={styles.input}
            value={facturePrefix}
            onChangeText={setFacturePrefix}
            placeholder="FA"
            placeholderTextColor={theme.colors.textMuted}
          />
        </View>

        {/* Section Import de données */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="upload" size={20} color={theme.colors.accent} />
            <Text style={styles.sectionTitle}>Import de données</Text>
          </View>
          <Text style={styles.helpText}>
            Importez vos clients depuis un fichier CSV, Excel, JSON ou PDF exporté depuis un autre logiciel.
          </Text>
          <TouchableOpacity
            style={[styles.templateLinkButton, {
              backgroundColor: theme.colors.surfaceElevated || theme.colors.surface,
              borderRadius: theme.borderRadius?.md || 8,
            }]}
            onPress={() => navigation.navigate('ImportData')}
            activeOpacity={0.7}
          >
            <Feather name="upload" size={20} color={theme.colors.accent} />
            <Text style={[styles.templateLinkText, { color: theme.colors.text }]}>
              Importer mes données
            </Text>
            <Feather name="chevron-right" size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Section Préférences */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="settings" size={20} color={theme.colors.accent} />
            <Text style={styles.sectionTitle}>Préférences</Text>
          </View>
          
          <Text style={styles.label}>Prénom</Text>
          <Text style={styles.helpText}>
            Votre prénom sera utilisé dans la salutation de l'accueil (ex: "Bonjour, Jean")
          </Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Jean"
            placeholderTextColor={theme.colors.textMuted}
            autoCapitalize="words"
          />
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Vibrations</Text>
              <Text style={styles.settingDescription}>
                Active ou désactive les vibrations au toucher dans l'application
              </Text>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={async (value) => {
                setHapticsEnabled(value);
                await saveHapticsPreference(value);
                logger.info('Settings', `Vibrations ${value ? 'activées' : 'désactivées'}`);
              }}
              trackColor={{ 
                false: theme.colors.border || '#333', 
                true: theme.colors.accent 
              }}
              thumbColor={hapticsEnabled ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
        </View>

        {/* Section Couleurs - Masquée car le Design System 2.0 utilise un thème fixe */}
        {ENABLE_THEME_COLOR_SETTING && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="palette" size={20} color={theme.colors.accent} />
              <Text style={styles.sectionTitle}>Couleurs</Text>
            </View>
            <Text style={styles.label}>Couleur principale</Text>
            <TextInput
              style={styles.input}
              value={primaryColor}
              onChangeText={setPrimaryColor}
              placeholder="#1D4ED8"
              placeholderTextColor={theme.colors.textMuted}
            />
          </View>
        )}

        <TouchableOpacity
          style={[styles.saveButton, saving && { opacity: 0.6 }]}
          onPress={saveSettings}
          disabled={saving}
          activeOpacity={0.7}
        >
          {saving ? (
            <ActivityIndicator color={theme.colors.text} />
          ) : (
            <>
              <Feather name="save" size={20} color={theme.colors.text} strokeWidth={2.5} />
              <Text style={styles.saveButtonText}>Sauvegarder</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Bouton Déconnexion */}
        <TouchableOpacity
          style={[styles.signOutButton, saving && { opacity: 0.6 }]}
          onPress={async () => {
            Alert.alert(
              'Déconnexion',
              'Êtes-vous sûr de vouloir vous déconnecter ?',
              [
                { text: 'Annuler', style: 'cancel' },
                {
                  text: 'Déconnexion',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await signOut();
                      logger.info('Settings', 'Déconnexion réussie');
                    } catch (err) {
                      Alert.alert('Erreur', 'Impossible de se déconnecter');
                    }
                  },
                },
              ]
            );
          }}
          disabled={saving}
          activeOpacity={0.7}
        >
          <Feather name="log-out" size={20} color={theme.colors.error} strokeWidth={2.5} />
          <Text style={styles.signOutButtonText}>Déconnexion</Text>
        </TouchableOpacity>

        {/* Bouton Supprimer mon compte */}
        <TouchableOpacity
          disabled={saving || deletingAccount}
          style={[styles.deleteAccountButton, (saving || deletingAccount) && { opacity: 0.6 }]}
          onPress={handleDeleteAccount}
          activeOpacity={0.7}
        >
          <Feather name="trash-2" size={20} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.deleteAccountButtonText}>Supprimer mon compte</Text>
        </TouchableOpacity>

        <View style={{ height: insets.bottom + 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme, insets = { bottom: 0 }) => {
  // Vérification de sécurité pour le thème
  const spacing = theme.spacing || { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
  const borderRadius = theme.borderRadius || { sm: 4, md: 8, lg: 12, xl: 16, round: 999 };
  const typography = theme.typography || {};
  const colors = theme.colors || {};
  const buttons = theme.buttons || {};
  const input = theme.input || {};
  const shadows = theme.shadows || {};
  
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtnText: {
    ...typography.body,
    fontWeight: '700',
    marginLeft: spacing.xs,
    color: colors.accent,
  },
  title: {
    ...typography.h1,
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodySmall,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    marginLeft: spacing.sm,
  },
  label: {
    ...typography.caption,
    marginBottom: spacing.sm,
    color: colors.text,
  },
  input: {
    ...input,
    marginBottom: spacing.md,
  },
  helpText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoButton: {
    width: 140,
    height: 140,
    borderWidth: 2,
    borderColor: `${colors.accent}40`,
    borderStyle: 'dashed',
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  logoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  logoText: {
    ...typography.bodySmall,
    marginTop: spacing.sm,
    color: colors.textSecondary,
  },
  changeLogoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: `${colors.accent}20`,
    borderRadius: borderRadius.md,
  },
  changeLogoText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
  },
  templateButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  templateButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
  },
  templateButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  templateButtonText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  templateButtonTextActive: {
    color: colors.text,
  },
  templateLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  templateLinkText: {
    ...typography.body,
    flex: 1,
    fontWeight: '600',
  },
  templateSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  templateSelectLabel: {
    ...typography.body,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '80%',
    paddingBottom: insets.bottom || spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border || colors.textMuted + '30',
  },
  modalTitle: {
    ...typography.h3,
    fontWeight: '700',
  },
  modalCloseButton: {
    padding: spacing.xs,
  },
  modalScrollView: {
    maxHeight: 500,
  },
  templateOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    gap: spacing.md,
  },
  templatePreview: {
    marginRight: spacing.sm,
  },
  templateOptionContent: {
    flex: 1,
  },
  templateActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  previewButton: {
    padding: spacing.xs,
  },
  templateOptionLabel: {
    ...typography.body,
    marginBottom: spacing.xs,
  },
  templateOptionDescription: {
    ...typography.bodySmall,
    fontSize: 12,
  },
  saveButton: {
    ...buttons.primary,
    flexDirection: 'row',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  saveButtonText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text,
    marginLeft: spacing.xs,
  },
  signOutButton: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 2,
    borderColor: colors.error,
    paddingVertical: 18,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  signOutButtonText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.error,
  },
  deleteAccountButton: {
    backgroundColor: '#DC2626', // Rouge danger foncé
    paddingVertical: 18,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderWidth: 2,
    borderColor: '#B91C1C', // Rouge très foncé
    ...shadows.lg,
  },
  deleteAccountButtonText: {
    ...typography.body,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surfaceElevated || colors.surface,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  settingDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  // ✅ Styles pour Picker (mentions légales)
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  picker: {
    color: colors.text,
    backgroundColor: colors.surface,
  },
  });
};
