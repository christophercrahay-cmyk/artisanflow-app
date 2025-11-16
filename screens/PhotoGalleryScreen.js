import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import ImageViewing from 'react-native-image-viewing';
import { supabase } from '../supabaseClient';
import { useSafeTheme } from '../theme/useSafeTheme';
import { getCurrentUser } from '../utils/auth';
import logger from '../utils/logger';
import EmptyState from '../components/EmptyState';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 48) / 3; // 3 colonnes avec marges

/**
 * Écran de galerie photos
 * Affiche toutes les photos de l'utilisateur (tous chantiers confondus)
 */
export default function PhotoGalleryScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const theme = useSafeTheme();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const styles = useMemo(() => getStyles(theme, insets), [theme, insets]);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      if (!user) {
        logger.warn('PhotoGallery', 'Pas de user connecté');
        setLoading(false);
        return;
      }

      // Charger toutes les photos de l'utilisateur
      const { data, error } = await supabase
        .from('project_photos')
        .select('id, url, project_id, taken_at, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('PhotoGallery', 'Erreur chargement photos', error);
        setLoading(false);
        return;
      }

      logger.success('PhotoGallery', `${data?.length || 0} photos chargées`);
      setPhotos(data || []);
    } catch (err) {
      logger.error('PhotoGallery', 'Exception chargement photos', err);
    } finally {
      setLoading(false);
    }
  };

  const openViewer = (index) => {
    setViewerIndex(index);
    setIsViewerVisible(true);
  };

  const viewerImages = useMemo(() => {
    return photos.map((photo) => ({
      uri: photo.url,
    }));
  }, [photos]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text style={styles.loadingText}>Chargement des photos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={24} color={theme.colors.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.title}>Galerie Photos</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('CaptureTab')}
          style={styles.captureButton}
          activeOpacity={0.7}
        >
          <Feather name="camera" size={24} color={theme.colors.accent} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {photos.length === 0 ? (
        <EmptyState
          icon="image"
          title="Aucune photo"
          subtitle="Prenez votre première photo de chantier"
          buttonText="Prendre une photo"
          onButtonPress={() => navigation.navigate('CaptureTab')}
        />
      ) : (
        <>
          <View style={styles.statsBar}>
            <Feather name="image" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.statsText}>
              {photos.length} photo{photos.length > 1 ? 's' : ''} au total
            </Text>
          </View>

          <FlatList
            data={photos}
            numColumns={3}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.grid}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={styles.photoContainer}
                onPress={() => openViewer(index)}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: item.url }}
                  style={styles.photo}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            )}
            columnWrapperStyle={{ gap: 12 }}
          />
        </>
      )}

      {/* Visualiseur plein écran */}
      <ImageViewing
        images={viewerImages}
        imageIndex={viewerIndex}
        visible={isViewerVisible}
        onRequestClose={() => setIsViewerVisible(false)}
        onImageIndexChange={setViewerIndex}
        swipeToCloseEnabled={true}
        doubleTapToZoomEnabled={true}
        presentationStyle="overFullScreen"
        animationType="fade"
        HeaderComponent={({ imageIndex }) => (
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
        )}
      />
    </SafeAreaView>
  );
}

const getStyles = (theme, insets) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...theme.typography.h2,
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },
  captureButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  statsText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontSize: 13,
  },
  grid: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: insets.bottom + theme.spacing.xl,
    gap: 12,
  },
  photoContainer: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    marginBottom: 12,
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceElevated,
  },
  viewerHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1,
  },
  viewerHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  viewerHeaderText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
    fontSize: 16,
  },
  viewerCloseButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

