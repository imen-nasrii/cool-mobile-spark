#!/bin/bash

# Script de déploiement complet Tomati Market pour VPS Hostinger
# Repository: https://github.com/imen-nasrii/cool-mobile-spark.git

set -e

echo "🚀 Déploiement Tomati Market sur VPS Hostinger"
echo "Repository: https://github.com/imen-nasrii/cool-mobile-spark.git"

# Configuration
REPO_URL="https://github.com/imen-nasrii/cool-mobile-spark.git"
APP_DIR="/home/tomati/tomati-market"
USER="tomati"
APP_NAME="tomati-production"

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }
info() { echo -e "${BLUE}[INFO]${NC} $1"; }

# Vérifier privilèges
if [[ $EUID -ne 0 ]]; then
   error "Ce script doit être exécuté avec sudo ou en tant que root"
   exit 1
fi

# Détecter l'IP publique
PUBLIC_IP=$(curl -s ifconfig.me || curl -s icanhazip.com || echo "IP_NON_DETECTEE")
log "IP publique détectée: $PUBLIC_IP"

log "=== PHASE 1: MISE À JOUR SYSTÈME ==="
apt update -qq
apt upgrade -y -qq

log "=== PHASE 2: INSTALLATION PRÉREQUIS ==="

# Node.js 18
if ! command -v node &> /dev/null || [[ $(node -v | cut -d'v' -f2 | cut -d'.' -f1) -lt 18 ]]; then
    log "Installation Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
else
    log "Node.js $(node -v) déjà installé"
fi

# PM2
if ! command -v pm2 &> /dev/null; then
    log "Installation PM2..."
    npm install -g pm2
else
    log "PM2 déjà installé"
fi

# PostgreSQL
if ! command -v psql &> /dev/null; then
    log "Installation PostgreSQL..."
    apt install -y postgresql postgresql-contrib
    systemctl start postgresql
    systemctl enable postgresql
else
    log "PostgreSQL déjà installé"
fi

# Nginx
if ! command -v nginx &> /dev/null; then
    log "Installation Nginx..."
    apt install -y nginx
    systemctl start nginx
    systemctl enable nginx
else
    log "Nginx déjà installé"
fi

# Git et autres outils
apt install -y git curl wget unzip htop

log "=== PHASE 3: CONFIGURATION UTILISATEUR ==="

# Créer utilisateur tomati
if ! id "$USER" &>/dev/null; then
    log "Création utilisateur $USER..."
    useradd -m -s /bin/bash $USER
    usermod -aG sudo $USER
    echo "$USER:tomati123" | chpasswd
    log "Utilisateur $USER créé avec mot de passe: tomati123"
else
    log "Utilisateur $USER existe déjà"
fi

log "=== PHASE 4: CONFIGURATION POSTGRESQL ==="

# Configuration PostgreSQL
log "Configuration base de données..."
sudo -u postgres psql << 'EOSQL'
-- Supprimer si existe
DROP DATABASE IF EXISTS tomati_db;
DROP USER IF EXISTS tomati;

-- Créer utilisateur
CREATE USER tomati WITH PASSWORD 'tomati123';
ALTER USER tomati CREATEDB;
ALTER USER tomati WITH SUPERUSER;

-- Créer base de données
CREATE DATABASE tomati_db OWNER tomati;
GRANT ALL PRIVILEGES ON DATABASE tomati_db TO tomati;

-- Afficher résultat
\l
\du
EOSQL

# Configuration pg_hba.conf pour Hostinger
PG_VERSION=$(sudo -u postgres psql -t -c "SHOW server_version_num;" | xargs echo | cut -c1-2)
PG_HBA_PATH="/etc/postgresql/$PG_VERSION/main/pg_hba.conf"

if [ -f "$PG_HBA_PATH" ]; then
    log "Configuration authentification PostgreSQL..."
    cp $PG_HBA_PATH $PG_HBA_PATH.backup-hostinger
    
    # Ajouter règles pour tomati
    if ! grep -q "tomati_db.*tomati" $PG_HBA_PATH; then
        sed -i '1i# === Tomati Market - Hostinger VPS ===' $PG_HBA_PATH
        sed -i '2i\local   all             tomati                                  trust' $PG_HBA_PATH
        sed -i '3i\host    all             tomati          127.0.0.1/32            trust' $PG_HBA_PATH
        sed -i '4i\host    all             tomati          ::1/128                 trust' $PG_HBA_PATH
        sed -i '5i\local   tomati_db       tomati                                  trust' $PG_HBA_PATH
        sed -i '6i\host    tomati_db       tomati          127.0.0.1/32            trust' $PG_HBA_PATH
    fi
    
    systemctl restart postgresql
    sleep 3
fi

log "=== PHASE 5: DÉPLOIEMENT APPLICATION ==="

# Nettoyer ancien déploiement
if [ -d "$APP_DIR" ]; then
    log "Suppression ancien déploiement..."
    sudo -u $USER pm2 delete $APP_NAME 2>/dev/null || true
    sudo -u $USER pm2 kill 2>/dev/null || true
    rm -rf $APP_DIR
fi

# Cloner repository
log "Clone repository GitHub..."
mkdir -p $APP_DIR
chown -R $USER:$USER $APP_DIR
sudo -u $USER git clone $REPO_URL $APP_DIR

cd $APP_DIR

# Configuration environnement pour Hostinger
log "Configuration environnement..."
sudo -u $USER cat > .env << EOF
# Configuration Hostinger VPS - Production
DATABASE_URL=postgresql://tomati:tomati123@localhost:5432/tomati_db
PGUSER=tomati
PGPASSWORD=tomati123
PGDATABASE=tomati_db
PGHOST=localhost
PGPORT=5432

# Application
NODE_ENV=production
PORT=5000
JWT_SECRET=tomati-hostinger-jwt-secret-2025
SESSION_SECRET=tomati-hostinger-session-secret-2025

# Hostinger VPS
HOSTINGER_VPS=true
PUBLIC_IP=$PUBLIC_IP
EOF

chown $USER:$USER .env

log "=== PHASE 6: BUILD APPLICATION ==="

# Installation dépendances
log "Installation dépendances..."
sudo -u $USER npm install

# Build application
log "Build production..."
sudo -u $USER npm run build

# Migration base de données
log "Migration base de données..."
sudo -u $USER npm run db:push || warn "Migration échouée, mais on continue"

log "=== PHASE 7: CONFIGURATION PM2 ==="

# Configuration PM2 pour Hostinger
sudo -u $USER cat > ecosystem.config.cjs << 'EOF'
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
      PORT: 5000
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
sudo -u $USER mkdir -p logs

# Démarrer application
log "Démarrage application avec PM2..."
sudo -u $USER pm2 start ecosystem.config.cjs

# Configuration auto-start
sudo -u $USER pm2 save
sudo -u $USER pm2 startup systemd -u $USER --hp /home/$USER > /tmp/pm2_startup.sh 2>/dev/null || true
bash /tmp/pm2_startup.sh 2>/dev/null || true

log "=== PHASE 8: CONFIGURATION NGINX ==="

# Configuration Nginx pour Hostinger
cat > /etc/nginx/sites-available/tomati << EOF
server {
    listen 80;
    server_name $PUBLIC_IP _;
    client_max_body_size 50M;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
    }

    # Cache statique pour performance
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        proxy_pass http://localhost:5000;
    }

    # Logs spécifiques
    access_log /var/log/nginx/tomati.access.log;
    error_log /var/log/nginx/tomati.error.log;
}
EOF

# Activer site
ln -sf /etc/nginx/sites-available/tomati /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test et redémarrage Nginx
if nginx -t; then
    systemctl restart nginx
    log "Configuration Nginx activée"
else
    error "Erreur configuration Nginx"
    exit 1
fi

log "=== PHASE 9: CONFIGURATION FIREWALL ==="

# Configuration firewall pour Hostinger
if command -v ufw &> /dev/null; then
    ufw --force enable
    ufw allow 22/tcp    # SSH
    ufw allow 80/tcp    # HTTP
    ufw allow 443/tcp   # HTTPS
    ufw reload
    log "Firewall configuré"
fi

log "=== PHASE 10: OPTIMISATIONS HOSTINGER ==="

# Optimisations spécifiques Hostinger
# Augmenter limites système
echo "tomati soft nofile 65536" >> /etc/security/limits.conf
echo "tomati hard nofile 65536" >> /etc/security/limits.conf

# Configuration swap si nécessaire
if [ ! -f /swapfile ] && [ $(free -m | grep Swap | awk '{print $2}') -eq 0 ]; then
    log "Création swap 1GB..."
    fallocate -l 1G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

log "=== PHASE 11: TESTS FINAUX ==="

# Attendre démarrage complet
sleep 15

# Tests complets
echo "📊 ==========================="
echo "📊 VÉRIFICATIONS DÉPLOIEMENT"
echo "📊 ==========================="

echo -e "\n🔄 Statut PM2:"
sudo -u $USER pm2 status || true

echo -e "\n🗄️ Test base de données:"
if sudo -u tomati psql -h localhost -U tomati -d tomati_db -c "SELECT 'Database OK' as status;" >/dev/null 2>&1; then
    echo "✅ Base de données OK"
else
    echo "❌ Problème base de données"
fi

echo -e "\n🌐 Test application locale:"
LOCAL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/ 2>/dev/null || echo "000")
if [ "$LOCAL_STATUS" = "200" ]; then
    echo "✅ Application locale OK (HTTP $LOCAL_STATUS)"
else
    echo "⚠️ Application locale: HTTP $LOCAL_STATUS"
fi

echo -e "\n🌍 Test application publique:"
PUBLIC_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$PUBLIC_IP/ 2>/dev/null || echo "000")
if [ "$PUBLIC_STATUS" = "200" ]; then
    echo "✅ Application publique OK (HTTP $PUBLIC_STATUS)"
else
    echo "⚠️ Application publique: HTTP $PUBLIC_STATUS"
fi

echo -e "\n📝 Logs récents:"
sudo -u $USER pm2 logs $APP_NAME --lines 3 --nostream || true

# Informations finales
echo ""
echo "🎉 ================================"
echo "🎉 DÉPLOIEMENT HOSTINGER TERMINÉ !"
echo "🎉 ================================"
echo ""
echo "📋 Informations déploiement:"
echo "   • VPS: Hostinger"
echo "   • IP publique: $PUBLIC_IP"
echo "   • Application: Tomati Market"
echo "   • Repository: https://github.com/imen-nasrii/cool-mobile-spark.git"
echo "   • Utilisateur: $USER (mot de passe: tomati123)"
echo "   • Répertoire: $APP_DIR"
echo ""
echo "🌐 URLs d'accès:"
echo "   • Application: http://$PUBLIC_IP"
echo "   • Admin: http://$PUBLIC_IP/admin (admin@tomati.com / admin123)"
echo ""
echo "🔧 Commandes maintenance:"
echo "   • Statut: sudo -u $USER pm2 status"
echo "   • Logs: sudo -u $USER pm2 logs $APP_NAME"
echo "   • Redémarrage: sudo -u $USER pm2 restart $APP_NAME"
echo "   • Monitoring: sudo -u $USER pm2 monit"
echo ""
echo "📁 Fichiers importants:"
echo "   • App: $APP_DIR"
echo "   • Config: $APP_DIR/.env"
echo "   • Nginx: /etc/nginx/sites-available/tomati"
echo "   • Logs: $APP_DIR/logs/"
echo ""

# SSL/HTTPS information
echo "🔒 Pour HTTPS (optionnel):"
echo "   1. Configurer domaine dans panel Hostinger → IP $PUBLIC_IP"
echo "   2. sudo apt install certbot python3-certbot-nginx"
echo "   3. sudo certbot --nginx -d votre-domaine.com"
echo ""

if [ "$PUBLIC_STATUS" = "200" ]; then
    echo "✅ SUCCÈS ! Votre application Tomati Market est accessible sur:"
    echo "   👉 http://$PUBLIC_IP"
else
    echo "⚠️ Application déployée mais vérifiez les logs:"
    echo "   sudo -u $USER pm2 logs $APP_NAME"
fi

echo ""
echo "🎯 Déploiement Hostinger terminé avec succès !"