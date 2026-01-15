import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { COLORS, FONTS, SHADOWS } from '../styles/theme';
import { useSettings } from '../context/SettingsContext';

const SettingsScreen = ({ onNavigate }) => {
  const { soundEnabled, difficulty, toggleSound, changeDifficulty } = useSettings();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.settingsContainer}>
        {/* Sound Effects Toggle */}
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Sound Effects</Text>
            <Text style={styles.settingDescription}>
              Enable game sounds
            </Text>
          </View>
          <Switch
            value={soundEnabled}
            onValueChange={toggleSound}
            trackColor={{ false: '#D3D3D3', true: COLORS.success }}
            thumbColor={soundEnabled ? COLORS.textLight : '#f4f3f4'}
          />
        </View>

        {/* Difficulty Selection */}
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Difficulty</Text>
            <Text style={styles.settingDescription}>
              Choose your challenge level
            </Text>
          </View>
        </View>

        <View style={styles.difficultyButtons}>
          <TouchableOpacity
            style={[
              styles.difficultyButton,
              difficulty === 'EASY' && styles.difficultyButtonActive,
            ]}
            onPress={() => changeDifficulty('EASY')}
          >
            <Text
              style={[
                styles.difficultyText,
                difficulty === 'EASY' && styles.difficultyTextActive,
              ]}
            >
              Easy
            </Text>
            <Text style={styles.difficultyDetail}>Wider gaps</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.difficultyButton,
              difficulty === 'HARD' && styles.difficultyButtonActive,
            ]}
            onPress={() => changeDifficulty('HARD')}
          >
            <Text
              style={[
                styles.difficultyText,
                difficulty === 'HARD' && styles.difficultyTextActive,
              ]}
            >
              Hard
            </Text>
            <Text style={styles.difficultyDetail}>Narrower gaps</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => onNavigate('menu')}
      >
        <Text style={styles.buttonText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    ...FONTS.title,
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 30,
  },
  settingsContainer: {
    flex: 1,
    backgroundColor: COLORS.accent,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    ...SHADOWS.card,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingLabel: {
    ...FONTS.subtitle,
    fontSize: 20,
    marginBottom: 5,
  },
  settingDescription: {
    ...FONTS.body,
    fontSize: 14,
    color: COLORS.secondary,
  },
  difficultyButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  difficultyButton: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  difficultyButtonActive: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.success + '20',
  },
  difficultyText: {
    ...FONTS.button,
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 5,
  },
  difficultyTextActive: {
    color: COLORS.success,
  },
  difficultyDetail: {
    ...FONTS.body,
    fontSize: 12,
    color: COLORS.secondary,
  },
  backButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
    ...SHADOWS.button,
  },
  buttonText: {
    ...FONTS.button,
    fontSize: 18,
  },
});

export default SettingsScreen;

