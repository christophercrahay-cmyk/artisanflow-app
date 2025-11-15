import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeTheme } from '../theme/useSafeTheme';

/**
 * Badge/Tag pour afficher des statuts ou labels
 */
export default function Tag({ 
  label, 
  variant = 'default', // 'default' | 'success' | 'warning' | 'error' | 'info'
  style,
  textStyle,
}) {
  const theme = useSafeTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          backgroundColor: `${theme.colors.success  }20`,
          borderColor: theme.colors.success,
          textColor: theme.colors.success,
        };
      case 'warning':
        return {
          backgroundColor: `${theme.colors.warning  }20`,
          borderColor: theme.colors.warning,
          textColor: theme.colors.warning,
        };
      case 'error':
        return {
          backgroundColor: `${theme.colors.error  }20`,
          borderColor: theme.colors.error,
          textColor: theme.colors.error,
        };
      case 'info':
        return {
          backgroundColor: `${theme.colors.info  }20`,
          borderColor: theme.colors.info,
          textColor: theme.colors.info,
        };
      default:
        return {
          backgroundColor: `${theme.colors.accent  }20`,
          borderColor: theme.colors.accent,
          textColor: theme.colors.accent,
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <View
      style={[
        styles.tag,
        {
          backgroundColor: variantStyles.backgroundColor,
          borderColor: variantStyles.borderColor,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: variantStyles.textColor },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

