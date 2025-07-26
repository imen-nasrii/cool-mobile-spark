# 🔧 Correction du Déploiement - VPS OVH Ubuntu

## Situation actuelle
- Connecté avec l'utilisateur `ubuntu` (pas `root`)
- Node.js 18.20.6 installé (il faut la version 20)
- Besoin d'utiliser `sudo` pour les commandes administratives

## Commandes à exécuter sur le serveur

### 1. Mise à jour du système
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Installation de Node.js 20 (mise à jour)
```bash
sudo apt-get install nodejs -y
node --version  # Devrait afficher v20.x.x
```

### 3. Installation de PostgreSQL
```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 4. Installation des autres dépendances
```bash
sudo apt install -y curl wget git vim htop ufw nginx
```

### 5. Installation de PM2
```bash
sudo npm install -g pm2
```

### 6. Configuration du firewall
```bash
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable
```

### 7. Configuration de PostgreSQL
```bash
sudo -u postgres psql
```

Dans PostgreSQL :
```sql
CREATE DATABASE tomati_production;
CREATE USER tomati_user WITH ENCRYPTED PASSWORD 'VotreMotDePasseSecurise123!';
GRANT ALL PRIVILEGES ON DATABASE tomati_production TO tomati_user;
ALTER DATABASE tomati_production OWNER TO tomati_user;
\q
```

### 8. Création de l'utilisateur application
```bash
sudo adduser tomati
sudo usermod -aG sudo tomati
```

### 9. Installation de Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 10. Préparation du projet
```bash
# Basculer vers l'utilisateur tomati
sudo su - tomati

# Cloner le projet (remplacez par votre repo GitHub)
git clone https://github.com/votre-username/tomati-market.git
cd tomati-market

# Installation des dépendances
npm install
npm run build
```

### 11. Configuration des variables d'environnement
```bash
# Créer le fichier .env
nano .env
```

Contenu du fichier `.env` :
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://tomati_user:VotreMotDePasseSecurise123!@localhost:5432/tomati_production
JWT_SECRET=votre_jwt_secret_super_long_et_securise_32_caracteres_minimum_pour_la_securite
SESSION_SECRET=votre_session_secret_tres_securise_pour_les_sessions_utilisateur
```

### 12. Migration de la base de données
```bash
npm run db:push
```

### 13. Démarrage avec PM2
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
# Copier-coller la commande générée avec sudo
```

### 14. Configuration Nginx
```bash
# Revenir en utilisateur ubuntu/root
exit

# Créer la configuration Nginx
sudo nano /etc/nginx/sites-available/tomati.org
```

Contenu de la configuration Nginx :
```nginx
server {
    listen 80;
    server_name tomati.org www.tomati.org;

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
    }

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

### 15. Activer le site Nginx
```bash
sudo ln -s /etc/nginx/sites-available/tomati.org /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 16. Configuration SSL
```bash
sudo certbot --nginx -d tomati.org -d www.tomati.org
```

### 17. Vérification finale
```bash
# Vérifier PM2
sudo su - tomati
pm2 status
pm2 logs tomati-market

# Tester l'application
curl http://localhost:5000
curl https://tomati.org
```

## Points importants à retenir :

1. **Utilisez `sudo`** pour toutes les commandes administratives
2. **Node.js 20** est maintenant installé après la commande `sudo apt-get install nodejs -y`
3. **Utilisateur `tomati`** pour l'application, `ubuntu` pour l'administration
4. **Variables d'environnement** critiques à configurer correctement
5. **SSL automatique** avec Let's Encrypt

## Commandes de dépannage :

```bash
# Vérifier les services
sudo systemctl status nginx
sudo systemctl status postgresql
pm2 status

# Voir les logs
pm2 logs tomati-market
sudo tail -f /var/log/nginx/error.log

# Redémarrer si nécessaire
pm2 restart tomati-market
sudo systemctl reload nginx
```

Suivez ces étapes dans l'ordre et votre application sera déployée sur https://tomati.org !