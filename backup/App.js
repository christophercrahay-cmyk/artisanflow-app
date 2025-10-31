import 'react-native-gesture-handler';
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import { Picker } from '@react-native-picker/picker';
import { supabase } from './supabaseClient';

/* ===================== ÉCRAN CLIENTS ===================== */
function ClientsScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadClients = async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('id,name,phone,email,created_at')
      .order('created_at', { ascending: false });
    if (!error) setClients(data || []);
  };

  useEffect(() => {
    loadClients();
  }, []);

  const addClient = async () => {
    if (!name.trim()) {
      return Alert.alert('Nom requis', 'Le champ nom est obligatoire.');
    }
    try {
      setLoading(true);
      const { error } = await supabase.from('clients').insert([
        {
          name: name.trim(),
          phone: phone.trim() || null,
          email: email.trim() || null,
        },
      ]);
      if (error) throw error;
      setName('');
      setPhone('');
      setEmail('');
      await loadClients();
      Alert.alert('OK', 'Client ajouté ✅');
    } catch (e) {
      Alert.alert('Erreur', e.message || 'Insertion impossible');
    } finally {
      setLoading(false);
    }
  };

  const deleteClient = async (id) => {
    Alert.alert('Confirmer', 'Supprimer ce client ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('clients').delete().eq('id', id);
          if (!error) loadClients();
        },
      },
    ]);
  };

  const renderClient = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.name}</Text>
      {item.phone ? <Text style={styles.cardLine}>{item.phone}</Text> : null}
      {item.email ? <Text style={styles.cardLine}>{item.email}</Text> : null}
      <TouchableOpacity
        onPress={() => deleteClient(item.id)}
        style={styles.deleteButton}
      >
        <Text style={styles.deleteText}>🗑️ Supprimer</Text>
      </TouchableOpacity>
    </View>
  );

  const headerForm = (
    <View style={{ paddingHorizontal: 20, paddingTop: 60, backgroundColor: '#fff' }}>
      <Text style={styles.title}>ArtisanFlow – Clients</Text>
      <TextInput
        style={styles.input}
        placeholder="Nom *"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Téléphone"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={addClient}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Ajout…' : 'AJOUTER LE CLIENT'}
        </Text>
      </TouchableOpacity>
      <Text style={styles.helper}>Liste des clients</Text>
    </View>
  );

  return (
    <FlatList
      nestedScrollEnabled
      data={clients}
      keyExtractor={(it) => it.id}
      renderItem={renderClient}
      ListHeaderComponent={headerForm}
      contentContainerStyle={{ paddingBottom: 40, backgroundColor: '#fff' }}
    />
  );
}

/* ===================== ÉCRAN CHANTIERS ===================== */
function ProjectsScreen() {
  const [projectName, setProjectName] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('active'); // valeurs: active | paused | done
  const [clientId, setClientId] = useState(null);

  const [clientsOptions, setClientsOptions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadClients = async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('id,name')
      .order('name', { ascending: true });
    if (!error) {
      setClientsOptions(data || []);
      if (!clientId && data && data.length) setClientId(data[0].id);
    }
  };

  // Récupère TOUTES les colonnes + nom client → évite l’erreur status/status_text
  const loadProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*, clients(name)')
      .order('created_at', { ascending: false });
    if (!error) setProjects(data || []);
  };

  useEffect(() => {
    (async () => {
      await loadClients();
      await loadProjects();
    })();
  }, []);

  const addProject = async () => {
    if (!projectName.trim())
      return Alert.alert('Nom requis', 'Le nom du chantier est obligatoire.');
    if (!clientId) return Alert.alert('Client requis', 'Sélectionne un client.');

    try {
      setLoading(true);

      // 1) essai avec status_text
      let { error } = await supabase.from('projects').insert([
        {
          name: projectName.trim(),
          address: address.trim() || null,
          client_id: clientId,
          status_text: status || 'active',
        },
      ]);

      // 2) si la colonne n’existe pas, on retente avec "status"
      if (error && String(error.message).includes('status_text')) {
        const retry = await supabase.from('projects').insert([
          {
            name: projectName.trim(),
            address: address.trim() || null,
            client_id: clientId,
            status: status || 'active',
          },
        ]);
        error = retry.error;
      }

      if (error) throw error;

      setProjectName('');
      setAddress('');
      await loadProjects();
      Alert.alert('OK', 'Chantier ajouté ✅');
    } catch (e) {
      Alert.alert('Erreur', e.message || 'Insertion impossible');
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id) => {
    Alert.alert('Confirmer', 'Supprimer ce chantier ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('projects').delete().eq('id', id);
          if (!error) loadProjects();
        },
      },
    ]);
  };

  const renderProject = ({ item }) => {
    const statusValue = item.status_text ?? item.status ?? '—';
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardLine}>{item.address || '—'}</Text>
        <Text style={styles.cardLine}>Client : {item.clients?.name || '—'}</Text>
        <Text style={styles.cardLine}>Statut : {statusValue}</Text>
        <TouchableOpacity
          onPress={() => deleteProject(item.id)}
          style={styles.deleteButton}
        >
          <Text style={styles.deleteText}>🗑️ Supprimer</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const headerForm = (
    <View style={{ paddingHorizontal: 20, paddingTop: 60, backgroundColor: '#fff' }}>
      <Text style={styles.title}>Chantiers</Text>

      <TextInput
        style={styles.input}
        placeholder="Nom du chantier *"
        value={projectName}
        onChangeText={setProjectName}
      />
      <TextInput
        style={styles.input}
        placeholder="Adresse"
        value={address}
        onChangeText={setAddress}
      />

      <View style={styles.pickerBox}>
        <Text style={styles.pickerLabel}>Client</Text>
        <Picker selectedValue={clientId} onValueChange={(v) => setClientId(v)}>
          {clientsOptions.map((c) => (
            <Picker.Item key={c.id} label={c.name} value={c.id} />
          ))}
        </Picker>
      </View>

      <View style={styles.pickerBox}>
        <Text style={styles.pickerLabel}>Statut</Text>
        <Picker selectedValue={status} onValueChange={(v) => setStatus(v)}>
          <Picker.Item label="Actif" value="active" />
          <Picker.Item label="En pause" value="paused" />
          <Picker.Item label="Terminé" value="done" />
        </Picker>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={addProject}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Ajout…' : 'AJOUTER LE CHANTIER'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.helper}>Liste des chantiers</Text>
    </View>
  );

  return (
    <FlatList
      nestedScrollEnabled
      data={projects}
      keyExtractor={(it) => it.id}
      renderItem={renderProject}
      ListHeaderComponent={headerForm}
      contentContainerStyle={{ paddingBottom: 40, backgroundColor: '#fff' }}
    />
  );
}

/* ===================== APP (SWIPE) ===================== */
export default function App() {
  const pagerRef = useRef(null);
  const [page, setPage] = useState(0);
  const goTo = (i) => {
    setPage(i);
    pagerRef.current?.setPage(i);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => goTo(0)}
          style={[styles.tabBtn, page === 0 && styles.tabBtnActive]}
        >
          <Text style={[styles.tabBtnText, page === 0 && styles.tabBtnTextActive]}>
            Clients
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => goTo(1)}
          style={[styles.tabBtn, page === 1 && styles.tabBtnActive]}
        >
          <Text style={[styles.tabBtnText, page === 1 && styles.tabBtnTextActive]}>
            Chantiers
          </Text>
        </TouchableOpacity>
      </View>

      <PagerView
        style={{ flex: 1 }}
        initialPage={0}
        ref={pagerRef}
        onPageSelected={(e) => setPage(e.nativeEvent.position)}
      >
        <View key="clients">
          <ClientsScreen />
        </View>
        <View key="projects">
          <ProjectsScreen />
        </View>
      </PagerView>
    </View>
  );
}

/* ===================== STYLES ===================== */
const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '800', marginBottom: 16 },
  input: {
    height: 54,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  button: {
    height: 54,
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  helper: { textAlign: 'left', marginTop: 14, marginBottom: 10, color: '#666' },

  pickerBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 12,
    overflow: 'hidden',
  },
  pickerLabel: { paddingHorizontal: 12, paddingTop: 8, color: '#666', fontSize: 12 },

  card: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  cardLine: { color: '#444', marginBottom: 2 },
  deleteButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  deleteText: { color: '#b91c1c', fontWeight: '700' },

  header: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
  },
  tabBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
  },
  tabBtnActive: { backgroundColor: '#DBEAFE' },
  tabBtnText: { fontWeight: '700', color: '#374151' },
  tabBtnTextActive: { color: '#1D4ED8' },
});
