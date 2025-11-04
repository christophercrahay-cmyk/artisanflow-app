import React from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { useSafeTheme } from '../theme/useSafeTheme';

/**
 * Composant ScrollView avec RefreshControl intégré
 * 
 * @param {object} props - Props de ScrollView + refreshing, onRefresh
 */
export default function RefreshableScrollView({
  refreshing = false,
  onRefresh,
  tintColor,
  children,
  ...scrollViewProps
}) {
  const theme = useSafeTheme();
  
  return (
    <ScrollView
      {...scrollViewProps}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={tintColor || theme.colors.accent}
          colors={[tintColor || theme.colors.accent]}
          progressBackgroundColor={theme.colors.surface}
        />
      }
    >
      {children}
    </ScrollView>
  );
}

