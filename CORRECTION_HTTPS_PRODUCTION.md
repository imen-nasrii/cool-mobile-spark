# Correction HTTPS pour production - tomati.org

## Problème identifié
- Application accessible en HTTPS mais erreurs 500 côté serveur
- Problème de certificat SSL (localhost vs tomati.org)
- Configuration de production pas adaptée pour HTTPS

## Solutions à appliquer

```bash
# 1. Vérifier les logs PM2 pour voir les erreurs exactes
cd ~/cool-mobile-spark
pm2 logs tomati-hamdi --lines 20

# 2. Corriger la configuration .env pour HTTPS
cat > .env << 'EOF'
DATABASE_URL=postgresql://tomatii_user:tomatii_password_2024!@localhost:5432/tomatii_db
PGDATABASE=tomatii_db
PGHOST=localhost
PGPORT=5432
PGUSER=tomatii_user
PGPASSWORD=tomatii_password_2024!
JWT_SECRET=tomati_super_secret_jwt_key_2024_production
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
SESSION_SECRET=tomati_session_secret_key_2024_production
REPL_ID=tomati-production
REPLIT_DOMAINS=tomati.org,www.tomati.org
ISSUER_URL=https://replit.com/oidc
BASE_URL=https://tomati.org
EOF

# 3. Mettre à jour la configuration PM2 pour HTTPS
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
      PORT: 5000,
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
      REPLIT_DOMAINS: 'tomati.org,www.tomati.org',
      ISSUER_URL: 'https://replit.com/oidc',
      BASE_URL: 'https://tomati.org'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# 4. Reconstruire l'application avec les nouvelles variables
npm run build

# 5. Redémarrer l'application
pm2 restart tomati-hamdi

# 6. Vérifier que l'application fonctionne
sleep 5
pm2 status
pm2 logs tomati-hamdi --lines 10
curl -I https://tomati.org
curl -I https://www.tomati.org

# 7. Tester l'API spécifiquement
curl -I https://tomati.org/api/products

echo "✅ Configuration HTTPS corrigée"
```

## Diagnostic supplémentaire

Si les erreurs 500 persistent, vérifier :

```bash
# Vérifier la connexion à la base de données
cd ~/cool-mobile-spark
npm run db:push

# Vérifier les logs détaillés
pm2 logs tomati-hamdi --lines 50 | grep -i error

# Tester la connexion locale
curl http://localhost:5000/api/products
```

## Résultat attendu
- ✅ HTTPS fonctionne sans erreurs SSL
- ✅ API répond correctement (pas d'erreurs 500)
- ✅ Application accessible sur https://tomati.org et https://www.tomati.org
- ✅ Authentification et toutes les fonctionnalités opérationnelles