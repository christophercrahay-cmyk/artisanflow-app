import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator, StyleSheet, Alert, Dimensions, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import ImageViewing from 'react-native-image-viewing';
import { supabase } from './supabaseClient';
import { useAppStore } from './store/useAppStore';
import { useSafeTheme } from './theme/useSafeTheme';
import { Feather } from '@expo/vector-icons';
import { compressImage } from './services/imageCompression';
import { showSuccess, showError } from './components/Toast';
import logger from './utils/logger';
import PhotoSourceModal from './components/PhotoSourceModal';
import LocationPermissionModal from './components/LocationPermissionModal';
import CameraPreviewModal from './components/CameraPreviewModal';
import { useNetworkStatus } from './contexts/NetworkStatusContext';
import { addToQueue } from './services/offlineQueueService';
import * as FileSystem from 'expo-file-system/legacy';
import cameraService from './services/cameraService';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 60) / 3;

export default function PhotoUploader({ projectId }) {
  // ⚠️ PHOTO UPLOADER VERROUILLÉ - NE PAS MODIFIER SANS RAISON VALABLE
  // Ce composant gère l'upload, l'affichage et la suppression des photos de chantier
  // - Upload avec géolocalisation et reverse geocoding en arrière-plan
  // - Viewer plein écran avec navigation
  // - Suppression avec confirmation
  
  const theme = useSafeTheme();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const { isOffline } = useNetworkStatus();
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // États pour le visualiseur plein écran
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  
  // État pour la modal de sélection de source photo
  const [isSourceModalVisible, setIsSourceModalVisible] = useState(false);
  
  // État pour la modal de permission de géolocalisation
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [pendingPhotoUri, setPendingPhotoUri] = useState(null);
  
  // État pour la prévisualisation caméra
  const [isCameraPreviewVisible, setIsCameraPreviewVisible] = useState(false);
  const [capturedPhotoUri, setCapturedPhotoUri] = useState(null);

  // Fonction utilitaire pour formater la date (hors renderItem pour performance)
  const formatPhotoDate = useCallback((dateString) => {
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
  }, []);

  // Fonction pour vérifier la géolocalisation (hors renderItem pour performance)
  const checkHasLocation = useCallback((item) => {
    if (item.latitude == null || item.longitude == null) {
      return false;
    }
    const lat = typeof item.latitude === 'string' ? parseFloat(item.latitude) : item.latitude;
    const lng = typeof item.longitude === 'string' ? parseFloat(item.longitude) : item.longitude;
    if (isNaN(lat) || isNaN(lng)) {
      return false;
    }
    if (lat === 0 && lng === 0) {
      return false;
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return false;
    }
    return true;
  }, []);

  // ═══════════════════════════════════════════════════════════
  // FONCTION : CHARGER LES PHOTOS (VERROUILLÉE)
  // ═══════════════════════════════════════════════════════════
  const loadPhotos = async () => {
    try {
      // ✅ Récupérer l'utilisateur connecté pour isolation multi-tenant
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showError('Utilisateur non authentifié');
        return;
      }

      // Optimisation: sélectionner uniquement les colonnes nécessaires à l'affichage
      const { data, error } = await supabase
        .from('project_photos')
        .select('id, url, project_id, client_id, user_id, taken_at, created_at, latitude, longitude, city')
        .eq('project_id', projectId)
        .eq('user_id', user.id) // ✅ Filtre obligatoire pour isolation utilisateurs
        .order('created_at', { ascending: false });
      
      if (error) {
        logger.error('PhotoUploader', 'Erreur chargement photos', error);
        showError('Impossible de charger les photos');
        return;
      }
      setPhotos(data || []);
    } catch (err) {
      logger.error('PhotoUploader', 'Exception chargement photos', err);
      showError('Erreur lors du chargement des photos');
    }
  };

  useEffect(() => {
    if (projectId) {
      loadPhotos();
    }
  }, [projectId]);

  // Rafraîchir quand l'écran parent devient visible
  useEffect(() => {
    if (isFocused && projectId) {
      loadPhotos();
    }
  }, [isFocused, projectId]);

  // Écouter les événements de capture photo depuis ProjectCameraScreen
  useEffect(() => {
    const unsubscribe = cameraService.onPhotoCaptured(async (photoUri) => {
      logger.info('PhotoUploader', 'Photo capturée reçue depuis caméra', { photoUri });
      await processAndUploadPhoto(photoUri);
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // processAndUploadPhoto est stable, pas besoin de dépendance

  const pickAndUpload = async () => {
    const { currentClient, currentProject } = useAppStore.getState();
    if (!currentProject?.id || !currentClient?.id) {
      Alert.alert('Sélection manquante', 'Sélectionne d\'abord un client et un chantier');
      return;
    }

    // ✅ Ouvrir directement la caméra intégrée (flux ultra-rapide)
    navigation.navigate('ProjectCamera', {
      projectId: currentProject.id,
    });
  };

  const pickFromCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Autorise l\'accès à la caméra');
        return;
      }

      // ✅ Ouvrir la caméra avec preview amélioré
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false, // On gère le preview nous-mêmes
        quality: 0.8,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });

      if (result.canceled) {return;}
      
      // ✅ Afficher la prévisualisation avant upload
      const photoUri = result.assets[0].uri;
      setCapturedPhotoUri(photoUri);
      setIsCameraPreviewVisible(true);
    } catch (err) {
      logger.error('PhotoUploader', 'Erreur capture caméra', err);
      showError('Erreur lors de la capture');
    }
  };

  // ✅ Confirmer la photo capturée et l'uploader
  const handleConfirmPhoto = async () => {
    if (capturedPhotoUri) {
      setIsCameraPreviewVisible(false);
      await processAndUploadPhoto(capturedPhotoUri);
      setCapturedPhotoUri(null);
    }
  };

  // ✅ Reprendre la photo (fermer preview et rouvrir caméra)
  const handleRetakePhoto = () => {
    setIsCameraPreviewVisible(false);
    setCapturedPhotoUri(null);
    // Rouvrir la caméra
    setTimeout(() => {
      pickFromCamera();
    }, 300); // Petit délai pour la fermeture de la modal
  };

  const pickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Autorise l\'accès à la galerie');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (result.canceled) {return;}
      
      await processAndUploadPhoto(result.assets[0].uri);
    } catch (err) {
      logger.error('PhotoUploader', 'Erreur sélection galerie', err);
      showError('Erreur lors de la sélection');
    }
  };

  // ═══════════════════════════════════════════════════════════
  // FONCTION : VÉRIFIER STATUT PERMISSION GÉOLOCALISATION
  // ═══════════════════════════════════════════════════════════
  const checkLocationPermissionStatus = async () => {
    try {
      const Location = await import('expo-location').then(mod => mod.default || mod);
      
      if (!Location || typeof Location.getForegroundPermissionsAsync !== 'function') {
        return 'unavailable';
      }

      // Vérifier le statut actuel de la permission
      const { status } = await Location.getForegroundPermissionsAsync();
      
      if (status === 'granted') {
        return 'granted';
      } else if (status === 'denied') {
        return 'denied';
      } else {
        // Permission pas encore demandée → retourner 'undetermined' pour afficher la modal
        return 'undetermined';
      }
    } catch (err) {
      logger.debug('PhotoUploader', 'Module expo-location non disponible', err.message);
      return 'unavailable';
    }
  };

  // ═══════════════════════════════════════════════════════════
  // FONCTION : TRAITER UNE PHOTO HORS LIGNE
  // ═══════════════════════════════════════════════════════════
  const processPhotoOffline = async (originalUri, skipLocationCheck = false) => {
    try {
      setUploading(true);
      setUploadProgress(10);
      
      // Récupérer currentProject et currentClient depuis le store
      const { currentProject, currentClient } = useAppStore.getState();
      
      if (!currentProject?.id) {
        throw new Error('Aucun projet sélectionné');
      }
      
      if (!currentClient?.id) {
        throw new Error('Aucun client sélectionné');
      }

      // Compression de l'image
      setUploadProgress(30);
      const compressed = await compressImage(originalUri);
      setUploadProgress(50);

      // Créer le dossier photos s'il n'existe pas
      const photosDir = `${FileSystem.documentDirectory}photos/`;
      const dirInfo = await FileSystem.getInfoAsync(photosDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(photosDir, { intermediates: true });
      }

      // Copier la photo dans un chemin local persistant
      const fileName = `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
      const localUri = `${photosDir}${fileName}`;
      await FileSystem.copyAsync({
        from: compressed.uri,
        to: localUri,
      });
      setUploadProgress(70);

      // Capturer la date/heure de prise de vue
      const takenAt = new Date().toISOString();

      // Récupérer la position GPS (optionnel, même hors ligne)
      let latitude = null;
      let longitude = null;
      if (!skipLocationCheck) {
        const permissionStatus = await checkLocationPermissionStatus();
        if (permissionStatus === 'granted') {
          try {
            const Location = await import('expo-location').then(mod => mod.default || mod);
            if (Location?.getCurrentPositionAsync) {
              const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
                timeout: 10000,
                maximumAge: 60000,
              });
              
              if (location?.coords?.latitude && location?.coords?.longitude) {
                const lat = location.coords.latitude;
                const lng = location.coords.longitude;
                
                if (lat !== 0 && lng !== 0 && 
                    lat >= -90 && lat <= 90 && 
                    lng >= -180 && lng <= 180) {
                  latitude = lat;
                  longitude = lng;
                }
              }
            }
          } catch (locationErr) {
            logger.warn('PhotoUploader', 'Erreur GPS hors ligne', locationErr.message);
          }
        }
      }

      // Ajouter à la queue
      setUploadProgress(80);
      const queueItem = await addToQueue({
        type: 'photo',
        data: {
          localUri,
          projectId: currentProject.id,
          clientId: currentClient.id,
          metadata: {
            taken_at: takenAt,
            latitude,
            longitude,
          },
        },
      });
      setUploadProgress(90);

      // Créer un objet photo local pour l'affichage immédiat
      const localPhoto = {
        id: queueItem.id,
        project_id: currentProject.id,
        client_id: currentClient.id,
        url: localUri,
        uri: localUri,
        taken_at: takenAt,
        latitude,
        longitude,
        synced: false,
        created_at: takenAt,
        isLocal: true, // Marqueur pour indiquer que c'est une photo locale
      };

      // Ajouter la photo à la liste immédiatement
      setPhotos((prev) => [localPhoto, ...prev]);
      setUploadProgress(100);
      
      showSuccess('Photo sauvegardée (synchronisation en attente)');
      logger.info('PhotoUploader', `Photo sauvegardée hors ligne: ${queueItem.id}`);
    } catch (err) {
      logger.error('PhotoUploader', 'Erreur traitement photo hors ligne', err);
      showError('Impossible de sauvegarder la photo');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // FONCTION : TRAITER ET UPLOADER UNE PHOTO (VERROUILLÉE)
  // ═══════════════════════════════════════════════════════════
  // - Compression de l'image
  // - Capture GPS avec timeout (si permission accordée)
  // - Upload vers Supabase Storage (ou queue si hors ligne)
  // - Insertion en BDD avec géolocalisation
  // - Reverse geocoding en arrière-plan pour la ville
  // ═══════════════════════════════════════════════════════════
  const processAndUploadPhoto = async (originalUri, skipLocationCheck = false) => {
    // Si hors ligne, sauvegarder localement et ajouter à la queue
    if (isOffline) {
      return await processPhotoOffline(originalUri, skipLocationCheck);
    }
    try {
      setUploading(true);
      setUploadProgress(0);
      
      // Capturer la date/heure de prise de vue
      const takenAt = new Date().toISOString();
      
      // Simuler progress initial (collecte données)
      setUploadProgress(10);
      
      // Récupérer la position GPS (si permission accordée et module disponible)
      let latitude = null;
      let longitude = null;
      let city = null; // Ville obtenue via reverse geocoding
      
      // La géolocalisation est OPTIONNELLE (module natif requis)
      // L'app fonctionne sans GPS, les photos sont juste sans coordonnées
      if (!skipLocationCheck) {
        try {
          const Location = await import('expo-location').then(mod => mod.default || mod);
          
          if (Location && typeof Location.requestForegroundPermissionsAsync === 'function') {
            // Vérifier d'abord le statut actuel
            const permissionStatus = await checkLocationPermissionStatus();
            
            // Si permission pas encore demandée, on la demandera via la modal
            if (permissionStatus === 'undetermined') {
              setPendingPhotoUri(originalUri);
              setIsLocationModalVisible(true);
              setUploading(false);
              setUploadProgress(0);
              return; // Sortir et attendre la réponse de l'utilisateur
            }
            
            // Si permission refusée, continuer sans GPS
            if (permissionStatus === 'denied') {
              logger.info('PhotoUploader', 'Permission de géolocalisation refusée, photo sans GPS');
              // Continue sans GPS
            }
            
            // Si permission accordée, récupérer la position
            if (permissionStatus === 'granted') {
              try {
                const location = await Location.getCurrentPositionAsync({
                  accuracy: Location.Accuracy.Balanced,
                  timeout: 10000, // Timeout 10s pour laisser plus de temps
                  maximumAge: 60000, // Accepter une position jusqu'à 1 minute
                });
              
              // Vérifier que les coordonnées sont valides (pas 0,0 et dans des limites raisonnables)
              if (location?.coords?.latitude && location?.coords?.longitude) {
                const lat = location.coords.latitude;
                const lng = location.coords.longitude;
                
                // Vérifier que ce n'est pas 0,0 (qui est dans le golfe de Guinée, peu probable)
                // et que les coordonnées sont dans des limites raisonnables
                if (lat !== 0 && lng !== 0 && 
                    lat >= -90 && lat <= 90 && 
                    lng >= -180 && lng <= 180) {
                  latitude = lat;
                  longitude = lng;
                  logger.info('PhotoUploader', `Géolocalisation capturée: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
                  
                  // Reverse geocoding sera fait en arrière-plan après l'upload pour ne pas ralentir
                  // On stocke les coordonnées pour le reverse geocoding asynchrone
                } else {
                  logger.warn('PhotoUploader', 'Coordonnées GPS invalides (0,0 ou hors limites)');
                }
                }
              } catch (locationErr) {
                logger.warn('PhotoUploader', 'Erreur récupération position GPS', locationErr.message);
                // Continue sans GPS
              }
            }
          }
        } catch (importErr) {
          // Module natif non disponible (Expo Go en dev) → normal, continue sans GPS
          logger.debug('PhotoUploader', 'Module expo-location non disponible (normal en Expo Go)');
        }
      }
      
      // Compression de l'image avant upload
      setUploadProgress(20);
      const compressed = await compressImage(originalUri);
      setUploadProgress(40);
      
      const resp = await fetch(compressed.uri);
      const arrayBuffer = await resp.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      setUploadProgress(50);

      const fileName = `projects/${projectId}/${Date.now()}.jpg`;
      
      // Upload avec simulation de progress
      setUploadProgress(60);
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('project-photos')
        .upload(fileName, bytes, { contentType: 'image/jpeg', upsert: false });
      setUploadProgress(80);

      if (uploadErr) {throw uploadErr;}

      const { data: urlData } = supabase.storage.from('project-photos').getPublicUrl(fileName);
      const publicUrl = urlData.publicUrl;

      // Récupérer l'utilisateur connecté pour RLS
      const { data: { user } } = await supabase.auth.getUser();

      // Récupérer currentProject et currentClient depuis le store
      const { currentProject, currentClient } = useAppStore.getState();
      
      if (!currentProject?.id) {
        throw new Error('Aucun projet sélectionné');
      }
      
      if (!currentClient?.id) {
        throw new Error('Aucun client sélectionné');
      }

      // Préparer les données avec horodatage et géolocalisation
      const photoData = {
        project_id: currentProject.id,
        client_id: currentClient.id,
        user_id: user?.id, // Nécessaire pour RLS
        url: publicUrl,
        taken_at: takenAt,
      };

      // Ajouter latitude/longitude seulement si disponibles (ville sera ajoutée après)
      if (latitude !== null && longitude !== null) {
        photoData.latitude = latitude;
        photoData.longitude = longitude;
      }

      const { error: insertErr, data: insertedData } = await supabase
        .from('project_photos')
        .insert([photoData])
        .select()
        .single();

      if (insertErr) {throw insertErr;}

      setUploadProgress(95);
      await loadPhotos();
      setUploadProgress(100);
      showSuccess('Photo envoyée');

      // Reverse geocoding en arrière-plan (ne bloque pas l'upload)
      if (latitude !== null && longitude !== null && insertedData?.id) {
        // Faire le reverse geocoding de manière asynchrone sans bloquer
        (async () => {
          try {
            const Location = await import('expo-location').then(mod => mod.default || mod);
            
            if (Location?.reverseGeocodeAsync && typeof Location.reverseGeocodeAsync === 'function') {
              const reverseGeocodeResult = await Location.reverseGeocodeAsync({
                latitude,
                longitude,
              });
              
              if (reverseGeocodeResult && reverseGeocodeResult.length > 0) {
                const address = reverseGeocodeResult[0];
                // Prioriser city, sinon locality, sinon subLocality
                const detectedCity = address.city || address.locality || address.subLocality || null;
                
                if (detectedCity) {
                  logger.info('PhotoUploader', `Ville détectée en arrière-plan: ${detectedCity}`);
                  
                  // Mettre à jour la photo avec la ville
                  const { error: updateErr } = await supabase
                    .from('project_photos')
                    .update({ city: detectedCity })
                    .eq('id', insertedData.id);
                  
                  if (!updateErr) {
                    // Recharger les photos pour afficher la ville
                    await loadPhotos();
                  } else {
                    logger.warn('PhotoUploader', 'Erreur mise à jour ville', updateErr);
                  }
                }
              }
            }
          } catch (geocodeErr) {
            // Erreur reverse geocoding → silencieuse, la photo est déjà uploadée
            logger.debug('PhotoUploader', 'Reverse geocoding échoué en arrière-plan', geocodeErr.message);
          }
        })();
      }
    } catch (err) {
      logger.error('PhotoUploader', 'Erreur upload', err);
      showError('Impossible d\'envoyer la photo');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // FONCTION : SUPPRIMER UNE PHOTO (VERROUILLÉE)
  // ═══════════════════════════════════════════════════════════
  const deletePhoto = async (id, url) => {
    try {
      const path = url.split('/').slice(-3).join('/');
      const { error: storageErr } = await supabase.storage.from('project-photos').remove([path]);
      if (storageErr) {
        logger.error('PhotoUploader', 'Erreur suppression storage', storageErr);
      }

      const { error } = await supabase.from('project_photos').delete().eq('id', id);
      if (error) {
        logger.error('PhotoUploader', 'Erreur suppression DB', error);
        showError('Impossible de supprimer la photo');
        return;
      }

      await loadPhotos();
      showSuccess('Photo supprimée');
    } catch (err) {
      logger.error('PhotoUploader', 'Exception suppression photo', err);
      showError('Erreur lors de la suppression');
    }
  };

  // ═══════════════════════════════════════════════════════════
  // FONCTION : CONFIRMER SUPPRESSION DEPUIS VIEWER (VERROUILLÉE)
  // ═══════════════════════════════════════════════════════════
  const handleConfirmDeleteCurrentPhoto = (currentImageIndex) => {
    if (viewerImages.length === 0 || photos.length === 0) {return;}
    
    // Utiliser l'index passé en paramètre (depuis FooterComponent) ou viewerIndex en fallback
    const activeIndex = currentImageIndex !== undefined ? currentImageIndex : viewerIndex;
    const currentPhoto = photos[activeIndex];
    if (!currentPhoto) {return;}

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
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
              showError('Utilisateur non authentifié');
              return;
            }
            const { data: updatedPhotos } = await supabase
              .from('project_photos')
              .select('*')
              .eq('project_id', projectId)
              .eq('user_id', user.id) // ✅ Filtre obligatoire pour isolation utilisateurs
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

  // ═══════════════════════════════════════════════════════════
  // FONCTIONS : VIEWER PLEIN ÉCRAN (VERROUILLÉES)
  // ═══════════════════════════════════════════════════════════
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

  // RenderItem mémorisé pour FlatList (évite rerenders inutiles) - défini après openViewer et deletePhoto
  const renderPhotoItem = useCallback(({ item, index }) => {
    const photoDate = formatPhotoDate(item.taken_at || item.created_at);
    const hasLocation = checkHasLocation(item);
    const isPendingSync = item.synced === false || item.isLocal === true;

    return (
      <View style={styles.photoContainer}>
        <TouchableOpacity
          style={styles.photo}
          onPress={() => openViewer(index)}
          onLongPress={() => deletePhoto(item.id, item.url)}
          activeOpacity={0.7}
        >
          <Image source={{ uri: item.url || item.uri }} style={styles.photoImg} />
          {isPendingSync && (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>🔄 En attente</Text>
            </View>
          )}
        </TouchableOpacity>
        {photoDate && (
          <View style={styles.photoInfo}>
            <Text style={styles.photoDateText}>{photoDate}</Text>
            {hasLocation && item.city && item.city.trim().length > 0 && (
              <View style={styles.locationBadge}>
                <Feather name="map-pin" size={10} color={theme.colors.accent} />
                <Text style={styles.locationText} numberOfLines={1} ellipsizeMode="tail">
                  {item.city}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  }, [formatPhotoDate, checkHasLocation, styles, theme.colors.accent, openViewer, deletePhoto]);

  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <View>
        <TouchableOpacity
          style={styles.btn}
          onPress={pickAndUpload}
          disabled={uploading}
          activeOpacity={0.7}
        >
          {uploading ? (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator color={theme.colors.text} size="small" />
              <Text style={styles.uploadingText}>Upload {Math.round(uploadProgress)}%</Text>
            </View>
          ) : (
            <>
              <Feather name="camera" size={20} color={theme.colors.text} strokeWidth={2.5} />
              <Text style={styles.btnText}>Prendre une photo</Text>
            </>
          )}
        </TouchableOpacity>
        
        {/* Lien discret pour importer depuis la galerie (option secondaire) */}
        {!uploading && (
          <TouchableOpacity
            onPress={pickFromGallery}
            style={styles.galleryLink}
            activeOpacity={0.7}
          >
            <Feather name="image" size={14} color={theme.colors.textSecondary} strokeWidth={2} />
            <Text style={styles.galleryLinkText}>Importer depuis la galerie</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {uploading && uploadProgress > 0 && (
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${uploadProgress}%` }]} />
        </View>
      )}
      
      <FlatList
        data={photos}
        numColumns={3}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderPhotoItem}
        ListEmptyComponent={<Text style={styles.empty}>Aucune photo</Text>}
        columnWrapperStyle={{ gap: 10, marginBottom: 10 }}
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        windowSize={5}
        removeClippedSubviews={true}
      />

      {/* Modal de sélection de source photo - DÉSACTIVÉ du flux principal */}
      {/* Conservé pour compatibilité mais non utilisé dans le flux principal */}
      <PhotoSourceModal
        visible={false}
        onClose={() => setIsSourceModalVisible(false)}
        onCamera={pickFromCamera}
        onGallery={pickFromGallery}
      />

      {/* Modal de prévisualisation caméra */}
      <CameraPreviewModal
        visible={isCameraPreviewVisible}
        photoUri={capturedPhotoUri}
        onConfirm={handleConfirmPhoto}
        onRetake={handleRetakePhoto}
        onClose={() => {
          setIsCameraPreviewVisible(false);
          setCapturedPhotoUri(null);
        }}
      />

      {/* Modal d'explication permission géolocalisation */}
      <LocationPermissionModal
        visible={isLocationModalVisible}
        onClose={() => {
          setIsLocationModalVisible(false);
          // Si l'utilisateur ferme sans choisir, continuer sans GPS
          if (pendingPhotoUri) {
            processAndUploadPhoto(pendingPhotoUri, true);
            setPendingPhotoUri(null);
          }
        }}
        onAllow={async () => {
          // L'utilisateur accepte → demander la permission et continuer
          if (pendingPhotoUri) {
            try {
              const Location = await import('expo-location').then(mod => mod.default || mod);
              if (Location && typeof Location.requestForegroundPermissionsAsync === 'function') {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                  // Permission accordée, continuer avec GPS
                  await processAndUploadPhoto(pendingPhotoUri, false);
                } else {
                  // Permission refusée, continuer sans GPS
                  await processAndUploadPhoto(pendingPhotoUri, true);
                }
              } else {
                // Module non disponible, continuer sans GPS
                await processAndUploadPhoto(pendingPhotoUri, true);
              }
            } catch (err) {
              logger.warn('PhotoUploader', 'Erreur demande permission GPS', err);
              // En cas d'erreur, continuer sans GPS
              await processAndUploadPhoto(pendingPhotoUri, true);
            }
            setPendingPhotoUri(null);
          }
        }}
        onDeny={() => {
          // L'utilisateur refuse → continuer sans GPS
          if (pendingPhotoUri) {
            processAndUploadPhoto(pendingPhotoUri, true);
            setPendingPhotoUri(null);
          }
        }}
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
          if (viewerImages.length === 0) {return null;}
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
          if (viewerImages.length === 0) {return null;}
          
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
  galleryLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
  },
  galleryLinkText: {
    ...theme.typography.bodySmall,
    fontSize: 13,
    color: theme.colors.textSecondary,
    textDecorationLine: 'underline',
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  uploadingText: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text,
    fontSize: 14,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.sm,
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
  pendingBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#F59E0B', // Orange
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 10,
  },
  pendingBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
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
