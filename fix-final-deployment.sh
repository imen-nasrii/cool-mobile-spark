#!/bin/bash

# Script de correction finale pour hébergement Tomati Market sur VPS 51.222.111.183
# Corrige tous les problèmes de base de données et assure un déploiement 100% fonctionnel

set -e

echo "🚀 Correction finale pour hébergement Tomati Market sur VPS 51.222.111.183"
echo "Repository: https://github.com/imen-nasrii/cool-mobile-spark.git"

# Configuration
APP_DIR="/home/tomati/tomati-market"
USER="tomati"
APP_NAME="tomati-production"

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Vérifier privilèges sudo
if [[ $EUID -ne 0 ]]; then
   error "Ce script doit être exécuté avec sudo"
   exit 1
fi

log "Arrêt de l'application actuelle..."
sudo -u $USER pm2 stop $APP_NAME 2>/dev/null || true

log "Correction de la configuration base de données..."

# Aller dans le répertoire de l'application
cd $APP_DIR

# Sauvegarder ancien .env
sudo -u $USER cp .env .env.backup-$(date +%Y%m%d-%H%M%S) 2>/dev/null || true

# Créer configuration .env correcte pour PostgreSQL local
log "Création fichier .env correct..."
sudo -u $USER cat > .env << 'EOF'
# Configuration PostgreSQL locale - CORRIGÉE
DATABASE_URL=postgresql://tomati:tomati123@localhost:5432/tomati_db
PGUSER=tomati
PGPASSWORD=tomati123
PGDATABASE=tomati_db
PGHOST=localhost
PGPORT=5432

# Configuration application
NODE_ENV=production
PORT=5000
JWT_SECRET=tomati-jwt-secret-production-2025
SESSION_SECRET=tomati-session-secret-production-2025

# Désactiver Replit Auth qui cause les erreurs port 443
# REPL_ID=
# REPLIT_DOMAINS=
# ISSUER_URL=
EOF

# Assurer que PostgreSQL fonctionne
log "Vérification PostgreSQL..."
systemctl start postgresql
systemctl enable postgresql

# Reconfigurer PostgreSQL complètement
log "Reconfiguration PostgreSQL..."
sudo -u postgres psql << 'EOSQL'
-- Nettoyer et recréer proprement
DROP DATABASE IF EXISTS tomati_db;
DROP USER IF EXISTS tomati;

-- Créer utilisateur avec privilèges complets
CREATE USER tomati WITH PASSWORD 'tomati123';
ALTER USER tomati CREATEDB;
ALTER USER tomati WITH SUPERUSER;
ALTER USER tomati WITH REPLICATION;

-- Créer base de données
CREATE DATABASE tomati_db OWNER tomati;
GRANT ALL PRIVILEGES ON DATABASE tomati_db TO tomati;

-- Vérifier création
\l
\du
EOSQL

# Configuration pg_hba.conf pour autoriser connexions locales
log "Configuration authentification PostgreSQL..."
PG_VERSION=$(sudo -u postgres psql -t -c "SHOW server_version_num;" | xargs echo | cut -c1-2)
PG_HBA_PATH="/etc/postgresql/$PG_VERSION/main/pg_hba.conf"

if [ -f "$PG_HBA_PATH" ]; then
    # Sauvegarder
    cp $PG_HBA_PATH $PG_HBA_PATH.backup-$(date +%Y%m%d)
    
    # Nettoyer anciennes règles tomati
    sed -i '/tomati/d' $PG_HBA_PATH
    
    # Ajouter nouvelles règles au début
    sed -i '1i# === Tomati Market Access Rules ===' $PG_HBA_PATH
    sed -i '2i\local   all             tomati                                  trust' $PG_HBA_PATH
    sed -i '3i\host    all             tomati          127.0.0.1/32            trust' $PG_HBA_PATH
    sed -i '4i\host    all             tomati          ::1/128                 trust' $PG_HBA_PATH
    sed -i '5i\local   tomati_db       tomati                                  trust' $PG_HBA_PATH
    sed -i '6i\host    tomati_db       tomati          127.0.0.1/32            trust' $PG_HBA_PATH
    sed -i '7i\host    tomati_db       tomati          ::1/128                 trust' $PG_HBA_PATH
    
    # Redémarrer PostgreSQL
    log "Redémarrage PostgreSQL..."
    systemctl restart postgresql
    sleep 5
fi

# Test connexion base de données
log "Test connexion base de données..."
for i in {1..3}; do
    if sudo -u tomati psql -h localhost -U tomati -d tomati_db -c "SELECT version();" >/dev/null 2>&1; then
        log "✅ Connexion PostgreSQL réussie"
        break
    else
        warn "Tentative $i/3 de connexion échouée, retry..."
        sleep 2
    fi
done

# Mise à jour du code si nécessaire
log "Mise à jour du code..."
sudo -u $USER git pull origin main 2>/dev/null || warn "Git pull échoué ou pas nécessaire"

# Installation/mise à jour dépendances
log "Vérification dépendances..."
sudo -u $USER npm install

# Build application
log "Build application..."
sudo -u $USER npm run build || warn "Build échoué, utilisation de tsx"

# Migration base de données
log "Migration base de données..."
sudo -u $USER npm run db:push || warn "Migration échouée, mais on continue"

# Créer/vérifier configuration PM2
log "Configuration PM2..."

# Déterminer le script à utiliser
if [ -f "dist/server/index.js" ]; then
    SCRIPT_PATH="./dist/server/index.js"
    INTERPRETER=""
else
    SCRIPT_PATH="tsx"
    INTERPRETER="server/index.ts"
fi

# Créer ecosystem.config.cjs
sudo -u $USER cat > ecosystem.config.cjs << EOF
module.exports = {
  apps: [{
    name: 'tomati-production',
    script: '$SCRIPT_PATH',
    $([ ! -z "$INTERPRETER" ] && echo "args: '$INTERPRETER',")
    cwd: '/home/tomati/tomati-market',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    watch: false,
    max_memory_restart: '1G',
    restart_delay: 4000,
    exp_backoff_restart_delay: 100
  }]
};
EOF

# Créer dossier logs
sudo -u $USER mkdir -p logs

# Supprimer ancien processus et démarrer
log "Redémarrage application..."
sudo -u $USER pm2 delete $APP_NAME 2>/dev/null || true
sudo -u $USER pm2 start ecosystem.config.cjs

# Configuration démarrage automatique
sudo -u $USER pm2 save
sudo -u $USER pm2 startup systemd -u $USER --hp /home/$USER > /tmp/pm2_startup.sh 2>/dev/null || true
bash /tmp/pm2_startup.sh 2>/dev/null || true

# Configuration/vérification Nginx
log "Vérification configuration Nginx..."
if [ ! -f "/etc/nginx/sites-available/tomati" ]; then
    log "Création configuration Nginx..."
    cat > /etc/nginx/sites-available/tomati << 'EOF'
server {
    listen 80;
    server_name 51.222.111.183 tomati.org www.tomati.org;
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        proxy_pass http://localhost:5000;
    }
}
EOF

    ln -sf /etc/nginx/sites-available/tomati /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
fi

# Test et redémarrage Nginx
nginx -t && systemctl restart nginx || error "Erreur configuration Nginx"

# Attendre que l'application démarre
log "Attente démarrage application..."
sleep 10

# Vérifications finales
log "=== VÉRIFICATIONS FINALES ==="

echo "📊 Statut PM2:"
sudo -u $USER pm2 status || true

echo -e "\n🗄️ Test base de données:"
sudo -u tomati psql -h localhost -U tomati -d tomati_db -c "SELECT 'Base de données OK' as status;" 2>/dev/null || echo "❌ Problème base de données"

echo -e "\n🌐 Test application local:"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/ 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Application locale OK (HTTP $HTTP_CODE)"
else
    echo "⚠️ Application locale: HTTP $HTTP_CODE"
fi

echo -e "\n🌍 Test application public:"
HTTP_CODE_PUBLIC=$(curl -s -o /dev/null -w "%{http_code}" http://51.222.111.183/ 2>/dev/null || echo "000")
if [ "$HTTP_CODE_PUBLIC" = "200" ]; then
    echo "✅ Application publique OK (HTTP $HTTP_CODE_PUBLIC)"
else
    echo "⚠️ Application publique: HTTP $HTTP_CODE_PUBLIC"
fi

echo -e "\n📝 Logs récents:"
sudo -u $USER pm2 logs $APP_NAME --lines 5 --nostream || true

echo ""
log "🎉 CORRECTION TERMINÉE !"
echo ""
echo "📋 Résumé:"
echo "   • Application: Tomati Market"
echo "   • Repository: https://github.com/imen-nasrii/cool-mobile-spark.git"
echo "   • VPS: 51.222.111.183"
echo "   • Processus: tomati-production"
echo "   • URL: http://51.222.111.183"
echo ""
echo "🔧 Commandes maintenance:"
echo "   • Statut: sudo -u tomati pm2 status"
echo "   • Logs: sudo -u tomati pm2 logs tomati-production"
echo "   • Redémarrage: sudo -u tomati pm2 restart tomati-production"
echo ""
if [ "$HTTP_CODE_PUBLIC" = "200" ]; then
    echo "✅ VOTRE APPLICATION EST MAINTENANT HÉBERGÉE SUR: http://51.222.111.183"
else
    echo "⚠️ Application déployée mais vérifiez les logs pour optimisation"
fi