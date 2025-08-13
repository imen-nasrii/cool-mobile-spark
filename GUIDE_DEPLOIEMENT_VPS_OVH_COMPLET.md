# Guide Complet de Déploiement - Application Tomati sur VPS OVH

## 📋 Prérequis
- VPS OVH avec Ubuntu 22.04 LTS
- Accès SSH root
- Nom de domaine pointé vers votre VPS (optionnel pour HTTPS)

## 🚀 Étapes de Déploiement

### Étape 1: Connexion et Préparation du VPS

```bash
# Connexion SSH (remplacez IP_VPS par votre IP)
ssh root@IP_VPS

# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Installation des outils de base
sudo apt install curl git ufw build-essential -y
```

### Étape 2: Installation de Node.js via NVM

```bash
# Installation de NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Rechargement du profil
source ~/.bashrc

# Installation de Node.js LTS
nvm install --lts
nvm use --lts

# Vérification des versions
node -v
npm -v
```

### Étape 3: Installation et Configuration de PostgreSQL

```bash
# Installation de PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Démarrage et activation du service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Configuration de PostgreSQL
sudo -u postgres psql

# Dans le terminal PostgreSQL, exécutez :
CREATE DATABASE tomati_db;
CREATE USER tomati_user WITH ENCRYPTED PASSWORD 'tomati_password_2024!';
GRANT ALL PRIVILEGES ON DATABASE tomati_db TO tomati_user;
ALTER USER tomati_user CREATEDB;
\q
```

### Étape 4: Création de l'Utilisateur Système

```bash
# Création d'un utilisateur non-root pour sécurité
sudo adduser tomati

# Ajout aux groupes nécessaires
sudo usermod -aG sudo tomati

# Passage à l'utilisateur tomati
sudo su - tomati
```

### Étape 5: Clone et Configuration du Projet

```bash
# Clone du repository
git clone https://github.com/imen-nasrii/cool-mobile-spark.git
cd cool-mobile-spark

# Installation des dépendances
npm install

# Création du fichier .env
cat > .env << 'EOF'
# Database Configuration
DATABASE_URL=postgresql://tomati_user:tomati_password_2024!@localhost:5432/tomati_db
PGDATABASE=tomati_db
PGHOST=localhost
PGPORT=5432
PGUSER=tomati_user
PGPASSWORD=tomati_password_2024!

# JWT Configuration
JWT_SECRET=tomati_super_secret_jwt_key_2024_production

# Server Configuration
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# Session Configuration
SESSION_SECRET=tomati_session_secret_key_2024_production

# Replit Configuration (pour compatibilité)
REPL_ID=tomati-production
REPLIT_DOMAINS=votre-domaine.com

# Security
ISSUER_URL=https://replit.com/oidc
EOF

# Configuration des permissions
chmod 600 .env
```

### Étape 6: Migration de la Base de Données

```bash
# Push du schéma vers la base de données
npm run db:push

# Vérification que les tables sont créées
sudo -u postgres psql -d tomati_db -c "\dt"
```

### Étape 7: Build et Test de l'Application

```bash
# Build du frontend
npm run build

# Test rapide de l'application
npm start &
sleep 5
curl http://localhost:5000
kill %1
```

### Étape 8: Installation et Configuration de PM2

```bash
# Installation globale de PM2
npm install -g pm2

# Création du fichier ecosystem PM2
cat > ecosystem.config.cjs << 'EOF'
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
EOF

# Création du dossier logs
mkdir -p logs

# Démarrage avec PM2
pm2 start ecosystem.config.cjs

# Sauvegarde de la configuration PM2
pm2 save

# Configuration du démarrage automatique
pm2 startup
# Copiez et exécutez la commande générée par PM2
```

### Étape 9: Installation et Configuration de Nginx

```bash
# Retour en root pour installer Nginx
exit
sudo apt install nginx -y

# Création de la configuration Nginx
sudo cat > /etc/nginx/sites-available/tomati << 'EOF'
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;

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
EOF

# Activation de la configuration
sudo ln -s /etc/nginx/sites-available/tomati /etc/nginx/sites-enabled/

# Suppression de la configuration par défaut
sudo rm /etc/nginx/sites-enabled/default

# Test de la configuration Nginx
sudo nginx -t

# Redémarrage de Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### Étape 10: Configuration du Pare-feu

```bash
# Configuration UFW
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw allow 5432/tcp  # PostgreSQL (si accès externe nécessaire)
sudo ufw --force enable

# Vérification du statut
sudo ufw status
```

### Étape 11: Installation HTTPS avec Certbot (Optionnel)

```bash
# Installation de Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtention du certificat SSL (remplacez par votre domaine)
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com

# Test du renouvellement automatique
sudo certbot renew --dry-run
```

### Étape 12: Scripts de Maintenance

```bash
# Création d'un script de déploiement
sudo cat > /home/tomati/deploy.sh << 'EOF'
#!/bin/bash
echo "🚀 Déploiement Tomati..."

cd /home/tomati/cool-mobile-spark

# Backup de la base de données
sudo -u postgres pg_dump tomati_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Pull des dernières modifications
git pull origin main

# Installation des dépendances
npm install

# Migration de la base de données
npm run db:push

# Build du frontend
npm run build

# Redémarrage de l'application
pm2 restart tomati-production

echo "✅ Déploiement terminé !"
EOF

# Permissions d'exécution
chmod +x /home/tomati/deploy.sh

# Script de monitoring
sudo cat > /home/tomati/monitor.sh << 'EOF'
#!/bin/bash
echo "📊 Status de Tomati:"
echo "==================="

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
EOF

chmod +x /home/tomati/monitor.sh
```

### Étape 13: Vérifications Finales

```bash
# Vérification des services
sudo systemctl status nginx
sudo systemctl status postgresql
sudo su - tomati -c "pm2 status"

# Test de l'application
curl -I http://localhost
curl -I http://votre-domaine.com  # Si domaine configuré

# Vérification des logs
sudo su - tomati -c "pm2 logs tomati-production --lines 20"
```

## 🔧 Commandes de Maintenance

### Mise à jour de l'application
```bash
sudo su - tomati
cd cool-mobile-spark
./deploy.sh
```

### Monitoring
```bash
sudo su - tomati
./monitor.sh
```

### Redémarrage des services
```bash
# Redémarrage de l'application
sudo su - tomati -c "pm2 restart tomati-production"

# Redémarrage de Nginx
sudo systemctl restart nginx

# Redémarrage de PostgreSQL
sudo systemctl restart postgresql
```

### Sauvegarde de la base de données
```bash
sudo -u postgres pg_dump tomati_db > backup_tomati_$(date +%Y%m%d).sql
```

## 🚨 Dépannage

### Si l'application ne démarre pas :
```bash
# Vérifier les logs PM2
sudo su - tomati -c "pm2 logs tomati-production"

# Vérifier la configuration
sudo su - tomati -c "cd cool-mobile-spark && cat .env"
```

### Si Nginx retourne une erreur :
```bash
# Vérifier la configuration
sudo nginx -t

# Vérifier les logs
sudo tail -f /var/log/nginx/error.log
```

### Si la base de données ne se connecte pas :
```bash
# Test de connexion
sudo -u postgres psql -d tomati_db -c "SELECT version();"

# Vérifier les permissions
sudo -u postgres psql -c "\du"
```

## ✅ Points de Contrôle

Après le déploiement, vérifiez que :

1. ✅ L'application répond sur http://votre-domaine.com
2. ✅ Les WebSockets fonctionnent (messagerie en temps réel)
3. ✅ Les uploads de fichiers fonctionnent
4. ✅ La base de données stocke les données
5. ✅ PM2 redémarre automatiquement l'app en cas de crash
6. ✅ HTTPS fonctionne (si configuré)
7. ✅ Les logs sont générés correctement

## 📞 Support

En cas de problème, vérifiez les logs dans cet ordre :
1. PM2 : `pm2 logs tomati-production`
2. Nginx : `sudo tail -f /var/log/nginx/error.log`
3. PostgreSQL : `sudo tail -f /var/log/postgresql/postgresql-*.log`

---

**🎉 Votre application Tomati est maintenant déployée en production sur votre VPS OVH !**