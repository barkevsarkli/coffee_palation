import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { COLORS, FONTS, SHADOWS } from '../styles/theme';

const GameOverModal = ({ visible, score, isHighScore, onRestart, onMainMenu }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onMainMenu}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Game Over!</Text>
          
          {isHighScore && (
            <Text style={styles.highScoreText}>🎉 New High Score! 🎉</Text>
          )}
          
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Final Score</Text>
            <Text style={styles.score}>{score}</Text>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.restartButton]}
            onPress={onRestart}
          >
            <Text style={styles.buttonText}>Restart</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.menuButton]}
            onPress={onMainMenu}
          >
            <Text style={styles.buttonText}>Main Menu</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: COLORS.accent,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '80%',
    maxWidth: 400,
    ...SHADOWS.card,
  },
  title: {
    ...FONTS.title,
    fontSize: 36,
    marginBottom: 10,
  },
  highScoreText: {
    ...FONTS.subtitle,
    fontSize: 18,
    color: COLORS.success,
    marginBottom: 15,
  },
  scoreContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  scoreLabel: {
    ...FONTS.body,
    fontSize: 18,
    marginBottom: 5,
  },
  score: {
    ...FONTS.score,
    fontSize: 48,
    color: COLORS.primary,
  },
  button: {
    width: '100%',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 8,
    ...SHADOWS.button,
  },
  restartButton: {
    backgroundColor: COLORS.success,
  },
  menuButton: {
    backgroundColor: COLORS.secondary,
  },
  buttonText: {
    ...FONTS.button,
    fontSize: 18,
  },
});

export default GameOverModal;

