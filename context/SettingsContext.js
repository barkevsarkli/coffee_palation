import React, { createContext, useState, useEffect, useContext } from 'react';
import { getSettings, saveSettings } from '../utils/storage';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [difficulty, setDifficulty] = useState('EASY');
  const [isLoading, setIsLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await getSettings();
      setSoundEnabled(settings.soundEnabled);
      setDifficulty(settings.difficulty);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSound = async () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    await saveSettings({ soundEnabled: newValue, difficulty });
  };

  const changeDifficulty = async (newDifficulty) => {
    setDifficulty(newDifficulty);
    await saveSettings({ soundEnabled, difficulty: newDifficulty });
  };

  const value = {
    soundEnabled,
    difficulty,
    toggleSound,
    changeDifficulty,
    isLoading,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

