# Commandes correctes pour déploiement final

## Exécuter ces commandes une par une sur le VPS

```bash
# 1. Aller dans le répertoire et arrêter l'application
cd ~/cool-mobile-spark
pm2 delete all
pm2 kill

# 2. Nettoyer tous les processus Node.js
sudo killall node 2>/dev/null || true
sudo lsof -ti :5000 | xargs sudo kill -9 2>/dev/null || true
sudo lsof -ti :5001 | xargs sudo kill -9 2>/dev/null || true

# 3. Créer un fichier .env propre avec port 5001
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

# 4. Créer une configuration PM2 propre avec port 5001
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

# 5. Reconstruire l'application avec les nouvelles variables
rm -rf dist
npm run build

# 6. Configurer Nginx pour le port 5001
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

# 7. Activer et tester Nginx
sudo nginx -t
sudo systemctl reload nginx

# 8. Démarrer l'application
mkdir -p logs
pm2 start ecosystem.config.cjs

# 9. Vérifications finales
sleep 5
pm2 status
curl http://localhost:5001
curl -I http://tomati.org

# 10. Sauvegarder la configuration
pm2 save

echo "✅ Déploiement terminé - tomati.org accessible"
```

## Résultat attendu
- PM2 status : tomati-hamdi "online"
- curl localhost:5001 : page HTML complète
- curl tomati.org : HTTP 200 OK
- Application accessible sur tomati.org