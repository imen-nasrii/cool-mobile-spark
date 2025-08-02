#!/bin/bash

# Script de déploiement simplifié pour Tomati Market
# Usage: curl -sSL https://raw.githubusercontent.com/imen-nasrii/cool-mobile-spark/main/deploy-simple.sh | bash

echo "🚀 Déploiement Tomati Market depuis GitHub..."

# Configuration
REPO_URL="https://github.com/imen-nasrii/cool-mobile-spark.git"
APP_DIR="/home/tomati/tomati-market"

# Arrêter l'ancienne version
sudo -u tomati pm2 delete tomati-production 2>/dev/null || true

# Supprimer l'ancien code
sudo rm -rf $APP_DIR

# Cloner le nouveau code
sudo -u tomati git clone $REPO_URL $APP_DIR
cd $APP_DIR

# Installer et construire
sudo -u tomati npm install
sudo -u tomati npm run build

# Pousser les changements DB
sudo -u tomati npm run db:push

# Redémarrer avec PM2
sudo -u tomati pm2 start ecosystem.config.cjs

echo "✅ Déploiement terminé ! Application accessible sur http://51.222.111.183"