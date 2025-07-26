# Guide de Déploiement - Tomati Market sur VPS OVH

## Prérequis
- VPS OVH avec Ubuntu 20.04/22.04
- Accès SSH au serveur
- Nom de domaine pointant vers l'IP du VPS
- Base de données PostgreSQL configurée

## 1. Configuration du Serveur

### Connexion SSH
```bash
ssh root@votre-ip-vps
```

### Mise à jour du système
```bash
apt update && apt upgrade -y
```

### Installation de Node.js 20
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt-get install -y nodejs
node --version  # Vérifier la version
```

### Installation de PostgreSQL
```bash
apt install postgresql postgresql-contrib -y
systemctl start postgresql
systemctl enable postgresql

# Créer utilisateur et base de données
sudo -u postgres psql
CREATE DATABASE tomati_market;
CREATE USER tomati_user WITH PASSWORD 'votre_mot_de_passe_securise';
GRANT ALL PRIVILEGES ON DATABASE tomati_market TO tomati_user;
\q
```

### Installation de PM2 (gestionnaire de processus)
```bash
npm install -g pm2
```

### Installation de Nginx
```bash
apt install nginx -y
systemctl start nginx
systemctl enable nginx
```

## 2. Configuration de l'Application

### Cloner le projet
```bash
cd /var/www
git clone https://github.com/votre-repo/tomati-market.git
cd tomati-market
```

### Installer les dépendances
```bash
npm install
```

### Configuration des variables d'environnement
```bash
nano .env.production
```

Contenu du fichier `.env.production` :
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://tomati_user:votre_mot_de_passe_securise@localhost:5432/tomati_market
JWT_SECRET=votre_jwt_secret_tres_long_et_securise
BCRYPT_ROUNDS=12
SESSION_SECRET=votre_session_secret_securise
```

### Build de production
```bash
npm run build
```

### Migration de la base de données
```bash
npm run db:push
```

## 3. Configuration PM2

### Créer le fichier ecosystem
```bash
nano ecosystem.config.js
```

Contenu :
```javascript
module.exports = {
  apps: [{
    name: 'tomati-market',
    script: 'server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/tomati-error.log',
    out_file: '/var/log/pm2/tomati-out.log',
    log_file: '/var/log/pm2/tomati-combined.log',
    time: true
  }]
}
```

### Démarrer l'application
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

## 4. Configuration Nginx

### Créer la configuration du site
```bash
nano /etc/nginx/sites-available/tomati-market
```

Contenu :
```nginx
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Static files
    location /assets {
        alias /var/www/tomati-market/dist/assets;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Main application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support for messaging
    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

### Activer le site
```bash
ln -s /etc/nginx/sites-available/tomati-market /etc/nginx/sites-enabled/
nginx -t  # Tester la configuration
systemctl reload nginx
```

## 5. SSL avec Let's Encrypt

### Installation de Certbot
```bash
apt install certbot python3-certbot-nginx -y
```

### Obtenir le certificat SSL
```bash
certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
```

## 6. Configuration du Pare-feu

```bash
ufw allow ssh
ufw allow 'Nginx Full'
ufw enable
```

## 7. Scripts de Maintenance

### Script de backup
```bash
nano /home/backup-tomati.sh
```

Contenu :
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump tomati_market > /home/backups/tomati_$DATE.sql
find /home/backups -name "tomati_*.sql" -mtime +7 -delete
```

### Rendre exécutable et ajouter au cron
```bash
chmod +x /home/backup-tomati.sh
crontab -e
# Ajouter : 0 2 * * * /home/backup-tomati.sh
```

## 8. Monitoring et Logs

### Voir les logs de l'application
```bash
pm2 logs tomati-market
```

### Redémarrer l'application
```bash
pm2 restart tomati-market
```

### Status de l'application
```bash
pm2 status
```

## 9. Mise à jour de l'Application

Script de déploiement automatique :
```bash
nano /home/deploy-tomati.sh
```

Contenu :
```bash
#!/bin/bash
cd /var/www/tomati-market
git pull origin main
npm install
npm run build
npm run db:push
pm2 restart tomati-market
```

## 10. Vérifications Post-Déploiement

1. **Vérifier que l'application fonctionne** : `curl http://localhost:3000`
2. **Tester le domaine** : Ouvrir `https://votre-domaine.com`
3. **Vérifier les logs** : `pm2 logs tomati-market`
4. **Tester les fonctionnalités** : Inscription, connexion, création de produits
5. **Vérifier la base de données** : Se connecter et vérifier les tables

## Dépannage Courant

### L'application ne démarre pas
```bash
pm2 logs tomati-market  # Voir les erreurs
pm2 restart tomati-market
```

### Problème de base de données
```bash
sudo -u postgres psql -c "SELECT version();"  # Vérifier PostgreSQL
```

### Problème Nginx
```bash
nginx -t  # Tester la configuration
systemctl status nginx
```

## Sécurité Supplémentaire

1. **Désactiver l'accès root SSH** après avoir créé un utilisateur
2. **Configurer fail2ban** pour protéger contre les attaques par force brute
3. **Mettre à jour régulièrement** le système et les dépendances
4. **Sauvegarder régulièrement** la base de données et les fichiers

Votre application Tomati Market est maintenant déployée et sécurisée sur votre VPS OVH !