# ☕ Flappy Coffee

A fun and addictive mobile game built with React Native and Expo! Guide your flying coffee cup through pipes while collecting coffee beans to score points.

## 🎮 Game Features

- **Coffee-Themed Gameplay**: Control a flying coffee cup instead of a bird
- **Unique Scoring System**: Collect coffee beans that appear randomly in pipe gaps
- **Multiple Screens**: Main menu, game play, leaderboard, and settings
- **Persistent High Scores**: Top 5 scores saved locally using AsyncStorage
- **Sound Effects**: Jump, collect, and game over sounds (with toggle)
- **Difficulty Levels**: Easy (wider gaps) and Hard (narrower gaps) modes
- **Beautiful UI**: Coffee-themed color palette with smooth animations

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Run on your platform:**
   
   **🌐 Web Browser (Recommended for Testing):**
   - Press `w` in the terminal
   - Or run: `npm run web`
   - Opens in your default browser
   
   **📱 Mobile Device (Best Performance):**
   - Install the Expo Go app on your iOS or Android device
   - Scan the QR code shown in the terminal
   - Game runs as native app
   
   **🖥️ Simulator/Emulator:**
   ```bash
   npm run ios     # For iOS simulator (Mac only)
   npm run android # For Android emulator
   ```

## 🎯 How to Play

1. **Tap** anywhere on the screen to make the coffee cup jump
2. **Avoid** hitting the pipes or the ground
3. **Collect** coffee beans (🫘) that appear in the gaps for points
4. Try to beat your high score!

## 📱 Screens

### Main Menu
- **PLAY**: Start a new game
- **SCORES**: View your top 5 high scores
- **SETTINGS**: Adjust sound and difficulty

### Game Screen
- Active gameplay with physics-based controls
- Real-time score display
- Pause button to freeze the game
- Game Over modal with restart and menu options

### Leaderboard
- Displays top 5 highest scores
- Trophy icon for the best score
- Persistent storage across app sessions

### Settings
- **Sound Effects**: Toggle game sounds on/off
- **Difficulty**: Choose between Easy and Hard modes
  - Easy: Wider gaps between pipes
  - Hard: Narrower gaps for expert players

## 🛠️ Technology Stack

- **Framework**: React Native with Expo (Managed Workflow)
- **Language**: JavaScript (ES6+)
- **State Management**: React Hooks (useState, useEffect, useRef)
- **Storage**: AsyncStorage for persistent data
- **Audio**: expo-av for sound effects
- **Game Loop**: requestAnimationFrame for smooth 60 FPS gameplay

## 🎨 Game Physics

- **Gravity**: 0.6 pixels per frame
- **Jump Velocity**: -12 pixels
- **Terminal Velocity**: 10 pixels/second
- **Pipe Speed**: 2.5px/frame (Easy), 3.5px/frame (Hard)
- **Bean Spawn Rate**: 30% chance per pipe

## 📂 Project Structure

```
zeki_abi/
├── App.js                      # Main app with navigation
├── screens/
│   ├── MainMenuScreen.js       # Home screen
│   ├── GameScreen.js           # Core game logic
│   ├── LeaderboardScreen.js    # High scores
│   └── SettingsScreen.js       # Game settings
├── components/
│   ├── CoffeeCup.js           # Player avatar
│   ├── Pipe.js                # Obstacles
│   ├── CoffeeBean.js          # Collectibles
│   └── GameOverModal.js       # End game UI
├── context/
│   └── SettingsContext.js     # Global settings state
├── utils/
│   ├── collisionDetection.js  # Physics calculations
│   ├── storage.js             # AsyncStorage helpers
│   └── constants.js           # Game constants
└── styles/
    └── theme.js               # Color palette & fonts
```

## 🎨 Color Palette

- **Primary**: #6F4E37 (Dark Roast Brown)
- **Secondary**: #C4A574 (Latte Beige)
- **Accent**: #F5E6D3 (Cream)
- **Success**: #7FB069 (Organic Green)
- **Background**: #FFF8E7 (Light Cream)

## 🔧 Customization

### Adjusting Difficulty

Edit `utils/constants.js`:
```javascript
export const DIFFICULTY = {
  EASY: {
    gapSize: 180,    // Increase for easier
    pipeSpeed: 2.5,
  },
  HARD: {
    gapSize: 140,    // Decrease for harder
    pipeSpeed: 3.5,  // Increase for faster
  },
};
```

### Changing Physics

Modify these constants in `utils/constants.js`:
```javascript
export const GRAVITY = 0.6;           // Downward force
export const JUMP_VELOCITY = -12;     // Upward force on tap
export const TERMINAL_VELOCITY = 10;  // Max fall speed
```

## 🐛 Troubleshooting

### Sound not playing
- Sounds are loaded from placeholder URLs
- For production, add actual MP3 files to `assets/sounds/`
- Update sound loading in `GameScreen.js`

### Performance issues
- Close other apps on your device
- Try restarting the Expo development server
- Ensure you're using a physical device (simulators may be slower)

### AsyncStorage errors
- Clear app data and restart
- On iOS simulator: Device → Erase All Content and Settings
- On Android emulator: Settings → Apps → Clear Data

## 📝 License

This project is open source and available for educational purposes.

## 🎉 Credits

Developed as a demonstration of mobile game development with React Native and Expo.

---

**Enjoy playing Flappy Coffee! ☕🫘**

