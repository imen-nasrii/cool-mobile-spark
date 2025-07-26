#!/bin/bash

# Script de déploiement automatique pour Tomati Market
# Usage: ./deploy.sh

set -e

echo "🍅 Début du déploiement de Tomati Market..."

# Configuration
APP_DIR="/var/www/tomati-market"
PM2_APP_NAME="tomati-market"

# Vérifications préliminaires
if [ ! -d "$APP_DIR" ]; then
    echo "❌ Erreur: Le répertoire $APP_DIR n'existe pas"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Erreur: Node.js n'est pas installé"
    exit 1
fi

if ! command -v pm2 &> /dev/null; then
    echo "❌ Erreur: PM2 n'est pas installé"
    exit 1
fi

# Naviguer vers le répertoire de l'application
cd $APP_DIR

echo "📥 Récupération des dernières modifications..."
git pull origin main

echo "📦 Installation des dépendances..."
npm ci --production

echo "🏗️ Build de l'application..."
npm run build

echo "🗃️ Migration de la base de données..."
npm run db:push

echo "🔄 Redémarrage de l'application..."
pm2 restart $PM2_APP_NAME

echo "💾 Sauvegarde de la configuration PM2..."
pm2 save

echo "✅ Déploiement terminé avec succès!"
echo "🌐 L'application est disponible sur votre domaine"

# Afficher le statut
pm2 status $PM2_APP_NAME