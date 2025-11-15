/**
 * SegmentedControl - Contrôle segmenté premium (style iOS)
 * Design System 2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '../../theme/theme2';

/**
 * Contrôle segmenté avec animation slide
 * @param {Array} segments - Tableau d'objets { value, label, icon }
 * @param {string} value - Valeur sélectionnée
 * @param {function} onChange - Callback changement
 * @param {object} style - Styles personnalisés
 */
export const SegmentedControl = ({ segments, value, onChange, style }) => {
  const theme = useThemeColors();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const selectedIndex = segments.findIndex(s => s.value === value);

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: selectedIndex,
      tension: 300,
      friction: 30,
      useNativeDriver: false, // ✅ false car on anime 'left' qui n'est pas supporté par useNativeDriver
    }).start();
  }, [selectedIndex]);

  const handlePress = (segment) => {
    if (segment.value !== value) {
      // // // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(segment.value);
    }
  };

  const segmentWidth = 100 / segments.length;

  return (
    <View
      ref={containerRef}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surfaceAlt,
          borderRadius: theme.radius.round,
        },
        style,
      ]}
    >
      {/* Indicateur animé */}
      {containerWidth > 0 && (
        <Animated.View
          style={[
            styles.indicator,
            {
              backgroundColor: theme.colors.primary,
              borderRadius: theme.radius.round,
              width: `${segmentWidth}%`,
              left: slideAnim.interpolate({
                inputRange: segments.map((_, i) => i),
                outputRange: segments.map((_, i) => 4 + (i * ((containerWidth - 8) / segments.length))),
              }),
            },
            theme.glowBlueLight,
          ]}
        />
      )}

      {/* Segments */}
      {segments.map((segment) => {
        const isSelected = segment.value === value;
        return (
          <Pressable
            key={segment.value}
            onPress={() => handlePress(segment)}
            style={({ pressed }) => [
              styles.segment,
              {
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            {segment.icon && (
              <Text style={[styles.icon, { color: isSelected ? theme.colors.primaryText : theme.colors.textMuted }]}>
                {segment.icon}
              </Text>
            )}
            <Text
              style={[
                styles.label,
                {
                  color: isSelected ? theme.colors.primaryText : theme.colors.textMuted,
                  fontWeight: isSelected ? theme.fontWeights.bold : theme.fontWeights.medium,
                },
              ]}
            >
              {segment.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    position: 'relative',
    padding: 4,
  },
  indicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    zIndex: 0,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 4,
    zIndex: 1,
  },
  icon: {
    fontSize: 14,
  },
  label: {
    fontSize: 13,
  },
});

export default SegmentedControl;

