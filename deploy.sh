#!/bin/bash

# Coffee Palation - Deployment Script
# ===================================

echo "☕ Coffee Palation Deployment Script"
echo "===================================="
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build for web
echo "🔨 Building web version..."
npx expo export --platform web

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful! Files are in /dist folder"
echo ""

# Ask where to deploy
echo "Where do you want to deploy?"
echo "1) Vercel (recommended)"
echo "2) Netlify"
echo "3) Just build (don't deploy)"
read -p "Enter choice [1-3]: " choice

case $choice in
    1)
        echo "🚀 Deploying to Vercel..."
        if ! command -v vercel &> /dev/null; then
            echo "Installing Vercel CLI..."
            npm install -g vercel
        fi
        vercel --prod
        ;;
    2)
        echo "🚀 Deploying to Netlify..."
        if ! command -v netlify &> /dev/null; then
            echo "Installing Netlify CLI..."
            npm install -g netlify-cli
        fi
        netlify deploy --prod --dir=dist
        ;;
    3)
        echo "📁 Build complete! Your files are in the /dist folder."
        echo "You can upload this folder to any static hosting service."
        ;;
    *)
        echo "Invalid choice. Build files are in /dist folder."
        ;;
esac

echo ""
echo "☕ Done! Enjoy your Coffee Palation game!"

