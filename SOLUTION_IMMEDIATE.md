# Solution Immédiate - Port 5000 occupé

## Problème identifié
Le port 5000 est déjà utilisé par un autre processus (probablement l'ancienne instance de l'application).

## Commands à exécuter immédiatement

```bash
# 1. Arrêter tous les processus PM2
pm2 delete all
pm2 kill

# 2. Identifier qui utilise le port 5000
sudo lsof -i :5000
# ou
sudo netstat -tulpn | grep :5000

# 3. Arrêter le processus qui occupe le port
sudo fuser -k 5000/tcp

# 4. Vérifier que le port est libéré
sudo lsof -i :5000

# 5. Redémarrer PM2 avec la configuration
pm2 start ecosystem.config.cjs
pm2 status
pm2 logs tomati-hamdi --lines 5

# 6. Tester l'application
curl http://localhost:5000

# 7. Si ça fonctionne, sauvegarder
pm2 save
```

## Alternative - Utiliser un autre port

```bash
# Si le port 5000 continue d'être occupé, utiliser le port 3001
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
      PORT: 3001,
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

pm2 start ecosystem.config.cjs
curl http://localhost:3001
```

## Diagnostic pour identifier le processus

```bash
# Voir tous les processus Node.js
ps aux | grep node

# Voir qui utilise le port 5000
sudo ss -tulpn | grep :5000
```