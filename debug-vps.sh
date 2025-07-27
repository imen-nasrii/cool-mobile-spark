#!/bin/bash

echo "Script de diagnostic et correction pour VPS"

cat > fix-vps-deployment.sh << 'EOF'
#!/bin/bash

echo "=== Diagnostic et correction du déploiement ==="

# Vérifier les logs PM2
echo "1. Logs PM2 actuels:"
pm2 logs tomati-production --lines 10

echo ""
echo "2. Vérification de l'ecosystem.config.js:"
cd /home/tomati/tomati-market
if [ ! -f ecosystem.config.js ]; then
    echo "Création ecosystem.config.js manquant..."
    cat > ecosystem.config.js << 'ECOEOF'
module.exports = {
  apps: [{
    name: 'tomati-production',
    script: 'dist/index.js',
    cwd: '/home/tomati/tomati-market',
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
ECOEOF
    echo "✅ ecosystem.config.js créé"
fi

echo ""
echo "3. Vérification du build:"
if [ ! -d dist ]; then
    echo "Build manquant, reconstruction..."
    npm run build
fi

echo ""
echo "4. Vérification du fichier dist/index.js:"
if [ ! -f dist/index.js ]; then
    echo "ERREUR: dist/index.js manquant!"
    echo "Tentative de rebuild..."
    npm run build
fi

echo ""
echo "5. Création du répertoire logs:"
mkdir -p logs

echo ""
echo "6. Redémarrage complet de PM2:"
pm2 stop tomati-production
pm2 delete tomati-production
pm2 start ecosystem.config.js

echo ""
echo "7. Attente du démarrage..."
sleep 5

echo ""
echo "8. Vérification finale:"
pm2 status
echo ""
echo "9. Test des ports:"
netstat -tlnp | grep :5000 || echo "Port 5000 non occupé"

echo ""
echo "10. Logs récents:"
pm2 logs tomati-production --lines 5

echo ""
echo "11. Test API final:"
sleep 2
curl -s http://localhost:5000/api/stats || echo "API stats inaccessible"

echo ""
echo "=== Diagnostic terminé ==="
echo "Si l'API ne répond toujours pas, vérifiez les logs avec:"
echo "pm2 logs tomati-production --lines 20"
EOF

chmod +x fix-vps-deployment.sh

echo "Script de diagnostic créé. Commandes à coller sur le VPS:"
echo ""
echo "# Coller ces commandes sur le VPS:"
echo "cat > /tmp/fix-deployment.sh << 'FIXEOF'"
cat fix-vps-deployment.sh
echo "FIXEOF"
echo ""
echo "chmod +x /tmp/fix-deployment.sh"
echo "/tmp/fix-deployment.sh"