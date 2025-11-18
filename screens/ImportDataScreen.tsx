/**
 * Écran d'import de données universel basé sur GPT
 * Analyse n'importe quel fichier (CSV, Excel, PDF, etc.) et importe les données détectées
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useSafeTheme } from '../theme/useSafeTheme';
import { pickImportFile, ImportResult } from '../services/import/documentImport';
import { uploadImportFile, analyzeImportFile, processImport } from '../services/import/aiImportService';
import type { ImportAnalysis } from '../types/import';
import logger from '../utils/logger';

export default function ImportDataScreen({ navigation }: any) {
  const theme = useSafeTheme();
  const styles = getStyles(theme);

  const [file, setFile] = useState<ImportResult | null>(null);
  const [isPicking, setIsPicking] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [analysis, setAnalysis] = useState<ImportAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePick = async () => {
    setError(null);
    setIsPicking(true);

    try {
      const res = await pickImportFile();

      if (!res.cancelled) {
        setFile(res);
        logger.success('ImportDataScreen', 'Fichier sélectionné', { name: res.name });
      } else {
        logger.info('ImportDataScreen', 'Sélection annulée');
      }
    } catch (err: any) {
      logger.error('ImportDataScreen', 'Erreur sélection fichier', err);
      const errorMessage = err?.message || 'Erreur lors de la sélection du fichier.';
      setError(errorMessage);
      Alert.alert('Erreur', errorMessage);
    } finally {
      setIsPicking(false);
    }
  };

  const handleAnalyze = async () => {
    if (!file?.uri) {
      Alert.alert('Aucun fichier', 'Sélectionne d\'abord un fichier à importer.');
      return;
    }

    setError(null);
    setIsAnalyzing(true);

    try {
      // 1. Upload le fichier dans Supabase Storage
      logger.info('ImportDataScreen', 'Upload fichier...');
      const filePath = await uploadImportFile(
        file.uri, 
        file.name || 'import.csv',
        file.mimeType || null
      );

      // 2. Analyser avec GPT (utiliser fileId + bucketName pour bucket privé)
      logger.info('ImportDataScreen', 'Analyse avec GPT...');
      const analysisResult = await analyzeImportFile(undefined, filePath, 'imports');
      setAnalysis(analysisResult);

      Alert.alert(
        'Analyse terminée',
        `Détecté : ${analysisResult.summary.clients} clients, ${analysisResult.summary.projects} projets, ${analysisResult.summary.quotes} devis, ${analysisResult.summary.invoices} factures.`,
        [
          {
            text: 'Annuler',
            style: 'cancel',
          },
          {
            text: 'Importer',
            onPress: handleImport,
          },
        ]
      );

      logger.success('ImportDataScreen', 'Analyse terminée', analysisResult.summary);
    } catch (err: any) {
      logger.error('ImportDataScreen', 'Erreur analyse', err);
      const errorMessage = err?.message || 'Erreur lors de l\'analyse du fichier.';
      setError(errorMessage);
      Alert.alert('Erreur', errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImport = async () => {
    if (!analysis) {
      Alert.alert('Aucune analyse', 'Analyse d\'abord le fichier.');
      return;
    }

    setError(null);
    setIsImporting(true);

    try {
      const result = await processImport(analysis);

      if (result.status === 'ok' && result.imported) {
        const imported = result.imported;
        const summary = [
          imported.clients > 0 ? `${imported.clients} client${imported.clients > 1 ? 's' : ''}` : null,
          imported.projects > 0 ? `${imported.projects} projet${imported.projects > 1 ? 's' : ''}` : null,
          imported.quotes > 0 ? `${imported.quotes} devis` : null,
          imported.invoices > 0 ? `${imported.invoices} facture${imported.invoices > 1 ? 's' : ''}` : null,
        ]
          .filter(Boolean)
          .join(', ');

        Alert.alert('Import terminé', `Données importées : ${summary || 'Aucune donnée'}.`);
        logger.success('ImportDataScreen', 'Import terminé', result.imported);

        // Réinitialiser
        setFile(null);
        setAnalysis(null);
      } else {
        throw new Error(result.message || 'Erreur lors de l\'import');
      }
    } catch (err: any) {
      logger.error('ImportDataScreen', 'Erreur import', err);
      const errorMessage = err?.message || 'Erreur lors de l\'import.';
      setError(errorMessage);
      Alert.alert('Erreur', errorMessage);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={24} color={theme.colors.accent} strokeWidth={2.5} />
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Importer vos données</Text>
          <Text style={styles.subtitle}>Récupérez vos clients, chantiers et documents depuis vos anciens logiciels.</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.description}>
            Sélectionnez un fichier exporté depuis Obat, Tolteck, EBP, Excel ou tout autre logiciel (CSV, Excel, PDF, etc.).
            {'\n\n'}
            ArtisanFlow s'occupe du tri et du nettoyage.
            {'\n\n'}
            L'IA analyse automatiquement votre fichier et :
            {'\n'}• nettoie les données mal formatées
            {'\n'}• sépare correctement adresses, emails et téléphones
            {'\n'}• identifie les clients, projets, devis et factures
            {'\n'}• corrige certaines erreurs de formatage automatiquement
          </Text>
        </View>

        {/* Bouton sélection fichier */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
            onPress={handlePick}
            disabled={isPicking || isImporting}
            activeOpacity={0.7}
          >
            {isPicking ? (
              <>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Ouverture du sélecteur...</Text>
              </>
            ) : (
              <>
                <Feather name="upload" size={20} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Choisir un fichier à importer</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Fichier sélectionné */}
        {file?.name && (
          <View style={styles.section}>
            <View style={[styles.fileCard, { backgroundColor: theme.colors.surfaceAlt }]}>
              <Feather name="file-text" size={32} color={theme.colors.primary} />
              <View style={styles.fileInfo}>
                <Text style={[styles.fileName, { color: theme.colors.text }]}>{file.name}</Text>
                {file.size && (
                  <Text style={[styles.fileSize, { color: theme.colors.textMuted }]}>
                    {(file.size / 1024).toFixed(2)} KB
                  </Text>
                )}
                {file.mimeType && (
                  <Text style={[styles.fileType, { color: theme.colors.textMuted }]}>
                    {file.mimeType}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Résumé de l'analyse */}
        {analysis && (
          <View style={styles.section}>
            <View style={[styles.analysisCard, { backgroundColor: theme.colors.surfaceAlt }]}>
              <Feather name="check-circle" size={24} color={theme.colors.success || theme.colors.primary} />
              <View style={styles.analysisInfo}>
                <Text style={[styles.analysisTitle, { color: theme.colors.text }]}>
                  Analyse terminée
                </Text>
                <Text style={[styles.analysisText, { color: theme.colors.textMuted }]}>
                  {analysis.summary.clients} client{analysis.summary.clients > 1 ? 's' : ''} •{' '}
                  {analysis.summary.projects} projet{analysis.summary.projects > 1 ? 's' : ''} •{' '}
                  {analysis.summary.quotes} devis • {analysis.summary.invoices} facture
                  {analysis.summary.invoices > 1 ? 's' : ''}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Bouton analyser */}
        {file?.uri && !analysis && (
          <View style={styles.section}>
            <TouchableOpacity
              style={[
                styles.importButton,
                {
                  backgroundColor: theme.colors.primary,
                  opacity: isAnalyzing ? 0.6 : 1,
                },
              ]}
              onPress={handleAnalyze}
              disabled={isAnalyzing}
              activeOpacity={0.7}
            >
              {isAnalyzing ? (
                <>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.importButtonText}>Analyse en cours...</Text>
                </>
              ) : (
                <>
                  <Feather name="search" size={20} color="#FFFFFF" />
                  <Text style={styles.importButtonText}>Analyser le fichier</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Bouton lancer import */}
        {analysis && (
          <View style={styles.section}>
            <TouchableOpacity
              style={[
                styles.importButton,
                {
                  backgroundColor: theme.colors.success || theme.colors.primary,
                  opacity: isImporting ? 0.6 : 1,
                },
              ]}
              onPress={handleImport}
              disabled={isImporting}
              activeOpacity={0.7}
            >
              {isImporting ? (
                <>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.importButtonText}>Import en cours...</Text>
                </>
              ) : (
                <>
                  <Feather name="check" size={20} color="#FFFFFF" />
                  <Text style={styles.importButtonText}>Importer les données</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Message d'erreur */}
        {error && (
          <View style={styles.section}>
            <View style={[styles.errorCard, { backgroundColor: theme.colors.error + '20' }]}>
              <Feather name="alert-circle" size={24} color={theme.colors.error} />
              <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
            </View>
          </View>
        )}

        {/* Info formats acceptés */}
        <View style={styles.section}>
          <View style={[styles.infoCard, { backgroundColor: theme.colors.surfaceAlt }]}>
            <Text style={[styles.infoText, { color: theme.colors.textMuted }]}>
              💡 Formats acceptés : CSV, Excel (.xls, .xlsx), PDF (tableaux), etc.{'\n'}
              Plus le fichier est structuré, plus l'import sera rapide.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: theme.spacing?.lg || 16,
      paddingTop: theme.spacing?.lg || 16,
      paddingBottom: theme.spacing?.md || 12,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing?.md || 12,
    },
    backButtonText: {
      fontSize: 16,
      fontWeight: '700',
      marginLeft: theme.spacing?.xs || 4,
      color: theme.colors.accent,
    },
    headerContent: {
      marginLeft: theme.spacing?.md || 12,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: theme.colors.text,
      marginBottom: theme.spacing?.xs || 4,
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.textMuted,
    },
    scrollView: {
      flex: 1,
    },
    section: {
      paddingHorizontal: theme.spacing?.lg || 16,
      marginBottom: theme.spacing?.lg || 16,
    },
    description: {
      fontSize: 16,
      lineHeight: 24,
      color: theme.colors.textMuted,
    },
    primaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing?.sm || 8,
      paddingVertical: theme.spacing?.md || 12,
      paddingHorizontal: theme.spacing?.lg || 16,
      borderRadius: theme.radius?.md || 8,
    },
    primaryButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    fileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing?.lg || 16,
      borderRadius: theme.radius?.md || 8,
      gap: theme.spacing?.md || 12,
    },
    fileInfo: {
      flex: 1,
    },
    fileName: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: theme.spacing?.xs || 4,
    },
    fileSize: {
      fontSize: 14,
      marginBottom: theme.spacing?.xs || 4,
    },
    fileType: {
      fontSize: 12,
    },
    importButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing?.sm || 8,
      paddingVertical: theme.spacing?.md || 12,
      paddingHorizontal: theme.spacing?.lg || 16,
      borderRadius: theme.radius?.md || 8,
    },
    importButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    errorCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing?.md || 12,
      borderRadius: theme.radius?.md || 8,
      gap: theme.spacing?.sm || 8,
    },
    errorText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 20,
    },
    infoCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: theme.spacing?.md || 12,
      borderRadius: theme.radius?.md || 8,
      gap: theme.spacing?.sm || 8,
    },
    infoText: {
      flex: 1,
      fontSize: 13,
      lineHeight: 18,
    },
    analysisCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing?.lg || 16,
      borderRadius: theme.radius?.md || 8,
      gap: theme.spacing?.md || 12,
    },
    analysisInfo: {
      flex: 1,
    },
    analysisTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: theme.spacing?.xs || 4,
    },
    analysisText: {
      fontSize: 14,
      lineHeight: 20,
    },
  });

