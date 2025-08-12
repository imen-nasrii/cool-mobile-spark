#!/bin/bash

# Script de déploiement simplifié pour VPS OVH
# Usage: ./deploy-simple.sh

echo "🚀 Déploiement Tomati Market sur VPS OVH..."

# Configuration
VPS_USER="tomati"
VPS_HOST="51.222.111.183"
APP_NAME="tomati-production"
APP_DIR="/home/tomati/tomatimarket"

# Créer un script de commandes à exécuter sur le VPS
cat > remote-deploy.sh << 'REMOTESCRIPT'
#!/bin/bash
set -e

echo "🔄 Arrêt de l'application existante..."
pm2 delete tomati-production 2>/dev/null || echo "Aucune application à arrêter"

echo "💾 Sauvegarde de l'ancienne version..."
if [ -d /home/tomati/tomatimarket ]; then
    mv /home/tomati/tomatimarket /home/tomati/tomatimarket_backup_$(date +%Y%m%d_%H%M%S)
fi

echo "📁 Création du nouveau répertoire..."
mkdir -p /home/tomati/tomatimarket
cd /home/tomati/tomatimarket

echo "📦 Installation des dépendances de base..."
# Vérifier si Node.js et npm sont installés
node --version || { echo "Node.js non installé"; exit 1; }
npm --version || { echo "npm non installé"; exit 1; }

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

echo "✅ Préparation terminée. Attendez le transfert des fichiers..."
REMOTESCRIPT

echo "📤 Transfert du script de préparation..."
scp remote-deploy.sh tomati@51.222.111.183:/home/tomati/

echo "🔧 Exécution de la préparation sur le VPS..."
ssh tomati@51.222.111.183 "chmod +x /home/tomati/remote-deploy.sh && /home/tomati/remote-deploy.sh"

echo "📦 Création de l'archive de l'application..."
tar --exclude='node_modules' \
    --exclude='.git' \
    --exclude='attached_assets' \
    --exclude='logs' \
    --exclude='*.tar.gz' \
    --exclude='remote-deploy.sh' \
    -czf tomati-app.tar.gz .

echo "📤 Transfert de l'application..."
scp tomati-app.tar.gz tomati@51.222.111.183:/home/tomati/

echo "📦 Extraction et installation sur le VPS..."
ssh tomati@51.222.111.183 << 'INSTALLSCRIPT'
cd /home/tomati/tomatimarket
tar -xzf /home/tomati/tomati-app.tar.gz
rm /home/tomati/tomati-app.tar.gz

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
INSTALLSCRIPT

# Nettoyer les fichiers temporaires
rm -f tomati-app.tar.gz remote-deploy.sh

echo ""
echo "🎉 Déploiement terminé!"
echo "🌐 Application disponible sur: https://tomati.org"
echo ""
echo "🔧 Commandes de gestion:"
echo "   ssh tomati@51.222.111.183 'pm2 status'"
echo "   ssh tomati@51.222.111.183 'pm2 logs tomati-production'"
echo "   ssh tomati@51.222.111.183 'pm2 restart tomati-production'"