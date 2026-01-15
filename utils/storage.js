import AsyncStorage from './storageWeb';
import { STORAGE_KEYS } from './constants';

/**
 * Save a high score to the leaderboard with username
 * Only saves if it's in the top 5
 */
export const saveHighScore = async (score, username = 'Anonymous') => {
  try {
    const existingScores = await getTopScores();
    
    // Create new score entry with username and date
    const newEntry = {
      score: score,
      username: username,
      date: new Date().toISOString(),
    };
    
    const newScores = [...existingScores, newEntry]
      .sort((a, b) => b.score - a.score) // Sort by score descending
      .slice(0, 5); // Keep only top 5

    await AsyncStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify(newScores));
    return newScores;
  } catch (error) {
    console.error('Error saving high score:', error);
    return [];
  }
};

/**
 * Get the top 5 scores from storage
 * Returns array of { score, username, date } objects
 */
export const getTopScores = async () => {
  try {
    const scoresJson = await AsyncStorage.getItem(STORAGE_KEYS.SCORES);
    if (scoresJson) {
      const scores = JSON.parse(scoresJson);
      
      // Handle old format (just numbers) - convert to new format
      if (scores.length > 0 && typeof scores[0] === 'number') {
        const converted = scores.map(score => ({
          score: score,
          username: 'Anonymous',
          date: new Date().toISOString(),
        }));
        await AsyncStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify(converted));
        return converted.sort((a, b) => b.score - a.score).slice(0, 5);
      }
      
      return scores.sort((a, b) => b.score - a.score).slice(0, 5);
    }
    return [];
  } catch (error) {
    console.error('Error getting top scores:', error);
    return [];
  }
};

/**
 * Check if a score is a new high score (top 5)
 */
export const isHighScore = async (score) => {
  try {
    const topScores = await getTopScores();
    if (topScores.length < 5) {
      return true;
    }
    return score > topScores[topScores.length - 1].score;
  } catch (error) {
    console.error('Error checking high score:', error);
    return false;
  }
};

/**
 * Get username from storage
 */
export const getUsername = async () => {
  try {
    const username = await AsyncStorage.getItem(STORAGE_KEYS.USERNAME);
    return username || null;
  } catch (error) {
    console.error('Error getting username:', error);
    return null;
  }
};

/**
 * Save username to storage
 */
export const saveUsername = async (username) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USERNAME, username);
    return true;
  } catch (error) {
    console.error('Error saving username:', error);
    return false;
  }
};

/**
 * Get settings from storage
 */
export const getSettings = async () => {
  try {
    const settingsJson = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (settingsJson) {
      return JSON.parse(settingsJson);
    }
    // Default settings
    return {
      soundEnabled: true,
      difficulty: 'EASY',
    };
  } catch (error) {
    console.error('Error getting settings:', error);
    return {
      soundEnabled: true,
      difficulty: 'EASY',
    };
  }
};

/**
 * Save settings to storage
 */
export const saveSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
};

/**
 * Clear all high scores (for testing)
 */
export const clearScores = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.SCORES);
    return true;
  } catch (error) {
    console.error('Error clearing scores:', error);
    return false;
  }
};
