#!/bin/bash

# Script de déploiement manuel pour VPS OVH
echo "🚀 Préparation du déploiement Tomati Market..."

# Créer l'archive de l'application
echo "📦 Création de l'archive..."
tar --exclude='node_modules' \
    --exclude='.git' \
    --exclude='attached_assets' \
    --exclude='logs' \
    --exclude='*.tar.gz' \
    --exclude='deploy-*.sh' \
    --exclude='remote-deploy.sh' \
    -czf tomati-deployment.tar.gz .

echo "✅ Archive créée: tomati-deployment.tar.gz"

# Créer le script de déploiement à exécuter manuellement sur le VPS
cat > commands-for-vps.txt << 'VPSCOMMANDS'
# Commandes à exécuter sur le VPS OVH (tomati@51.222.111.183)
# Mot de passe: Tomati123

# 1. Se connecter au VPS
ssh tomati@51.222.111.183

# 2. Arrêter l'application existante
pm2 delete tomati-production 2>/dev/null || echo "Aucune app à arrêter"

# 3. Sauvegarder l'ancienne version
if [ -d /home/tomati/tomatimarket ]; then
    mv /home/tomati/tomatimarket /home/tomati/tomatimarket_backup_$(date +%Y%m%d_%H%M%S)
fi

# 4. Créer le nouveau répertoire
mkdir -p /home/tomati/tomatimarket
cd /home/tomati/tomatimarket

# 5. Configuration de l'environnement
cat > .env << 'ENVEOF'
NODE_ENV=production
PORT=5000
JWT_SECRET=tomati-super-secret-jwt-key-production-2025
DATABASE_URL=postgresql://tomati_user:Tomati123_db@localhost:5432/tomati_db
PUBLIC_URL=https://tomati.org
VITE_API_URL=https://tomati.org/api
CORS_ORIGIN=https://tomati.org
ENVEOF

# 6. Configuration PM2
cat > ecosystem.config.js << 'ECOEOF'
module.exports = {
  apps: [{
    name: 'tomati-production',
    script: './server/index.ts',
    interpreter: 'tsx',
    cwd: '/home/tomati/tomatimarket',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    autorestart: true,
    max_restarts: 5,
    min_uptime: '10s'
  }]
};
ECOEOF

# 7. Créer les répertoires
mkdir -p logs uploads

# 8. MAINTENANT, transférer le fichier tomati-deployment.tar.gz vers le VPS
# Depuis votre machine locale:
# scp tomati-deployment.tar.gz tomati@51.222.111.183:/home/tomati/

# 9. Extraire l'archive
tar -xzf /home/tomati/tomati-deployment.tar.gz -C /home/tomati/tomatimarket
rm /home/tomati/tomati-deployment.tar.gz

# 10. Installation et démarrage
cd /home/tomati/tomatimarket
npm install --production
npm run build
npm run db:push
pm2 start ecosystem.config.js
pm2 save

# 11. Vérification
pm2 status
pm2 logs tomati-production --lines 10
curl http://localhost:5000/api/categories

VPSCOMMANDS

echo ""
echo "📋 Instructions de déploiement:"
echo "1. Archive créée: tomati-deployment.tar.gz"
echo "2. Commandes à exécuter: commands-for-vps.txt"
echo ""
echo "📤 Pour transférer l'archive vers le VPS:"
echo "scp tomati-deployment.tar.gz tomati@51.222.111.183:/home/tomati/"
echo ""
echo "📋 Puis exécutez les commandes dans commands-for-vps.txt sur le VPS"
echo ""
echo "🌐 Application sera disponible sur: https://tomati.org"