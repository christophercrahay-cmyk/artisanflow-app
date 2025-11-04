import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../supabaseClient';
import { formatAddress, prepareClientData } from '../utils/addressFormatter';
import { useSafeTheme } from '../theme/useSafeTheme';
import { Feather } from '@expo/vector-icons';
import { getCurrentUser } from '../utils/auth';
import logger from '../utils/logger';
import EmptyState from '../components/EmptyState';
import { showSuccess, showError } from '../components/Toast';

export default function ClientsListScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const theme = useSafeTheme();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const styles = useMemo(() => getStyles(theme), [theme]);

  const loadClients = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        logger.warn('ClientsList', 'Pas de user connecté');
        return;
      }

      logger.info('ClientsList', `Chargement clients pour user: ${user.id}`);
      
      const { data, error } = await supabase
        .from('clients')
        .select('id,name,phone,email,address,created_at')
        .order('created_at', { ascending: false });
      
      if (error) {
        logger.error('ClientsList', 'Erreur chargement clients', error);
        showError('Impossible de charger les clients');
        return;
      }
      logger.info('ClientsList', `${data?.length || 0} clients chargés`);
      setClients(data || []);
    } catch (err) {
      logger.error('ClientsList', 'Exception chargement clients', err);
      showError('Erreur lors du chargement des clients');
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const addClient = async () => {
    if (!name.trim()) {
      showError('Le nom du client est obligatoire');
      return;
    }
    if (!address.trim()) {
      showError('L\'adresse du client est obligatoire');
      return;
    }
    const emailTrim = email.trim();
    if (emailTrim && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      showError('L\'email n\'est pas valide');
      return;
    }
    
    try {
      setLoading(true);
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('Pas de user connecté');
      }

      logger.info('ClientsList', `Création client pour user: ${user.id}`);
      
      const clientData = prepareClientData({
        name: name.trim(),
        phone: phone.trim() || null,
        email: emailTrim || null,
        address: address.trim(),
        postalCode: postalCode.trim() || null,
        city: city.trim() || null,
      });
      
      const { error } = await supabase.from('clients').insert([clientData]);
      if (error) {
        logger.error('ClientsList', 'Erreur création client', error);
        throw error;
      }
      
      logger.success('ClientsList', 'Client créé', { clientName: name.trim() });
      
      setName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setPostalCode('');
      setCity('');
      
      await loadClients();
      showSuccess('Client ajouté');
    } catch (e) {
      showError(e.message || 'Impossible d\'ajouter le client');
    } finally {
      setLoading(false);
    }
  };

  const deleteClient = async (id) => {
    Alert.alert(
      'Supprimer ce client ?',
      'Cette action est définitive.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.from('clients').delete().eq('id', id);
              if (error) {
                logger.error('ClientsList', 'Erreur suppression client', error);
                showError('Erreur lors de la suppression du client');
                return;
              }
              await loadClients();
              showSuccess('Client supprimé');
            } catch (err) {
              logger.error('ClientsList', 'Exception suppression client', err);
              showError('Erreur lors de la suppression du client');
            }
          },
        },
      ]
    );
  };

  const filteredClients = clients.filter((client) => {
    const query = searchQuery.toLowerCase();
    return (
      client.name.toLowerCase().includes(query) ||
      (client.email && client.email.toLowerCase().includes(query)) ||
      (client.phone && client.phone.includes(query))
    );
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Text style={styles.title}>Clients</Text>
            <Text style={styles.subtitle}>Gestion de votre base client</Text>
          
            {/* Barre recherche */}
            <View style={styles.searchContainer}>
              <Feather name="search" size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher un client..."
                placeholderTextColor={theme.colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Formulaire ajouter client */}
            <View style={styles.formContainer}>
              <View style={styles.formHeader}>
                <Feather name="user-plus" size={24} color={theme.colors.accent} />
                <Text style={styles.formTitle}>Nouveau client</Text>
              </View>
              
              <TextInput
                style={styles.input}
                placeholder="Nom *"
                placeholderTextColor={theme.colors.textMuted}
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={styles.input}
                placeholder="Téléphone"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              <TextInput
                style={styles.input}
                placeholder="Adresse *"
                placeholderTextColor={theme.colors.textMuted}
                value={address}
                onChangeText={setAddress}
              />
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, { flex: 1, marginRight: 8 }]}
                  placeholder="Code postal"
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="numeric"
                  value={postalCode}
                  onChangeText={setPostalCode}
                />
                <TextInput
                  style={[styles.input, { flex: 2 }]}
                  placeholder="Ville"
                  placeholderTextColor={theme.colors.textMuted}
                  autoCapitalize="words"
                  value={city}
                  onChangeText={setCity}
                />
              </View>
              <TouchableOpacity
                style={[styles.primaryButton, loading && { opacity: 0.6 }]}
                onPress={addClient}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={theme.colors.text} />
                ) : (
                  <>
                    <Feather name="check" size={20} color={theme.colors.text} />
                    <Text style={styles.primaryButtonText}>AJOUTER</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Liste clients */}
            <View style={styles.sectionHeader}>
              <Feather name="users" size={20} color={theme.colors.accent} />
              <Text style={styles.sectionTitle}>
                Liste ({filteredClients.length})
              </Text>
            </View>

            {filteredClients.length === 0 ? (
              <EmptyState
                icon="users"
                title="Aucun client"
                subtitle={searchQuery ? "Aucun client ne correspond à votre recherche" : "Créez votre premier client pour commencer"}
              />
            ) : (
              filteredClients.map((client) => (
              <TouchableOpacity
                key={client.id}
                style={styles.clientCard}
                onPress={() => navigation.navigate('ClientDetail', { clientId: client.id })}
                activeOpacity={0.7}
              >
                <View style={styles.clientInfo}>
                  <View style={styles.clientHeader}>
                    <Feather name="user" size={18} color={theme.colors.accent} />
                    <Text style={styles.cardTitle}>{client.name}</Text>
                  </View>
                  {client.address ? (
                    <View style={styles.clientRow}>
                      <Feather name="map-pin" size={14} color={theme.colors.textSecondary} />
                      <Text style={styles.cardLine}>{client.address}</Text>
                    </View>
                  ) : null}
                  {client.phone ? (
                    <View style={styles.clientRow}>
                      <Feather name="phone" size={14} color={theme.colors.textSecondary} />
                      <Text style={styles.cardLine}>{client.phone}</Text>
                    </View>
                  ) : null}
                  {client.email ? (
                    <View style={styles.clientRow}>
                      <Feather name="mail" size={14} color={theme.colors.textSecondary} />
                      <Text style={styles.cardLine}>{client.email}</Text>
                    </View>
                  ) : null}
                </View>
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    deleteClient(client.id);
                  }}
                  style={styles.deleteButton}
                  activeOpacity={0.7}
                >
                  <Feather name="trash-2" size={18} color={theme.colors.error} />
                </TouchableOpacity>
              </TouchableOpacity>
              ))
            )}
          </View>
          <View style={{ height: insets.bottom }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    height: 56,
    marginBottom: theme.spacing.lg,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: 16,
    color: theme.colors.text,
  },
  formContainer: {
    backgroundColor: '#1E293B', // Premium dark gray
    borderRadius: 16, // Plus arrondi
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: '#334155', // Bordure fine discrète
    ...theme.shadows.lg, // Ombre plus prononcée
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  formTitle: {
    ...theme.typography.h4,
    marginLeft: theme.spacing.sm,
  },
  input: {
    ...theme.input,
    marginBottom: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
  },
  primaryButton: {
    ...theme.buttons.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  primaryButtonText: {
    ...theme.buttons.primaryText,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h4,
    marginLeft: theme.spacing.sm,
  },
  clientCard: {
    backgroundColor: '#1E293B', // Premium dark gray
    borderRadius: 16, // Plus arrondi
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#334155', // Bordure fine discrète
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...theme.shadows.md, // Ombre plus prononcée
  },
  clientInfo: {
    flex: 1,
  },
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  cardTitle: {
    ...theme.typography.h4,
    marginLeft: theme.spacing.sm,
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  cardLine: {
    ...theme.typography.bodySmall,
    marginLeft: theme.spacing.sm,
  },
  deleteButton: {
    padding: theme.spacing.sm,
  },
});
