# Correction PM2 Final - Application Crashe

## Problème identifié
L'application démarre mais crashe immédiatement (15 redémarrages, statut "errored").

## Commandes de diagnostic et correction

```bash
# 1. Voir les logs d'erreur détaillés
pm2 logs tomati-hamdi --err --lines 50

# 2. Voir les logs complets
cat logs/err.log
cat logs/out.log

# 3. Tester l'application manuellement pour voir l'erreur
node --loader tsx/esm server/index.ts

# 4. Vérifier la configuration .env
cat .env

# 5. Tester la connexion à la base de données
npm run db:push

# 6. Si erreur de base de données, recréer l'utilisateur DB
sudo -u postgres psql -c "DROP USER IF EXISTS tomatii_user;"
sudo -u postgres psql -c "CREATE USER tomatii_user WITH ENCRYPTED PASSWORD 'tomatii_password_2024!';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE tomatii_db TO tomatii_user;"
sudo -u postgres psql -c "ALTER USER tomatii_user CREATEDB;"

# 7. Redémarrer PM2 avec logs verbeux
pm2 delete tomati-hamdi
pm2 start ecosystem.config.cjs --log-date-format="YYYY-MM-DD HH:mm:ss Z"
pm2 logs tomati-hamdi --lines 20
```

## Configuration PM2 alternative (si problème persist)

```bash
# Configuration simplifiée sans TSX
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
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Utiliser le fichier compilé
pm2 start ecosystem.config.cjs
```

## Test direct de l'application
```bash
# Test sans PM2 pour voir l'erreur exacte
NODE_ENV=production PORT=5000 node --loader tsx/esm server/index.ts
```