/**
 * ClientsListScreen 2.0 - CRM Pro
 * Design System 2.0 - Niveau 11/10
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Pressable,
  Modal,
  ActivityIndicator,
  Linking,
  Keyboard,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as DocumentPicker from 'expo-document-picker';
import { useThemeColors } from '../theme/theme2';
import { ScreenContainer, AppCard, PrimaryButton, SectionTitle, AFInput } from '../components/ui';
import SearchBar from '../components/SearchBar';
import { supabase } from '../supabaseClient';
import { formatAddress, prepareClientData } from '../utils/addressFormatter';
import { getCurrentUser } from '../utils/auth';
import logger from '../utils/logger';
import EmptyState from '../components/EmptyState';
import { showSuccess, showError } from '../components/Toast';
import { playClickSound } from '../utils/soundService';
import { getErrorMessage, getDeleteConfirmationMessage } from '../utils/errorMessages';
import { requireProOrPaywall } from '../utils/proAccess';
import { importClientsFromParsedRows } from '../utils/import/importClients';
import { parseFileWithHeaders } from '../utils/import/importClientsWithMapping';
import { detectColumns, applyMapping, normalizeHeader } from '../utils/clientImportMapping';
import { getOrDetectMapping, saveMapping } from '../services/import/clientImportMemory';
import ClientImportMappingModal from '../components/clients/ClientImportMappingModal';
import { createCSVTemplateFile } from '../utils/import/generateCSVTemplate';
import * as Sharing from 'expo-sharing';
import { useNetworkStatus } from '../contexts/NetworkStatusContext';
import { cacheClients, loadCachedClients } from '../services/offlineCacheService';
import { useRequireOnline } from '../utils/requireOnline';

export default function ClientsListScreen2({ navigation }) {
  const theme = useThemeColors();
  const { isOffline } = useNetworkStatus();
  const { checkAndShowMessage } = useRequireOnline('Création de client');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  
  // États pour l'import
  const [showImportModal, setShowImportModal] = useState(false);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [parsedRows, setParsedRows] = useState(null);
  const [importError, setImportError] = useState(null);
  const [fileHeaders, setFileHeaders] = useState([]);
  const [fileRows, setFileRows] = useState([]);
  const [currentMapping, setCurrentMapping] = useState(null);
  const [headersSignature, setHeadersSignature] = useState(null);

  // Fonction de normalisation pour recherche "intelligente" (insensible à la casse et aux accents)
  const normalize = useCallback((value) => {
    if (!value) return '';
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // suppression accents
      .trim();
  }, []);

  // ✅ Filtrer les clients selon la recherche (temps réel)
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    
    const q = normalize(searchQuery);
    
    return clients.filter((client) => {
      const name = normalize(client.name);
      const company = normalize(client.company);
      const address = normalize(client.address);
      const email = normalize(client.email);
      const phone = normalize(client.phone?.toString());
      
      return (
        name.includes(q) ||
        company.includes(q) ||
        address.includes(q) ||
        email.includes(q) ||
        phone.includes(q)
      );
    });
  }, [clients, searchQuery, normalize]);

  const styles = useMemo(() => getStyles(theme), [theme]);

  const loadClients = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const user = await getCurrentUser();
      if (!user) {
        logger.warn('ClientsList', 'Pas de user connecté');
        return;
      }

      // Si hors ligne, charger depuis le cache
      if (isOffline) {
        logger.info('ClientsList', 'Mode hors ligne, chargement depuis cache');
        const cachedClients = await loadCachedClients();
        setClients(cachedClients);
        return;
      }

      logger.info('ClientsList', `Chargement clients pour user: ${user.id}`);
      
      const { data, error } = await supabase
        .from('clients')
        .select('id,name,phone,email,address,created_at')
        .eq('user_id', user.id)
        .order('name', { ascending: true });
      
      if (error) {
        logger.error('ClientsList', 'Erreur chargement clients', error);
        showError(getErrorMessage(error, 'load'));
        // En cas d'erreur, essayer de charger depuis le cache
        const cachedClients = await loadCachedClients();
        if (cachedClients.length > 0) {
          logger.info('ClientsList', 'Chargement depuis cache après erreur');
          setClients(cachedClients);
        }
        return;
      }
      logger.info('ClientsList', `${data?.length || 0} clients chargés`);
      setClients(data || []);
      
      // Mettre à jour le cache
      if (data && data.length > 0) {
        await cacheClients(data);
      }
    } catch (err) {
      logger.error('ClientsList', 'Exception chargement clients', err);
      // En cas d'erreur, essayer de charger depuis le cache
      const cachedClients = await loadCachedClients();
      if (cachedClients.length > 0) {
        logger.info('ClientsList', 'Chargement depuis cache après exception');
        setClients(cachedClients);
      } else {
        showError(getErrorMessage(err, 'load'));
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = useCallback(() => {
    loadClients(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadClients();
    }, [])
  );

  const addClient = async () => {
    // Vérifier la connexion
    if (!checkAndShowMessage()) {
      return;
    }

    // Vérifier l'accès Pro
    const ok = await requireProOrPaywall(navigation, 'Création client');
    if (!ok) return;

    logger.info('ClientsList', 'Début addClient', { name, address });
    
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
        logger.error('ClientsList', 'Pas de user connecté');
        throw new Error('Pas de user connecté');
      }

      logger.info('ClientsList', `Création client pour user: ${user.id}`);
      
      const clientData = await prepareClientData({
        name: name.trim(),
        phone: phone.trim() || null,
        email: emailTrim || null,
        address: address.trim(),
        postalCode: postalCode.trim() || null,
        city: city.trim() || null,
      }, user.id);
      
      logger.info('ClientsList', 'ClientData préparé', clientData);
      
      const { data, error } = await supabase.from('clients').insert([clientData]).select();
      if (error) {
        logger.error('ClientsList', 'Erreur création client', error);
        throw error;
      }
      
      logger.success('ClientsList', 'Client créé avec succès', data);
      
      setName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setPostalCode('');
      setCity('');
      
      await loadClients();
      showSuccess(`Client "${name}" ajouté avec succès`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      logger.error('ClientsList', 'Exception addClient', e);
      showError(getErrorMessage(e, 'save'));
      // Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  // Gérer l'import de clients avec mapping adaptatif
  const handleImportPress = async () => {
    // Vérifier l'accès Pro
    const ok = await requireProOrPaywall(navigation, 'Import de clients');
    if (!ok) return;

    try {
      // Ouvrir le sélecteur de fichiers
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'text/csv',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
          'application/vnd.ms-excel', // .xls
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      if (!file) {
        showError('Aucun fichier sélectionné');
        return;
      }

      // Déterminer le type de fichier
      const fileName = file.name?.toLowerCase() || '';
      let fileType;
      if (fileName.endsWith('.csv')) {
        fileType = 'csv';
      } else if (fileName.endsWith('.xlsx')) {
        fileType = 'xlsx';
      } else if (fileName.endsWith('.xls')) {
        fileType = 'xls';
      } else {
        showError('Format non supporté. Utilisez un fichier CSV ou Excel (.xlsx)');
        return;
      }

      // Parser le fichier avec headers
      setIsImporting(true);
      setImportError(null);

      try {
        const { headers, rows } = await parseFileWithHeaders(file.uri, fileType);

        logger.info('ClientsList', `Fichier parsé: ${headers.length} colonnes, ${rows.length} lignes`);
        logger.info('ClientsList', `Headers détectés:`, headers);
        if (rows.length > 0) {
          logger.info('ClientsList', `Première ligne exemple:`, JSON.stringify(rows[0], null, 2));
        }

        if (headers.length === 0) {
          showError('Format CSV non reconnu (aucune ligne d\'en-têtes)');
          setIsImporting(false);
          return;
        }

        if (rows.length === 0) {
          showError('Le fichier ne contient aucune ligne de données (seulement les en-têtes)');
          setIsImporting(false);
          return;
        }

        // Récupérer l'utilisateur pour la mémoire
        const user = await getCurrentUser();
        if (!user) {
          throw new Error('Utilisateur non connecté');
        }

        // Détecter ou récupérer le mapping
        let mapping, wasSaved, signature;
        try {
          const mappingResult = await getOrDetectMapping(user.id, headers);
          mapping = mappingResult.mapping;
          wasSaved = mappingResult.wasSaved;
          signature = mappingResult.signature;
          
          logger.info('ClientsList', `Mapping détecté/récupéré:`, JSON.stringify(mapping, null, 2));
          logger.info('ClientsList', `Mapping sauvegardé: ${wasSaved}, signature: ${signature}`);
        } catch (mappingError) {
          logger.error('ClientsList', 'Erreur détection mapping', mappingError);
          // En cas d'erreur, détecter manuellement
          const { autoMapping } = detectColumns(headers);
          mapping = autoMapping;
          wasSaved = false;
          signature = null;
          logger.info('ClientsList', 'Mapping de secours détecté:', JSON.stringify(mapping, null, 2));
        }
        
        // S'assurer que le mapping contient au moins le champ name
        if (!mapping || !mapping.name) {
          logger.warn('ClientsList', 'Aucun mapping pour "name" détecté, tentative de détection manuelle');
          const { autoMapping } = detectColumns(headers);
          if (autoMapping.name) {
            mapping = { ...mapping, ...autoMapping };
            logger.info('ClientsList', 'Mapping corrigé:', JSON.stringify(mapping, null, 2));
          } else {
            logger.error('ClientsList', 'Impossible de détecter le champ "Nom" dans les headers');
            showError('Impossible de détecter la colonne "Nom" dans votre fichier. Vérifiez que votre fichier contient bien une colonne avec "Nom" ou "Name".');
            setIsImporting(false);
            return;
          }
        }
        
        setHeadersSignature(signature);
        setFileHeaders(headers);
        setFileRows(rows);
        setCurrentMapping(mapping);
        setImportFile({ name: file.name, uri: file.uri, type: fileType });

        // Si mapping sauvegardé OU si le mapping auto-détecté est complet (name mappé), importer directement
        if (wasSaved || (mapping && mapping.name)) {
          if (wasSaved) {
            logger.info('ClientsList', 'Mapping sauvegardé trouvé, import direct');
          } else {
            logger.info('ClientsList', 'Mapping auto-détecté valide, import direct (bypass modale)');
          }
          await processImportWithMapping(mapping, rows, signature, user.id);
        } else {
          // Sinon, afficher la modale de mapping pour que l'utilisateur confirme
          logger.info('ClientsList', 'Affichage modale de mapping (mapping incomplet)');
          setShowMappingModal(true);
        }

        setIsImporting(false);
      } catch (parseError) {
        logger.error('ClientsList', 'Erreur parsing fichier', parseError);
        showError('Erreur lors de la lecture du fichier. Vérifiez que le fichier est bien un CSV.');
        setIsImporting(false);
        setImportError(parseError.message);
      }
    } catch (error) {
      logger.error('ClientsList', 'Erreur sélection fichier', error);
      showError(`Erreur lors de la sélection du fichier: ${error.message}`);
      setIsImporting(false);
      setImportError(error.message);
    }
  };

  // Traiter l'import avec un mapping donné
  const processImportWithMapping = async (
    mapping,
    rows,
    signature,
    userId
  ) => {
    try {
      setIsImporting(true);
      setImportError(null);

      logger.info('ClientsList', `processImportWithMapping: ${rows.length} lignes à traiter`);
      logger.info('ClientsList', `Mapping utilisé:`, JSON.stringify(mapping, null, 2));

      // Vérifier que le mapping contient au moins le champ "name"
      if (!mapping || !mapping.name) {
        logger.error('ClientsList', 'Mapping invalide: champ "name" manquant');
        showError('❌ Erreur: Le champ "Nom" doit être mappé. Veuillez vérifier votre fichier.');
        setIsImporting(false);
        return;
      }

      // Appliquer le mapping à chaque ligne
      const parsedClients = [];
      let skippedCount = 0;
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const parsed = applyMapping(row, mapping);
        if (parsed) {
          // Validation : nom obligatoire (email et phone sont optionnels)
          if (parsed.name && parsed.name.trim()) {
            parsedClients.push(parsed);
          } else {
            skippedCount++;
            logger.warn('ClientsList', `Ligne ${i + 2} ignorée: nom vide après mapping`);
          }
        } else {
          skippedCount++;
          logger.warn('ClientsList', `Ligne ${i + 2} ignorée: applyMapping retourné null`);
        }
      }

      logger.info('ClientsList', `${parsedClients.length} clients parsés, ${skippedCount} lignes ignorées`);

      if (parsedClients.length === 0) {
        logger.error('ClientsList', 'Aucun client valide après parsing');
        showError('❌ Aucun client valide trouvé dans le fichier. Vérifiez que le champ "Nom" est bien mappé et contient des données.');
        setIsImporting(false);
        return;
      }

      // Convertir en format attendu par importClientsFromParsedRows
      const formattedRows = parsedClients.map((client) => ({
        name: client.name,
        phone: client.phone,
        email: client.email,
        address: client.address,
        postalCode: client.postalCode,
        city: client.city,
      }));

      logger.info('ClientsList', `Début import ${formattedRows.length} clients`);
      logger.info('ClientsList', `Premier client exemple:`, JSON.stringify(formattedRows[0], null, 2));

      const result = await importClientsFromParsedRows(userId, formattedRows);
      
      logger.info('ClientsList', `Résultat import:`, JSON.stringify(result, null, 2));

      // Sauvegarder le mapping pour la prochaine fois
      if (signature && !currentMapping) {
        await saveMapping(userId, signature, mapping);
      }

      // Afficher le résultat
      if (result.imported > 0) {
        showSuccess(`✅ ${result.imported} client${result.imported > 1 ? 's' : ''} importé${result.imported > 1 ? 's' : ''} avec succès`);
      } else {
        showError('❌ Aucun client valide trouvé dans le fichier');
      }

      // Recharger la liste
      await loadClients();

      // Fermer les modales
      setShowMappingModal(false);
      setShowImportModal(false);
      setImportFile(null);
      setFileHeaders([]);
      setFileRows([]);
      setCurrentMapping(null);
      setHeadersSignature(null);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      logger.error('ClientsList', 'Erreur import clients', error);
      showError(`Erreur lors de l'import: ${error.message}`);
      setImportError(error.message);
    } finally {
      setIsImporting(false);
    }
  };

  // Gérer la confirmation du mapping
  const handleMappingConfirm = async (mapping) => {
    const user = await getCurrentUser();
    if (!user) {
      showError('Utilisateur non connecté');
      return;
    }

    // Sauvegarder le mapping
    if (headersSignature) {
      await saveMapping(user.id, headersSignature, mapping);
    }

    // Traiter l'import
    await processImportWithMapping(mapping, fileRows, headersSignature, user.id);
  };

  // Télécharger le template CSV
  const handleDownloadTemplate = async () => {
    try {
      const fileUri = await createCSVTemplateFile();
      const canShare = await Sharing.isAvailableAsync();
      
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Télécharger le modèle CSV',
        });
      } else {
        showError('Le partage de fichiers n\'est pas disponible sur cet appareil');
      }
    } catch (error) {
      logger.error('ClientsList', 'Erreur génération template', error);
      showError('Erreur lors de la génération du template');
    }
  };

  // Confirmer et exécuter l'import
  const handleConfirmImport = async () => {
    if (!parsedRows || parsedRows.length === 0) {
      showError('Aucune donnée à importer');
      return;
    }

    try {
      setIsImporting(true);
      setImportError(null);

      const user = await getCurrentUser();
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      logger.info('ClientsList', `Début import ${parsedRows.length} clients`);

      const result = await importClientsFromParsedRows(user.id, parsedRows);

      // Afficher le résultat
      let message = `Import terminé : ${result.imported} client${result.imported > 1 ? 's' : ''} ajouté${result.imported > 1 ? 's' : ''}`;
      if (result.skipped > 0) {
        message += `, ${result.skipped} ligne${result.skipped > 1 ? 's' : ''} ignorée${result.skipped > 1 ? 's' : ''}`;
      }
      if (result.errors && result.errors.length > 0) {
        message += `, ${result.errors.length} erreur${result.errors.length > 1 ? 's' : ''}`;
      }

      showSuccess(message);
      
      // Recharger la liste
      await loadClients();
      
      // Fermer le modal
      setShowImportModal(false);
      setImportFile(null);
      setParsedRows(null);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      logger.error('ClientsList', 'Erreur import clients', error);
      showError(`Erreur lors de l'import: ${error.message}`);
      setImportError(error.message);
    } finally {
      setIsImporting(false);
    }
  };

  const deleteClient = async (id, clientName) => {
    Alert.alert(
      'Supprimer le client',
      getDeleteConfirmationMessage(clientName || 'ce client', 'client'),
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
                showError(getErrorMessage(error, 'delete'));
                return;
              }
              await loadClients();
              showSuccess(`Client "${clientName || ''}" supprimé`);
            } catch (err) {
              logger.error('ClientsList', 'Exception suppression client', err);
              showError(getErrorMessage(err, 'delete'));
            }
          },
        },
      ]
    );
  };

  // Handlers pour téléphone et email cliquables
  const handleCall = (phone) => {
    if (!phone) return;
    const cleaned = phone.toString().replace(/\s+/g, '');
    const url = `tel:${cleaned}`;
    Linking.openURL(url).catch((err) => {
      console.warn('Erreur ouverture téléphone', err);
    });
  };

  const handleEmail = (email) => {
    if (!email) return;
    const url = `mailto:${email}`;
    Linking.openURL(url).catch((err) => {
      console.warn('Erreur ouverture email', err);
    });
  };


  return (
    <ScreenContainer 
      scrollable 
      contentStyle={styles.scrollContent}
      refreshing={refreshing}
      onRefresh={handleRefresh}
    >
      {/* BLOC 1 : Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          Clients
        </Text>
        <Text style={styles.subtitle}>
          Gestion de votre base client
        </Text>
      </View>
      
      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Rechercher un client..."
        />
      </View>

      {/* BLOC 2 : Formulaire d'ajout client */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Ajouter un client</Text>
        
        <AFInput
          icon="user"
          placeholder="Nom *"
          value={name}
          onChangeText={setName}
          onFocus={() => {
            setFocusedField('name');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            playClickSound();
          }}
          onBlur={() => setFocusedField(null)}
        />

        <AFInput
          icon="phone"
          placeholder="Téléphone"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          onFocus={() => {
            setFocusedField('phone');
          }}
          onBlur={() => setFocusedField(null)}
        />

        <AFInput
          icon="mail"
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          onFocus={() => {
            setFocusedField('email');
          }}
          onBlur={() => setFocusedField(null)}
        />

        <AFInput
          icon="map-pin"
          placeholder="Adresse *"
          value={address}
          onChangeText={setAddress}
          onFocus={() => {
            setFocusedField('address');
          }}
          onBlur={() => setFocusedField(null)}
        />

        <View style={styles.formRow}>
          <AFInput
            placeholder="Code postal"
            keyboardType="numeric"
            value={postalCode}
            onChangeText={setPostalCode}
            onFocus={() => {
              setFocusedField('postal');
            }}
            onBlur={() => setFocusedField(null)}
            containerStyle={{ flex: 1, marginRight: 7 }}
          />

          <AFInput
            icon="map-pin"
            placeholder="Ville"
            autoCapitalize="words"
            value={city}
            onChangeText={setCity}
            onFocus={() => {
              setFocusedField('city');
            }}
            onBlur={() => setFocusedField(null)}
            containerStyle={{ flex: 1, marginLeft: 7 }}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={addClient}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Feather name="check" size={18} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>Ajouter le client</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* BLOC 3 : Actions d'import */}
      <View style={styles.actionsCard}>
        <View style={styles.secondaryActionsRow}>
          <TouchableOpacity
            style={styles.secondaryActionButton}
            onPress={handleImportPress}
            disabled={isImporting}
          >
            <Feather name="upload" size={18} color="#FFFFFF" />
            <Text style={styles.secondaryActionText}>Importer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.premiumActionButton}
            onPress={() => {
              requireProOrPaywall(navigation, 'Import avec IA').then((ok) => {
                if (ok) {
                  navigation.navigate('ImportData');
                }
              });
            }}
          >
            <Text style={styles.premiumActionIcon}>⚡</Text>
            <Text style={styles.premiumActionText}>Importer avec IA</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.templateLink}
          onPress={handleDownloadTemplate}
        >
          <Feather name="file-text" size={14} color="#9CA3AF" />
          <Text style={styles.templateLinkText}>Télécharger modèle CSV</Text>
        </TouchableOpacity>
      </View>

      {/* BLOC 4 : Liste clients */}
      <View style={styles.listHeader}>
        <Feather name="users" size={20} color="#3B82F6" />
        <Text style={styles.listTitle}>Liste ({filteredClients.length})</Text>
      </View>

      {/* Liste clients */}
      {filteredClients.length === 0 ? (
        <EmptyState
          icon="users"
          title="Aucun client"
          subtitle={searchQuery ? "Aucun client ne correspond à votre recherche" : "Créez votre premier client pour commencer"}
        />
      ) : (
        filteredClients.map((client) => (
          <Pressable
            key={client.id}
            onPress={() => {
              navigation.navigate('ClientDetail', { clientId: client.id });
            }}
            style={({ pressed }) => [
              styles.cardPressable,
              pressed && styles.cardPressed,
            ]}
          >
            <View style={styles.clientCard}>
              <View style={styles.clientInfo}>
                <View style={styles.clientHeader}>
                  <Text style={styles.cardName} numberOfLines={1}>
                    {client.name}
                  </Text>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      deleteClient(client.id, client.name);
                    }}
                    style={styles.deleteButton}
                    accessibilityRole="button"
                    accessibilityLabel={`Supprimer ${client.name}`}
                  >
                    <Feather name="trash-2" size={18} color={theme.colors.danger} />
                  </TouchableOpacity>
                </View>
                {client.address && (
                  <View style={styles.infoRow}>
                    <Feather name="map-pin" size={14} color="#A4A9B3" style={styles.infoIcon} />
                    <Text style={styles.infoText} numberOfLines={2}>
                      {client.address}
                    </Text>
                  </View>
                )}
                {client.phone && (
                  <View style={styles.infoRow}>
                    <Feather name="phone" size={14} color="#A4A9B3" style={styles.infoIcon} />
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handleCall(client.phone);
                      }}
                      style={styles.infoTextWrapper}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel={`Appeler ${client.phone}`}
                    >
                      <Text style={styles.infoTextLink} numberOfLines={1}>
                        {client.phone}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
                {client.email && (
                  <View style={styles.infoRow}>
                    <Feather name="mail" size={14} color="#A4A9B3" style={styles.infoIcon} />
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handleEmail(client.email);
                      }}
                      style={styles.infoTextWrapper}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel={`Envoyer un email à ${client.email}`}
                    >
                      <Text style={styles.infoTextLink} numberOfLines={1}>
                        {client.email}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </Pressable>
        ))
      )}


      {/* Modal de confirmation d'import */}
      <Modal
        visible={showImportModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => !isImporting && setShowImportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Importer des clients
              </Text>
              {!isImporting && (
                <TouchableOpacity
                  onPress={() => setShowImportModal(false)}
                  style={styles.modalCloseButton}
                >
                  <Feather name="x" size={24} color={theme.colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {importError ? (
              <View style={styles.modalError}>
                <Feather name="alert-circle" size={24} color={theme.colors.error} />
                <Text style={[styles.modalErrorText, { color: theme.colors.error }]}>
                  {importError}
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.modalInfo}>
                  <Feather name="file-text" size={32} color={theme.colors.primary} />
                  <Text style={[styles.modalFileName, { color: theme.colors.text }]}>
                    {importFile?.name || 'Fichier'}
                  </Text>
                  <Text style={[styles.modalInfoText, { color: theme.colors.textMuted }]}>
                    {parsedRows?.length || 0} client{parsedRows?.length !== 1 ? 's' : ''} détecté{parsedRows?.length !== 1 ? 's' : ''}
                  </Text>
                  <Text style={[styles.modalMessage, { color: theme.colors.textMuted }]}>
                    Nous allons importer vos clients à partir de ce fichier.
                  </Text>
                </View>

                <View style={styles.modalActions}>
                  {!isImporting && (
                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalButtonCancel, {
                        borderColor: theme.colors.border,
                      }]}
                      onPress={() => setShowImportModal(false)}
                    >
                      <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>
                        Annuler
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonConfirm, {
                      backgroundColor: theme.colors.primary,
                      flex: isImporting ? 1 : 0,
                    }]}
                    onPress={handleConfirmImport}
                    disabled={isImporting}
                  >
                    {isImporting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Feather name="check" size={18} color="#FFFFFF" />
                        <Text style={styles.modalButtonTextConfirm}>
                          Importer maintenant
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Modale de mapping */}
      {showMappingModal && currentMapping && fileHeaders.length > 0 && (
        <ClientImportMappingModal
          visible={showMappingModal}
          headers={fileHeaders.map((h, i) => ({
            original: h,
            normalized: normalizeHeader(h),
            index: i,
          }))}
          autoMapping={currentMapping}
          onCancel={() => {
            logger.info('ClientsList', 'Modale de mapping annulée');
            setShowMappingModal(false);
            setIsImporting(false);
            setImportFile(null);
            setFileHeaders([]);
            setFileRows([]);
            setCurrentMapping(null);
            setHeadersSignature(null);
          }}
          onConfirm={handleMappingConfirm}
        />
      )}
    </ScreenContainer>
  );
}

const getStyles = (theme) => StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 160,
  },
  // BLOC 1 : Header
  header: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  searchContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  // BLOC 3 : Actions d'import
  actionsCard: {
    backgroundColor: '#15171C',
    borderRadius: 20,
    padding: 20,
    marginVertical: 20,
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3E7BFA',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 10,
  },
  primaryActionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  secondaryActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1F25',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 8,
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  premiumActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 8,
  },
  premiumActionIcon: {
    fontSize: 16,
  },
  premiumActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  templateLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  templateLinkText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  // BLOC 2 : Formulaire d'ajout client
  formCard: {
    backgroundColor: '#15171C',
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  formInput: {
    backgroundColor: '#1C1F25',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 14,
  },
  formInputFocused: {
    borderColor: '#3E7BFA',
    borderWidth: 1,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  formInputHalf: {
    flex: 1,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3E7BFA',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 8,
    gap: 10,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // BLOC 4 : Liste
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardPressable: {
    marginBottom: 12,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  clientCard: {
    backgroundColor: '#1A1D23',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  clientInfo: {
    flex: 1,
  },
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  infoIcon: {
    marginRight: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#A4A9B3',
    flex: 1,
  },
  infoTextWrapper: {
    flex: 1,
  },
  infoTextLink: {
    fontSize: 13,
    color: '#4DA3FF',
  },
  deleteButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Styles modal import
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: theme.typography.h2,
    fontWeight: theme.fontWeights.bold,
  },
  modalCloseButton: {
    padding: theme.spacing.xs,
  },
  modalError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.error + '10',
    marginBottom: theme.spacing.md,
  },
  modalErrorText: {
    flex: 1,
    fontSize: theme.typography.body,
  },
  modalInfo: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  modalFileName: {
    fontSize: theme.typography.h3,
    fontWeight: theme.fontWeights.semibold,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  modalInfoText: {
    fontSize: theme.typography.body,
    marginBottom: theme.spacing.sm,
  },
  modalMessage: {
    fontSize: theme.typography.body,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    minHeight: 48,
  },
  modalButtonCancel: {
    borderWidth: 1,
    flex: 1,
  },
  modalButtonConfirm: {
    flex: 1,
  },
  modalButtonText: {
    fontSize: theme.typography.body,
    fontWeight: theme.fontWeights.semibold,
  },
  modalButtonTextConfirm: {
    fontSize: theme.typography.body,
    fontWeight: theme.fontWeights.semibold,
    color: '#FFFFFF',
  },
});

