#!/bin/bash

# Script de déploiement automatisé depuis GitHub
echo "🚀 Déploiement Tomati Market depuis GitHub..."

# Variables
VPS_IP="51.222.111.183"
VPS_USER="ubuntu"
APP_USER="tomati"
GITHUB_REPO="https://github.com/imen-nasrii/cool-mobile-spark.git"

echo "📋 Déploiement sur $VPS_IP..."

# Commandes à exécuter sur le VPS
ssh ${VPS_USER}@${VPS_IP} << 'EOF'
  # Basculer vers l'utilisateur tomati
  sudo su - tomati << 'SCRIPT'
    echo "📦 Préparation du déploiement..."
    
    # Sauvegarder l'ancienne version
    if [ -d "tomati-market" ]; then
      mv tomati-market tomati-market-backup-$(date +%Y%m%d_%H%M%S)
      echo "✅ Sauvegarde créée"
    fi
    
    # Arrêter l'application actuelle
    pm2 stop tomati-production 2>/dev/null || true
    pm2 delete tomati-production 2>/dev/null || true
    
    # Cloner la nouvelle version
    echo "📥 Clonage depuis GitHub..."
    git clone https://github.com/imen-nasrii/cool-mobile-spark.git tomati-market
    cd tomati-market
    
    # Installer les dépendances
    echo "📦 Installation des dépendances..."
    npm install --production --silent
    
    # Build de production
    echo "🏗️ Construction de l'application..."
    npm run build
    
    # Configuration environnement
    echo "⚙️ Configuration de l'environnement..."
    cat > .env << 'ENVEOF'
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://tomati:Tomati123@localhost:5432/tomati_market
JWT_SECRET=tomati_jwt_secret_super_securise_32_caracteres_minimum_pour_production_2025_france
SESSION_SECRET=tomati_session_secret_securise_pour_authentification_utilisateurs_marketplace_2025
BCRYPT_ROUNDS=12
ENVEOF
    
    # Migration base de données
    echo "🗄️ Migration de la base de données..."
    npm run db:push
    
    # Démarrer l'application
    echo "🚀 Démarrage de l'application..."
    pm2 start ecosystem.config.js --env production --name tomati-production
    pm2 save
    
    # Attendre le démarrage
    sleep 10
    
    # Vérifier le statut
    pm2 status tomati-production
    
    echo "✅ Déploiement terminé!"
    echo "📋 Logs récents:"
    pm2 logs tomati-production --lines 10
    
SCRIPT
EOF

# Test de l'application
echo "🧪 Test de l'application..."
sleep 5
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://${VPS_IP})
if [ $HTTP_STATUS -eq 200 ]; then
    echo "✅ Application accessible sur http://${VPS_IP}"
else
    echo "❌ Erreur: Application non accessible (HTTP $HTTP_STATUS)"
fi

echo "🎉 Déploiement depuis GitHub terminé!"