#!/bin/bash

# Déploiement Tomati Market depuis GitHub sur VPS 51.222.111.183
# Repository: https://github.com/imen-nasrii/cool-mobile-spark.git

set -e  # Arrêter en cas d'erreur

echo "🚀 Déploiement Tomati Market depuis GitHub..."

# Configuration
REPO_URL="https://github.com/imen-nasrii/cool-mobile-spark.git"
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

# Vérifier les privilèges
if [[ $EUID -ne 0 ]]; then
   error "Ce script doit être exécuté avec sudo"
   exit 1
fi

log "Mise à jour du système..."
apt update -qq

# Installation des prérequis
log "Installation des prérequis..."

# Node.js 18
if ! command -v node &> /dev/null; then
    log "Installation Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# PM2
if ! command -v pm2 &> /dev/null; then
    log "Installation PM2..."
    npm install -g pm2
fi

# PostgreSQL
if ! command -v psql &> /dev/null; then
    log "Installation PostgreSQL..."
    apt install -y postgresql postgresql-contrib
    systemctl start postgresql
    systemctl enable postgresql
fi

# Nginx
if ! command -v nginx &> /dev/null; then
    log "Installation Nginx..."
    apt install -y nginx
    systemctl start nginx
    systemctl enable nginx
fi

# Git
if ! command -v git &> /dev/null; then
    apt install -y git
fi

# Créer utilisateur tomati
if ! id "$USER" &>/dev/null; then
    log "Création utilisateur $USER..."
    useradd -m -s /bin/bash $USER
    usermod -aG sudo $USER
    echo "$USER:tomati123" | chpasswd
fi

# Configuration PostgreSQL
log "Configuration PostgreSQL..."
sudo -u postgres psql << 'EOSQL'
DROP DATABASE IF EXISTS tomati_db;
DROP USER IF EXISTS tomati;

CREATE USER tomati WITH PASSWORD 'tomati123';
ALTER USER tomati CREATEDB;
ALTER USER tomati WITH SUPERUSER;

CREATE DATABASE tomati_db OWNER tomati;
GRANT ALL PRIVILEGES ON DATABASE tomati_db TO tomati;
EOSQL

# Configurer pg_hba.conf
PG_VERSION=$(sudo -u postgres psql -t -c "SHOW server_version_num;" | xargs echo | cut -c1-2)
PG_HBA_PATH="/etc/postgresql/$PG_VERSION/main/pg_hba.conf"

if [ -f "$PG_HBA_PATH" ]; then
    cp $PG_HBA_PATH $PG_HBA_PATH.backup
    
    # Ajouter règles pour tomati
    if ! grep -q "tomati_db.*tomati" $PG_HBA_PATH; then
        sed -i '1i# Tomati user access' $PG_HBA_PATH
        sed -i '2i\local   tomati_db       tomati                                  trust' $PG_HBA_PATH
        sed -i '3i\host    tomati_db       tomati          127.0.0.1/32            trust' $PG_HBA_PATH
    fi
    
    systemctl restart postgresql
    sleep 3
fi

# Arrêter ancienne application
log "Arrêt ancienne application..."
sudo -u $USER pm2 delete $APP_NAME 2>/dev/null || true
sudo -u $USER pm2 kill 2>/dev/null || true

# Supprimer ancien code
if [ -d "$APP_DIR" ]; then
    log "Suppression ancien code..."
    rm -rf $APP_DIR
fi

# Cloner repository
log "Clonage repository GitHub..."
mkdir -p $APP_DIR
chown -R $USER:$USER $APP_DIR
sudo -u $USER git clone $REPO_URL $APP_DIR

cd $APP_DIR

# Configuration environnement
log "Configuration environnement..."
sudo -u $USER cat > .env << 'EOF'
# Base de données PostgreSQL locale
DATABASE_URL=postgresql://tomati:tomati123@localhost:5432/tomati_db
PGUSER=tomati
PGPASSWORD=tomati123
PGDATABASE=tomati_db
PGHOST=localhost
PGPORT=5432

# Application
NODE_ENV=production
PORT=5000
JWT_SECRET=tomati-jwt-secret-production-2025
SESSION_SECRET=tomati-session-secret-production-2025

# Désactiver Replit Auth pour éviter les erreurs de connexion
EOF

chown $USER:$USER .env

# Installation dépendances
log "Installation dépendances..."
sudo -u $USER npm install

# Build application
log "Build application..."
sudo -u $USER npm run build

# Vérifier build
if [ ! -d "dist" ] && [ ! -f "server/index.ts" ]; then
    error "Aucun fichier de démarrage trouvé"
    exit 1
fi

# Configuration PM2
log "Configuration PM2..."
if [ -d "dist" ] && [ -f "dist/server/index.js" ]; then
    # Build réussi, utiliser le JS compilé
    sudo -u $USER cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'tomati-production',
    script: './dist/server/index.js',
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
    max_memory_restart: '1G'
  }]
};
EOF
else
    # Utiliser TypeScript avec tsx
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
    max_memory_restart: '1G'
  }]
};
EOF
fi

# Créer dossier logs
sudo -u $USER mkdir -p logs

# Migration base de données
log "Migration base de données..."
sudo -u $USER npm run db:push || warn "Migration échouée, mais on continue..."

# Test connexion base de données
log "Test connexion base de données..."
sudo -u tomati psql -h localhost -U tomati -d tomati_db -c "SELECT version();" || warn "Test connexion échoué"

# Démarrer application
log "Démarrage application..."
sudo -u $USER pm2 start ecosystem.config.cjs

# Configuration démarrage automatique
sudo -u $USER pm2 save
sudo -u $USER pm2 startup systemd -u $USER --hp /home/$USER > /tmp/pm2_startup.sh 2>/dev/null || true
bash /tmp/pm2_startup.sh 2>/dev/null || true

# Configuration Nginx
log "Configuration Nginx..."
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

# Test configuration Nginx
nginx -t && systemctl restart nginx

# Configuration firewall
ufw allow 22 2>/dev/null || true
ufw allow 80 2>/dev/null || true
ufw allow 443 2>/dev/null || true

# Attendre démarrage
sleep 5

# Vérifications finales
log "Vérifications finales..."
echo "📊 Statut PM2:"
sudo -u $USER pm2 status

echo -e "\n🌐 Test application:"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/ || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Application accessible (HTTP $HTTP_CODE)"
else
    echo "⚠️ Application répond avec code $HTTP_CODE"
fi

echo -e "\n📝 Logs récents:"
sudo -u $USER pm2 logs tomati-production --lines 5 || true

echo ""
log "🎉 Déploiement terminé !"
echo ""
echo "📋 Informations:"
echo "   • Application: $APP_NAME"
echo "   • Répertoire: $APP_DIR"
echo "   • URL: http://51.222.111.183"
echo "   • Utilisateur: $USER (mot de passe: tomati123)"
echo ""
echo "🔧 Commandes utiles:"
echo "   • Statut: sudo -u $USER pm2 status"
echo "   • Logs: sudo -u $USER pm2 logs $APP_NAME"
echo "   • Redémarrage: sudo -u $USER pm2 restart $APP_NAME"
echo ""
log "✅ Application accessible sur: http://51.222.111.183"