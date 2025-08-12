#!/bin/bash

# Script de déploiement GitHub vers VPS OVH
# Usage: ./deploy-github-vps.sh

echo "🚀 Déploiement Tomati Market via GitHub vers VPS OVH..."

# Configuration
VPS_USER="tomati"
VPS_HOST="51.222.111.183"
GITHUB_REPO="https://github.com/imen-nasrii/cool-mobile-spark.git"
APP_NAME="tomati-production"
APP_DIR="/home/tomati/tomatimarket"

# Script à exécuter sur le VPS
cat > remote-github-deploy.sh << 'GITHUBSCRIPT'
#!/bin/bash
set -e

echo "🔄 Arrêt de l'application existante..."
pm2 delete tomati-production 2>/dev/null || echo "Aucune application à arrêter"

echo "💾 Sauvegarde de l'ancienne version..."
if [ -d /home/tomati/tomatimarket ]; then
    mv /home/tomati/tomatimarket /home/tomati/tomatimarket_backup_$(date +%Y%m%d_%H%M%S)
fi

echo "📥 Clone depuis GitHub..."
git clone https://github.com/imen-nasrii/cool-mobile-spark.git /home/tomati/tomatimarket
cd /home/tomati/tomatimarket

echo "⚙️ Configuration de l'environnement..."
cat > .env << 'ENVEOF'
NODE_ENV=production
PORT=5000
JWT_SECRET=tomati-super-secret-jwt-key-production-2025
DATABASE_URL=postgresql://tomati_user:Tomati123_db@localhost:5432/tomati_db
PUBLIC_URL=https://tomati.org
VITE_API_URL=https://tomati.org/api
CORS_ORIGIN=https://tomati.org
ENVEOF

echo "📋 Configuration PM2..."
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

echo "📂 Création des répertoires..."
mkdir -p logs uploads

echo "📦 Installation des dépendances..."
npm install --production

echo "🔨 Build de l'application..."
npm run build

echo "🗄️ Mise à jour de la base de données..."
npm run db:push || echo "Erreur DB push - continuons..."

echo "🚀 Démarrage de l'application..."
pm2 start ecosystem.config.js

echo "💾 Sauvegarde de la configuration PM2..."
pm2 save

echo "📊 Statut de l'application..."
pm2 status

echo "⏰ Attente du démarrage..."
sleep 10

echo "🧪 Test de l'API..."
curl -f http://localhost:5000/api/categories && echo "✅ API fonctionne" || echo "❌ API ne répond pas"

echo "📝 Logs récents:"
pm2 logs tomati-production --lines 10
GITHUBSCRIPT

echo "📤 Transfert du script de déploiement..."
scp remote-github-deploy.sh tomati@51.222.111.183:/home/tomati/

echo "🔧 Exécution du déploiement GitHub..."
ssh tomati@51.222.111.183 "chmod +x /home/tomati/remote-github-deploy.sh && /home/tomati/remote-github-deploy.sh"

# Nettoyer
rm remote-github-deploy.sh

echo ""
echo "🎉 Déploiement GitHub terminé!"
echo "🌐 Application disponible sur: https://tomati.org"
echo ""
echo "🔄 Pour les prochaines mises à jour:"
echo "   git push origin main"
echo "   ssh tomati@51.222.111.183 'cd /home/tomati/tomatimarket && git pull && npm install && npm run build && npm run db:push && pm2 restart tomati-production'"