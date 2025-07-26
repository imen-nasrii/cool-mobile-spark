# Étapes Suivantes - PostgreSQL Installé ✅

PostgreSQL est maintenant installé et actif. Voici les prochaines commandes à exécuter :

## 1. Installer PM2
```bash
sudo npm install -g pm2
```

## 2. Configuration du firewall
```bash
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable
```

## 3. Configuration de PostgreSQL
```bash
sudo -u postgres psql
```

Dans PostgreSQL, créez la base :
```sql
CREATE DATABASE tomati_production;
CREATE USER tomati_user WITH ENCRYPTED PASSWORD 'TomatiSecure2025!';
GRANT ALL PRIVILEGES ON DATABASE tomati_production TO tomati_user;
ALTER DATABASE tomati_production OWNER TO tomati_user;
\q
```

## 4. Créer l'utilisateur pour l'application
```bash
sudo adduser tomati
sudo usermod -aG sudo tomati
```

## 5. Installation de Certbot (SSL)
```bash
sudo apt install -y certbot python3-certbot-nginx
```

## 6. Basculer vers l'utilisateur tomati
```bash
sudo su - tomati
```

## 7. Cloner le projet GitHub
```bash
# Remplacez par votre vrai repo GitHub
git clone https://github.com/votre-username/tomati-market.git
cd tomati-market
```

## 8. Installation et build
```bash
npm install
npm run build
```

## 9. Configuration environnement
```bash
nano .env
```

Contenu :
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://tomati_user:TomatiSecure2025!@localhost:5432/tomati_production
JWT_SECRET=tomati_jwt_secret_super_securise_32_caracteres_minimum_pour_production_2025
SESSION_SECRET=tomati_session_secret_securise_pour_authentification_utilisateurs_2025
```

## 10. Migration base de données
```bash
npm run db:push
```

## 11. Démarrage PM2
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

## 12. Configuration Nginx (retour ubuntu)
```bash
exit  # Retour à l'utilisateur ubuntu
sudo nano /etc/nginx/sites-available/tomati.org
```

Configuration Nginx :
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
    }
}
```

## 13. Activer le site
```bash
sudo ln -s /etc/nginx/sites-available/tomati.org /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 14. SSL automatique
```bash
sudo certbot --nginx -d tomati.org -d www.tomati.org
```

## 15. Vérification finale
```bash
sudo su - tomati
pm2 status
pm2 logs tomati-market
curl https://tomati.org
```

Continuez avec ces étapes dans l'ordre et votre application sera en ligne sur https://tomati.org