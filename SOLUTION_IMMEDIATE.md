# Solution Immédiate - Configuration PM2 Corrigée

## Sur votre serveur, exécutez ces commandes :

```bash
# 1. Supprimer l'instance PM2 défaillante
pm2 delete pm2.production

# 2. Créer un fichier .cjs (CommonJS)
cat > start-tomati.cjs << 'EOF'
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

# 3. Démarrer avec la nouvelle configuration
pm2 start start-tomati.cjs
pm2 save

# 4. Vérifier le statut
pm2 status
pm2 logs tomati-market --lines 5

# 5. Tester la connexion
curl http://localhost:5000

# 6. Retourner à ubuntu pour tester Nginx
exit
curl http://51.222.111.183
```

Cette solution utilise l'extension `.cjs` qui force l'utilisation de CommonJS, éliminant l'erreur de module ES.