import React from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { useSafeTheme } from '../theme/useSafeTheme';

/**
 * Composant FlatList avec RefreshControl intégré
 * 
 * @param {object} props - Props de FlatList + refreshing, onRefresh
 */
export default function RefreshableList({
  refreshing = false,
  onRefresh,
  tintColor,
  ...flatListProps
}) {
  const theme = useSafeTheme();
  
  return (
    <FlatList
      {...flatListProps}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={tintColor || theme.colors.accent}
          colors={[tintColor || theme.colors.accent]}
          progressBackgroundColor={theme.colors.surface}
        />
      }
    />
  );
}

