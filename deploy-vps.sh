#!/bin/bash

# Script de déploiement automatisé pour Tomati Market
# Repository: https://github.com/imen-nasrii/cool-mobile-spark.git

echo "🚀 Déploiement de Tomati Market sur VPS..."

# Variables
REPO_URL="https://github.com/imen-nasrii/cool-mobile-spark.git"
APP_DIR="/home/tomati/tomati-market"
USER="tomati"
APP_NAME="tomati-production"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction d'affichage coloré
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérification des prérequis
print_status "Vérification des prérequis..."

# Vérifier si git est installé
if ! command -v git &> /dev/null; then
    print_error "Git n'est pas installé. Installation..."
    sudo apt update && sudo apt install -y git
fi

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    print_error "Node.js n'est pas installé. Installation..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Vérifier si PM2 est installé
if ! command -v pm2 &> /dev/null; then
    print_error "PM2 n'est pas installé. Installation..."
    sudo npm install -g pm2
fi

# Créer l'utilisateur tomati si il n'existe pas
if ! id "$USER" &>/dev/null; then
    print_status "Création de l'utilisateur $USER..."
    sudo useradd -m -s /bin/bash $USER
    sudo usermod -aG sudo $USER
fi

# Arrêter l'application existante si elle existe
print_status "Arrêt de l'application existante..."
sudo -u $USER pm2 delete $APP_NAME 2>/dev/null || true

# Supprimer l'ancien répertoire s'il existe
if [ -d "$APP_DIR" ]; then
    print_status "Suppression de l'ancienne installation..."
    sudo rm -rf $APP_DIR
fi

# Créer le répertoire de l'application
print_status "Création du répertoire d'application..."
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# Cloner le repository
print_status "Clonage du repository GitHub..."
sudo -u $USER git clone $REPO_URL $APP_DIR

# Naviguer vers le répertoire de l'application
cd $APP_DIR

# Installation des dépendances
print_status "Installation des dépendances npm..."
sudo -u $USER npm install

# Configuration de l'environnement
print_status "Configuration de l'environnement..."

# Créer le fichier .env si il n'existe pas
if [ ! -f .env ]; then
    print_status "Création du fichier .env..."
    sudo -u $USER cat > .env << 'EOF'
# Base de données PostgreSQL
DATABASE_URL=postgresql://tomati:tomati123@localhost:5432/tomati_db
PGUSER=tomati
PGPASSWORD=tomati123
PGDATABASE=tomati_db
PGHOST=localhost
PGPORT=5432

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Session Secret
SESSION_SECRET=your-super-secret-session-key-change-in-production

# Environnement
NODE_ENV=production
PORT=5000

# Replit variables (pour compatibilité)
REPL_ID=tomati-market
REPLIT_DOMAINS=51.222.111.183,tomati.org
ISSUER_URL=https://replit.com/oidc
EOF
    sudo chown $USER:$USER .env
fi

# Build de l'application
print_status "Build de l'application..."
sudo -u $USER npm run build

# Vérification de la base de données PostgreSQL
print_status "Vérification de PostgreSQL..."
if ! systemctl is-active --quiet postgresql; then
    print_warning "PostgreSQL n'est pas actif. Tentative de démarrage..."
    sudo systemctl start postgresql
fi

# Création de la base de données et de l'utilisateur
print_status "Configuration de la base de données..."
sudo -u postgres psql << 'EOF'
-- Créer l'utilisateur s'il n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'tomati') THEN
        CREATE USER tomati WITH PASSWORD 'tomati123';
    END IF;
END
$$;

-- Créer la base de données s'elle n'existe pas
SELECT 'CREATE DATABASE tomati_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'tomati_db')\gexec

-- Donner les permissions
GRANT ALL PRIVILEGES ON DATABASE tomati_db TO tomati;
ALTER USER tomati CREATEDB;
EOF

# Migration de la base de données
print_status "Migration de la base de données..."
cd $APP_DIR
sudo -u $USER npm run db:push

# Configuration PM2
print_status "Configuration de PM2..."
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
    max_memory_restart: '1G',
    restart_delay: 1000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF

# Créer le répertoire de logs
sudo -u $USER mkdir -p logs

# Démarrer l'application avec PM2
print_status "Démarrage de l'application avec PM2..."
sudo -u $USER pm2 start ecosystem.config.cjs

# Sauvegarder la configuration PM2
sudo -u $USER pm2 save

# Configuration du démarrage automatique
print_status "Configuration du démarrage automatique..."
sudo -u $USER pm2 startup systemd -u $USER --hp /home/$USER
sudo env PATH=$PATH:/usr/bin /usr/local/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp /home/$USER

# Configuration Nginx
print_status "Configuration de Nginx..."

# Installer Nginx si nécessaire
if ! command -v nginx &> /dev/null; then
    sudo apt update && sudo apt install -y nginx
fi

# Créer la configuration Nginx
sudo cat > /etc/nginx/sites-available/tomati << 'EOF'
server {
    listen 80;
    server_name 51.222.111.183 tomati.org www.tomati.org;

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

    # Gestion des fichiers statiques
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        proxy_pass http://localhost:5000;
    }
}
EOF

# Activer le site
sudo ln -sf /etc/nginx/sites-available/tomati /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Tester la configuration Nginx
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

# Affichage du statut final
print_status "Vérification du statut de l'application..."
sudo -u $USER pm2 status

print_status "Vérification de l'accès HTTP..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/ || echo "Erreur de connexion"

echo ""
print_status "🎉 Déploiement terminé avec succès !"
echo ""
echo "📋 Informations de déploiement :"
echo "   • Application: $APP_NAME"
echo "   • Répertoire: $APP_DIR"
echo "   • Port: 5000"
echo "   • URL: http://51.222.111.183"
echo "   • Logs: $APP_DIR/logs/"
echo ""
echo "🔧 Commandes utiles :"
echo "   • Statut: sudo -u $USER pm2 status"
echo "   • Logs: sudo -u $USER pm2 logs $APP_NAME"
echo "   • Restart: sudo -u $USER pm2 restart $APP_NAME"
echo "   • Stop: sudo -u $USER pm2 stop $APP_NAME"
echo ""
print_status "Application accessible sur: http://51.222.111.183"