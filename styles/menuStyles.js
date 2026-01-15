/**
 * Coffee Palation - Menu Screen Styles
 */

import { StyleSheet, Dimensions } from 'react-native';
import COLORS from './colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const menuStyles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Backgrounds
  skyBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '55%',
    backgroundColor: COLORS.sky,
  },
  
  creamBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: COLORS.cream,
  },
  
  // Decorative Elements
  cloud: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 50,
  },
  cloudLarge: {
    width: 120,
    height: 50,
    top: 80,
    left: 20,
  },
  cloudMedium: {
    width: 80,
    height: 35,
    top: 140,
    right: 40,
  },
  cloudSmall: {
    width: 60,
    height: 25,
    top: 60,
    right: 80,
  },
  
  // Logo & Title
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  
  cupIcon: {
    fontSize: 90,
    textShadowColor: '#000',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 6,
  },
  
  characterImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  
  title: {
    fontSize: 52,
    fontWeight: 'bold',
    color: COLORS.espresso,
    textShadowColor: 'rgba(255,255,255,0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 2,
  },
  
  subtitle: {
    fontSize: 38,
    color: COLORS.coffee,
    letterSpacing: 8,
    fontWeight: '300',
    marginTop: -8,
  },
  
  tagline: {
    fontSize: 16,
    color: COLORS.primary,
    marginTop: 12,
    marginBottom: 40,
    fontStyle: 'italic',
  },
  
  // Buttons
  playButton: {
    backgroundColor: COLORS.successDark,
    paddingVertical: 18,
    paddingHorizontal: 70,
    borderRadius: 35,
    marginBottom: 15,
    borderWidth: 4,
    borderColor: COLORS.success,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 10,
    minWidth: SCREEN_WIDTH * 0.7,
    alignItems: 'center',
  },
  
  playButtonText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.textLight,
    letterSpacing: 3,
  },
  
  menuButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    paddingHorizontal: 35,
    borderRadius: 28,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: COLORS.accentDark,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
    minWidth: SCREEN_WIDTH * 0.6,
    alignItems: 'center',
  },
  
  menuButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.espresso,
  },
  
  // Version/Footer
  footer: {
    position: 'absolute',
    bottom: 20,
  },
  
  footerText: {
    fontSize: 12,
    color: COLORS.coffee,
    opacity: 0.6,
  },
});

export default menuStyles;

