# 🌐 Flappy Coffee - Web Version

## Running on Web

### Option 1: Start Web Server (Recommended)
```bash
npm start
```
Then press `w` in the terminal to open in web browser.

Or directly:
```bash
npm run web
```

### Option 2: Expo Go QR Code (Mobile Testing)
```bash
npm start
```
- Scan the QR code with your phone's Expo Go app
- The app will load on your mobile device

## 🎮 Web vs Mobile Differences

### ✅ What Works on Web:
- Full game mechanics and physics
- Score tracking with localStorage
- Settings (sound toggle, difficulty)
- Leaderboard (top 5 scores)
- All animations and UI
- Touch/click to jump
- Pause functionality

### ⚠️ Platform Differences:
- **Storage**: Uses `localStorage` on web instead of AsyncStorage
- **Audio**: Uses HTML5 Audio API instead of expo-av
- **Controls**: 
  - Mobile: Tap anywhere
  - Web: Click anywhere or press SPACEBAR

### 🖥️ Browser Compatibility
- ✅ Chrome 90+ (Recommended)
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 🚀 Deployment Options

### Deploy to Expo
```bash
expo build:web
```

### Deploy to Netlify/Vercel
1. Build for production:
   ```bash
   expo export:web
   ```
2. Upload the `web-build` folder to your hosting service

### Deploy to GitHub Pages
```bash
expo export:web
# Then push web-build folder to gh-pages branch
```

## 🎨 Web-Specific Features

### Responsive Design
The game automatically adjusts to different screen sizes:
- Desktop: Full screen gameplay
- Tablet: Optimized for touch
- Mobile Web: Native-like experience

### Performance Tips
- Use Chrome for best performance
- Enable hardware acceleration in browser settings
- Close other tabs to free up resources

## 🔧 Troubleshooting

### "Audio doesn't play"
- Browsers block autoplay audio. Click/tap to enable sound.
- Check that sound is enabled in game settings.

### "Game is laggy"
- Close other browser tabs
- Try a different browser (Chrome recommended)
- Disable browser extensions

### "Scores don't save"
- Check that localStorage is enabled
- Don't use private/incognito mode
- Clear browser cache if issues persist

## 📱 Testing on Mobile Devices

### Via Web Browser
Simply open the web URL on your phone's browser.

### Via Expo Go (Better Performance)
1. Start the dev server: `npm start`
2. Scan QR code with Expo Go app
3. Runs as native app with full performance

## 🌟 Best Experience

For the best gaming experience:
- **Desktop**: Use Chrome browser in fullscreen (F11)
- **Mobile**: Use Expo Go app via QR code
- **Tablet**: Either method works great!

---

**Enjoy Flappy Coffee on any device! ☕🫘**

