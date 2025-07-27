# Correction PM2 - Création du Fichier de Configuration

## Situation
- ✅ Build réussi (application construite)
- ✅ Base de données à jour (no changes detected)
- ❌ ecosystem.config.js manquant

## Commandes à Exécuter

### Étape 1: Créer le fichier ecosystem.config.js
```bash
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'tomati-production',
    script: 'dist/index.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'development',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000,
      DATABASE_URL: 'postgresql://tomati:Tomati123@localhost:5432/tomati_market'
    },
    error_file: '/tmp/tomati-error.log',
    out_file: '/tmp/tomati-out.log',
    log_file: '/tmp/tomati-combined.log',
    time: true,
    watch: false,
    max_memory_restart: '500M',
    min_uptime: '10s',
    max_restarts: 5
  }]
}
EOF
```

### Étape 2: Vérifier que le fichier existe
```bash
ls -la ecosystem.config.js
```

### Étape 3: Démarrer l'application
```bash
pm2 start ecosystem.config.js --env production
```

### Étape 4: Vérifier le statut
```bash
pm2 status
```

### Étape 5: Consulter les logs
```bash
pm2 logs tomati-production --lines 10
```

### Étape 6: Tester l'application
```bash
curl http://localhost:5000
```

### Étape 7: Test externe
```bash
exit
curl http://51.222.111.183
```

## Alternative si problème
Si PM2 ne démarre pas, utilisez directement Node.js :
```bash
NODE_ENV=production PORT=5000 node dist/index.js &
```