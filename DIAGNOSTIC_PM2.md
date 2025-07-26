# Diagnostic PM2 - Application en erreur

L'application PM2 est en erreur (status: errored, 15 restarts).

## Sur votre serveur, exécutez ces commandes pour diagnostiquer :

### 1. Voir les logs d'erreur
```bash
pm2 logs tomati-market --lines 20
```

### 2. Si les logs ne sont pas clairs, essayons de démarrer manuellement
```bash
# Arrêter PM2
pm2 delete tomati-market

# Tester le démarrage manuel
NODE_ENV=production tsx server/index.ts
```

### 3. Si ça ne fonctionne pas, essayons avec Node directement
```bash
# Compiler d'abord
npm run build

# Démarrer le fichier compilé
NODE_ENV=production node dist/index.js
```

### 4. Alternative : Démarrage simple sans cluster
```bash
# Créer un fichier PM2 plus simple
cat > pm2.config.js << 'EOF'
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

# Redémarrer avec cette config
pm2 start pm2.config.js
```

Commencez par `pm2 logs tomati-market --lines 20` et montrez-moi le résultat pour identifier le problème exact.