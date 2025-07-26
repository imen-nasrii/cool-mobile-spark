#!/bin/bash

# Script de déploiement automatisé pour VPS OVH
# Usage: ./deploy-ovh.sh [IP_VPS] [DOMAIN]

set -e

VPS_IP=${1:-"213.186.33.5"}
DOMAIN=${2:-"tomati.org"}
APP_USER="tomati"
APP_DIR="/home/$APP_USER/tomati-market"

echo "🚀 Déploiement de Tomati Market sur VPS OVH"
echo "IP: $VPS_IP"
echo "Domaine: $DOMAIN"
echo ""

# Fonction pour exécuter des commandes sur le serveur distant
remote_exec() {
    ssh root@$VPS_IP "$1"
}

# Fonction pour copier des fichiers vers le serveur
copy_to_server() {
    scp -r "$1" root@$VPS_IP:"$2"
}

echo "📦 Étape 1: Mise à jour du système..."
remote_exec "apt update && apt upgrade -y"

echo "🔧 Étape 2: Installation des dépendances système..."
remote_exec "apt install -y curl wget git vim htop ufw nginx postgresql postgresql-contrib"

echo "📱 Étape 3: Installation de Node.js 20..."
remote_exec "curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && apt install -y nodejs"

echo "🗄️ Étape 4: Configuration de PostgreSQL..."
remote_exec "systemctl start postgresql && systemctl enable postgresql"

echo "👤 Étape 5: Création de l'utilisateur application..."
remote_exec "adduser --disabled-password --gecos '' $APP_USER || true"
remote_exec "usermod -aG sudo $APP_USER"

echo "📁 Étape 6: Préparation du répertoire application..."
remote_exec "mkdir -p $APP_DIR && chown -R $APP_USER:$APP_USER /home/$APP_USER"

echo "🔒 Étape 7: Configuration du firewall..."
remote_exec "ufw allow ssh && ufw allow 80 && ufw allow 443 && echo 'y' | ufw enable"

echo "🔐 Étape 8: Installation de Certbot..."
remote_exec "apt install -y certbot python3-certbot-nginx"

echo "⚙️ Étape 9: Installation de PM2..."
remote_exec "npm install -g pm2"

echo "📄 Étape 10: Création des fichiers de configuration..."

# Configuration Nginx
cat > /tmp/nginx-tomati.conf << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

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
}
EOF

copy_to_server "/tmp/nginx-tomati.conf" "/etc/nginx/sites-available/$DOMAIN"
remote_exec "ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/"
remote_exec "nginx -t && systemctl reload nginx"

# Script de backup
cat > /tmp/backup-tomati.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/tomati/backups"
DB_NAME="tomati_production"
DB_USER="tomati_user"

mkdir -p $BACKUP_DIR

# Backup de la base de données
PGPASSWORD="$DB_PASSWORD" pg_dump -U $DB_USER -h localhost $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Backup du code
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz ~/tomati-market

# Garder seulement les 7 derniers backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

copy_to_server "/tmp/backup-tomati.sh" "/home/$APP_USER/backup.sh"
remote_exec "chmod +x /home/$APP_USER/backup.sh && chown $APP_USER:$APP_USER /home/$APP_USER/backup.sh"

echo "✅ Configuration terminée!"
echo ""
echo "🔑 Prochaines étapes manuelles:"
echo "1. Connectez-vous au serveur: ssh root@$VPS_IP"
echo "2. Configurez PostgreSQL:"
echo "   sudo -u postgres psql"
echo "   CREATE DATABASE tomati_production;"
echo "   CREATE USER tomati_user WITH ENCRYPTED PASSWORD 'votre_mot_de_passe';"
echo "   GRANT ALL PRIVILEGES ON DATABASE tomati_production TO tomati_user;"
echo "   \\q"
echo ""
echo "3. Transférez votre code et configurez l'application:"
echo "   su - $APP_USER"
echo "   git clone https://github.com/votre-repo/tomati-market.git"
echo "   cd tomati-market"
echo "   npm install && npm run build"
echo ""
echo "4. Créez le fichier .env avec vos variables"
echo "5. Lancez l'application: pm2 start ecosystem.config.js --env production"
echo "6. Obtenez le certificat SSL: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo ""
echo "🎉 Votre serveur est prêt pour le déploiement!"