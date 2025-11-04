import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../supabaseClient';

export default function ProDashboardScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({
    devisEnAttente: 0,
    facturesImpayees: 0,
    caMois: 0,
    chantiersActifs: 0,
  });

  useEffect(() => {
    loadKPIs();
  }, []);

  const loadKPIs = async () => {
    try {
      setLoading(true);

      // 1. Devis en attente (statut = 'envoye')
      const { data: devisData, error: devisErr } = await supabase
        .from('devis')
        .select('id', { count: 'exact' })
        .eq('statut', 'envoye');

      if (devisErr) {
        console.error('Erreur devis:', devisErr);
      }

      // 2. Factures impayées (statut = 'impayee')
      const { data: facturesData, error: facturesErr } = await supabase
        .from('factures')
        .select('id', { count: 'exact' })
        .eq('statut', 'impayee');

      if (facturesErr) {
        console.error('Erreur factures:', facturesErr);
      }

      // 3. CA du mois (sum montant_ttc where statut = 'paye' et ce mois)
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const { data: caData, error: caErr } = await supabase
        .from('factures')
        .select('montant_ttc')
        .eq('statut', 'paye')
        .gte('created_at', firstDayOfMonth.toISOString())
        .lte('created_at', lastDayOfMonth.toISOString());

      if (caErr) {
        console.error('Erreur CA:', caErr);
      }

      const caTotal = caData?.reduce((sum, item) => sum + (item.montant_ttc || 0), 0) || 0;

      // 4. Chantiers actifs (status = 'active')
      const { data: chantiersData, error: chantiersErr } = await supabase
        .from('projects')
        .select('id', { count: 'exact' })
        .in('status', ['active', 'paused']); // On compte aussi en pause comme "actifs"

      if (chantiersErr) {
        console.error('Erreur chantiers:', chantiersErr);
      }

      setKpis({
        devisEnAttente: devisData?.length || 0,
        facturesImpayees: facturesData?.length || 0,
        caMois: caTotal,
        chantiersActifs: chantiersData?.length || 0,
      });
    } catch (err) {
      console.error('Exception load KPIs:', err);
      Alert.alert('Erreur', 'Impossible de charger les statistiques');
    } finally {
      setLoading(false);
    }
  };

  const KPICard = ({ icon, label, value, color }) => (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <Text style={styles.cardIcon}>{icon}</Text>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1D4ED8" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Dashboard Pro</Text>
              <Text style={styles.subtitle}>Vue d'ensemble de votre activité</Text>
            </View>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => navigation.navigate('Settings')}
            >
              <Text style={styles.settingsButtonText}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>

      <View style={styles.grid}>
        <KPICard
          icon="📋"
          label="Devis en attente"
          value={kpis.devisEnAttente}
          color="#F59E0B"
        />
        <KPICard
          icon="🧾"
          label="Factures impayées"
          value={kpis.facturesImpayees}
          color="#EF4444"
        />
        <KPICard
          icon="💰"
          label="CA du mois"
          value={`${kpis.caMois.toFixed(2)} €`}
          color="#10B981"
        />
        <KPICard
          icon="🏗️"
          label="Chantiers actifs"
          value={kpis.chantiersActifs}
          color="#3B82F6"
        />
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Résumé</Text>
        <Text style={styles.summaryText}>
          {kpis.devisEnAttente > 0
            ? `${kpis.devisEnAttente} devis ${kpis.devisEnAttente > 1 ? 'sont' : 'est'} en attente de réponse`
            : 'Aucun devis en attente'}
        </Text>
        <Text style={styles.summaryText}>
          {kpis.facturesImpayees > 0
            ? `${kpis.facturesImpayees} facture${kpis.facturesImpayees > 1 ? 's' : ''} ${kpis.facturesImpayees > 1 ? 'sont' : 'est'} impayée${kpis.facturesImpayees > 1 ? 's' : ''}`
            : 'Toutes les factures sont payées'}
        </Text>
        <Text style={styles.summaryText}>
          Chiffre d'affaires du mois : {kpis.caMois.toFixed(2)} €
        </Text>
      </View>
      <View style={{ height: insets.bottom }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsButtonText: {
    fontSize: 24,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  card: {
    width: '47%',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
  },
  cardIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  summary: {
    backgroundColor: '#F9FAFB',
    marginHorizontal: 20,
    marginBottom: 40,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 24,
  },
});

