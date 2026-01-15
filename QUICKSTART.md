# 🚀 Quick Start Guide - Flappy Coffee

## Installation & Running (3 Steps)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start the Development Server
```bash
npm start
```

### Step 3: Run the App
Choose one of these options:

**Option A: On Your Phone**
1. Install "Expo Go" app from App Store (iOS) or Play Store (Android)
2. Scan the QR code shown in your terminal
3. The app will load on your device!

**Option B: On Simulator/Emulator**
```bash
npm run ios      # For iOS (Mac only)
npm run android  # For Android
```

## 🎮 Game Controls

- **Tap anywhere** on the screen to jump
- **Collect beans (🫘)** for points
- **Avoid pipes** and the ground
- Beat your high score!

## ⚙️ Troubleshooting

**Problem: "expo command not found"**
```bash
npm install -g expo-cli
```

**Problem: "Module not found"**
```bash
rm -rf node_modules
npm install
```

**Problem: App won't load on phone**
- Make sure your phone and computer are on the same WiFi network
- Try closing and reopening Expo Go
- Restart the development server (npm start)

## 📱 Tested Configurations

✅ iOS 14+
✅ Android 8.0+
✅ Responsive on various screen sizes
✅ Portrait orientation only

## 🎨 Features at a Glance

- ☕ **Coffee Cup Avatar** - Smooth physics and rotation
- 🫘 **Coffee Beans** - Collect for points (30% spawn rate)
- 🎯 **Multiple Screens** - Menu, Game, Leaderboard, Settings
- 🏆 **High Scores** - Top 5 saved locally
- 🔊 **Sound Effects** - Jump, collect, game over (with toggle)
- ⚡ **Two Difficulty Modes** - Easy and Hard
- 🎨 **Coffee Theme** - Beautiful brown and cream palette

## 📊 Default Settings

- **Difficulty**: Easy (180px gap)
- **Sound**: Enabled
- **Physics**: Gravity 0.6, Jump -12

## Need Help?

Check the full README.md for:
- Complete project structure
- Customization options
- Detailed troubleshooting
- Game physics explanation

---

**Have fun and good luck beating your high score! ☕🫘**

