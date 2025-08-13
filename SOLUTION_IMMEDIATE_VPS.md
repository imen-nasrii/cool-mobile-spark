# Solution Immédiate - PM2 Hamdi

## Commandes de diagnostic urgent

```bash
# 1. Voir le statut actuel
pm2 status

# 2. Voir les logs d'erreur complets
pm2 logs tomati-hamdi --err --lines 30

# 3. Voir les fichiers de logs
ls -la logs/
cat logs/err.log 2>/dev/null || echo "Fichier err.log introuvable"
cat logs/out.log 2>/dev/null || echo "Fichier out.log introuvable"

# 4. Test direct de l'application pour identifier l'erreur
node --loader tsx/esm server/index.ts
```

## Solution de contournement immédiate

```bash
# Utiliser le fichier JavaScript compilé au lieu de TypeScript
pm2 delete tomati-hamdi

# Nouvelle configuration utilisant dist/index.js
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

# Démarrer avec le fichier compilé
pm2 start ecosystem.config.cjs
pm2 status
pm2 logs tomati-hamdi --lines 10
```

## Si le problème persiste - Configuration minimale

```bash
# Configuration ultra-simple
pm2 delete tomati-hamdi

# Démarrage direct sans fichier de config
pm2 start dist/index.js --name tomati-hamdi --env production

# Vérifier
pm2 status
pm2 logs tomati-hamdi
```

## Dernière solution - Démarrage manuel avec screen

```bash
# Si PM2 continue de crasher, utiliser screen
sudo apt update && sudo apt install -y screen

# Démarrer l'application en arrière-plan avec screen
screen -dmS tomati bash -c 'cd /home/hamdi/cool-mobile-spark && node dist/index.js'

# Vérifier que ça fonctionne
curl http://localhost:5000
screen -list

# Pour voir les logs de screen
screen -r tomati
# (Ctrl+A puis D pour sortir)
```