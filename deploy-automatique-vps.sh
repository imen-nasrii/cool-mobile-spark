#!/bin/bash

# 🚀 Script de Déploiement Automatique - Tomati sur VPS OVH
# Usage: bash deploy-automatique-vps.sh

set -e  # Arrêt en cas d'erreur

echo "🚀 Déploiement automatique de Tomati sur VPS OVH"
echo "================================================"

# Variables de configuration
DOMAIN="votre-domaine.com"  # Changez par votre domaine
DB_NAME="tomatii_db"
DB_USER="tomatii_user"
DB_PASSWORD="tomatii_password_2024!"
APP_USER="tomati"
APP_DIR="/home/tomati/cool-mobile-spark"
JWT_SECRET="tomati_super_secret_jwt_key_2024_production"
SESSION_SECRET="tomati_session_secret_key_2024_production"

echo "📋 Configuration:"
echo "- Domaine: $DOMAIN"
echo "- Base de données: $DB_NAME"
echo "- Utilisateur app: $APP_USER"
echo ""

# Fonction pour logger
log() {
    echo "✅ $1"
}

error() {
    echo "❌ $1"
    exit 1
}

# Vérification des droits root
if [[ $EUID -ne 0 ]]; then
   error "Ce script doit être exécuté en tant que root"
fi

# Étape 1: Mise à jour système
log "Mise à jour du système..."
apt update && apt upgrade -y
apt install curl git ufw build-essential nginx postgresql postgresql-contrib certbot python3-certbot-nginx -y

# Étape 2: Installation de Node.js via NVM
log "Installation de Node.js..."
if ! command -v nvm &> /dev/null; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
    nvm install --lts
    nvm use --lts
fi

# Étape 3: Configuration de PostgreSQL
log "Configuration de PostgreSQL..."
systemctl start postgresql
systemctl enable postgresql

sudo -u postgres psql <<EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER USER $DB_USER CREATEDB;
\q
EOF

# Étape 4: Création de l'utilisateur système
log "Création de l'utilisateur $APP_USER..."
if ! id "$APP_USER" &>/dev/null; then
    adduser --disabled-password --gecos "" $APP_USER
    usermod -aG sudo $APP_USER
fi

# Installation de NVM pour l'utilisateur tomati
sudo -u $APP_USER bash <<EOF
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="/home/$APP_USER/.nvm"
[ -s "\$NVM_DIR/nvm.sh" ] && \. "\$NVM_DIR/nvm.sh"
nvm install --lts
nvm use --lts
EOF

# Étape 5: Clone du projet
log "Clone du projet Tomati..."
sudo -u $APP_USER bash <<EOF
cd /home/$APP_USER
if [ -d "cool-mobile-spark" ]; then
    rm -rf cool-mobile-spark
fi
git clone https://github.com/imen-nasrii/cool-mobile-spark.git
cd cool-mobile-spark

# Chargement de NVM pour cet utilisateur
export NVM_DIR="/home/$APP_USER/.nvm"
[ -s "\$NVM_DIR/nvm.sh" ] && \. "\$NVM_DIR/nvm.sh"

# Installation des dépendances
npm install

# Création du fichier .env
cat > .env << 'ENVEOF'
# Database Configuration
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME
PGDATABASE=$DB_NAME
PGHOST=localhost
PGPORT=5432
PGUSER=$DB_USER
PGPASSWORD=$DB_PASSWORD

# JWT Configuration
JWT_SECRET=$JWT_SECRET

# Server Configuration
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# Session Configuration
SESSION_SECRET=$SESSION_SECRET

# Replit Configuration
REPL_ID=tomati-production
REPLIT_DOMAINS=$DOMAIN

# Security
ISSUER_URL=https://replit.com/oidc
ENVEOF

chmod 600 .env
EOF

# Étape 6: Migration de la base de données
log "Migration de la base de données..."
sudo -u $APP_USER bash <<EOF
cd $APP_DIR
export NVM_DIR="/home/$APP_USER/.nvm"
[ -s "\$NVM_DIR/nvm.sh" ] && \. "\$NVM_DIR/nvm.sh"
npm run db:push
EOF

# Étape 7: Build de l'application
log "Build de l'application..."
sudo -u $APP_USER bash <<EOF
cd $APP_DIR
export NVM_DIR="/home/$APP_USER/.nvm"
[ -s "\$NVM_DIR/nvm.sh" ] && \. "\$NVM_DIR/nvm.sh"
npm run build
EOF

# Étape 8: Installation et configuration de PM2
log "Configuration de PM2..."
sudo -u $APP_USER bash <<EOF
export NVM_DIR="/home/$APP_USER/.nvm"
[ -s "\$NVM_DIR/nvm.sh" ] && \. "\$NVM_DIR/nvm.sh"
npm install -g pm2

cd $APP_DIR

# Création du fichier ecosystem PM2
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

# Création du dossier logs
mkdir -p logs

# Démarrage avec PM2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
EOF

# Étape 9: Configuration de Nginx
log "Configuration de Nginx..."
cat > /etc/nginx/sites-available/tomati << 'NGINXEOF'
server {
    listen 80;
    server_name DOMAIN_PLACEHOLDER www.DOMAIN_PLACEHOLDER;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Main application
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

    # WebSocket support
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

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINXEOF

# Remplacement du placeholder domain
sed -i "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" /etc/nginx/sites-available/tomati

# Activation de la configuration
ln -sf /etc/nginx/sites-available/tomati /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test et redémarrage de Nginx
nginx -t
systemctl restart nginx
systemctl enable nginx

# Étape 10: Configuration du pare-feu
log "Configuration du pare-feu..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# Étape 11: Création des scripts de maintenance
log "Création des scripts de maintenance..."
sudo -u $APP_USER bash <<EOF
cat > /home/$APP_USER/deploy.sh << 'DEPLOYEOF'
#!/bin/bash
echo "🚀 Déploiement Tomati..."

cd $APP_DIR

# Backup de la base de données
sudo -u postgres pg_dump $DB_NAME > backup_\$(date +%Y%m%d_%H%M%S).sql

# Pull des dernières modifications
git pull origin main

# Chargement de NVM
export NVM_DIR="/home/$APP_USER/.nvm"
[ -s "\$NVM_DIR/nvm.sh" ] && \. "\$NVM_DIR/nvm.sh"

# Installation des dépendances
npm install

# Migration de la base de données
npm run db:push

# Build du frontend
npm run build

# Redémarrage de l'application
pm2 restart tomati-production

echo "✅ Déploiement terminé !"
DEPLOYEOF

chmod +x /home/$APP_USER/deploy.sh

cat > /home/$APP_USER/monitor.sh << 'MONITOREOF'
#!/bin/bash
echo "📊 Status de Tomati:"
echo "==================="

# Chargement de NVM
export NVM_DIR="/home/$APP_USER/.nvm"
[ -s "\$NVM_DIR/nvm.sh" ] && \. "\$NVM_DIR/nvm.sh"

# Status PM2
echo "🔄 PM2 Status:"
pm2 status

echo ""
echo "💾 Utilisation disque:"
df -h

echo ""
echo "🧠 Utilisation mémoire:"
free -h

echo ""
echo "📈 Status Nginx:"
sudo systemctl status nginx --no-pager

echo ""
echo "🗄️ Status PostgreSQL:"
sudo systemctl status postgresql --no-pager
MONITOREOF

chmod +x /home/$APP_USER/monitor.sh
EOF

# Étape 12: Installation HTTPS (optionnel)
read -p "Voulez-vous installer un certificat SSL avec Certbot? (y/N): " install_ssl
if [[ $install_ssl =~ ^[Yy]$ ]]; then
    log "Installation du certificat SSL..."
    certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
    certbot renew --dry-run
fi

# Étape 13: Vérifications finales
log "Vérifications finales..."
sleep 5

# Vérification des services
systemctl status nginx --no-pager
systemctl status postgresql --no-pager

# Test de l'application
curl -I http://localhost:5000 || error "L'application ne répond pas sur le port 5000"

echo ""
echo "🎉 DÉPLOIEMENT TERMINÉ AVEC SUCCÈS !"
echo "===================================="
echo ""
echo "📍 Votre application Tomati est maintenant accessible sur :"
echo "   HTTP:  http://$DOMAIN"
echo "   HTTPS: https://$DOMAIN (si SSL configuré)"
echo ""
echo "🔧 Commandes utiles :"
echo "   Monitoring:    sudo su - $APP_USER -c './monitor.sh'"
echo "   Déploiement:   sudo su - $APP_USER -c './deploy.sh'"
echo "   Logs PM2:      sudo su - $APP_USER -c 'pm2 logs tomati-production'"
echo "   Redémarrage:   sudo su - $APP_USER -c 'pm2 restart tomati-production'"
echo ""
echo "✅ Tous les services sont opérationnels !"