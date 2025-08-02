#!/bin/bash

# Correction immédiate après git pull pour VPS 51.222.111.183
# Résout les problèmes de base de données et relance l'application

echo "🔧 Correction immédiate après mise à jour GitHub"
echo "VPS: 51.222.111.183 (vps-8dfc48b5)"

# Variables
APP_DIR="/home/tomati/tomati-market"
USER="tomati"
APP_NAME="tomati-production"

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Pas dans le répertoire de l'application"
    echo "Exécuter: cd /home/tomati/tomati-market"
    exit 1
fi

echo "📍 Répertoire: $(pwd)"
echo "👤 Utilisateur: $(whoami)"

# Arrêter l'application
echo "⏹️ Arrêt application..."
pm2 stop $APP_NAME 2>/dev/null || true
pm2 delete $APP_NAME 2>/dev/null || true

# Nettoyer et réinstaller dépendances
echo "📦 Mise à jour dépendances..."
rm -rf node_modules package-lock.json 2>/dev/null || true
npm install

# Créer fichier .env correct pour VPS
echo "📝 Configuration environnement VPS..."
cat > .env << 'EOF'
# Configuration VPS 51.222.111.183 - Production
DATABASE_URL=postgresql://tomati:tomati123@localhost:5432/tomati_db
PGUSER=tomati
PGPASSWORD=tomati123
PGDATABASE=tomati_db
PGHOST=localhost
PGPORT=5432

# Application
NODE_ENV=production
PORT=5000
JWT_SECRET=tomati-vps-jwt-secret-2025
SESSION_SECRET=tomati-vps-session-secret-2025

# VPS Configuration
VPS_IP=51.222.111.183
VPS_HOST=vps-8dfc48b5

# Désactiver Replit Auth (cause erreurs port 443)
# REPL_ID=
# REPLIT_DOMAINS=
# ISSUER_URL=
EOF

# Build application
echo "🏗️ Build application..."
npm run build

# Migration base de données
echo "📊 Migration base de données..."
npm run db:push || echo "⚠️ Migration échouée, mais on continue"

# Créer configuration PM2 optimisée
echo "⚙️ Configuration PM2..."
cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'tomati-production',
    script: 'tsx',
    args: 'server/index.ts',
    cwd: '/home/tomati/tomati-market',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
      VPS_IP: '51.222.111.183'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    watch: false,
    max_memory_restart: '1G',
    restart_delay: 4000,
    exp_backoff_restart_delay: 100,
    min_uptime: '10s',
    max_restarts: 10
  }]
};
EOF

# Créer dossier logs
mkdir -p logs

# Démarrer application
echo "🚀 Démarrage application..."
pm2 start ecosystem.config.cjs

# Configuration démarrage automatique
pm2 save
pm2 startup systemd -u tomati --hp /home/tomati > /tmp/pm2_startup.sh 2>/dev/null || true

echo "⏳ Attente démarrage (15 secondes)..."
sleep 15

# Vérifications
echo ""
echo "📊 ==========================="
echo "📊 VÉRIFICATIONS FINAL"
echo "📊 ==========================="

echo "🔄 Statut PM2:"
pm2 status

echo -e "\n📝 Logs récents:"
pm2 logs $APP_NAME --lines 5 --nostream

echo -e "\n🌐 Test application:"
HTTP_LOCAL=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/ 2>/dev/null || echo "000")
if [ "$HTTP_LOCAL" = "200" ]; then
    echo "✅ Application locale OK (HTTP $HTTP_LOCAL)"
else
    echo "⚠️ Application locale: HTTP $HTTP_LOCAL"
fi

echo -e "\n🌍 Test VPS public:"
HTTP_PUBLIC=$(curl -s -o /dev/null -w "%{http_code}" http://51.222.111.183/ 2>/dev/null || echo "000")
if [ "$HTTP_PUBLIC" = "200" ]; then
    echo "✅ Application VPS OK (HTTP $HTTP_PUBLIC)"
else
    echo "⚠️ Application VPS: HTTP $HTTP_PUBLIC"
fi

echo ""
echo "🎉 CORRECTION TERMINÉE !"
echo ""
echo "📋 Résultat:"
if [ "$HTTP_PUBLIC" = "200" ]; then
    echo "   ✅ Application accessible: http://51.222.111.183"
    echo "   ✅ Admin: http://51.222.111.183/admin"
else
    echo "   ⚠️ Application en cours de démarrage..."
    echo "   🔧 Vérifiez les logs: pm2 logs tomati-production"
fi

echo ""
echo "🔧 Commandes utiles:"
echo "   • Statut: pm2 status"
echo "   • Logs: pm2 logs tomati-production"
echo "   • Redémarrage: pm2 restart tomati-production"
echo "   • Monitoring: pm2 monit"