import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator, StyleSheet, Alert, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import ImageViewing from 'react-native-image-viewing';
import { supabase } from './supabaseClient';
import { useAppStore } from './store/useAppStore';
import { useSafeTheme } from './theme/useSafeTheme';
import { Feather } from '@expo/vector-icons';
import { compressImage } from './services/imageCompression';
import { showSuccess, showError } from './components/Toast';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 60) / 3;

export default function PhotoUploader({ projectId }) {
  const theme = useSafeTheme();
  const insets = useSafeAreaInsets();
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  
  // États pour le visualiseur plein écran
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const loadPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('project_photos')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erreur chargement photos:', error);
        Alert.alert('Erreur', 'Impossible de charger les photos');
        return;
      }
      setPhotos(data || []);
    } catch (err) {
      console.error('Exception chargement photos:', err);
      Alert.alert('Erreur', 'Erreur lors du chargement des photos');
    }
  };

  useEffect(() => {
    if (projectId) loadPhotos();
  }, [projectId]);

  const pickAndUpload = async () => {
    const { currentClient, currentProject } = useAppStore.getState();
    if (!currentProject?.id || !currentClient?.id) {
      Alert.alert('Sélection manquante', 'Sélectionne d\'abord un client et un chantier');
      return;
    }

    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Autorise l\'accès à la caméra');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.8,
      });

      if (result.canceled) return;

      setUploading(true);
      const originalUri = result.assets[0].uri;
      
      // Capturer la date/heure de prise de vue
      const takenAt = new Date().toISOString();
      
      // Récupérer la position GPS (si permission accordée)
      let latitude = null;
      let longitude = null;
      try {
        // Import dynamique pour éviter le crash si le module natif n'est pas disponible
        const locationModule = await import('expo-location');
        // Gérer les différents formats d'export (default ou named)
        const Location = locationModule.default || locationModule;
        
        // Vérifier que les fonctions sont disponibles
        if (Location && typeof Location.requestForegroundPermissionsAsync === 'function') {
          const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
          if (locationStatus === 'granted') {
            const location = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            latitude = location.coords.latitude;
            longitude = location.coords.longitude;
          }
        } else {
          throw new Error('Module expo-location non disponible - build native requise');
        }
      } catch (locationErr) {
        console.warn('[PhotoUploader] Erreur récupération position (module natif peut-être non disponible):', locationErr);
        // Continue sans géolocalisation si erreur
      }
      
      // Compression de l'image avant upload
      const compressed = await compressImage(originalUri);
      
      const resp = await fetch(compressed.uri);
      const arrayBuffer = await resp.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      const fileName = `projects/${projectId}/${Date.now()}.jpg`;
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('project-photos')
        .upload(fileName, bytes, { contentType: 'image/jpeg', upsert: false });

      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from('project-photos').getPublicUrl(fileName);
      const publicUrl = urlData.publicUrl;

      // Récupérer l'utilisateur connecté pour RLS
      const { data: { user } } = await supabase.auth.getUser();

      // Préparer les données avec horodatage et géolocalisation
      const photoData = {
        project_id: currentProject.id,
        client_id: currentClient.id,
        user_id: user?.id, // Nécessaire pour RLS
        url: publicUrl,
        taken_at: takenAt,
      };

      // Ajouter latitude/longitude seulement si disponibles
      if (latitude !== null && longitude !== null) {
        photoData.latitude = latitude;
        photoData.longitude = longitude;
      }

      const { error: insertErr } = await supabase.from('project_photos').insert([photoData]);

      if (insertErr) throw insertErr;

      await loadPhotos();
      showSuccess('Photo envoyée');
    } catch (err) {
      console.error('Erreur upload:', err);
      showError('Impossible d\'envoyer la photo');
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async (id, url) => {
    try {
      const path = url.split('/').slice(-3).join('/');
      const { error: storageErr } = await supabase.storage.from('project-photos').remove([path]);
      if (storageErr) {
        console.error('Erreur suppression storage:', storageErr);
      }

      const { error } = await supabase.from('project_photos').delete().eq('id', id);
      if (error) {
        console.error('Erreur suppression DB:', error);
        showError('Impossible de supprimer la photo');
        return;
      }

      await loadPhotos();
      showSuccess('Photo supprimée');
    } catch (err) {
      console.error('Exception suppression photo:', err);
      showError('Erreur lors de la suppression');
    }
  };

  // Gestion de la suppression depuis le viewer avec confirmation et gestion de l'index
  const handleConfirmDeleteCurrentPhoto = (currentImageIndex) => {
    if (viewerImages.length === 0 || photos.length === 0) return;
    
    // Utiliser l'index passé en paramètre (depuis FooterComponent) ou viewerIndex en fallback
    const activeIndex = currentImageIndex !== undefined ? currentImageIndex : viewerIndex;
    const currentPhoto = photos[activeIndex];
    if (!currentPhoto) return;

    Alert.alert(
      'Confirmer',
      'Supprimer cette photo ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const photoToDelete = currentPhoto;
            const indexToDelete = activeIndex;

            // Supprimer la photo
            await deletePhoto(photoToDelete.id, photoToDelete.url);

            // Recharger les photos pour avoir la liste à jour
            const { data: updatedPhotos } = await supabase
              .from('project_photos')
              .select('*')
              .eq('project_id', projectId)
              .order('created_at', { ascending: false });
            
            if (updatedPhotos) {
              setPhotos(updatedPhotos);

              // Gérer l'index du viewer
              if (updatedPhotos.length === 0) {
                // Plus aucune photo : fermer le viewer
                setIsViewerVisible(false);
              } else {
                // Ajuster l'index pour afficher la photo précédente ou suivante
                let newIndex = indexToDelete;
                if (newIndex >= updatedPhotos.length) {
                  newIndex = updatedPhotos.length - 1;
                }
                // Si on était sur la dernière photo, afficher la nouvelle dernière
                if (newIndex < 0) {
                  newIndex = 0;
                }
                setViewerIndex(newIndex);
              }
            }
          },
        },
      ]
    );
  };

  // Transformer les photos en format pour le viewer
  const viewerImages = useMemo(() => {
    return photos.map((photo) => ({
      uri: photo.url,
    }));
  }, [photos]);

  // Ouvrir le viewer sur une photo spécifique
  const openViewer = (index) => {
    setViewerIndex(index);
    setIsViewerVisible(true);
  };

  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Feather name="image" size={20} color={theme.colors.accent} />
        <Text style={styles.title}>Photos du chantier</Text>
      </View>
      
      <TouchableOpacity
        style={styles.btn}
        onPress={pickAndUpload}
        disabled={uploading}
        activeOpacity={0.7}
      >
        {uploading ? (
          <ActivityIndicator color={theme.colors.text} />
        ) : (
          <>
            <Feather name="camera" size={20} color={theme.colors.text} strokeWidth={2.5} />
            <Text style={styles.btnText}>Prendre une photo</Text>
          </>
        )}
      </TouchableOpacity>
      
      <FlatList
        data={photos}
        numColumns={3}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item, index }) => {
          // Formater la date de prise de vue
          const formatPhotoDate = (dateString) => {
            if (!dateString) return null;
            try {
              const date = new Date(dateString);
              const day = date.getDate().toString().padStart(2, '0');
              const month = (date.getMonth() + 1).toString().padStart(2, '0');
              const year = date.getFullYear();
              const hours = date.getHours().toString().padStart(2, '0');
              const minutes = date.getMinutes().toString().padStart(2, '0');
              return `${day}/${month}/${year} à ${hours}:${minutes}`;
            } catch (e) {
              return null;
            }
          };

          const photoDate = formatPhotoDate(item.taken_at || item.created_at);
          const hasLocation = item.latitude !== null && item.longitude !== null && 
                            item.latitude !== undefined && item.longitude !== undefined;

          return (
            <View style={styles.photoContainer}>
              <TouchableOpacity
                style={styles.photo}
                onPress={() => openViewer(index)}
                onLongPress={() => deletePhoto(item.id, item.url)}
                activeOpacity={0.7}
              >
                <Image source={{ uri: item.url }} style={styles.photoImg} />
              </TouchableOpacity>
              {photoDate && (
                <View style={styles.photoInfo}>
                  <Text style={styles.photoDateText}>{photoDate}</Text>
                  {hasLocation && (
                    <View style={styles.locationBadge}>
                      <Feather name="map-pin" size={10} color={theme.colors.accent} />
                      <Text style={styles.locationText}>géolocalisée</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>Aucune photo</Text>}
        columnWrapperStyle={{ gap: 10, marginBottom: 10 }}
      />

      {/* Visualiseur plein écran */}
      <ImageViewing
        images={viewerImages}
        imageIndex={viewerIndex}
        visible={isViewerVisible}
        onRequestClose={() => setIsViewerVisible(false)}
        onImageIndexChange={setViewerIndex} // Suivre l'index actuel lors du swipe
        swipeToCloseEnabled={true} // Swipe down pour fermer
        doubleTapToZoomEnabled={true} // Double tap pour zoomer/dézoomer
        presentationStyle="overFullScreen"
        animationType="fade" // Animation d'ouverture/fermeture
        HeaderComponent={({ imageIndex }) => {
          if (viewerImages.length === 0) return null;
          return (
            <View style={[styles.viewerHeader, { paddingTop: insets.top + theme.spacing.md }]}>
              <View style={styles.viewerHeaderContent}>
                <Text style={styles.viewerHeaderText}>
                  {imageIndex + 1} / {viewerImages.length}
                </Text>
                <TouchableOpacity
                  style={styles.viewerCloseButton}
                  onPress={() => setIsViewerVisible(false)}
                  activeOpacity={0.7}
                >
                  <Feather name="x" size={24} color={theme.colors.text} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        FooterComponent={({ imageIndex }) => {
          if (viewerImages.length === 0) return null;
          
          return (
            <View style={[styles.viewerFooter, { paddingBottom: insets.bottom + theme.spacing.md }]}>
              <TouchableOpacity
                style={styles.viewerDeleteButton}
                onPress={() => handleConfirmDeleteCurrentPhoto(imageIndex)}
                activeOpacity={0.7}
              >
                <Feather name="trash-2" size={20} color={theme.colors.error} strokeWidth={2.5} />
                <Text style={styles.viewerDeleteText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: { 
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: { 
    ...theme.typography.h4,
    marginLeft: theme.spacing.sm,
  },
  btn: { 
    ...theme.buttons.primary,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  btnText: { 
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.text,
  },
  photoContainer: {
    width: PHOTO_SIZE,
    marginBottom: theme.spacing.sm,
  },
  photo: { 
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  photoImg: { 
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoInfo: {
    marginTop: theme.spacing.xs,
    paddingHorizontal: theme.spacing.xs,
  },
  photoDateText: {
    ...theme.typography.bodySmall,
    fontSize: 11,
    color: theme.colors.textSecondary,
    lineHeight: 14,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    ...theme.typography.bodySmall,
    fontSize: 10,
    color: theme.colors.accent,
    fontStyle: 'italic',
  },
  empty: { 
    ...theme.typography.bodySmall,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  // Styles pour le viewer plein écran
  viewerHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.85)', // Fond plus opaque pour meilleure lisibilité
    zIndex: 1,
  },
  viewerHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewerHeaderText: {
    ...theme.typography.body,
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  viewerCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  viewerFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    alignItems: 'center',
    zIndex: 1,
  },
  viewerDeleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    backgroundColor: 'rgba(239, 68, 68, 0.25)', // Rouge avec plus de transparence
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(239, 68, 68, 0.5)',
    minWidth: 140,
  },
  viewerDeleteText: {
    ...theme.typography.body,
    fontSize: 16,
    color: theme.colors.error,
    fontWeight: '700',
  },
});
