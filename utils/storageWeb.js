// Web-compatible storage using localStorage
import { Platform } from 'react-native';

// Check if we're on web platform
const isWeb = Platform.OS === 'web';

let AsyncStorage;
if (isWeb) {
  // Web implementation using localStorage
  AsyncStorage = {
    async getItem(key) {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.error('Error getting item from localStorage:', error);
        return null;
      }
    },
    async setItem(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.error('Error setting item to localStorage:', error);
      }
    },
    async removeItem(key) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('Error removing item from localStorage:', error);
      }
    },
  };
} else {
  // Native implementation
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
}

export default AsyncStorage;

