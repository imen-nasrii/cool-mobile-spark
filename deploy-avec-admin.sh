#!/bin/bash

# 🚀 Déploiement Tomati avec Utilisateur Admin
# Script complet pour créer admin et déployer l'application

set -e

echo "🚀 Déploiement Tomati avec utilisateur admin"
echo "============================================="

# Variables
DB_NAME="tomatii_db"
DB_USER="tomatii_user"
DB_PASSWORD="tomatii_password_2024!"
ADMIN_USER="admin"
DOMAIN="tomati.org"

# Vérification des droits root/sudo
if [[ $EUID -eq 0 ]]; then
    SUDO=""
elif sudo -n true 2>/dev/null; then
    SUDO="sudo"
else
    echo "❌ Ce script nécessite des privilèges sudo"
    exit 1
fi

log() {
    echo "✅ $1"
}

# 1. Création de l'utilisateur admin
log "Création de l'utilisateur admin..."
$SUDO adduser --disabled-password --gecos "Admin User" $ADMIN_USER || true
$SUDO usermod -aG sudo $ADMIN_USER

# 2. Configuration PostgreSQL (si pas déjà fait)
log "Configuration de PostgreSQL..."
$SUDO systemctl start postgresql
$SUDO systemctl enable postgresql

# Création de la base de données si elle n'existe pas
$SUDO -u postgres psql << EOF || true
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER USER $DB_USER CREATEDB;
\q
EOF

# 3. Installation pour l'utilisateur admin
log "Configuration de l'environnement pour admin..."
$SUDO -u $ADMIN_USER bash << 'ADMIN_SETUP'
cd /home/admin

# Installation de NVM
if [ ! -d "/home/admin/.nvm" ]; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
fi

# Chargement de NVM
export NVM_DIR="/home/admin/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Installation de Node.js
nvm install --lts
nvm use --lts

# Clone du projet
if [ -d "cool-mobile-spark" ]; then
    rm -rf cool-mobile-spark
fi
git clone https://github.com/imen-nasrii/cool-mobile-spark.git
cd cool-mobile-spark

# Installation des dépendances
npm install

# Configuration .env
cat > .env << 'ENVEOF'
DATABASE_URL=postgresql://tomatii_user:tomatii_password_2024!@localhost:5432/tomatii_db
PGDATABASE=tomatii_db
PGHOST=localhost
PGPORT=5432
PGUSER=tomatii_user
PGPASSWORD=tomatii_password_2024!
JWT_SECRET=tomati_super_secret_jwt_key_2024_production
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
SESSION_SECRET=tomati_session_secret_key_2024_production
REPL_ID=tomati-production
REPLIT_DOMAINS=tomati.org
ISSUER_URL=https://replit.com/oidc
ENVEOF

chmod 600 .env

# Migration de la base de données
npm run db:push

# Build de l'application
npm run build

# Installation et configuration de PM2
npm install -g pm2

# Configuration ecosystem PM2
cat > ecosystem.config.cjs << 'PMEOF'
module.exports = {
  apps: [{
    name: 'tomati-production',
    script: 'server/index.ts',
    interpreter: 'node',
    interpreter_args: '--loader tsx/esm',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
PMEOF

# Création du dossier logs et démarrage
mkdir -p logs
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup

# Scripts de gestion
cat > deploy.sh << 'DEPLOYEOF'
#!/bin/bash
echo "🚀 Déploiement Tomati par Admin..."
cd /home/admin/cool-mobile-spark

# Backup de la base de données
sudo -u postgres pg_dump tomatii_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Chargement NVM
export NVM_DIR="/home/admin/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Mise à jour
git pull origin main
npm install
npm run db:push
npm run build
pm2 restart tomati-production

echo "✅ Déploiement terminé par Admin !"
DEPLOYEOF

cat > monitor.sh << 'MONEOF'
#!/bin/bash
echo "📊 Status Tomati - Admin Panel:"
echo "==============================="

# Chargement NVM
export NVM_DIR="/home/admin/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

pm2 status
echo ""
echo "💾 Utilisation disque:"
df -h | head -5
echo ""
echo "🧠 Utilisation mémoire:"
free -h
echo ""
echo "📈 Status des services:"
sudo systemctl status nginx --no-pager -l 0 | head -3
sudo systemctl status postgresql --no-pager -l 0 | head -3
MONEOF

chmod +x deploy.sh monitor.sh

echo "✅ Configuration de l'utilisateur admin terminée"
ADMIN_SETUP

# 4. Configuration Nginx
log "Configuration de Nginx..."
$SUDO tee /etc/nginx/sites-available/tomati > /dev/null << 'NGINXEOF'
server {
    listen 80;
    server_name tomati.org www.tomati.org;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

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

    location /ws {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINXEOF

# Activation de la configuration Nginx
$SUDO ln -sf /etc/nginx/sites-available/tomati /etc/nginx/sites-enabled/
$SUDO rm -f /etc/nginx/sites-enabled/default
$SUDO nginx -t
$SUDO systemctl restart nginx
$SUDO systemctl enable nginx

# 5. Configuration du pare-feu
log "Configuration du pare-feu..."
$SUDO ufw allow OpenSSH
$SUDO ufw allow 'Nginx Full'
$SUDO ufw --force enable

# 6. Tests finaux
log "Tests de vérification..."
sleep 3

# Vérification des services
if $SUDO systemctl is-active --quiet nginx; then
    echo "✅ Nginx: actif"
else
    echo "❌ Nginx: problème"
fi

if $SUDO systemctl is-active --quiet postgresql; then
    echo "✅ PostgreSQL: actif"
else
    echo "❌ PostgreSQL: problème"
fi

# Test de l'application
if curl -s -I http://localhost:5000 | head -1 | grep -q "200\|302\|301"; then
    echo "✅ Application: accessible"
else
    echo "❌ Application: problème de connexion"
fi

echo ""
echo "🎉 DÉPLOIEMENT TERMINÉ !"
echo "========================"
echo ""
echo "📍 Accès à l'application:"
echo "   HTTP:  http://$DOMAIN"
echo "   Local: http://localhost:5000"
echo ""
echo "🔐 Utilisateur admin créé: $ADMIN_USER"
echo ""
echo "🔧 Commandes de gestion:"
echo "   sudo su - admin"
echo "   pm2 status"
echo "   pm2 logs tomati-production"
echo "   pm2 restart tomati-production"
echo "   ./monitor.sh"
echo "   ./deploy.sh"
echo ""
echo "✅ Votre marketplace Tomati est opérationnelle !"