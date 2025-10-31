import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator, StyleSheet, Alert, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from './supabaseClient';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 60) / 3;

export default function PhotoUploaderClient({ clientId }) {
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);

  const loadPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('client_photos')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPhotos(data || []);
    } catch (err) {
      console.error('Erreur chargement photos client:', err);
    }
  };

  useEffect(() => {
    if (clientId) loadPhotos();
  }, [clientId]);

  const pickAndUpload = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Autorise l\'accès à la caméra');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled) return;

      setUploading(true);
      const uri = result.assets[0].uri;
      const resp = await fetch(uri);
      const arrayBuffer = await resp.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      const fileName = `clients/${clientId}/${Date.now()}.jpg`;
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('project-photos')
        .upload(fileName, bytes, { contentType: 'image/jpeg', upsert: false });

      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from('project-photos').getPublicUrl(fileName);
      const publicUrl = urlData.publicUrl;

      const { error: insertErr } = await supabase.from('client_photos').insert([
        { client_id: clientId, url: publicUrl },
      ]);

      if (insertErr) throw insertErr;

      await loadPhotos();
      Alert.alert('OK', 'Photo envoyée ✅');
    } catch (err) {
      console.error('Erreur upload:', err);
      Alert.alert('Erreur', 'Impossible d\'envoyer la photo');
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async (id, url) => {
    Alert.alert('Confirmer', 'Supprimer cette photo ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            const path = url.split('/').slice(-3).join('/');
            await supabase.storage.from('project-photos').remove([path]);
            const { error } = await supabase.from('client_photos').delete().eq('id', id);
            if (!error) await loadPhotos();
          } catch (err) {
            console.error('Erreur suppression:', err);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Photos du client</Text>
      <TouchableOpacity
        style={styles.btn}
        onPress={pickAndUpload}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>📷 Prendre une photo</Text>
        )}
      </TouchableOpacity>
      <FlatList
        data={photos}
        numColumns={3}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.photo}
            onPress={() => deletePhoto(item.id, item.url)}
          >
            <Image source={{ uri: item.url }} style={styles.photoImg} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Aucune photo</Text>}
        columnWrapperStyle={{ gap: 10, marginBottom: 10 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderColor: '#eee' },
  title: { fontWeight: '800', marginBottom: 6 },
  btn: { backgroundColor: '#1D4ED8', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, marginBottom: 12 },
  btnText: { color: '#fff', fontWeight: '700', textAlign: 'center' },
  photo: { width: PHOTO_SIZE, height: PHOTO_SIZE, borderRadius: 8, overflow: 'hidden' },
  photoImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  empty: { color: '#666', marginTop: 8, textAlign: 'center' },
});

