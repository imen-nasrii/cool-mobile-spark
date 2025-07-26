# 🚀 Déploiement Final - Tomati Market

## Informations du déploiement

- **Repository GitHub** : https://github.com/imen-nasrii/cool-mobile-spark.git
- **Serveur VPS** : 213.186.33.5 (Ubuntu 22.04)
- **Domaine** : tomati.org
- **Logo** : Intégré dans toute l'application

## Commandes à exécuter sur votre serveur VPS

### 1. Finaliser l'installation des dépendances
```bash
# Installation PM2
sudo npm install -g pm2

# Configuration firewall
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable
```

### 2. Configuration PostgreSQL
```bash
sudo -u postgres psql
```

Dans PostgreSQL :
```sql
CREATE DATABASE tomati_production;
CREATE USER tomati_user WITH ENCRYPTED PASSWORD 'TomatiSecure2025!';
GRANT ALL PRIVILEGES ON DATABASE tomati_production TO tomati_user;
ALTER DATABASE tomati_production OWNER TO tomati_user;
\q
```

### 3. Créer l'utilisateur application
```bash
sudo adduser tomati
sudo usermod -aG sudo tomati
```

### 4. Installation SSL
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 5. Cloner et configurer l'application
```bash
sudo su - tomati

# Cloner le repository
git clone https://github.com/imen-nasrii/cool-mobile-spark.git tomati-market
cd tomati-market

# Installation des dépendances
npm install

# Build de production
npm run build

# Configuration environnement
nano .env
```

**Contenu du fichier .env :**
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://tomati_user:TomatiSecure2025!@localhost:5432/tomati_production
JWT_SECRET=tomati_jwt_secret_super_securise_32_caracteres_minimum_pour_production_2025_france
SESSION_SECRET=tomati_session_secret_securise_pour_authentification_utilisateurs_marketplace_2025
BCRYPT_ROUNDS=12
```

### 6. Migration et démarrage
```bash
# Migration de la base de données
npm run db:push

# Démarrage avec PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# Copiez et exécutez la commande générée par pm2 startup
```

### 7. Configuration Nginx
```bash
# Retourner à l'utilisateur ubuntu
exit

# Créer la configuration Nginx
sudo nano /etc/nginx/sites-available/tomati.org
```

**Configuration Nginx complète :**
```nginx
server {
    listen 80;
    server_name tomati.org www.tomati.org;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/json
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

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
        
        # Rate limiting for general requests
        limit_req zone=api burst=20 nodelay;
    }

    # WebSocket for real-time messaging
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

    # API rate limiting
    location /api/auth {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg)$ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 8. Activer le site et SSL
```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/tomati.org /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Obtenir le certificat SSL
sudo certbot --nginx -d tomati.org -d www.tomati.org
```

### 9. Vérification finale
```bash
# Vérifier l'application
sudo su - tomati
pm2 status
pm2 logs tomati-market --lines 20

# Tester localement
curl http://localhost:5000

# Tester le domaine
curl https://tomati.org
```

## Fonctionnalités déployées :

- ✅ **Authentification sécurisée** avec JWT et bcrypt
- ✅ **Base de données PostgreSQL** avec toutes les tables
- ✅ **Catalogue produits** avec géolocalisation
- ✅ **Système de likes** et promotion automatique
- ✅ **Messagerie temps réel** avec WebSocket
- ✅ **Dashboard administrateur** complet
- ✅ **Système publicitaire** avancé
- ✅ **Assistant IA chatbot** 
- ✅ **Cartes interactives** Leaflet
- ✅ **Logo personnalisé** intégré partout
- ✅ **SSL/HTTPS** automatique
- ✅ **Performance optimisée** avec PM2
- ✅ **Sécurité renforcée** avec headers et rate limiting

## Maintenance et monitoring :

```bash
# Logs en temps réel
pm2 logs tomati-market

# Monitoring
pm2 monit

# Redémarrage
pm2 restart tomati-market

# Mise à jour de l'application
cd ~/tomati-market
git pull
npm install
npm run build
pm2 restart tomati-market

# Backup base de données
pg_dump -U tomati_user -h localhost tomati_production > backup_$(date +%Y%m%d_%H%M%S).sql
```

## URL finale :
**https://tomati.org** - Votre marketplace est prête !

## Compte administrateur :
- Email : admin@tomati.com
- Mot de passe : admin123

Votre marketplace Tomati est maintenant complètement déployée et opérationnelle sur votre domaine tomati.org avec votre logo personnalisé !