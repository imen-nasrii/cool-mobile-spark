# Correction finale PM2 - Node.js v20

Le problème : `--loader` est déprécié dans Node.js v20, il faut utiliser `--import`.

## Sur votre serveur, exécutez ces commandes :

### 1. Arrêter PM2 actuel
```bash
pm2 delete tomati-market
```

### 2. Créer un nouveau fichier PM2 avec --import
```bash
cat > ecosystem.production.js << 'EOF'
module.exports = {
  apps: [{
    name: 'tomati-market',
    script: 'server/index.ts',
    interpreter: 'node',
    interpreter_args: '--import tsx',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
}
EOF
```

### 3. Ou mieux : utiliser le fichier compilé
```bash
# D'abord compiler le serveur
npm run build

# Créer config PM2 pour le fichier compilé
cat > pm2.production.js << 'EOF'
module.exports = {
  apps: [{
    name: 'tomati-market',
    script: 'dist/index.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true
  }]
}
EOF
```

### 4. Créer le dossier logs
```bash
mkdir -p logs
```

### 5. Démarrer avec PM2
```bash
pm2 start pm2.production.js
pm2 save
```

### 6. Vérifier le statut
```bash
pm2 status
pm2 logs tomati-market --lines 10
```

Si ça fonctionne, continuons avec Nginx. Sinon, testez d'abord manuellement :
```bash
NODE_ENV=production node dist/index.js
```