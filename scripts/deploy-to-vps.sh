#!/bin/bash

# Script de déploiement automatisé pour Tomati Market sur VPS
# Usage: ./scripts/deploy-to-vps.sh

VPS_IP="51.222.111.183"
VPS_USER="ubuntu"
APP_USER="tomati"
APP_DIR="/home/tomati/tomati-market"

echo "🚀 Déploiement de Tomati Market sur VPS..."

# 1. Builder l'application
echo "📦 Construction de l'application..."
npm run build

# 2. Créer l'archive
echo "📁 Création de l'archive de déploiement..."
tar -czf tomati-market-latest.tar.gz dist/ server/ package.json package-lock.json ecosystem.config.js shared/ drizzle.config.ts

# 3. Copier sur le VPS
echo "📤 Upload vers le VPS..."
scp tomati-market-latest.tar.gz ${VPS_USER}@${VPS_IP}:/tmp/

# 4. Déployer sur le VPS
echo "🔧 Déploiement sur le serveur..."
ssh ${VPS_USER}@${VPS_IP} << EOF
  # Basculer vers l'utilisateur tomati
  sudo su - ${APP_USER} << 'SCRIPT'
    cd ${APP_DIR}
    
    # Sauvegarder l'ancienne version
    if [ -d "dist" ]; then
      cp -r dist dist-backup-\$(date +%Y%m%d_%H%M%S)
    fi
    
    # Arrêter l'application
    pm2 stop tomati-production || true
    
    # Extraire la nouvelle version
    tar -xzf /tmp/tomati-market-latest.tar.gz
    
    # Installer les dépendances
    npm install --production --silent
    
    # Migrer la base de données
    npm run db:push
    
    # Redémarrer l'application
    pm2 restart tomati-production || pm2 start ecosystem.config.js --env production --name tomati-production
    
    # Attendre le démarrage
    sleep 5
    
    # Vérifier le statut
    pm2 status tomati-production
    
    echo "✅ Déploiement terminé!"
SCRIPT
EOF

# 5. Tester l'application
echo "🧪 Test de l'application..."
sleep 10
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://${VPS_IP})
if [ $HTTP_STATUS -eq 200 ]; then
    echo "✅ Application accessible sur http://${VPS_IP}"
else
    echo "❌ Erreur: Application non accessible (HTTP $HTTP_STATUS)"
    echo "📋 Consultez les logs avec: ssh ${VPS_USER}@${VPS_IP} 'sudo su - ${APP_USER} -c \"pm2 logs tomati-production\"'"
fi

# Nettoyage
rm -f tomati-market-latest.tar.gz
echo "🧹 Nettoyage terminé"