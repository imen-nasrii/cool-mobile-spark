# 🏗️ Guide Hébergement Manuel - OVH VPS 51.222.111.183

## 📋 Situation Actuelle
- **VPS OVH** : 51.222.111.183 (vps-8dfc48b5)
- **Utilisateur** : tomati
- **Répertoire** : /home/tomati/tomati-market ✅
- **Code** : Mis à jour depuis GitHub ✅

---

## 🔧 ÉTAPE 1: Arrêter l'Application Actuelle

```bash
# Arrêter PM2
pm2 stop tomati-production
pm2 delete tomati-production

# Vérifier qu'elle est arrêtée
pm2 status
```

---

## 🗄️ ÉTAPE 2: Configuration Base de Données

### Vérifier PostgreSQL
```bash
sudo systemctl status postgresql
```

### Créer/Vérifier la base de données
```bash
sudo -u postgres psql
```

Dans PostgreSQL :
```sql
-- Supprimer si existe
DROP DATABASE IF EXISTS tomati_db;
DROP USER IF EXISTS tomati;

-- Créer utilisateur
CREATE USER tomati WITH PASSWORD 'tomati123';
ALTER USER tomati CREATEDB;
ALTER USER tomati WITH SUPERUSER;

-- Créer base de données
CREATE DATABASE tomati_db OWNER tomati;
GRANT ALL PRIVILEGES ON DATABASE tomati_db TO tomati;

-- Vérifier
\l
\q
```

### Tester la connexion
```bash
psql -h localhost -U tomati -d tomati_db -c "SELECT version();"
```

---

## 📝 ÉTAPE 3: Configuration Environnement

### Créer le fichier .env
```bash
cd /home/tomati/tomati-market
nano .env
```

### Contenu du fichier .env :
```env
# Configuration OVH VPS - Production
DATABASE_URL=postgresql://tomati:tomati123@localhost:5432/tomati_db
PGUSER=tomati
PGPASSWORD=tomati123
PGDATABASE=tomati_db
PGHOST=localhost
PGPORT=5432

# Application
NODE_ENV=production
PORT=5000
JWT_SECRET=tomati-ovh-jwt-secret-2025
SESSION_SECRET=tomati-ovh-session-secret-2025

# OVH Configuration
OVH_VPS=true
PUBLIC_IP=51.222.111.183
```

### Sauvegarder et fermer
- Appuyer `Ctrl + X`
- Appuyer `Y` pour confirmer
- Appuyer `Entrée`

---

## 📦 ÉTAPE 4: Installation Dépendances

### Nettoyer ancien build
```bash
rm -rf node_modules
rm -f package-lock.json
```

### Installer les dépendances
```bash
npm install
```

### Vérifier l'installation
```bash
npm list --depth=0
```

---

## 🏗️ ÉTAPE 5: Build Production

### Compiler l'application
```bash
npm run build
```

### Vérifier le build
```bash
ls -la dist/
```

---

## 🗄️ ÉTAPE 6: Migration Base de Données

### Appliquer les migrations
```bash
npm run db:push
```

### Vérifier les tables
```bash
psql -h localhost -U tomati -d tomati_db -c "\dt"
```

---

## ⚙️ ÉTAPE 7: Configuration PM2

### Créer le fichier de configuration
```bash
nano ecosystem.config.cjs
```

### Contenu du fichier :
```javascript
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
      PORT: 5000,
      OVH_VPS: 'true',
      PUBLIC_IP: '51.222.111.183'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    watch: false,
    max_memory_restart: '1G',
    restart_delay: 4000,
    min_uptime: '10s',
    max_restarts: 10
  }]
};
```

### Créer dossier logs
```bash
mkdir -p logs
```

---

## 🚀 ÉTAPE 8: Démarrage Application

### Démarrer avec PM2
```bash
pm2 start ecosystem.config.cjs
```

### Vérifier le statut
```bash
pm2 status
```

### Voir les logs
```bash
pm2 logs tomati-production --lines 10
```

---

## 🌐 ÉTAPE 9: Configuration Nginx

### Créer la configuration Nginx
```bash
sudo nano /etc/nginx/sites-available/tomati
```

### Contenu du fichier Nginx :
```nginx
server {
    listen 80;
    server_name 51.222.111.183 _;
    client_max_body_size 50M;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

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

    access_log /var/log/nginx/tomati.access.log;
    error_log /var/log/nginx/tomati.error.log;
}
```

### Activer le site
```bash
sudo ln -sf /etc/nginx/sites-available/tomati /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
```

### Tester la configuration
```bash
sudo nginx -t
```

### Redémarrer Nginx
```bash
sudo systemctl restart nginx
```

---

## 🔒 ÉTAPE 10: Configuration Firewall

### Configurer UFW
```bash
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status
```

---

## ✅ ÉTAPE 11: Tests et Vérifications

### Test local
```bash
curl http://localhost:5000
```

### Test public
```bash
curl http://51.222.111.183
```

### Vérifier les services
```bash
sudo systemctl status postgresql
sudo systemctl status nginx
pm2 status
```

### Voir les logs détaillés
```bash
pm2 logs tomati-production
sudo tail -f /var/log/nginx/tomati.error.log
```

---

## 🔄 ÉTAPE 12: Configuration Auto-Start

### PM2 auto-start
```bash
pm2 save
pm2 startup systemd -u tomati --hp /home/tomati
```

### Exécuter la commande générée
(PM2 va afficher une commande sudo à exécuter)

---

## 🎯 RÉSULTAT FINAL

Votre application sera accessible sur :
- **Application** : http://51.222.111.183
- **Administration** : http://51.222.111.183/admin
- **Connexion admin** : admin@tomati.com / admin123

---

## 🔧 MAINTENANCE

### Redémarrage application
```bash
pm2 restart tomati-production
```

### Mise à jour future
```bash
cd /home/tomati/tomati-market
git pull origin main
npm install
npm run build
npm run db:push
pm2 restart tomati-production
```

### Monitoring
```bash
pm2 monit
htop
```

### Sauvegarde base de données
```bash
pg_dump -h localhost -U tomati tomati_db > backup_$(date +%Y%m%d).sql
```

---

## ❌ DÉPANNAGE

### Application ne démarre pas
```bash
pm2 logs tomati-production
```

### Erreur base de données
```bash
psql -h localhost -U tomati -d tomati_db -c "SELECT NOW();"
sudo systemctl restart postgresql
```

### Nginx erreur 502
```bash
sudo nginx -t
sudo systemctl restart nginx
curl http://localhost:5000
```

Suivez ces étapes une par une et votre application OVH sera parfaitement hébergée !