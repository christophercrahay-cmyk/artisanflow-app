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
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../supabaseClient';
import { useAppStore } from '../store/useAppStore';
import { useSafeTheme } from '../theme/useSafeTheme';
import { Feather } from '@expo/vector-icons';
import { signOut } from '../utils/auth';
import logger from '../utils/logger';

export default function SettingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const theme = useSafeTheme();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settingsId, setSettingsId] = useState(null);
  
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

  const styles = useMemo(() => getStyles(theme), [theme]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('brand_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur chargement settings:', error);
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
        setTemplateDefault(data.template_default || 'classique');
        setDevisPrefix(data.devis_prefix || 'DEV');
        setFacturePrefix(data.facture_prefix || 'FA');
        setPrimaryColor(data.primary_color || '#1D4ED8');
        setLogoUrl(data.logo_url);
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

      if (result.canceled) return;

      const uri = result.assets[0].uri;
      const fileName = `logo_${Date.now()}.jpg`;
      const resp = await fetch(uri);
      const arrayBuffer = await resp.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('project-photos')
        .upload(`logo/${fileName}`, bytes, { contentType: 'image/jpeg', upsert: true });

      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from('project-photos').getPublicUrl(uploadData.path);
      setLogoUrl(urlData.publicUrl);
    } catch (err) {
      console.error('Erreur upload logo:', err);
      Alert.alert('Erreur', 'Impossible d\'uploader le logo');
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);

      // Récupérer l'utilisateur connecté pour RLS
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      const settingsData = {
        company_name: companyName.trim(),
        company_siret: companySiret.trim(),
        company_address: companyAddress.trim(),
        company_phone: companyPhone.trim(),
        company_email: companyEmail.trim(),
        tva_default: parseFloat(tvaDefault) || 20,
        template_default: templateDefault,
        devis_prefix: devisPrefix.trim(),
        facture_prefix: facturePrefix.trim(),
        primary_color: primaryColor.trim(),
        logo_url: logoUrl,
        updated_at: new Date().toISOString(),
        user_id: user.id, // Nécessaire pour RLS
      };

      if (settingsId) {
        const { error } = await supabase
          .from('brand_settings')
          .update(settingsData)
          .eq('id', settingsId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase.from('brand_settings').insert([settingsData]);
        if (error) throw error;
      }

      Alert.alert('✅ Succès', 'Paramètres sauvegardés');
      await loadSettings();
    } catch (err) {
      console.error('Erreur sauvegarde settings:', err);
      Alert.alert('Erreur', err.message || 'Impossible de sauvegarder');
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
            <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
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
          <Text style={styles.label}>Template par défaut</Text>
          <View style={styles.templateButtons}>
            {['minimal', 'classique', 'bandeBleue'].map((template) => (
              <TouchableOpacity
                key={template}
                style={[
                  styles.templateButton,
                  templateDefault === template && styles.templateButtonActive,
                ]}
                onPress={() => setTemplateDefault(template)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.templateButtonText,
                    templateDefault === template && styles.templateButtonTextActive,
                  ]}
                >
                  {template === 'minimal' ? 'Minimal' : template === 'classique' ? 'Classique' : 'Bande Bleue'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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

        <View style={{ height: insets.bottom + 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
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
    ...theme.typography.body,
    fontWeight: '700',
    marginLeft: theme.spacing.xs,
    color: theme.colors.accent,
  },
  title: {
    ...theme.typography.h1,
    fontSize: 32,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.bodySmall,
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.h4,
    marginLeft: theme.spacing.sm,
  },
  label: {
    ...theme.typography.caption,
    marginBottom: theme.spacing.sm,
    color: theme.colors.text,
  },
  input: {
    ...theme.input,
    marginBottom: theme.spacing.md,
  },
  helpText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
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
    borderColor: theme.colors.accent + '40',
    borderStyle: 'dashed',
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
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
    ...theme.typography.bodySmall,
    marginTop: theme.spacing.sm,
    color: theme.colors.textSecondary,
  },
  changeLogoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.accent + '20',
    borderRadius: theme.borderRadius.md,
  },
  changeLogoText: {
    ...theme.typography.caption,
    color: theme.colors.accent,
    fontWeight: '700',
  },
  templateButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  templateButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
  },
  templateButtonActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  templateButtonText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  templateButtonTextActive: {
    color: theme.colors.text,
  },
  saveButton: {
    ...theme.buttons.primary,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  saveButtonText: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.text,
    marginLeft: theme.spacing.xs,
  },
  signOutButton: {
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 2,
    borderColor: theme.colors.error,
    paddingVertical: 18,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  signOutButtonText: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.error,
  },
});
