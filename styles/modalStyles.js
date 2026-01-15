/**
 * Coffee Palation - Modal Styles
 */

import { StyleSheet, Dimensions } from 'react-native';
import COLORS from './colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const modalStyles = StyleSheet.create({
  // Overlay
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Card
  card: {
    backgroundColor: COLORS.cream,
    width: SCREEN_WIDTH * 0.88,
    maxWidth: 380,
    borderRadius: 25,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 4,
    borderColor: COLORS.accent,
  },
  
  // Icon/Emoji
  icon: {
    fontSize: 60,
    marginBottom: 15,
  },
  
  // Titles
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.espresso,
    marginBottom: 20,
    textAlign: 'center',
  },
  
  gameOverTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  
  highScoreText: {
    fontSize: 18,
    color: COLORS.successDark,
    fontWeight: 'bold',
    marginBottom: 15,
    backgroundColor: COLORS.goldLight,
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 10,
    overflow: 'hidden',
  },
  
  // Input
  input: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 16,
    fontSize: 20,
    textAlign: 'center',
    borderWidth: 3,
    borderColor: COLORS.latte,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  
  inputFocused: {
    borderColor: COLORS.accentDark,
  },
  
  // Score Display
  scoreBox: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 50,
    paddingVertical: 20,
    borderRadius: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.accentDark,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  
  scoreLabel: {
    fontSize: 14,
    color: COLORS.coffee,
    fontWeight: '600',
    marginBottom: 5,
  },
  
  scoreValue: {
    fontSize: 64,
    fontWeight: 'bold',
    color: COLORS.espresso,
  },
  
  // Buttons
  primaryButton: {
    width: '100%',
    backgroundColor: COLORS.successDark,
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.success,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  
  primaryButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textLight,
    letterSpacing: 1,
  },
  
  secondaryButton: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  
  secondaryButtonText: {
    fontSize: 16,
    color: COLORS.coffee,
    fontWeight: '600',
  },
  
  // Decorations
  confetti: {
    position: 'absolute',
    fontSize: 30,
  },
});

export default modalStyles;

