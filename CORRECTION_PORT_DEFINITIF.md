# Solution définitive - Port 5001 au lieu de 5000

## Problème identifié
Le port 5000 semble être réservé ou utilisé par un service système. L'erreur EADDRINUSE persiste malgré le nettoyage des processus Node.js.

## Solution - Commandes de correction

```bash
# En tant qu'utilisateur hamdi sur le VPS

# 1. Arrêter l'application actuelle qui échoue
cd ~/cool-mobile-spark
pm2 delete tomati-hamdi

# 2. Modifier la configuration pour utiliser le port 5001
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

# 3. Modifier la configuration PM2 pour utiliser le port 5001
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

# 4. Mettre à jour Nginx pour pointer vers le port 5001
sudo sed -i 's/proxy_pass http:\/\/localhost:5000/proxy_pass http:\/\/localhost:5001/g' /etc/nginx/sites-available/tomati.org
sudo nginx -t
sudo systemctl reload nginx

# 5. Démarrer l'application sur le nouveau port
pm2 start ecosystem.config.cjs

# 6. Vérifications
sleep 3
pm2 status
pm2 logs tomati-hamdi --lines 5
curl http://localhost:5001
curl -I http://tomati.org

# 7. Sauvegarder
pm2 save

echo "✅ Application déployée sur le port 5001 et accessible via tomati.org"
```

## Vérification de la configuration Nginx mise à jour

Pour confirmer que Nginx pointe vers le bon port :
```bash
sudo cat /etc/nginx/sites-available/tomati.org | grep proxy_pass
```

Vous devriez voir :
```
proxy_pass http://localhost:5001;
```

## Résultat attendu

Après ces commandes :
- ✅ L'application fonctionnera sur le port 5001 (libre de conflit)
- ✅ Nginx redirigera tomati.org vers localhost:5001
- ✅ PM2 montrera tomati-hamdi en statut "online"
- ✅ tomati.org sera accessible avec la nouvelle version complète