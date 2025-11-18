/**
 * CollapsibleSection - Composant accordéon réutilisable
 * Permet de réduire/agrandir une section pour économiser l'espace
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme2';
import { ICON_COLORS } from '../theme/iconColors';

export default function CollapsibleSection({
  title,
  icon = 'chevron-down',
  defaultExpanded = false,
  children,
  headerRight,
  style,
}) {
  const theme = useThemeColors();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [animation] = useState(new Animated.Value(defaultExpanded ? 1 : 0));

  const toggle = () => {
    const toValue = isExpanded ? 0 : 1;
    
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: false, // height ne peut pas utiliser native driver
    }).start();

    setIsExpanded(!isExpanded);
  };

  const rotateInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const styles = getStyles(theme);

  return (
    <View style={[styles.container, style]}>
      {/* Header cliquable */}
      <TouchableOpacity
        style={styles.header}
        onPress={toggle}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Feather 
            name={icon} 
            size={18} 
            color={ICON_COLORS.primary} 
            style={{ marginRight: theme.spacing.xs }}
          />
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {title}
          </Text>
        </View>
        <View style={styles.headerRight}>
          {headerRight}
          <Animated.View
            style={{
              transform: [{ rotate: rotateInterpolate }],
              marginLeft: headerRight ? theme.spacing.sm : 0,
            }}
          >
            <Feather 
              name="chevron-down" 
              size={20} 
              color={ICON_COLORS.secondary} 
            />
          </Animated.View>
        </View>
      </TouchableOpacity>

      {/* Contenu (collapsible) */}
      {isExpanded && (
        <View style={styles.content}>
          {children}
        </View>
      )}
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surfaceAlt,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.h3,
    fontWeight: '600',
    flex: 1,
  },
  content: {
    padding: theme.spacing.md,
  },
});

