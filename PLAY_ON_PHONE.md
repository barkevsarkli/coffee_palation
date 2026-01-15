# 📱 How to Play on Your Phone via QR Code

## Quick Setup (2 Steps)

### Step 1: Install Expo Go App
Download the **Expo Go** app on your phone:
- **iOS**: https://apps.apple.com/app/expo-go/id982107779
- **Android**: https://play.google.com/store/apps/details?id=host.exp.exponent

### Step 2: Start Server & Scan QR

```bash
# In your terminal, run:
npm start

# You'll see something like:
```

```
  Metro waiting on exp://192.168.1.xxx:8081
  
  › Press w │ open web
  › Press a │ open Android
  › Press i │ open iOS
  
  [QR CODE DISPLAYED HERE]
  
  › Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

### Step 3: Scan & Play!

**On iPhone:**
1. Open the Camera app
2. Point at the QR code in terminal
3. Tap the notification banner
4. Opens in Expo Go automatically

**On Android:**
1. Open Expo Go app
2. Tap "Scan QR Code"
3. Point at the QR code in terminal
4. Game loads instantly!

---

## ⚠️ Important: Don't Use `npm run web`

If you used `npm run web`, it only starts the web version and doesn't show the QR code.

**Instead, use:**
```bash
npm start
```

This gives you:
- ✅ QR code for mobile
- ✅ Web option (press 'w')
- ✅ All platforms available

---

## 🔧 Troubleshooting

### "Can't connect" or "Something went wrong"

**Solution 1: Check WiFi**
- Your phone and computer MUST be on the same WiFi network
- Disconnect from VPN if you have one

**Solution 2: Restart the server**
```bash
# Press Ctrl+C to stop
# Then restart:
npm start
```

**Solution 3: Clear Expo cache**
```bash
npx expo start --clear
```

### "QR code not showing"

Make sure you ran:
```bash
npm start
```

NOT:
```bash
npm run web  # ❌ This doesn't show QR
```

### "Network response timed out"

Your firewall might be blocking port 8081.

**On Mac:**
```bash
# Allow the connection in System Preferences > Security & Privacy > Firewall
```

**On Windows:**
```bash
# Allow Node.js in Windows Firewall settings
```

---

## 🎮 Playing on Phone vs Web

### Phone (via Expo Go) - BEST EXPERIENCE ⭐
- ✅ Native performance (60 FPS smooth)
- ✅ Native audio (instant sound)
- ✅ Touch controls optimized
- ✅ Better physics feel
- ✅ AsyncStorage (native)

### Web Browser - GOOD FOR TESTING
- ✅ Instant access (no app needed)
- ✅ Keyboard support (SPACEBAR)
- ⚠️ Slightly lower performance
- ⚠️ Audio needs click first (browser restriction)

---

## 📊 Connection Flow

```
Your Computer                Your Phone
     |                            |
npm start                  [Expo Go App]
     |                            |
Starts Metro Server              |
     |                            |
Shows QR Code  ←-------→  Scan QR Code
     |                            |
Serves game files                |
     |                            |
     └----------→ Game loads & plays!
```

---

## 🌐 Alternative: Direct URL

If QR scanning doesn't work, you can also type the URL manually:

1. Look in terminal for the URL like:
   ```
   exp://192.168.1.15:8081
   ```

2. In Expo Go app:
   - Tap "Enter URL manually"
   - Type the URL
   - Press Connect

---

## 🚀 Best Practice Workflow

### Development & Testing:
```bash
npm start
# Opens Metro bundler with QR code
# Keep this running while you develop
```

### When you make code changes:
- Save the file
- The phone app automatically refreshes!
- No need to restart the server

### Hot Reload:
- ✅ Enabled by default
- Changes appear instantly on phone
- Shake phone to see developer menu

---

## 💡 Pro Tips

1. **Keep Terminal Visible**
   - The QR code stays in the terminal
   - You can rescan anytime

2. **Multiple Devices**
   - One QR code works for all phones
   - Share with friends to test together!

3. **Network Debugging**
   - Shake phone → "Debug Remote JS"
   - Opens Chrome DevTools on computer

4. **Reload Game**
   - Shake phone → "Reload"
   - Or double-tap with 2 fingers

---

## 🎯 Expected Results

After scanning QR code, you should see:
1. **Loading screen** (Expo splash)
2. **Username prompt** (if first time)
3. **Game starts!** with:
   - Coffee cup (☕)
   - Pipes spawning every 2 seconds
   - Beans in every gap
   - Touch to jump
   - Smooth 60 FPS gameplay

---

## 📱 Sharing with Friends

Want others to play?

1. **Keep your computer running** with `npm start`
2. **Share the QR code** (screenshot the terminal)
3. **Friends scan** with their Expo Go app
4. **Everyone plays!** (as long as on same WiFi)

Or deploy to web and share URL:
```bash
npx expo export:web
# Upload to Vercel, Netlify, etc.
```

---

## ✅ Summary

**To play on phone:**
```bash
npm start           # ← Start server with QR
Scan with phone     # ← Open Expo Go or Camera
Play game!          # ← Enjoy!
```

**Need help?** Check that:
- [x] Phone and computer on same WiFi
- [x] Expo Go app installed
- [x] `npm start` running (not `npm run web`)
- [x] Firewall not blocking port 8081

---

**Ready to play! Scan the QR code and start collecting beans! ☕🫘**

