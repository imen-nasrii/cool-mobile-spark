# Nettoyage complet VPS - Suppression utilisateur tomati et redéploiement

## 1. Nettoyer complètement l'ancien déploiement

```bash
# Connexion en tant qu'utilisateur ubuntu (administrateur)
# Arrêter tous les services de l'utilisateur tomati
sudo pkill -u tomati
sudo systemctl stop postgresql
sudo systemctl stop nginx

# Supprimer complètement l'utilisateur tomati et ses données
sudo userdel -r tomati 2>/dev/null || true
sudo groupdel tomati 2>/dev/null || true

# Nettoyer tous les processus Node.js
sudo killall node 2>/dev/null || true
sudo killall pm2 2>/dev/null || true

# Libérer tous les ports
sudo lsof -ti :5000 | xargs sudo kill -9 2>/dev/null || true
sudo lsof -ti :5001 | xargs sudo kill -9 2>/dev/null || true
sudo fuser -k 5000/tcp 2>/dev/null || true
sudo fuser -k 5001/tcp 2>/dev/null || true

# Nettoyer la configuration Nginx
sudo rm -f /etc/nginx/sites-enabled/tomati.org
sudo rm -f /etc/nginx/sites-available/tomati.org

# Redémarrer les services système
sudo systemctl start postgresql
sudo systemctl start nginx
sudo systemctl status postgresql
sudo systemctl status nginx
```

## 2. Déploiement complet sous utilisateur hamdi

```bash
# Passer à l'utilisateur hamdi
sudo su - hamdi

# Nettoyer le répertoire de hamdi
cd ~
rm -rf cool-mobile-spark*
pm2 kill 2>/dev/null || true

# Cloner le nouveau repository
git clone https://github.com/imen-nasrii/cool-mobile-spark.git
cd cool-mobile-spark

# Installer les dépendances
npm install

# Créer le fichier .env pour port 5001
cat > .env << 'EOF'
DATABASE_URL=postgresql://tomatii_user:tomatii_password_2024!@localhost:5432/tomatii_db
PGDATABASE=tomatii_db
PGHOST=localhost
PGPORT=5432
PGUSER=tomatii_user
PGPASSWORD=tomatii_password_2024!
JWT_SECRET=tomati_super_secret_jwt_key_2024_production
NODE_ENV=production
PORT=5001
HOST=0.0.0.0
SESSION_SECRET=tomati_session_secret_key_2024_production
REPL_ID=tomati-production
REPLIT_DOMAINS=tomati.org
ISSUER_URL=https://replit.com/oidc
EOF

# Créer la configuration PM2
cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'tomati-hamdi',
    script: 'dist/index.js',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5001,
      HOST: '0.0.0.0',
      DATABASE_URL: 'postgresql://tomatii_user:tomatii_password_2024!@localhost:5432/tomatii_db',
      PGDATABASE: 'tomatii_db',
      PGHOST: 'localhost',
      PGPORT: '5432',
      PGUSER: 'tomatii_user',
      PGPASSWORD: 'tomatii_password_2024!',
      JWT_SECRET: 'tomati_super_secret_jwt_key_2024_production',
      SESSION_SECRET: 'tomati_session_secret_key_2024_production',
      REPL_ID: 'tomati-production',
      REPLIT_DOMAINS: 'tomati.org',
      ISSUER_URL: 'https://replit.com/oidc'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Mettre à jour la base de données et construire
npm run db:push
npm run build

# Créer le répertoire de logs
mkdir -p logs

# Sortir de la session hamdi
exit
```

## 3. Configuration Nginx propre (en tant qu'ubuntu/root)

```bash
# Créer une nouvelle configuration Nginx propre
sudo tee /etc/nginx/sites-available/tomati.org << 'EOF'
server {
    listen 80;
    server_name tomati.org www.tomati.org;

    location / {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# Activer le site
sudo ln -sf /etc/nginx/sites-available/tomati.org /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 4. Démarrage final de l'application

```bash
# Retourner à l'utilisateur hamdi et démarrer
sudo su - hamdi
cd ~/cool-mobile-spark

# Démarrer l'application
pm2 start ecosystem.config.cjs

# Vérifications
sleep 5
pm2 status
pm2 logs tomati-hamdi --lines 5
curl http://localhost:5001
curl -I http://tomati.org

# Sauvegarder la configuration PM2
pm2 save
pm2 startup

echo "✅ Déploiement complet terminé sur tomati.org"
```

## Résultat final
- ✅ Ancien utilisateur "tomati" supprimé
- ✅ Application déployée sous "hamdi" sur port 5001
- ✅ Nginx configuré proprement
- ✅ tomati.org accessible avec la nouvelle version