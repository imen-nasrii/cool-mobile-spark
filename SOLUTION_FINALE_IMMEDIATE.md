# Solution Finale - Variables d'environnement PM2

## Problème identifié
✅ PM2 fonctionne maintenant (statut "online")
❌ Les variables d'environnement du fichier .env ne sont pas chargées

## Solution immédiate - Charger les variables d'environnement

```bash
# 1. Arrêter le processus actuel
pm2 delete tomati-hamdi

# 2. Configuration PM2 avec chargement du fichier .env
cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'tomati-hamdi',
    script: 'dist/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env_file: '.env',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
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

# 3. Redémarrer avec toutes les variables d'environnement
pm2 start ecosystem.config.cjs
pm2 status
pm2 logs tomati-hamdi --lines 10
```

## Test de fonctionnement

```bash
# Vérifier le statut
pm2 status

# Tester l'application
curl http://localhost:5000

# Voir les logs
pm2 logs tomati-hamdi --lines 5

# Si tout fonctionne, sauvegarder la configuration
pm2 save

# Configurer le démarrage automatique
sudo env PATH=$PATH:/home/hamdi/.nvm/versions/node/v22.18.0/bin /home/hamdi/.nvm/versions/node/v22.18.0/lib/node_modules/pm2/bin/pm2 startup systemd -u hamdi --hp /home/hamdi
```

## Configuration Nginx (après validation PM2)

```bash
# Une fois PM2 stable, configurer Nginx
sudo nano /etc/nginx/sites-available/tomati.org

# Contenu du fichier Nginx:
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
}

# Activer la configuration
sudo ln -s /etc/nginx/sites-available/tomati.org /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```