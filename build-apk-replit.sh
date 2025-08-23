#!/bin/bash

echo "🚀 Building Tomati APK on Replit..."

# Étape 1: Build de l'app React
echo "📦 Building React app..."
npm run build

# Étape 2: Sync avec Capacitor
echo "🔄 Syncing with Capacitor..."
npx cap sync

# Étape 3: Créer un zip pour téléchargement
echo "📁 Creating deployment package..."
zip -r tomati-capacitor-project.zip android/ dist/ capacitor.config.ts package.json

echo "✅ Done! Voici vos options:"
echo ""
echo "📱 OPTION 1: GitHub Actions"
echo "   - Committez votre code sur GitHub"
echo "   - Le workflow va automatiquement générer l'APK"
echo "   - Téléchargez l'APK depuis les 'Actions'"
echo ""
echo "💻 OPTION 2: Téléchargement local"
echo "   - Téléchargez: tomati-capacitor-project.zip"
echo "   - Ouvrez le dossier android/ dans Android Studio"
echo "   - Build → Build APK"
echo ""
echo "🌐 OPTION 3: Service en ligne"
echo "   - Utilisez pwa2apk.com avec votre URL"
echo "   - Ou utilisez GitHub Codespaces pour compiler"
echo ""
echo "📦 Fichier créé: tomati-capacitor-project.zip"