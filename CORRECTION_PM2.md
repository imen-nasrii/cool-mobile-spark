# Correction PM2 pour Hamdi

## Problème identifié
L'application fonctionne (curl répond correctement) mais PM2 n'a pas démarré le processus `tomati-hamdi` correctement.

## Commandes de correction à exécuter

```bash
# 1. Se connecter en tant que hamdi
sudo su - hamdi
cd cool-mobile-spark

# 2. Arrêter tous les processus PM2
pm2 delete all

# 3. Redémarrer avec la bonne configuration
pm2 start server/index.ts --name tomati-hamdi --interpreter node --interpreter-args "--loader tsx/esm"

# 4. Vérifier le statut
pm2 status

# 5. Voir les logs
pm2 logs tomati-hamdi

# 6. Sauvegarder la configuration
pm2 save

# 7. Configurer le démarrage automatique
sudo env PATH=$PATH:/home/hamdi/.nvm/versions/node/v22.18.0/bin /home/hamdi/.nvm/versions/node/v22.18.0/lib/node_modules/pm2/bin/pm2 startup systemd -u hamdi --hp /home/hamdi
```

## Alternative avec ecosystem.config.cjs

```bash
# Créer un fichier de configuration PM2
cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'tomati-hamdi',
    script: 'server/index.ts',
    interpreter: 'node',
    interpreter_args: '--loader tsx/esm',
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

# Créer le dossier logs
mkdir -p logs

# Démarrer avec le fichier de configuration
pm2 start ecosystem.config.cjs

# Vérifier
pm2 status
pm2 logs tomati-hamdi
```

## Test final
```bash
# Test de l'application
curl http://localhost:5000

# Status PM2
pm2 status

# Logs en temps réel
pm2 logs tomati-hamdi --lines 10
```