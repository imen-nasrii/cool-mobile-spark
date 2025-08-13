# Correction Finale VPS - Port 3001

## Solution immédiate - Éviter le conflit de port

```bash
# 1. Nettoyer complètement PM2 et libérer le port
pm2 delete all
pm2 kill
sudo fuser -k 5000/tcp
sudo killall node 2>/dev/null || true

# 2. Configuration PM2 avec port 3001 pour éviter les conflits
cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'tomati-hamdi',
    script: 'dist/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
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

# 3. Redémarrer PM2 avec le nouveau port
pm2 start ecosystem.config.cjs
sleep 3
pm2 status

# 4. Vérifier que l'application fonctionne
curl http://localhost:3001
pm2 logs tomati-hamdi --lines 5

# 5. Si ça fonctionne, sauvegarder
pm2 save

# 6. Configuration du démarrage automatique
sudo env PATH=$PATH:/home/hamdi/.nvm/versions/node/v22.18.0/bin /home/hamdi/.nvm/versions/node/v22.18.0/lib/node_modules/pm2/bin/pm2 startup systemd -u hamdi --hp /home/hamdi
```

## Configuration Nginx pour le port 3001

```bash
# Configurer Nginx pour rediriger vers le port 3001
sudo tee /etc/nginx/sites-available/tomati.org << 'EOF'
server {
    listen 80;
    server_name tomati.org www.tomati.org;

    location / {
        proxy_pass http://localhost:3001;
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

# Activer la configuration
sudo ln -sf /etc/nginx/sites-available/tomati.org /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Tester la configuration complète
curl http://localhost:3001
curl http://tomati.org
```

## Validation finale

```bash
# Vérifier tous les services
pm2 status
sudo systemctl status nginx
sudo systemctl status postgresql

# Test final
curl -I http://tomati.org
echo "Application déployée avec succès sur tomati.org"
```