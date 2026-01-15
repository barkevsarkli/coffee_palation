/**
 * Coffee Palation - Theme Configuration
 * Master theme file for consistency
 */

import { COLORS } from './colors';

// Typography
export const TYPOGRAPHY = {
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.espresso,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 32,
    fontWeight: '300',
    color: COLORS.coffee,
    letterSpacing: 4,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.espresso,
  },
  body: {
    fontSize: 16,
    color: COLORS.coffee,
    lineHeight: 24,
  },
  button: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textLight,
    letterSpacing: 1,
  },
  score: {
    fontSize: 56,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  caption: {
    fontSize: 12,
    color: COLORS.latte,
  },
};

// Shadows
export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 12,
  },
  glow: {
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 8,
  },
};

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border Radius
export const RADIUS = {
  sm: 8,
  md: 15,
  lg: 25,
  xl: 35,
  round: 100,
};

// Animation durations (ms)
export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500,
  bounce: 1500,
};

// Export all as default
export default {
  COLORS,
  TYPOGRAPHY,
  SHADOWS,
  SPACING,
  RADIUS,
  ANIMATION,
};
