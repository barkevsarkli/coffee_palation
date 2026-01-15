import { Dimensions } from 'react-native';

// Screen dimensions
export const SCREEN_WIDTH = Dimensions.get('window').width;
export const SCREEN_HEIGHT = Dimensions.get('window').height;

// Game physics constants
export const GRAVITY = 0.6;
export const JUMP_VELOCITY = -12;
export const TERMINAL_VELOCITY = 10;

// Game object dimensions
export const CUP_SIZE = 40;
export const PIPE_WIDTH = 60;
export const BEAN_SIZE = 25;

// Game difficulty settings
export const DIFFICULTY = {
  EASY: {
    gapSize: 180,
    pipeSpeed: 2.5,
  },
  HARD: {
    gapSize: 140,
    pipeSpeed: 3.5,
  },
};

// Game mechanics
export const PIPE_SPAWN_INTERVAL = 2000; // milliseconds
export const BEAN_SPAWN_CHANCE = 0.3; // 30% chance
export const GROUND_HEIGHT = 80;

// Collision detection settings
export const COLLISION_REDUCTION = 0.8; // Reduce hitbox to 80% for fairness

// Storage keys
export const STORAGE_KEYS = {
  SCORES: '@flappy_coffee:scores',
  SETTINGS: '@flappy_coffee:settings',
  USERNAME: '@flappy_coffee:username',
};

