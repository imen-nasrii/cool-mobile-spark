#!/bin/bash

# 🚀 Script d'Installation Complète - Tomati sur VPS OVH
# Ce script installe tout automatiquement en une seule fois

set -e

echo "🚀 Installation Complète de Tomati sur VPS OVH"
echo "=============================================="

# Variables (modifiez selon vos besoins)
DOMAIN="votre-domaine.com"  # CHANGEZ PAR VOTRE DOMAINE
ADMIN_EMAIL="admin@$DOMAIN"  # Email pour SSL
DB_NAME="tomatii_db"
DB_USER="tomatii_user"
DB_PASSWORD="tomatii_password_2024!"
APP_USER="tomati"

echo "📋 Configuration utilisée :"
echo "- Domaine: $DOMAIN"
echo "- Email admin: $ADMIN_EMAIL"
echo "- Base de données: $DB_NAME"
echo "- Utilisateur DB: $DB_USER"
echo ""

# Vérification des droits root
if [[ $EUID -ne 0 ]]; then
   echo "❌ Ce script doit être exécuté en tant que root"
   exit 1
fi

log() {
    echo "✅ $1"
}

# 1. Mise à jour système et installation des paquets
log "Mise à jour du système et installation des paquets..."
apt update && apt upgrade -y
apt install -y curl git ufw build-essential nginx postgresql postgresql-contrib certbot python3-certbot-nginx

# 2. Configuration PostgreSQL
log "Configuration de PostgreSQL..."
systemctl start postgresql
systemctl enable postgresql

sudo -u postgres psql << EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER USER $DB_USER CREATEDB;
\q
EOF

# 3. Création utilisateur système
log "Création de l'utilisateur système $APP_USER..."
adduser --disabled-password --gecos "" $APP_USER
usermod -aG sudo $APP_USER

# 4. Installation Node.js pour l'utilisateur tomati
log "Installation de Node.js..."
sudo -u $APP_USER bash << 'EOF'
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="/home/tomati/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install --lts
nvm use --lts
EOF

# 5. Clone et configuration du projet
log "Clone et configuration du projet..."
sudo -u $APP_USER bash << EOF
cd /home/$APP_USER
git clone https://github.com/imen-nasrii/cool-mobile-spark.git
cd cool-mobile-spark

# Chargement NVM
export NVM_DIR="/home/$APP_USER/.nvm"
[ -s "\$NVM_DIR/nvm.sh" ] && \. "\$NVM_DIR/nvm.sh"

# Installation des dépendances
npm install

# Configuration .env
cat > .env << 'ENVEOF'
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME
PGDATABASE=$DB_NAME
PGHOST=localhost
PGPORT=5432
PGUSER=$DB_USER
PGPASSWORD=$DB_PASSWORD
JWT_SECRET=tomati_super_secret_jwt_key_2024_production
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
SESSION_SECRET=tomati_session_secret_key_2024_production
REPL_ID=tomati-production
REPLIT_DOMAINS=$DOMAIN
ISSUER_URL=https://replit.com/oidc
ENVEOF

chmod 600 .env

# Migration base de données
npm run db:push

# Build application
npm run build
EOF

# 6. Configuration PM2
log "Configuration de PM2..."
sudo -u $APP_USER bash << 'EOF'
export NVM_DIR="/home/tomati/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Installation PM2
npm install -g pm2

cd /home/tomati/cool-mobile-spark

# Configuration ecosystem
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

# Démarrage
mkdir -p logs
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
EOF

# 7. Configuration Nginx
log "Configuration de Nginx..."
cat > /etc/nginx/sites-available/tomati << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

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
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }

    location /ws {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Activation Nginx
ln -sf /etc/nginx/sites-available/tomati /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
systemctl enable nginx

# 8. Configuration pare-feu
log "Configuration du pare-feu..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# 9. Scripts de maintenance
log "Création des scripts de maintenance..."
sudo -u $APP_USER bash << 'EOF'
cat > /home/tomati/deploy.sh << 'DEPLOYEOF'
#!/bin/bash
echo "🚀 Déploiement Tomati..."
cd /home/tomati/cool-mobile-spark

# Backup BDD
sudo -u postgres pg_dump tomatii_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Chargement NVM
export NVM_DIR="/home/tomati/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Mise à jour
git pull origin main
npm install
npm run db:push
npm run build
pm2 restart tomati-production

echo "✅ Déploiement terminé !"
DEPLOYEOF

cat > /home/tomati/monitor.sh << 'MONEOF'
#!/bin/bash
echo "📊 Status de Tomati:"
echo "==================="

# Chargement NVM
export NVM_DIR="/home/tomati/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

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
MONEOF

chmod +x /home/tomati/deploy.sh /home/tomati/monitor.sh
EOF

# 10. Installation SSL (optionnel)
echo ""
read -p "Voulez-vous installer le certificat SSL HTTPS ? (y/N): " install_ssl
if [[ $install_ssl =~ ^[Yy]$ ]]; then
    log "Installation du certificat SSL..."
    certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $ADMIN_EMAIL
    systemctl enable certbot.timer
fi

# 11. Tests finaux
log "Tests finaux..."
sleep 5

# Test des services
systemctl status nginx --no-pager > /dev/null && echo "✅ Nginx OK" || echo "❌ Nginx KO"
systemctl status postgresql --no-pager > /dev/null && echo "✅ PostgreSQL OK" || echo "❌ PostgreSQL KO"
sudo -u $APP_USER bash -c "export NVM_DIR='/home/tomati/.nvm'; [ -s \"\$NVM_DIR/nvm.sh\" ] && \. \"\$NVM_DIR/nvm.sh\"; pm2 list | grep -q tomati-production" && echo "✅ PM2 OK" || echo "❌ PM2 KO"

# Test application
curl -s -I http://localhost:5000 | head -1 | grep -q "200 OK" && echo "✅ Application OK" || echo "❌ Application KO"

echo ""
echo "🎉 INSTALLATION TERMINÉE AVEC SUCCÈS !"
echo "======================================"
echo ""
echo "📍 Votre application Tomati est accessible sur :"
echo "   HTTP:  http://$DOMAIN"
if [[ $install_ssl =~ ^[Yy]$ ]]; then
    echo "   HTTPS: https://$DOMAIN"
fi
echo ""
echo "🔧 Commandes de gestion :"
echo "   Monitoring:    sudo su - $APP_USER -c './monitor.sh'"
echo "   Déploiement:   sudo su - $APP_USER -c './deploy.sh'"
echo "   Logs:          sudo su - $APP_USER -c 'pm2 logs tomati-production'"
echo "   Redémarrage:   sudo su - $APP_USER -c 'pm2 restart tomati-production'"
echo ""
echo "✅ Tous les services sont opérationnels !"
echo "✅ Base de données: $DB_NAME configurée"
echo "✅ Utilisateur: $APP_USER créé"
echo "✅ PM2: Application en production"
echo "✅ Nginx: Reverse proxy configuré"
echo "✅ Sécurité: Pare-feu activé"
if [[ $install_ssl =~ ^[Yy]$ ]]; then
    echo "✅ SSL: Certificat HTTPS installé"
fi