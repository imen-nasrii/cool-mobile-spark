# Étapes Finales - Déploiement Tomati Market

## Situation actuelle :
- Application fonctionne manuellement : ✅ `DATABASE_URL="..." node dist/index.js`
- PM2 ne démarre pas l'application correctement : ❌ logs vides
- Nginx configuré et prêt : ✅

## Solution immédiate :

```bash
# Sur le serveur, en tant qu'utilisateur tomati

# 1. Créer un script propre (sans erreurs de formatage)
cat > /home/tomati/tomati-market/start-app.sh << 'EOF'
#!/bin/bash
cd /home/tomati/tomati-market
export NODE_ENV=production
export PORT=5000
export DATABASE_URL=postgresql://tomati:Tomati123@localhost:5432/tomati_market
node dist/index.js
EOF

chmod +x /home/tomati/tomati-market/start-app.sh

# 2. Tester le script directement
/home/tomati/tomati-market/start-app.sh

# Si ça marche (Ctrl+C pour arrêter), configurer PM2 :

# 3. Configuration PM2 simple
cat > /home/tomati/tomati-market/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'tomati-production',
    script: '/home/tomati/tomati-market/start-app.sh',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false
  }]
}
EOF

# 4. Démarrer avec PM2
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
pm2 logs tomati-production --lines 10

# 5. Test final
curl http://localhost:5000
exit
curl http://51.222.111.183
```

## Une fois que ça marche :
1. Configuration DNS : tomati.org → 51.222.111.183
2. Certificat SSL avec Let's Encrypt
3. Site accessible sur https://tomati.org