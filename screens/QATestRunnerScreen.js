import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { QARunner } from '../utils/qaRunner';

export default function QATestRunnerScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [running, setRunning] = useState(false);
  const [report, setReport] = useState(null);
  const [purging, setPurging] = useState(false);

  const handleRun = async () => {
    setRunning(true);
    setReport(null);

    try {
      const runner = new QARunner();
      const results = await runner.runAll();
      setReport(results);
    } catch (err) {
      Alert.alert('Erreur', err.message);
    } finally {
      setRunning(false);
    }
  };

  const handlePurge = async () => {
    if (!report) {
      Alert.alert('Info', 'Aucun rapport à purger');
      return;
    }

    Alert.alert('Confirmer', 'Supprimer toutes les données du dernier run ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          setPurging(true);
          try {
            const runner = new QARunner();
            // Mapper report.ids vers createdIds (conversion noms colonnes)
            runner.createdIds = {
              clientId: report.ids.client_id,
              projectId: report.ids.project_id,
              noteId: report.ids.note_id,
              devisId: report.ids.devis_id,
              factureId: report.ids.facture_id,
              photoUrl: report.ids.photo_url,
              pdfUrl: report.ids.pdf_url,
            };
            await runner.purge();
            setReport(null);
            Alert.alert('✅ Succès', 'Données supprimées');
          } catch (err) {
            Alert.alert('Erreur', err.message);
          } finally {
            setPurging(false);
          }
        },
      },
    ]);
  };

  const handleExport = async () => {
    if (!report) {
      Alert.alert('Info', 'Aucun rapport à exporter');
      return;
    }

    try {
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        const jsonStr = JSON.stringify(report, null, 2);
        const uri = `${FileSystem.cacheDirectory}qa_report_${Date.now()}.json`;
        await FileSystem.writeAsStringAsync(uri, jsonStr);
        await Sharing.shareAsync(uri, { mimeType: 'application/json' });
      } else {
        Alert.alert('Erreur', 'Sharing non disponible');
      }
    } catch (err) {
      Alert.alert('Erreur', err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.title}>QA Test Runner</Text>
          <Text style={styles.subtitle}>Tests E2E Automatisés</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.runButton, running && styles.buttonDisabled]}
            onPress={handleRun}
            disabled={running}
          >
            {running ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>▶️ Run Full Flow</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.purgeButton, (!report || purging) && styles.buttonDisabled]}
            onPress={handlePurge}
            disabled={!report || purging}
          >
            {purging ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>🗑️ Purge Last Run</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.exportButton, !report && styles.buttonDisabled]}
            onPress={handleExport}
            disabled={!report}
          >
            <Text style={styles.buttonText}>📄 Export Report (.json)</Text>
          </TouchableOpacity>
        </View>

        {report && (
          <View style={styles.report}>
            <Text style={styles.reportTitle}>Rapport de Test</Text>
            <View style={styles.reportMeta}>
              <Text style={styles.reportMetaText}>Run ID: {report.runId}</Text>
              <Text style={styles.reportMetaText}>Durée: {report.duration}ms</Text>
            </View>

            <View style={styles.steps}>
              {Object.entries(report.steps).map(([step, data]) => (
                <View key={step} style={styles.step}>
                  <Text style={styles.stepStatus}>{data.status}</Text>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepName}>{step}</Text>
                    {data.error && (
                      <Text style={styles.stepError}>⚠️ {data.error}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>

            {Object.keys(report.ids).length > 0 && (
              <View style={styles.ids}>
                <Text style={styles.idsTitle}>IDs & URLs Créés</Text>
                {Object.entries(report.ids).map(([key, value]) => (
                  <View key={key} style={styles.idRow}>
                    <Text style={styles.idKey}>{key}:</Text>
                    <Text style={styles.idValue}>{String(value).substring(0, 50)}...</Text>
                  </View>
                ))}
              </View>
            )}

            {report.errors.length > 0 && (
              <View style={styles.errors}>
                <Text style={styles.errorsTitle}>❌ Erreurs</Text>
                {report.errors.map((err, idx) => (
                  <Text key={idx} style={styles.errorText}>
                    {err.step}: {err.error}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        <View style={{ height: insets.bottom + 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scroll: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backBtn: {
    marginBottom: 12,
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  actions: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  runButton: {
    backgroundColor: '#10B981',
  },
  purgeButton: {
    backgroundColor: '#EF4444',
  },
  exportButton: {
    backgroundColor: '#3B82F6',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  report: {
    marginHorizontal: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
  },
  reportMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  reportMetaText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
  steps: {
    marginBottom: 16,
  },
  step: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  stepStatus: {
    fontSize: 20,
    marginRight: 12,
  },
  stepContent: {
    flex: 1,
  },
  stepName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepError: {
    fontSize: 12,
    color: '#EF4444',
  },
  ids: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  idsTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  idRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  idKey: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginRight: 8,
    width: 120,
  },
  idValue: {
    fontSize: 12,
    color: '#111',
    fontFamily: 'monospace',
    flex: 1,
  },
  errors: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EF4444',
  },
  errorsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginBottom: 4,
  },
});

