# Mise à jour vers la dernière version

## Commandes à exécuter sur le VPS

```bash
# En tant qu'utilisateur hamdi sur le VPS
cd ~/cool-mobile-spark

# 1. Sauvegarder les fichiers de configuration actuels
cp .env .env.backup
cp ecosystem.config.cjs ecosystem.config.cjs.backup

# 2. Récupérer la dernière version depuis GitHub
git fetch origin
git reset --hard origin/main
git pull origin main

# 3. Installer les nouvelles dépendances si nécessaires
npm install

# 4. Recréer le fichier .env avec les bonnes variables
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
REPLIT_DOMAINS=tomati.org
ISSUER_URL=https://replit.com/oidc
EOF

chmod 600 .env

# 5. Mettre à jour la base de données si nécessaire
npm run db:push

# 6. Reconstruire l'application avec les derniers changements
npm run build

# 7. Recréer la configuration PM2 avec les dernières variables
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

# 8. Redémarrer l'application avec la nouvelle version
pm2 delete tomati-hamdi
pm2 start ecosystem.config.cjs

# 9. Vérifier le déploiement
sleep 3
pm2 status
pm2 logs tomati-hamdi --lines 10
curl http://localhost:5000
curl -I http://tomati.org

# 10. Sauvegarder la configuration
pm2 save

echo "✅ Mise à jour terminée - Tomati Market à jour sur tomati.org"
```

## Vérification des fonctionnalités mises à jour

Après la mise à jour, vérifiez que les dernières fonctionnalités sont présentes :
- Système de préférences utilisateur complet
- Design plat (rouge, noir, blanc) sans effets visuels
- Bouton d'action flottant avec raccourcis de catégories
- Photos dans les conversations de messagerie
- Système de notation et vues des produits
- Toutes les améliorations récentes

## En cas de problème

Si des erreurs surviennent :
```bash
# Voir les logs détaillés
pm2 logs tomati-hamdi --lines 50

# Restaurer la version précédente si nécessaire
git log --oneline -10
git reset --hard <commit_hash_précédent>
npm run build
pm2 restart tomati-hamdi
```