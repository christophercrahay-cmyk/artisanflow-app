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
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as DocumentPicker from 'expo-document-picker';
import { useThemeColors } from '../theme/theme2';
import { ScreenContainer, AppCard, PrimaryButton, SectionTitle } from '../components/ui';
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

export default function ClientsListScreen2({ navigation }) {
  const theme = useThemeColors();
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

  // ✅ Filtrer les clients selon la recherche
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    
    const query = searchQuery.toLowerCase().trim();
    return clients.filter(client => 
      client.name?.toLowerCase().includes(query) ||
      client.phone?.includes(query) ||
      client.email?.toLowerCase().includes(query) ||
      client.address?.toLowerCase().includes(query)
    );
  }, [clients, searchQuery]);

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

      logger.info('ClientsList', `Chargement clients pour user: ${user.id}`);
      
      const { data, error } = await supabase
        .from('clients')
        .select('id,name,phone,email,address,created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        logger.error('ClientsList', 'Erreur chargement clients', error);
        showError(getErrorMessage(error, 'load'));
        return;
      }
      logger.info('ClientsList', `${data?.length || 0} clients chargés`);
      setClients(data || []);
    } catch (err) {
      logger.error('ClientsList', 'Exception chargement clients', err);
      showError(getErrorMessage(err, 'load'));
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


  return (
    <ScreenContainer 
      scrollable 
      contentStyle={styles.scrollContent}
      refreshing={refreshing}
      onRefresh={handleRefresh}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text, letterSpacing: theme.letterSpacing.wide }]}>
          Clients
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
          Gestion de votre base client
        </Text>
      </View>
      
      {/* Barre de recherche */}
      <View style={[styles.searchContainer, { 
        backgroundColor: theme.colors.surfaceAlt,
        borderRadius: theme.radius.md,
        borderColor: theme.colors.border,
      }]}>
        <Feather name="search" size={20} color={theme.colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Rechercher un client..."
          placeholderTextColor={theme.colors.textSoft}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Formulaire dans AppCard premium */}
      <AppCard premium style={styles.formCard}>
        {/* Header du formulaire avec bouton import */}
        <View style={styles.formHeaderContainer}>
          <View style={[styles.formHeader, { 
            backgroundColor: theme.colors.surfaceAlt,
            borderRadius: theme.radius.md,
            flex: 1,
          }]}>
            <Text style={styles.formHeaderEmoji}>🧑</Text>
            <Text style={[styles.formHeaderText, { color: theme.colors.text }]}>
              Nouveau client
            </Text>
          </View>
          
          {/* Boutons Import */}
          <View style={styles.importActions}>
            <TouchableOpacity
              style={[styles.importButton, {
                backgroundColor: theme.colors.surfaceAlt,
                borderColor: theme.colors.border,
              }]}
              onPress={handleImportPress}
              disabled={isImporting}
            >
              <Feather name="upload" size={18} color={theme.colors.primary} />
              <Text style={[styles.importButtonText, { color: theme.colors.primary }]}>
                Importer
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.importButton, {
                backgroundColor: theme.colors.primary,
                borderColor: theme.colors.primary,
              }]}
              onPress={() => {
                requireProOrPaywall(navigation, 'Import avec IA').then((ok) => {
                  if (ok) {
                    navigation.navigate('ImportData');
                  }
                });
              }}
            >
              <Feather name="zap" size={18} color="#FFFFFF" />
              <Text style={[styles.importButtonText, { color: '#FFFFFF' }]}>
                Importer avec IA
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.templateButton, {
                backgroundColor: theme.colors.surfaceAlt,
                borderColor: theme.colors.border,
              }]}
              onPress={handleDownloadTemplate}
            >
              <Feather name="download" size={16} color={theme.colors.textMuted} />
              <Text style={[styles.templateButtonText, { color: theme.colors.textMuted }]}>
                📄 Modèle CSV
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Inputs avec glow au focus */}
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.surfaceAlt,
              borderColor: focusedField === 'name' ? theme.colors.primary : theme.colors.border,
              borderRadius: theme.radius.md,
              color: theme.colors.text,
            },
            focusedField === 'name' && theme.glowBlueLight,
          ]}
          placeholder="Nom *"
          placeholderTextColor={theme.colors.textSoft}
          value={name}
          onChangeText={setName}
          onFocus={() => {
            setFocusedField('name');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            playClickSound();
          }}
          onBlur={() => setFocusedField(null)}
        />

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.surfaceAlt,
              borderColor: focusedField === 'phone' ? theme.colors.primary : theme.colors.border,
              borderRadius: theme.radius.md,
              color: theme.colors.text,
            },
            focusedField === 'phone' && theme.glowBlueLight,
          ]}
          placeholder="Téléphone"
          placeholderTextColor={theme.colors.textSoft}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          onFocus={() => {
            setFocusedField('phone');
            // // // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          onBlur={() => setFocusedField(null)}
        />

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.surfaceAlt,
              borderColor: focusedField === 'email' ? theme.colors.primary : theme.colors.border,
              borderRadius: theme.radius.md,
              color: theme.colors.text,
            },
            focusedField === 'email' && theme.glowBlueLight,
          ]}
          placeholder="Email"
          placeholderTextColor={theme.colors.textSoft}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          onFocus={() => {
            setFocusedField('email');
            // // // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          onBlur={() => setFocusedField(null)}
        />

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.surfaceAlt,
              borderColor: focusedField === 'address' ? theme.colors.primary : theme.colors.border,
              borderRadius: theme.radius.md,
              color: theme.colors.text,
            },
            focusedField === 'address' && theme.glowBlueLight,
          ]}
          placeholder="Adresse *"
          placeholderTextColor={theme.colors.textSoft}
          value={address}
          onChangeText={setAddress}
          onFocus={() => {
            setFocusedField('address');
            // // // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          onBlur={() => setFocusedField(null)}
        />

        <View style={styles.row}>
          <TextInput
            style={[
              styles.input,
              styles.inputHalf,
              {
                backgroundColor: theme.colors.surfaceAlt,
                borderColor: focusedField === 'postal' ? theme.colors.primary : theme.colors.border,
                borderRadius: theme.radius.md,
                color: theme.colors.text,
              },
              focusedField === 'postal' && theme.glowBlueLight,
            ]}
            placeholder="Code postal"
            placeholderTextColor={theme.colors.textSoft}
            keyboardType="numeric"
            value={postalCode}
            onChangeText={setPostalCode}
            onFocus={() => {
              setFocusedField('postal');
              // // // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            onBlur={() => setFocusedField(null)}
          />

          <TextInput
            style={[
              styles.input,
              styles.inputHalf,
              {
                backgroundColor: theme.colors.surfaceAlt,
                borderColor: focusedField === 'city' ? theme.colors.primary : theme.colors.border,
                borderRadius: theme.radius.md,
                color: theme.colors.text,
              },
              focusedField === 'city' && theme.glowBlueLight,
            ]}
            placeholder="Ville"
            placeholderTextColor={theme.colors.textSoft}
            autoCapitalize="words"
            value={city}
            onChangeText={setCity}
            onFocus={() => {
              setFocusedField('city');
              // // // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            onBlur={() => setFocusedField(null)}
          />
        </View>
      </AppCard>

      {/* Section Liste */}
      <SectionTitle
        title={`Liste (${filteredClients.length})`}
        emoji="👥"
        style={styles.sectionTitle}
      />

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
              // // // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              navigation.navigate('ClientDetail', { clientId: client.id });
            }}
            style={({ pressed }) => [
              pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 },
            ]}
          >
            <AppCard style={styles.clientCard}>
              <View style={styles.clientInfo}>
                <View style={styles.clientHeader}>
                  <Feather name="user" size={18} color={theme.colors.primary} />
                  <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                    {client.name}
                  </Text>
                </View>
                {client.address && (
                  <View style={styles.clientRow}>
                    <Feather name="map-pin" size={14} color={theme.colors.textMuted} />
                    <Text style={[styles.cardLine, { color: theme.colors.textMuted }]}>
                      {client.address}
                    </Text>
                  </View>
                )}
                {client.phone && (
                  <View style={styles.clientRow}>
                    <Feather name="phone" size={14} color={theme.colors.textMuted} />
                    <Text style={[styles.cardLine, { color: theme.colors.textMuted }]}>
                      {client.phone}
                    </Text>
                  </View>
                )}
                {client.email && (
                  <View style={styles.clientRow}>
                    <Feather name="mail" size={14} color={theme.colors.textMuted} />
                    <Text style={[styles.cardLine, { color: theme.colors.textMuted }]}>
                      {client.email}
                    </Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  // // // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  deleteClient(client.id, client.name);
                }}
                style={styles.deleteButton}
              >
                <Feather name="trash-2" size={18} color={theme.colors.danger} />
              </TouchableOpacity>
            </AppCard>
          </Pressable>
        ))
      )}

      {/* Bouton flottant avec glow bleu */}
      <View style={styles.floatingButtonContainer}>
        <PrimaryButton
          title="AJOUTER"
          icon="✅"
          onPress={addClient}
          loading={loading}
          style={[styles.floatingButton, theme.glowBlue]}
        />
      </View>

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
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.h1,
    fontWeight: theme.fontWeights.bold,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.body,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    height: 48,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.body,
  },
  formCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  formHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  importActions: {
    flexDirection: 'column',
    gap: theme.spacing.xs,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    borderWidth: 1,
  },
  importButtonText: {
    fontSize: theme.typography.body,
    fontWeight: theme.fontWeights.semibold,
  },
  templateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.md,
    borderWidth: 1,
  },
  templateButtonText: {
    fontSize: 12,
    fontWeight: theme.fontWeights.medium,
  },
  formHeaderEmoji: {
    fontSize: 20,
  },
  formHeaderText: {
    fontSize: theme.typography.h3,
    fontWeight: theme.fontWeights.bold,
  },
  input: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.body,
    borderWidth: 1,
    marginBottom: theme.spacing.md,
    height: 42,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  inputHalf: {
    flex: 1,
  },
  sectionTitle: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  clientCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clientInfo: {
    flex: 1,
  },
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  cardTitle: {
    fontSize: theme.typography.h3,
    fontWeight: theme.fontWeights.semibold,
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    gap: theme.spacing.sm,
  },
  cardLine: {
    fontSize: theme.typography.small,
  },
  deleteButton: {
    padding: theme.spacing.sm,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 24,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    zIndex: 100,
  },
  floatingButton: {
    width: '100%',
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

