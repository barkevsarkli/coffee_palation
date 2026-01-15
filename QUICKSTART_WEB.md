# 🌐 Quick Start - Web Version

## Run in 3 Simple Steps

### Step 1: Install (if you haven't already)
```bash
npm install
```

### Step 2: Start the Server
```bash
npm start
```

### Step 3: Choose Your Platform

The terminal will show options:

```
› Press w │ open web
› Press a │ open Android
› Press i │ open iOS (macOS only)
```

#### 🌐 For Web Browser:
Press `w` or run:
```bash
npm run web
```
Opens at: http://localhost:8081

#### 📱 For Mobile (via QR Code):
1. Install "Expo Go" app on your phone
2. Scan the QR code displayed in terminal
3. Game loads instantly on your device

#### 🖥️ For Emulator:
```bash
npm run ios      # Mac only
npm run android  # Android emulator
```

## ✨ What's Different on Web?

### Controls
- **Mobile/Touch**: Tap anywhere to jump
- **Desktop/Web**: Click or press SPACEBAR to jump

### Storage
- **Mobile**: AsyncStorage (native)
- **Web**: localStorage (browser)

### Audio
- **Mobile**: expo-av (native audio)
- **Web**: HTML5 Audio API

## 🎮 Playing the Game

1. **Start**: Tap/click or press SPACE
2. **Jump**: Tap/click or press SPACE (avoid pipes!)
3. **Score**: Collect coffee beans 🫘 (not just passing pipes)
4. **Pause**: Click ⏸️ button in top-right
5. **Settings**: Enable sound, choose Easy/Hard

## 🚀 Deployment (Production)

### Build for Web
```bash
npx expo export:web
```
Output folder: `web-build/`

### Deploy Options
- **Vercel**: `vercel web-build`
- **Netlify**: Upload `web-build` folder
- **GitHub Pages**: Push to gh-pages branch
- **Any Static Host**: Upload contents of `web-build/`

## 🔧 Troubleshooting

**Port 8081 already in use?**
```bash
# Kill existing process
npx kill-port 8081

# Or use different port
npx expo start --web --port 8082
```

**Can't access from phone?**
- Ensure phone and computer on same WiFi
- Check firewall isn't blocking port 8081
- Try restarting: `npm start`

**Game is slow?**
- Use Chrome browser (best performance)
- Close other tabs
- For best performance: Use Expo Go app via QR

**Audio not working?**
- Click/tap to enable (browsers block autoplay)
- Check sound toggle in settings
- Try Chrome browser

## 📊 Performance

### Web Browser
- ✅ Good: Chrome, Edge
- ⚠️ OK: Firefox, Safari
- 📱 Mobile browsers work but slower

### Best Experience
1. **Desktop**: Chrome in fullscreen
2. **Mobile**: Expo Go app (via QR code)
3. **Tablet**: Either works great!

## 🎯 Features Working on Web

✅ Full game physics and controls  
✅ Score tracking (localStorage)  
✅ High score leaderboard (top 5)  
✅ Settings (sound, difficulty)  
✅ All animations  
✅ Pause/resume  
✅ Game over and restart  
✅ Responsive design  
✅ Keyboard controls (SPACEBAR)  

## 🌐 Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | ✅ Excellent |
| Edge | 90+ | ✅ Excellent |
| Firefox | 88+ | ✅ Good |
| Safari | 14+ | ⚠️ OK |
| Mobile | All | ✅ Works |

---

**Ready to play! Visit http://localhost:8081 after running `npm start` and pressing `w`** 🎮☕

