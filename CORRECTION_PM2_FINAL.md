# Correction PM2 - Application ne répond pas

## Problème identifié :
- PM2 tourne avec le nom `pm2.production` 
- L'application ne répond pas sur le port 5000
- Connexion refusée sur localhost:5000

## Commandes de correction :

```bash
# 1. Voir les logs de l'application PM2
pm2 logs pm2.production --lines 20

# 2. Redémarrer l'application
pm2 restart pm2.production

# 3. Si ça ne fonctionne pas, supprimer et recréer
pm2 delete pm2.production

# 4. Recréer avec la bonne configuration
cat > start-app.js << 'EOF'
module.exports = {
  apps: [{
    name: 'tomati-market',
    script: 'dist/index.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
}
EOF

# 5. Démarrer avec la nouvelle config
pm2 start start-app.js
pm2 save

# 6. Vérifier le statut
pm2 status
pm2 logs tomati-market --lines 5
```

## Test de l'application :
```bash
# Vérifier que le port écoute
netstat -tlnp | grep :5000

# Tester la connexion
curl http://localhost:5000
```