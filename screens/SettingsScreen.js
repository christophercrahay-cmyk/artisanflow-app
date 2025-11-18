// Refonte premium SettingsScreen – Max
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
import { AFInput } from '../components/ui';
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
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('SettingsScreen', 'Utilisateur non connecté');
        return;
      }
      
      const { data, error } = await supabase
        .from('brand_settings')
        .select('*')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      if (error) {
        if (error.code !== 'PGRST116') {
          console.error('Erreur chargement settings:', error);
        }
        return;
      }

      if (data) {
        setSettingsId(data.id);
        setCompanyName(data.company_name || 'Mon Entreprise');
        setCompanySiret(data.company_siret || '');
        setCompanyAddress(data.company_address || '');
        setCompanyPhone(data.company_phone || '');
        setCompanyEmail(data.company_email || '');
        setTvaDefault(data.tva_default?.toString() || '20');
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
        mediaTypes: ImagePicker.MediaType.Images,
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

      const { error: rpcError } = await supabase.rpc('delete_user_account');
      
      if (rpcError) {
        logger.warn('Settings', 'RPC delete_user_account non disponible, suppression manuelle');
        
        const { error: clientsError } = await supabase
          .from('clients')
          .delete()
          .eq('user_id', user.id);
        
        if (clientsError) {
          logger.error('Settings', 'Erreur suppression clients', clientsError);
        }
        
        const { error: settingsError } = await supabase
          .from('brand_settings')
          .delete()
          .eq('user_id', user.id);
        
        if (settingsError) {
          logger.error('Settings', 'Erreur suppression settings', settingsError);
        }
      }

      logger.success('Settings', 'Données utilisateur supprimées');
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

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {throw new Error('Utilisateur non authentifié');}

      const settingsData = {
        company_name: companyName.trim(),
        company_siret: companySiret.trim(),
        company_address: companyAddress.trim(),
        company_phone: companyPhone.trim(),
        company_email: companyEmail.trim(),
        tva_default: parseFloat(tvaDefault) || 20,
        template_default: templateDefault === 'premium' ? 'premiumNoirOr' : templateDefault,
        devis_prefix: devisPrefix.trim(),
        facture_prefix: facturePrefix.trim(),
        primary_color: primaryColor.trim(),
        logo_url: logoUrl,
        first_name: firstName.trim() || null,
        updated_at: new Date().toISOString(),
        user_id: user.id,
        
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={24} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.title}>Paramètres</Text>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* CARD 1 : Identité & Logo */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Feather name="image" size={20} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Identité & Logo</Text>
          </View>
          
          <View style={styles.logoContainer}>
            <TouchableOpacity style={styles.logoButton} onPress={handleLogoPick} activeOpacity={0.7}>
              {logoUrl ? (
                <Image source={{ uri: logoUrl }} style={styles.logoImage} />
              ) : (
                <View style={styles.logoPlaceholder}>
                  <Feather name="image" size={32} color="#9CA3AF" />
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
                <Text style={styles.changeLogoText}>Changer le logo</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.label}>Nom entreprise</Text>
          <AFInput
            icon="briefcase"
            value={companyName}
            onChangeText={setCompanyName}
            placeholder="Mon Entreprise"
          />

          <Text style={styles.label}>SIRET</Text>
          <AFInput
            icon="hash"
            value={companySiret}
            onChangeText={setCompanySiret}
            placeholder="12345678901234"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Adresse</Text>
          <AFInput
            icon="map-pin"
            value={companyAddress}
            onChangeText={setCompanyAddress}
            placeholder="123 rue de la République"
            multiline
          />

          <Text style={styles.label}>Téléphone</Text>
          <AFInput
            icon="phone"
            value={companyPhone}
            onChangeText={setCompanyPhone}
            placeholder="0123456789"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Email</Text>
          <AFInput
            icon="mail"
            value={companyEmail}
            onChangeText={setCompanyEmail}
            placeholder="contact@entreprise.fr"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* CARD 2 : Facturation */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Feather name="tag" size={20} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Facturation</Text>
          </View>

          <Text style={styles.label}>TVA par défaut (%)</Text>
          <AFInput
            icon="percent"
            value={tvaDefault}
            onChangeText={setTvaDefault}
            keyboardType="decimal-pad"
            placeholder="20"
          />

          <Text style={styles.label}>Modèle de document</Text>
          <Pressable
            style={styles.dropdown}
            onPress={() => setShowTemplateModal(true)}
          >
            <Text style={styles.dropdownText}>
              {DOCUMENT_TEMPLATES[templateDefault]?.label || 'Classique'}
            </Text>
            <Feather name="chevron-down" size={20} color="#9CA3AF" />
          </Pressable>

          <Text style={styles.label}>Préfixe devis</Text>
          <AFInput
            icon="hash"
            value={devisPrefix}
            onChangeText={setDevisPrefix}
            placeholder="DEV"
          />

          <Text style={styles.label}>Préfixe facture</Text>
          <AFInput
            icon="hash"
            value={facturePrefix}
            onChangeText={setFacturePrefix}
            placeholder="FA"
          />
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
              style={styles.modalContent}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Choisir un modèle de document
                </Text>
                <TouchableOpacity
                  onPress={() => setShowTemplateModal(false)}
                  style={styles.modalCloseButton}
                >
                  <Feather name="x" size={24} color="#9CA3AF" />
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
                            ? '#3E7BFA20'
                            : '#1C1F24',
                          borderColor: isSelected
                            ? '#3E7BFA'
                            : 'rgba(255,255,255,0.05)',
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
                              color: isSelected ? '#3E7BFA' : '#FFFFFF',
                              fontWeight: isSelected ? '700' : '500',
                            },
                          ]}
                        >
                          {template.label}
                        </Text>
                        <Text
                          style={[
                            styles.templateOptionDescription,
                            { color: '#9CA3AF' },
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
                          <Feather name="eye" size={18} color="#3E7BFA" />
                        </TouchableOpacity>
                        {isSelected && (
                          <Feather name="check" size={20} color="#3E7BFA" />
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>

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

        {/* CARD 3 : Mentions légales */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Feather name="shield" size={20} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Mentions légales</Text>
          </View>

          <Text style={styles.label}>Forme juridique</Text>
          <View style={styles.dropdownContainer}>
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
              <Picker.Item label="EI" value="ei" />
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
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
              />
            </>
          )}

          <Text style={styles.label}>TVA intracommunautaire</Text>
          <TextInput
            style={styles.input}
            value={companyTvaNumber}
            onChangeText={setCompanyTvaNumber}
            placeholder="FR12345678901"
            placeholderTextColor="#6B7280"
            autoCapitalize="characters"
          />

          <Text style={styles.label}>Assurance RCP (nom)</Text>
          <TextInput
            style={styles.input}
            value={insuranceRcpProvider}
            onChangeText={setInsuranceRcpProvider}
            placeholder="Nom de l'assureur (ex: AXA, MAIF)"
            placeholderTextColor="#6B7280"
          />
          <Text style={styles.label}>Assurance RCP (numéro)</Text>
          <TextInput
            style={styles.input}
            value={insuranceRcpPolicy}
            onChangeText={setInsuranceRcpPolicy}
            placeholder="Numéro de police"
            placeholderTextColor="#6B7280"
          />

          <Text style={styles.label}>Assurance Décennale (nom)</Text>
          <TextInput
            style={styles.input}
            value={insuranceDecennaleProvider}
            onChangeText={setInsuranceDecennaleProvider}
            placeholder="Nom de l'assureur"
            placeholderTextColor="#6B7280"
          />
          <Text style={styles.label}>Assurance Décennale (numéro)</Text>
          <TextInput
            style={styles.input}
            value={insuranceDecennalePolicy}
            onChangeText={setInsuranceDecennalePolicy}
            placeholder="Numéro de police"
            placeholderTextColor="#6B7280"
          />

          <Text style={styles.label}>Qualification professionnelle</Text>
          <TextInput
            style={styles.input}
            value={professionalQualification}
            onChangeText={setProfessionalQualification}
            placeholder="Ex: RGE, Qualibat, etc."
            placeholderTextColor="#6B7280"
          />
        </View>

        {/* CARD 4 : Import de données */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Feather name="upload" size={20} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Import de données</Text>
          </View>
          <TouchableOpacity
            style={styles.importButton}
            onPress={() => navigation.navigate('ImportData')}
            activeOpacity={0.7}
          >
            <Feather name="upload" size={20} color="#FFFFFF" />
            <Text style={styles.importButtonText}>Importer mes données</Text>
          </TouchableOpacity>
          <Text style={styles.importInfo}>
            Importez vos clients depuis un fichier CSV, Excel, JSON ou PDF exporté depuis un autre logiciel.
          </Text>
        </View>

        {/* CARD 5 : Préférences */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Feather name="settings" size={20} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Préférences</Text>
          </View>
          
          <Text style={styles.label}>Prénom</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Jean"
            placeholderTextColor="#6B7280"
            autoCapitalize="words"
          />
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Vibrations</Text>
            <Switch
              value={hapticsEnabled}
              onValueChange={async (value) => {
                setHapticsEnabled(value);
                await saveHapticsPreference(value);
                logger.info('Settings', `Vibrations ${value ? 'activées' : 'désactivées'}`);
              }}
              trackColor={{ 
                false: '#374151', 
                true: '#3E7BFA' 
              }}
              thumbColor="#FFFFFF"
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, saving && { opacity: 0.6 }]}
            onPress={saveSettings}
            disabled={saving}
            activeOpacity={0.7}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Feather name="save" size={18} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.saveButtonText}>Sauvegarder</Text>
              </>
            )}
          </TouchableOpacity>

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
            <Feather name="log-out" size={18} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.signOutButtonText}>Déconnexion</Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={saving || deletingAccount}
            style={[styles.deleteAccountButton, (saving || deletingAccount) && { opacity: 0.6 }]}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
          >
            <Feather name="trash-2" size={18} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.deleteAccountButtonText}>Supprimer mon compte</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme, insets = { bottom: 0 }) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#0D0F12',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 16,
    },
    backBtn: {
      marginRight: 12,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 20,
      paddingBottom: 40,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0D0F12',
    },
    // Cards
    card: {
      backgroundColor: '#15171C',
      borderRadius: 20,
      padding: 20,
      marginBottom: 24,
      borderColor: 'rgba(255,255,255,0.05)',
      borderWidth: 1,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      gap: 10,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: '#FFFFFF',
      marginBottom: 8,
      marginTop: 4,
    },
    input: {
      backgroundColor: '#1C1F24',
      borderRadius: 14,
      paddingVertical: 12,
      paddingHorizontal: 16,
      fontSize: 16,
      color: '#FFFFFF',
      marginBottom: 14,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.05)',
    },
    // Logo
    logoContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    logoButton: {
      width: 100,
      height: 100,
      borderWidth: 2,
      borderColor: 'rgba(62, 123, 250, 0.3)',
      borderStyle: 'dashed',
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#1C1F24',
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
      fontSize: 12,
      color: '#9CA3AF',
      marginTop: 8,
    },
    changeLogoButton: {
      marginTop: 12,
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    changeLogoText: {
      fontSize: 13,
      color: '#3E7BFA',
      fontWeight: '600',
    },
    // Dropdown
    dropdown: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#1C1F24',
      borderRadius: 14,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.05)',
      marginBottom: 14,
      height: 52,
    },
    dropdownText: {
      fontSize: 16,
      color: '#FFFFFF',
      flex: 1,
    },
    dropdownContainer: {
      backgroundColor: '#1C1F24',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.05)',
      marginBottom: 14,
      overflow: 'hidden',
      height: 52,
    },
    picker: {
      color: '#FFFFFF',
      backgroundColor: '#1C1F24',
    },
    // Import
    importButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#3E7BFA',
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 20,
      gap: 10,
      marginBottom: 12,
    },
    importButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    importInfo: {
      fontSize: 13,
      color: '#9CA3AF',
      lineHeight: 18,
    },
    // Settings
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: '#1C1F24',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.05)',
      marginTop: 4,
      marginBottom: 14,
    },
    settingLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    // Buttons
    saveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#3E7BFA',
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 20,
      marginTop: 8,
      marginBottom: 12,
      gap: 10,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    signOutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#262B33',
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 20,
      marginBottom: 12,
      gap: 10,
    },
    signOutButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    deleteAccountButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#D9534F',
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 20,
      marginBottom: 0,
      gap: 10,
    },
    deleteAccountButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: '#15171C',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '80%',
      paddingBottom: insets.bottom || 20,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    modalCloseButton: {
      padding: 4,
    },
    modalScrollView: {
      maxHeight: 500,
    },
    templateOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      marginHorizontal: 20,
      marginTop: 12,
      borderRadius: 12,
      borderWidth: 1,
      gap: 12,
    },
    templatePreview: {
      marginRight: 8,
    },
    templateOptionContent: {
      flex: 1,
    },
    templateActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    previewButton: {
      padding: 4,
    },
    templateOptionLabel: {
      fontSize: 16,
      marginBottom: 4,
    },
    templateOptionDescription: {
      fontSize: 12,
      color: '#9CA3AF',
    },
  });
};
