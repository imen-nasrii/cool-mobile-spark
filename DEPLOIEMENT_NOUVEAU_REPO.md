# Déploiement du nouveau repository GitHub

## Repository source
https://github.com/imen-nasrii/cool-mobile-spark.git

## Commandes de déploiement sur le VPS

```bash
# En tant qu'utilisateur hamdi sur le VPS

# 1. Nettoyer complètement l'ancienne installation
cd ~
pm2 delete all 2>/dev/null || true
pm2 kill 2>/dev/null || true
sudo killall node 2>/dev/null || true
sudo lsof -ti :5000 | xargs sudo kill -9 2>/dev/null || true
sudo fuser -k 5000/tcp 2>/dev/null || true

# 2. Sauvegarder et supprimer l'ancien répertoire
if [ -d "cool-mobile-spark" ]; then
    mv cool-mobile-spark cool-mobile-spark-backup-$(date +%Y%m%d_%H%M%S)
fi

# 3. Cloner le nouveau repository
git clone https://github.com/imen-nasrii/cool-mobile-spark.git
cd cool-mobile-spark

# 4. Installer les dépendances
npm install

# 5. Créer le fichier .env avec toutes les variables
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

# 6. Pousser les changements de schéma vers la base de données
npm run db:push

# 7. Construire l'application
npm run build

# 8. Créer la configuration PM2
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

# 9. Créer le répertoire des logs
mkdir -p logs

# 10. Démarrer l'application
pm2 start ecosystem.config.cjs

# 11. Vérifier le déploiement
sleep 5
pm2 status
pm2 logs tomati-hamdi --lines 10

# 12. Tester l'accès
curl http://localhost:5000
curl -I http://tomati.org

# 13. Sauvegarder la configuration PM2
pm2 save

echo "🎉 Nouveau repository déployé avec succès sur tomati.org"
echo "Repository: https://github.com/imen-nasrii/cool-mobile-spark.git"
echo "Application accessible sur: http://tomati.org"
```

## Vérifications finales

Après l'exécution :
- ✅ PM2 status doit montrer tomati-hamdi "online"
- ✅ curl http://tomati.org doit retourner HTTP 200
- ✅ Aucune erreur EADDRINUSE dans les logs
- ✅ Application avec toutes les dernières fonctionnalités

## Fonctionnalités de la nouvelle version

- 🎨 Design plat complet (rouge, noir, blanc)
- 👤 Système de préférences utilisateur
- 📸 Photos dans les conversations
- 🚀 Bouton d'action flottant avec catégories
- ⭐ Système de notation et vues
- 🗺️ Carte interactive intégrée
- 💬 Messagerie temps réel WebSocket
- 🔐 Panel d'administration complet