#!/bin/bash

echo "🚀 Déploiement Tomati avec Tamtouma vers VPS..."

# Construire la version optimisée
echo "📦 Construction..."
npm run build

# Créer l'archive de déploiement
echo "📁 Création archive..."
tar -czf tomati-deploy.tar.gz dist/ package.json server/ --exclude="node_modules" --exclude=".git"

echo "✅ Archive prête: tomati-deploy.tar.gz"
echo ""
echo "📡 Instructions pour le VPS:"
echo "1. Uploadez tomati-deploy.tar.gz sur votre VPS"
echo "2. Exécutez les commandes suivantes sur le VPS:"
echo ""
echo "cd ~/cool-mobile-spark"
echo "tar -xzf tomati-deploy.tar.gz"
echo "npm install"
echo "pm2 restart backend"
echo ""
echo "🎯 Après ça, https://tomati.org aura Tamtouma et le footer !"