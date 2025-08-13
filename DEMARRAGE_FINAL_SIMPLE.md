# Démarrage final simple - Commandes à copier-coller

## Problème identifié
Le fichier ecosystem.config.cjs n'a pas été créé correctement.

## Solution immédiate

```bash
# En tant qu'utilisateur hamdi dans le répertoire cool-mobile-spark

# 1. Créer le fichier ecosystem.config.cjs manquant
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

# 2. Vérifier que les fichiers sont présents
ls -la ecosystem.config.cjs
ls -la .env
ls -la dist/index.js

# 3. Démarrer l'application
pm2 start ecosystem.config.cjs

# 4. Vérifications
sleep 5
pm2 status
pm2 logs tomati-hamdi --lines 5
curl http://localhost:5001
curl -I http://tomati.org

# 5. Sauvegarder si tout fonctionne
pm2 save

echo "✅ Application démarrée sur tomati.org"
```

## Résultat attendu
- pm2 status : tomati-hamdi "online"
- curl localhost:5001 : réponse HTML
- curl tomati.org : HTTP 200 OK
- tomati.org accessible dans le navigateur