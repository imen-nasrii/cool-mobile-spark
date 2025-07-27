# Solution finale PM2 - Déploiement réussi

## Problème identifié :
L'application fonctionne manuellement mais PM2 ne charge pas les variables d'environnement correctement.

## Solution - Script de démarrage :

```bash
# 1. Créer un script de démarrage simple
cat > start.sh << 'EOF'
#!/bin/bash
cd /home/tomati/tomati-market
export NODE_ENV=production
export PORT=5000
export DATABASE_URL="postgresql://tomati:Tomati123@localhost:5432/tomati_market"
node dist/index.js
EOF

chmod +x start.sh

# 2. Configuration PM2 avec le script
cat > start-script.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'tomati-market',
    script: '/home/tomati/tomati-market/start.sh',
    cwd: '/home/tomati/tomati-market',
    instances: 1,
    exec_mode: 'fork'
  }]
}
EOF

# 3. Démarrer PM2 avec le script
pm2 delete all
pm2 start start-script.cjs
pm2 save
pm2 logs tomati-market --lines 5

# 4. Tester la connexion
curl http://localhost:5000

# 5. Si ça marche, tester Nginx
exit
curl http://51.222.111.183
```

Cette approche utilise un script bash qui exporte explicitement les variables d'environnement avant de lancer Node.js.