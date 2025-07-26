# 🚀 Instructions de Déploiement Final - Tomati Market

## Étape 1 : GitHub depuis Replit (Option 1 - Recommandée)

### Dans Replit :
1. **Cliquez sur l'onglet "Version Control"** (icône Git dans la barre latérale)
2. **Connectez-vous à GitHub** si ce n'est pas fait
3. **Créez un nouveau repository** : `tomati-market`
4. **Description** : "Marketplace Tomati - Plateforme e-commerce française"
5. **Cliquez sur "Push to GitHub"**

## Étape 2 : Déploiement sur le serveur VPS

### 2.1 Installation PM2 (sur serveur)
```bash
sudo npm install -g pm2
```

### 2.2 Configuration firewall
```bash
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443  
sudo ufw --force enable
```

### 2.3 Configuration PostgreSQL
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

### 2.4 Créer utilisateur application
```bash
sudo adduser tomati
sudo usermod -aG sudo tomati
```

### 2.5 Installation SSL
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 2.6 Cloner et configurer l'application
```bash
sudo su - tomati

# Remplacez VOTRE-USERNAME par votre nom GitHub
git clone https://github.com/VOTRE-USERNAME/tomati-market.git
cd tomati-market

# Installation
npm install
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

### 2.7 Migration et démarrage
```bash
# Migration base de données
npm run db:push

# Démarrage PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# Exécutez la commande générée par pm2 startup (commence par sudo)
```

### 2.8 Configuration Nginx
```bash
# Retour utilisateur ubuntu
exit

# Configuration Nginx
sudo nano /etc/nginx/sites-available/tomati.org
```

**Configuration Nginx :**
```nginx
server {
    listen 80;
    server_name tomati.org www.tomati.org;

    # Headers sécurité
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

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

### 2.9 Activation site et SSL
```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/tomati.org /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# SSL automatique
sudo certbot --nginx -d tomati.org -d www.tomati.org
```

## Étape 3 : Vérification finale

```bash
# Statut application  
sudo su - tomati
pm2 status
pm2 logs tomati-market --lines 20

# Test local
curl http://localhost:5000

# Test domaine
curl https://tomati.org
```

## 📊 Commandes de maintenance

```bash
# Redémarrer l'application
pm2 restart tomati-market

# Voir les logs en temps réel
pm2 logs tomati-market

# Monitoring
pm2 monit

# Mise à jour de l'application
cd ~/tomati-market
git pull
npm install  
npm run build
pm2 restart tomati-market
```

## 🔧 Dépannage

**Application ne démarre pas :**
```bash
pm2 logs tomati-market
# Vérifier les erreurs dans .env
```

**Site inaccessible :**
```bash
sudo nginx -t
sudo systemctl status nginx
sudo systemctl reload nginx
```

**Problème SSL :**
```bash
sudo certbot renew --dry-run
sudo certbot certificates
```

**Base de données :**
```bash
sudo -u postgres psql
\l  # Lister les bases
\c tomati_production  # Se connecter
\dt  # Lister les tables
```

## ✅ Résultat final

Votre marketplace **Tomati Market** sera accessible sur :
- **🌐 URL principale** : https://tomati.org
- **🔒 SSL** : Certificat Let's Encrypt automatique
- **💾 Base de données** : PostgreSQL sécurisée
- **🚀 Performance** : PM2 cluster mode
- **📱 Fonctionnalités** : Tous les modules opérationnels

**Fonctionnalités disponibles :**
- ✅ Authentification utilisateurs
- ✅ Catalogue produits avec géolocalisation
- ✅ Système de likes et promotion automatique
- ✅ Messagerie temps réel WebSocket
- ✅ Dashboard administrateur complet
- ✅ Système publicitaire avancé
- ✅ Assistant IA chatbot
- ✅ Cartes interactives Leaflet
- ✅ Recherche et filtres avancés

Votre plateforme est prête pour la production ! 🎉