REQUIRED ASSETS FOR FLAPPY COFFEE
===================================

This folder should contain the following image assets:

1. icon.png (1024x1024)
   - App icon displayed on device home screen
   - For now, Expo will use a default icon

2. splash.png (1284x2778)
   - Splash screen shown when app launches
   - For now, Expo will use a default splash

3. adaptive-icon.png (1024x1024)
   - Android adaptive icon
   - For now, Expo will use a default icon

4. favicon.png (48x48)
   - Web favicon (if deploying to web)
   - For now, Expo will use a default favicon

SOUND ASSETS (Optional):
========================

sounds/jump.mp3 - Sound when coffee cup jumps
sounds/collect.mp3 - Sound when collecting a bean
sounds/gameover.mp3- Sound when game ends

Note: The game currently uses placeholder online sound URLs.
For production, add actual MP3 files here and update GameScreen.js

GENERATING ASSETS:
==================

You can use Expo's asset generation tool:
npx expo-asset --help

Or use online tools to create coffee-themed icons and images.

The app will work without these assets using Expo defaults!

