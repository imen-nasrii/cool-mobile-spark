#!/bin/bash

# Script de déploiement automatique Tomati Market sur VPS OVH
# Utilisation: bash SCRIPT_DEPLOIEMENT_AUTOMATIQUE.sh

echo "🚀 Début du déploiement automatique Tomati Market"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
print_step() {
    echo -e "${GREEN}[ÉTAPE]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[ATTENTION]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERREUR]${NC} $1"
}

# Vérification des prérequis
if [[ $EUID -eq 0 ]]; then
   print_error "Ce script ne doit pas être exécuté en tant que root"
   exit 1
fi

# Variables de configuration
DB_PASSWORD="TomatiSecure2024!"
JWT_SECRET="tomati_jwt_secret_very_long_and_secure_key_123456789"
APP_DIR="/home/tomati/tomatimarket"

print_step "Mise à jour du système"
sudo apt update && sudo apt upgrade -y
sudo apt install curl git ufw nano htop -y

print_step "Installation Node.js via NVM"
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
nvm install --lts
nvm use --lts

print_step "Installation PostgreSQL"
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql

print_step "Configuration base de données"
sudo -u postgres psql -c "CREATE DATABASE tomati_db;"
sudo -u postgres psql -c "CREATE USER tomati_user WITH ENCRYPTED PASSWORD '$DB_PASSWORD';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE tomati_db TO tomati_user;"
sudo -u postgres psql -c "ALTER USER tomati_user CREATEDB;"

print_step "Clonage du repository Tomati"
if [ -d "$APP_DIR" ]; then
    print_warning "Le dossier $APP_DIR existe déjà. Mise à jour..."
    cd $APP_DIR
    git pull origin main
else
    git clone https://github.com/imen-nasrii/cool-mobile-spark.git $APP_DIR
    cd $APP_DIR
fi

print_step "Installation des dépendances Node.js"
npm install

print_step "Création du fichier .env"
cat > .env << EOF
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://tomati_user:$DB_PASSWORD@localhost:5432/tomati_db
JWT_SECRET=$JWT_SECRET
BCRYPT_ROUNDS=12
EOF

print_step "Préparation de la base de données"
npm run db:push

print_step "Build de l'application"
npm run build

print_step "Installation PM2"
npm install -g pm2

print_step "Création dossier logs"
mkdir -p /home/tomati/logs

print_step "Configuration PM2"
cat > ecosystem.config.cjs << EOF
module.exports = {
  apps: [{
    name: 'tomati-production',
    script: 'npm',
    args: 'start',
    cwd: '$APP_DIR',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '1G',
    error_file: '/home/tomati/logs/tomati-error.log',
    out_file: '/home/tomati/logs/tomati-out.log',
    log_file: '/home/tomati/logs/tomati-combined.log',
    time: true
  }]
};
EOF

print_step "Démarrage de l'application avec PM2"
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup

print_step "Installation Nginx"
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx

print_step "Configuration Nginx"
sudo tee /etc/nginx/sites-available/tomati > /dev/null << EOF
server {
    listen 80;
    server_name _;

    # Gestion des assets statiques
    location /assets/ {
        root $APP_DIR/dist;
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }

    # Proxy vers l'application Node.js
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

    # WebSocket support
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
}
EOF

sudo ln -sf /etc/nginx/sites-available/tomati /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

print_step "Configuration pare-feu"
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

print_step "Création des scripts de maintenance"
cat > /home/tomati/update-tomati.sh << EOF
#!/bin/bash
cd $APP_DIR
git pull origin main
npm install
npm run build
npm run db:push
pm2 restart tomati-production
pm2 save
echo "Mise à jour terminée !"
EOF

chmod +x /home/tomati/update-tomati.sh

cat > /home/tomati/backup-db.sh << EOF
#!/bin/bash
DATE=\$(date +%Y%m%d_%H%M%S)
mkdir -p /home/tomati/backups
pg_dump -h localhost -U tomati_user tomati_db > /home/tomati/backups/tomati_db_\$DATE.sql
find /home/tomati/backups/ -name "tomati_db_*.sql" -type f -mtime +7 -delete
EOF

chmod +x /home/tomati/backup-db.sh

# Ajouter sauvegarde quotidienne à 2h du matin
(crontab -l 2>/dev/null; echo "0 2 * * * /home/tomati/backup-db.sh") | crontab -

print_step "Tests finaux"
sleep 5

# Tester les services
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓ Nginx est actif${NC}"
else
    print_error "Nginx n'est pas actif"
fi

if systemctl is-active --quiet postgresql; then
    echo -e "${GREEN}✓ PostgreSQL est actif${NC}"
else
    print_error "PostgreSQL n'est pas actif"
fi

if pm2 list | grep -q "tomati-production.*online"; then
    echo -e "${GREEN}✓ Application Tomati est en ligne${NC}"
else
    print_error "Application Tomati n'est pas en ligne"
fi

# Test HTTP
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5000 | grep -q "200"; then
    echo -e "${GREEN}✓ Application répond correctement${NC}"
else
    print_warning "Application ne répond pas correctement"
fi

print_step "Informations de connexion"
echo -e "${GREEN}🎉 Déploiement terminé !${NC}"
echo ""
echo "📋 Informations importantes :"
echo "• Application accessible : http://$(curl -s ifconfig.me)"
echo "• Base de données : tomati_db"
echo "• Utilisateur DB : tomati_user"
echo "• Mot de passe DB : $DB_PASSWORD"
echo "• Dossier application : $APP_DIR"
echo ""
echo "🔧 Commandes utiles :"
echo "• Voir les logs : pm2 logs tomati-production"
echo "• Redémarrer app : pm2 restart tomati-production"
echo "• Statut services : pm2 status"
echo "• Mise à jour : bash /home/tomati/update-tomati.sh"
echo "• Sauvegarde DB : bash /home/tomati/backup-db.sh"
echo ""
echo "🌐 Fonctionnalités disponibles :"
echo "• Page d'accueil : http://$(curl -s ifconfig.me)/"
echo "• API produits : http://$(curl -s ifconfig.me)/api/products"
echo "• Messagerie : http://$(curl -s ifconfig.me)/messages"
echo "• Admin : http://$(curl -s ifconfig.me)/admin"
echo ""
echo "🔒 Pour HTTPS, configurer un domaine puis :"
echo "• sudo certbot --nginx -d votre-domaine.com"

print_step "Script de déploiement terminé avec succès !"