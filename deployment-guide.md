# Guide de Déploiement VPS Hostinger - Tomati E-commerce

## 🚀 Configuration VPS Hostinger

### 1. Prérequis sur le VPS
```bash
# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Installation Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installation PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Installation PM2 pour la gestion des processus
sudo npm install -g pm2

# Installation Nginx pour le reverse proxy
sudo apt install nginx -y
```

### 2. Configuration PostgreSQL
```bash
# Connexion PostgreSQL
sudo -u postgres psql

# Création base de données et utilisateur
CREATE DATABASE tomati_db;
CREATE USER tomati_user WITH ENCRYPTED PASSWORD 'votre_mot_de_passe_securise';
GRANT ALL PRIVILEGES ON DATABASE tomati_db TO tomati_user;
GRANT ALL ON SCHEMA public TO tomati_user;
\q
```

### 3. Variables d'environnement (.env)
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://tomati_user:votre_mot_de_passe_securise@localhost:5432/tomati_db
JWT_SECRET=votre_jwt_secret_tres_securise_min_32_caracteres
PGUSER=tomati_user
PGPASSWORD=votre_mot_de_passe_securise
PGDATABASE=tomati_db
PGHOST=localhost
PGPORT=5432
```

### 4. Structure de déploiement
```
/var/www/tomati/
├── server/          # Backend Express
├── client/          # Frontend React (build)
├── shared/          # Schemas partagés
├── migrations/      # Migrations DB
├── package.json
├── .env
└── ecosystem.config.js  # Configuration PM2
```

## 📦 Processus de Déploiement

### 1. Préparation du code
```bash
# Build frontend
npm run build

# Test de la base de données
npm run db:push
```

### 2. Transfer sur VPS
```bash
# Via SCP ou SFTP
scp -r . user@votre-vps-ip:/var/www/tomati/
```

### 3. Installation sur VPS
```bash
cd /var/www/tomati
npm install --production
npm run db:push
```

### 4. Configuration PM2
```bash
# Démarrage avec PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 5. Configuration Nginx
```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    # Frontend statique
    location / {
        root /var/www/tomati/dist;
        try_files $uri $uri/ /index.html;
        expires 1d;
        add_header Cache-Control "public, immutable";
    }

    # API Backend
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket pour messagerie temps réel
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
}
```

## 🔐 Sécurité Production

### 1. Firewall
```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 2. SSL avec Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.com
```

### 3. Sauvegardes automatiques
```bash
# Script de sauvegarde DB
#!/bin/bash
pg_dump -U tomati_user -h localhost tomati_db > /backup/tomati_$(date +%Y%m%d_%H%M%S).sql
```

## 📊 Monitoring

### 1. Logs
```bash
# Logs PM2
pm2 logs

# Logs Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 2. Performance
```bash
# Monitoring PM2
pm2 monit

# Status système
htop
df -h
```

## 🛠️ Maintenance

### 1. Mise à jour application
```bash
cd /var/www/tomati
git pull origin main
npm install
npm run build
npm run db:push
pm2 restart all
```

### 2. Maintenance base de données
```bash
# Vacuum PostgreSQL
sudo -u postgres psql -d tomati_db -c "VACUUM ANALYZE;"

# Index optimization
sudo -u postgres psql -d tomati_db -c "REINDEX DATABASE tomati_db;"
```

## ✅ Check-list Déploiement

- [ ] VPS configuré avec Node.js 20
- [ ] PostgreSQL installé et configuré
- [ ] Base de données créée avec utilisateur dédié
- [ ] Variables d'environnement configurées
- [ ] Code transféré et dépendances installées
- [ ] Migrations DB exécutées
- [ ] PM2 configuré et démarré
- [ ] Nginx configuré avec proxy
- [ ] Firewall configuré
- [ ] SSL configuré
- [ ] Sauvegardes configurées
- [ ] Monitoring actif

Cette configuration garantit une application robuste, sécurisée et scalable sur votre VPS Hostinger.