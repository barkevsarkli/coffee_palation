// Web-compatible audio system
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

class WebAudioSound {
  constructor(uri) {
    this.audio = null;
    this.uri = uri;
    this.isLoaded = false;
  }

  async loadAsync() {
    if (isWeb) {
      try {
        this.audio = new Audio(this.uri);
        this.audio.preload = 'auto';
        await this.audio.load();
        this.isLoaded = true;
      } catch (error) {
        console.log('Audio load error (this is ok):', error);
      }
    }
  }

  async replayAsync() {
    if (isWeb && this.audio && this.isLoaded) {
      try {
        this.audio.currentTime = 0;
        await this.audio.play();
      } catch (error) {
        // Silently fail - audio might be blocked by browser
      }
    }
  }

  async unloadAsync() {
    if (isWeb && this.audio) {
      this.audio.pause();
      this.audio = null;
      this.isLoaded = false;
    }
  }
}

export const Audio = {
  Sound: {
    createAsync: async (source, initialStatus = {}) => {
      if (isWeb) {
        const sound = new WebAudioSound(source.uri || source);
        await sound.loadAsync();
        return { sound };
      } else {
        // Native implementation
        const ExpoAV = require('expo-av');
        return ExpoAV.Audio.Sound.createAsync(source, initialStatus);
      }
    },
  },
};

