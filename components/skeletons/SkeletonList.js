import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonCard, { SkeletonLine, SkeletonCircle } from './SkeletonCard';

/**
 * Skeleton pour une liste de clients
 */
export function SkeletonClientList({ count = 5 }) {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} height={120}>
          <View style={styles.row}>
            <SkeletonCircle size={18} marginRight={8} />
            <SkeletonLine width="60%" height={20} marginBottom={0} />
          </View>
          <View style={{ marginTop: 12 }}>
            <SkeletonLine width="80%" height={14} />
            <SkeletonLine width="50%" height={14} />
            <SkeletonLine width="70%" height={14} marginBottom={0} />
          </View>
        </SkeletonCard>
      ))}
    </View>
  );
}

/**
 * Skeleton pour une liste de projets
 */
export function SkeletonProjectList({ count = 5 }) {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} height={140}>
          <View style={styles.row}>
            <SkeletonCircle size={20} marginRight={8} />
            <SkeletonLine width="70%" height={22} marginBottom={0} />
          </View>
          <View style={{ marginTop: 12 }}>
            <SkeletonLine width="90%" height={14} />
            <SkeletonLine width="60%" height={14} />
            <View style={[styles.row, { marginTop: 8 }]}>
              <SkeletonLine width="30%" height={24} marginBottom={0} />
              <SkeletonLine width="30%" height={24} marginBottom={0} />
            </View>
          </View>
        </SkeletonCard>
      ))}
    </View>
  );
}

/**
 * Skeleton pour une grille de photos
 */
export function SkeletonPhotoGrid({ count = 6 }) {
  return (
    <View style={styles.photoGrid}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} height={120} marginBottom={8}>
          <View />
        </SkeletonCard>
      ))}
    </View>
  );
}

/**
 * Skeleton pour un formulaire
 */
export function SkeletonForm() {
  return (
    <SkeletonCard height={300}>
      <SkeletonLine width="40%" height={20} marginBottom={16} />
      <SkeletonLine width="100%" height={56} marginBottom={12} />
      <SkeletonLine width="100%" height={56} marginBottom={12} />
      <SkeletonLine width="100%" height={56} marginBottom={16} />
      <SkeletonLine width="50%" height={48} marginBottom={0} />
    </SkeletonCard>
  );
}

/**
 * Skeleton pour un détail complet
 */
export function SkeletonDetail() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <SkeletonCard height={80}>
        <SkeletonLine width="70%" height={24} />
        <SkeletonLine width="50%" height={16} marginBottom={0} />
      </SkeletonCard>
      
      {/* Info cards */}
      <SkeletonCard height={120}>
        <SkeletonLine width="40%" height={18} marginBottom={16} />
        <SkeletonLine width="100%" height={14} />
        <SkeletonLine width="90%" height={14} />
        <SkeletonLine width="80%" height={14} marginBottom={0} />
      </SkeletonCard>
      
      <SkeletonCard height={180}>
        <SkeletonLine width="50%" height={18} marginBottom={16} />
        <View style={styles.row}>
          <SkeletonCard height={100} marginBottom={0} />
          <SkeletonCard height={100} marginBottom={0} />
          <SkeletonCard height={100} marginBottom={0} />
        </View>
      </SkeletonCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 16,
  },
});

