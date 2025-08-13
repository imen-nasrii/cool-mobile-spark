# Guide Complet - Déploiement Tomati Market sur VPS OVH

## Prérequis
- VPS OVH Ubuntu 22.04
- Accès SSH avec IP fournie par OVH
- Domaine pointé vers l'IP du VPS (optionnel pour HTTPS)

## Étape 1 : Préparation du VPS

### 1.1 Connexion SSH
```bash
ssh root@VOTRE_IP_VPS
```

### 1.2 Mise à jour système
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install curl git ufw nano -y
```

### 1.3 Créer utilisateur dédié (sécurité)
```bash
adduser tomati
usermod -aG sudo tomati
su - tomati
```

## Étape 2 : Installation Node.js via NVM

### 2.1 Installer NVM
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
```

### 2.2 Installer Node.js LTS
```bash
nvm install --lts
nvm use --lts
node -v  # Doit afficher v20.x.x
npm -v   # Doit afficher 10.x.x
```

## Étape 3 : Installation PostgreSQL

### 3.1 Installation
```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 3.2 Configuration base de données
```bash
sudo -u postgres psql
```

Dans PostgreSQL :
```sql
CREATE DATABASE tomati_db;
CREATE USER tomati_user WITH ENCRYPTED PASSWORD 'VotreMotDePasseSecure123!';
GRANT ALL PRIVILEGES ON DATABASE tomati_db TO tomati_user;
ALTER USER tomati_user CREATEDB;
\q
```

### 3.3 Tester la connexion
```bash
psql -h localhost -U tomati_user -d tomati_db
# Entrer le mot de passe, puis \q pour quitter
```

## Étape 4 : Cloner et Configurer l'Application

### 4.1 Cloner le repository
```bash
cd /home/tomati
git clone https://github.com/imen-nasrii/cool-mobile-spark.git tomatimarket
cd tomatimarket
```

### 4.2 Installer les dépendances
```bash
npm install
```

### 4.3 Créer le fichier d'environnement
```bash
nano .env
```

Contenu du fichier `.env` :
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://tomati_user:VotreMotDePasseSecure123!@localhost:5432/tomati_db
JWT_SECRET=votre_jwt_secret_tres_long_et_secure_123456789
BCRYPT_ROUNDS=12
```

### 4.4 Préparer la base de données
```bash
npm run db:push
```

## Étape 5 : Build et Test Local

### 5.1 Build de l'application
```bash
npm run build
```

### 5.2 Test local
```bash
npm start
```

Dans un autre terminal :
```bash
curl http://localhost:5000
# Doit retourner du HTML de l'application
```

Arrêter avec `Ctrl+C`.

## Étape 6 : Installation PM2 (Process Manager)

### 6.1 Installer PM2 globalement
```bash
npm install -g pm2
```

### 6.2 Créer fichier ecosystem PM2
```bash
nano ecosystem.config.cjs
```

Contenu :
```javascript
module.exports = {
  apps: [{
    name: 'tomati-production',
    script: 'npm',
    args: 'start',
    cwd: '/home/tomati/tomatimarket',
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
```

### 6.3 Créer dossier logs
```bash
mkdir -p /home/tomati/logs
```

### 6.4 Démarrer avec PM2
```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

Copier-coller la commande générée par `pm2 startup`.

### 6.5 Vérifier le statut
```bash
pm2 status
pm2 logs tomati-production
```

## Étape 7 : Installation et Configuration Nginx

### 7.1 Installer Nginx
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 7.2 Créer configuration Nginx
```bash
sudo nano /etc/nginx/sites-available/tomati
```

Contenu :
```nginx
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;  # Remplacer par votre domaine

    # Gestion des assets statiques
    location /assets/ {
        root /home/tomati/tomatimarket/dist;
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }

    # Proxy vers l'application Node.js
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

    # WebSocket support pour les messages en temps réel
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

### 7.3 Activer la configuration
```bash
sudo ln -s /etc/nginx/sites-available/tomati /etc/nginx/sites-enabled/
sudo nginx -t  # Tester la configuration
sudo systemctl reload nginx
```

## Étape 8 : Configuration Pare-feu (UFW)

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
sudo ufw status
```

## Étape 9 : HTTPS avec Certbot (Si domaine configuré)

### 9.1 Installer Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 9.2 Obtenir certificat SSL
```bash
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
```

### 9.3 Test auto-renouvellement
```bash
sudo certbot renew --dry-run
```

## Étape 10 : Scripts de Maintenance

### 10.1 Script de mise à jour
```bash
nano ~/update-tomati.sh
```

Contenu :
```bash
#!/bin/bash
cd /home/tomati/tomatimarket
git pull origin main
npm install
npm run build
npm run db:push
pm2 restart tomati-production
pm2 save
echo "Mise à jour terminée !"
```

### 10.2 Rendre exécutable
```bash
chmod +x ~/update-tomati.sh
```

## Étape 11 : Vérifications Finales

### 11.1 Test complet
```bash
# Vérifier les services
sudo systemctl status nginx
sudo systemctl status postgresql
pm2 status

# Tester l'application
curl -I http://localhost:5000
curl -I http://votre-domaine.com
```

### 11.2 Test WebSocket
```bash
# Les logs PM2 doivent montrer les connexions WebSocket
pm2 logs tomati-production --lines 50
```

## Commandes de Monitoring

### Voir les logs
```bash
pm2 logs tomati-production
pm2 logs tomati-production --lines 100
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Redémarrer services
```bash
pm2 restart tomati-production
sudo systemctl reload nginx
sudo systemctl restart postgresql
```

### Monitoring performances
```bash
pm2 monit  # Interface de monitoring
htop       # Monitoring système
df -h      # Espace disque
free -h    # Mémoire
```

## Sauvegarde Automatique

### Script de sauvegarde base de données
```bash
nano ~/backup-db.sh
```

Contenu :
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U tomati_user tomati_db > /home/tomati/backups/tomati_db_$DATE.sql
# Garder seulement les 7 dernières sauvegardes
find /home/tomati/backups/ -name "tomati_db_*.sql" -type f -mtime +7 -delete
```

### Créer dossier et automatiser
```bash
mkdir -p /home/tomati/backups
chmod +x ~/backup-db.sh
# Ajouter au crontab pour sauvegarde quotidienne à 2h du matin
(crontab -l 2>/dev/null; echo "0 2 * * * /home/tomati/backup-db.sh") | crontab -
```

## URLs de Test Final

Une fois déployé, tester :
- `http://votre-domaine.com` - Page d'accueil
- `http://votre-domaine.com/api/products` - API produits
- `http://votre-domaine.com/messages` - Système de messagerie
- `http://votre-domaine.com/admin` - Dashboard admin

## Résolution de Problèmes

### Si l'application ne démarre pas :
```bash
pm2 logs tomati-production
npm run build
```

### Si la base de données ne fonctionne pas :
```bash
sudo systemctl status postgresql
psql -h localhost -U tomati_user -d tomati_db
```

### Si Nginx ne fonctionne pas :
```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

## Performance et Sécurité

### Optimisations recommandées :
- Configurer les logs de rotation
- Mettre en place monitoring avec tools comme Grafana
- Configurer fail2ban pour sécurité SSH
- Optimiser PostgreSQL selon la RAM disponible

L'application Tomati Market sera maintenant accessible 24/7 avec toutes les fonctionnalités : messagerie temps réel, dashboard admin, système de favoris, et gestion des photos utilisateurs.