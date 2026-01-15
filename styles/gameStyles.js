/**
 * Coffee Palation - Game Screen Styles
 */

import { StyleSheet, Dimensions, Platform } from 'react-native';
import COLORS from './colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Game Constants (exported for use in game logic)
export const GAME_CONSTANTS = {
  BIRD_SIZE: 50,
  PIPE_WIDTH: 65,
  PIPE_GAP: 190,
  GROUND_HEIGHT: 75,
  BEAN_SIZE: 35,
};

export const gameStyles = StyleSheet.create({
  // Main Containers
  container: {
    flex: 1,
  },
  
  sky: {
    flex: 1,
    backgroundColor: COLORS.sky,
    overflow: 'hidden',
  },
  
  skyGradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '30%',
    backgroundColor: COLORS.skyLight,
    opacity: 0.5,
  },
  
  // Ground
  ground: {
    height: GAME_CONSTANTS.GROUND_HEIGHT,
    backgroundColor: COLORS.ground,
    borderTopWidth: 6,
    borderTopColor: COLORS.successDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  groundPattern: {
    fontSize: 18,
    opacity: 0.3,
    color: COLORS.cream,
    letterSpacing: 3,
  },
  
  groundDirt: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: COLORS.groundDark,
  },
  
  // Score Display
  scoreContainer: {
    position: 'absolute',
    top: 35,
    alignSelf: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  
  scoreBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    paddingHorizontal: 25,
    paddingVertical: 8,
  },
  
  scoreText: {
    fontSize: 56,
    fontWeight: 'bold',
    color: COLORS.textLight,
    textShadowColor: '#000',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 5,
  },
  
  multiplierBadge: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 15,
    marginTop: 8,
    borderWidth: 3,
    borderColor: COLORS.goldDark,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  
  multiplierText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.espresso,
  },
  
  playerNameTag: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.textLight,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 10,
    overflow: 'hidden',
  },
  
  // Bird/Player
  bird: {
    position: 'absolute',
    width: GAME_CONSTANTS.BIRD_SIZE,
    height: GAME_CONSTANTS.BIRD_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  birdImage: {
    width: GAME_CONSTANTS.BIRD_SIZE,
    height: GAME_CONSTANTS.BIRD_SIZE,
    resizeMode: 'contain',
  },
  
  birdEmoji: {
    fontSize: GAME_CONSTANTS.BIRD_SIZE - 8,
  },
  
  birdShadow: {
    position: 'absolute',
    width: GAME_CONSTANTS.BIRD_SIZE * 0.8,
    height: 10,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 50,
    bottom: -15,
  },
  
  // Pipes
  pipe: {
    position: 'absolute',
    width: GAME_CONSTANTS.PIPE_WIDTH,
    backgroundColor: COLORS.pipe,
    borderWidth: 4,
    borderColor: COLORS.pipeDark,
    borderRadius: 4,
  },
  
  pipeCapTop: {
    position: 'absolute',
    bottom: -2,
    left: -6,
    right: -6,
    height: 25,
    backgroundColor: COLORS.pipe,
    borderWidth: 4,
    borderColor: COLORS.pipeDark,
    borderRadius: 5,
  },
  
  pipeCapBottom: {
    position: 'absolute',
    top: -2,
    left: -6,
    right: -6,
    height: 25,
    backgroundColor: COLORS.pipe,
    borderWidth: 4,
    borderColor: COLORS.pipeDark,
    borderRadius: 5,
  },
  
  pipeHighlight: {
    position: 'absolute',
    left: 8,
    top: 10,
    bottom: 10,
    width: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
  },
  
  // Beans
  bean: {
    position: 'absolute',
    width: GAME_CONSTANTS.BEAN_SIZE,
    height: GAME_CONSTANTS.BEAN_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  beanEmoji: {
    fontSize: GAME_CONSTANTS.BEAN_SIZE - 6,
  },
  
  beanGlow: {
    position: 'absolute',
    width: GAME_CONSTANTS.BEAN_SIZE + 10,
    height: GAME_CONSTANTS.BEAN_SIZE + 10,
    backgroundColor: COLORS.goldLight,
    borderRadius: 50,
    opacity: 0.4,
  },
  
  // Clouds
  cloud: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 40,
  },
  
  // Instructions
  instructionText: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    fontSize: 16,
    color: COLORS.textLight,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
  },
});

export default gameStyles;

