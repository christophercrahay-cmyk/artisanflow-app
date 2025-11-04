import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import networkManager from '../utils/networkManager';

export default function NetworkStatusBar() {
  const [isConnected, setIsConnected] = useState(true);
  const [slideAnim] = useState(new Animated.Value(-60));

  useEffect(() => {
    // S'abonner aux changements réseau
    const unsubscribe = networkManager.addListener((connected) => {
      setIsConnected(connected);

      if (!connected) {
        // Afficher la barre
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } else {
        // Cacher la barre après 2 secondes
        setTimeout(() => {
          Animated.timing(slideAnim, {
            toValue: -60,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }, 2000);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: isConnected ? '#10B981' : '#DC2626',
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Feather
        name={isConnected ? 'wifi' : 'wifi-off'}
        size={16}
        color="#FFFFFF"
      />
      <Text style={styles.text}>
        {isConnected ? 'Connexion rétablie' : 'Mode hors-ligne'}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 40,
    zIndex: 9999,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

