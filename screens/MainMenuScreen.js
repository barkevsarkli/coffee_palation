import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { COLORS, FONTS, SHADOWS } from '../styles/theme';

const MainMenuScreen = ({ onNavigate }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Floating coffee cup animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -20,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.cupContainer,
          {
            transform: [{ translateY: floatAnim }],
          },
        ]}
      >
        <Text style={styles.cupEmoji}>☕</Text>
      </Animated.View>

      <Text style={styles.title}>Coffee Palation</Text>
      <Text style={styles.subtitle}>Çekirdek topla, kahve al!</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.playButton]}
          onPress={() => onNavigate('game')}
        >
          <Text style={styles.buttonText}>Başla</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => onNavigate('scores')}
        >
          <Text style={styles.buttonText}>Puanlar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => onNavigate('settings')}
        >
          <Text style={styles.buttonText}>Ayarlar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cupContainer: {
    marginBottom: 20,
  },
  cupEmoji: {
    fontSize: 80,
  },
  title: {
    ...FONTS.title,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    ...FONTS.body,
    fontSize: 18,
    color: COLORS.secondary,
    marginBottom: 50,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },
  button: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginVertical: 10,
    ...SHADOWS.button,
  },
  playButton: {
    backgroundColor: COLORS.success,
    paddingVertical: 22,
  },
  secondaryButton: {
    backgroundColor: COLORS.secondary,
  },
  buttonText: {
    ...FONTS.button,
    fontSize: 22,
  },
});

export default MainMenuScreen;

