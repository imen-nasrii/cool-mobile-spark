#!/bin/bash

# Script de déploiement Tomati Market pour utilisateur tomati
# VPS: 51.222.111.183
# Repository: https://github.com/imen-nasrii/cool-mobile-spark.git

echo "🚀 Déploiement Tomati Market avec utilisateur tomati..."

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

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier si on est connecté en tant que root ou avec sudo
if [[ $EUID -ne 0 ]]; then
   print_error "Ce script doit être exécuté avec sudo"
   exit 1
fi

print_status "Mise à jour du système..."
apt update

# Installer les prérequis si nécessaire
print_status "Installation des prérequis..."

# Git
if ! command -v git &> /dev/null; then
    print_status "Installation de Git..."
    apt install -y git
fi

# Node.js 18
if ! command -v node &> /dev/null; then
    print_status "Installation de Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# PM2
if ! command -v pm2 &> /dev/null; then
    print_status "Installation de PM2..."
    npm install -g pm2
fi

# PostgreSQL
if ! command -v psql &> /dev/null; then
    print_status "Installation de PostgreSQL..."
    apt install -y postgresql postgresql-contrib
    systemctl start postgresql
    systemctl enable postgresql
fi

# Nginx
if ! command -v nginx &> /dev/null; then
    print_status "Installation de Nginx..."
    apt install -y nginx
    systemctl start nginx
    systemctl enable nginx
fi

# Créer l'utilisateur tomati s'il n'existe pas
if ! id "$USER" &>/dev/null; then
    print_status "Création de l'utilisateur $USER..."
    useradd -m -s /bin/bash $USER
    usermod -aG sudo $USER
    echo "$USER:tomati123" | chpasswd
fi

# Configuration PostgreSQL
print_status "Configuration de PostgreSQL..."
sudo -u postgres psql << 'EOSQL'
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
EOSQL

# Arrêter l'application existante
print_status "Arrêt de l'application existante..."
sudo -u $USER pm2 delete $APP_NAME 2>/dev/null || true
sudo -u $USER pm2 kill 2>/dev/null || true

# Supprimer l'ancien répertoire
if [ -d "$APP_DIR" ]; then
    print_status "Suppression de l'ancienne installation..."
    rm -rf $APP_DIR
fi

# Créer le répertoire et définir les permissions
print_status "Création du répertoire d'application..."
mkdir -p $APP_DIR
chown -R $USER:$USER $APP_DIR

# Cloner le repository
print_status "Clonage du repository GitHub..."
sudo -u $USER git clone $REPO_URL $APP_DIR

# Naviguer vers le répertoire
cd $APP_DIR

# Configuration de l'environnement
print_status "Configuration de l'environnement..."
sudo -u $USER cat > .env << 'EOF'
# Base de données PostgreSQL
DATABASE_URL=postgresql://tomati:tomati123@localhost:5432/tomati_db
PGUSER=tomati
PGPASSWORD=tomati123
PGDATABASE=tomati_db
PGHOST=localhost
PGPORT=5432

# JWT Secret
JWT_SECRET=tomati-super-secret-jwt-key-production-2025
SESSION_SECRET=tomati-super-secret-session-key-production-2025

# Application
NODE_ENV=production
PORT=5000

# Replit compatibility
REPL_ID=tomati-market
REPLIT_DOMAINS=51.222.111.183,tomati.org
ISSUER_URL=https://replit.com/oidc
EOF

chown $USER:$USER .env

# Installation des dépendances
print_status "Installation des dépendances npm..."
sudo -u $USER npm install

# Build de l'application
print_status "Build de l'application..."
sudo -u $USER npm run build

# Vérifier que le build a créé le dossier dist
if [ ! -d "dist" ]; then
    print_error "Le build n'a pas créé le dossier dist. Vérification du package.json..."
    print_status "Contenu du répertoire:"
    ls -la
    print_status "Tentative de build avec vite..."
    sudo -u $USER npx vite build || true
fi

# Migration de la base de données
print_status "Migration de la base de données..."
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

# Vérifier que le fichier de démarrage existe
if [ ! -f "dist/server/index.js" ]; then
    print_warning "Le fichier dist/server/index.js n'existe pas. Création d'un script de démarrage alternatif..."
    
    # Chercher le fichier d'entrée
    if [ -f "server/index.ts" ]; then
        print_status "Utilisation de server/index.ts avec tsx..."
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
    restart_delay: 1000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF
    fi
fi

# Démarrer l'application avec PM2
print_status "Démarrage de l'application avec PM2..."
sudo -u $USER pm2 start ecosystem.config.cjs

# Sauvegarder la configuration PM2
sudo -u $USER pm2 save

# Configuration du démarrage automatique
print_status "Configuration du démarrage automatique..."
sudo -u $USER pm2 startup systemd -u $USER --hp /home/$USER > /tmp/pm2_startup.sh
bash /tmp/pm2_startup.sh

# Configuration Nginx
print_status "Configuration de Nginx..."
cat > /etc/nginx/sites-available/tomati << 'EOF'
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
ln -sf /etc/nginx/sites-available/tomati /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Tester la configuration Nginx
nginx -t

# Redémarrer Nginx
systemctl restart nginx

# Affichage du statut final
print_status "Vérification du statut de l'application..."
sudo -u $USER pm2 status

print_status "Test de connexion locale..."
sleep 5
curl -s -o /dev/null -w "Code de réponse HTTP: %{http_code}\n" http://localhost:5000/ || echo "Impossible de se connecter"

# Configuration du firewall
print_status "Configuration du firewall..."
ufw allow 22 2>/dev/null || true
ufw allow 80 2>/dev/null || true
ufw allow 443 2>/dev/null || true

echo ""
print_status "🎉 Déploiement terminé avec succès !"
echo ""
echo "📋 Informations de déploiement :"
echo "   • Application: $APP_NAME"
echo "   • Utilisateur: $USER"
echo "   • Répertoire: $APP_DIR"
echo "   • Port: 5000"
echo "   • URL: http://51.222.111.183"
echo ""
echo "🔧 Commandes utiles :"
echo "   • Statut: sudo -u $USER pm2 status"
echo "   • Logs: sudo -u $USER pm2 logs $APP_NAME"
echo "   • Restart: sudo -u $USER pm2 restart $APP_NAME"
echo "   • Stop: sudo -u $USER pm2 stop $APP_NAME"
echo ""
print_status "✅ Application accessible sur: http://51.222.111.183"
print_status "✅ Utilisateur tomati configuré avec mot de passe: tomati123"