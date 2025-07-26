# Guide GitHub et Déploiement Final

## Étape 1 : Pousser le code sur GitHub (depuis votre machine locale Replit)

### 1.1 Créer un repository GitHub
1. Allez sur https://github.com
2. Cliquez sur "New repository"
3. Nom : `tomati-market`
4. Description : `Marketplace Tomati - Full-stack e-commerce platform`
5. Public ou Private (votre choix)
6. Cliquez "Create repository"

### 1.2 Initialiser Git et pousser le code (dans Replit terminal)
```bash
# Dans le terminal Replit
git init
git add .
git commit -m "Initial commit - Tomati Market ready for deployment"

# Remplacez VOTRE-USERNAME par votre nom d'utilisateur GitHub
git remote add origin https://github.com/VOTRE-USERNAME/tomati-market.git
git branch -M main
git push -u origin main
```

## Étape 2 : Continuer sur le serveur VPS

Une fois le code sur GitHub, retournez sur votre serveur et continuez :

### 2.1 Cloner le projet
```bash
# Sur le serveur VPS, en tant qu'utilisateur tomati
sudo su - tomati

# Cloner votre repo (remplacez VOTRE-USERNAME)
git clone https://github.com/VOTRE-USERNAME/tomati-market.git
cd tomati-market
```

### 2.2 Installation et configuration
```bash
# Installation des dépendances
npm install

# Build de production
npm run build

# Créer le fichier d'environnement
nano .env
```

Contenu du fichier `.env` :
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://tomati_user:TomatiSecure2025!@localhost:5432/tomati_production
JWT_SECRET=tomati_jwt_secret_super_securise_32_caracteres_minimum_pour_production_2025_france
SESSION_SECRET=tomati_session_secret_securise_pour_authentification_utilisateurs_marketplace_2025

# Optionnel : variables supplémentaires si nécessaire
BCRYPT_ROUNDS=12
```

### 2.3 Migration de la base de données
```bash
npm run db:push
```

### 2.4 Démarrage avec PM2
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# Copier-coller la commande générée par pm2 startup (elle commence par sudo)
# Exemple : sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u tomati --hp /home/tomati
```

### 2.5 Vérification
```bash
pm2 status
pm2 logs tomati-market
```

## Étape 3 : Configuration Nginx (retour utilisateur ubuntu)

```bash
# Sortir de l'utilisateur tomati
exit

# Créer la configuration Nginx
sudo nano /etc/nginx/sites-available/tomati.org
```

Contenu de la configuration :
```nginx
server {
    listen 80;
    server_name tomati.org www.tomati.org;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

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

    # WebSocket support for real-time messaging
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

### Activer le site
```bash
sudo ln -s /etc/nginx/sites-available/tomati.org /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Étape 4 : Configuration SSL

```bash
sudo certbot --nginx -d tomati.org -d www.tomati.org
```

## Étape 5 : Test final

```bash
# Tester l'application localement
curl http://localhost:5000

# Tester le domaine
curl https://tomati.org

# Vérifier les logs
sudo su - tomati
pm2 logs tomati-market --lines 20
```

## Commandes de maintenance

```bash
# Redémarrer l'application
pm2 restart tomati-market

# Mettre à jour l'application
cd ~/tomati-market
git pull
npm install
npm run build
pm2 restart tomati-market

# Voir les statistiques
pm2 monit
```

## Dépannage courant

**Si l'application ne démarre pas :**
```bash
pm2 logs tomati-market
# Vérifier les erreurs et ajuster .env si nécessaire
```

**Si le site n'est pas accessible :**
```bash
sudo nginx -t
sudo systemctl status nginx
sudo systemctl reload nginx
```

**Si SSL ne fonctionne pas :**
```bash
sudo certbot renew --dry-run
sudo certbot --nginx -d tomati.org -d www.tomati.org --force-renewal
```

Votre marketplace Tomati sera accessible sur https://tomati.org avec toutes les fonctionnalités !