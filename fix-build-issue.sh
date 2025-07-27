#!/bin/bash

echo "Correction du problème de build manquant..."

cat > /tmp/fix-build-complete.sh << 'EOF'
#!/bin/bash

echo "=== Correction du build manquant ==="

cd /home/tomati/tomati-market

echo "1. Arrêt complet de PM2:"
pm2 stop tomati-production
pm2 delete tomati-production

echo ""
echo "2. Nettoyage des builds précédents:"
rm -rf dist/
rm -rf node_modules/.vite/

echo ""
echo "3. Réinstallation complète:"
npm install

echo ""
echo "4. Build complet:"
npm run build

echo ""
echo "5. Vérification du build:"
if [ -f dist/index.js ]; then
    echo "✅ Build réussi - dist/index.js existe"
    ls -la dist/
else
    echo "❌ Build échoué - dist/index.js manquant"
    echo "Contenu du répertoire:"
    ls -la
    exit 1
fi

echo ""
echo "6. Création ecosystem.config.js correct:"
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

echo ""
echo "7. Création du répertoire logs:"
mkdir -p logs

echo ""
echo "8. Démarrage avec PM2:"
pm2 start ecosystem.config.js

echo ""
echo "9. Attente du démarrage..."
sleep 5

echo ""
echo "10. Vérification finale:"
pm2 status
echo ""
echo "Port 5000:"
netstat -tlnp | grep :5000

echo ""
echo "11. Test API:"
curl -s http://localhost:5000/api/stats && echo "✅ API fonctionne" || echo "❌ API ne répond pas"

echo ""
echo "12. Logs récents:"
pm2 logs tomati-production --lines 5

echo ""
echo "=== Correction terminée ==="
echo "Si tout fonctionne, testez l'accès externe:"
echo "curl http://51.222.111.183/"
EOF

chmod +x /tmp/fix-build-complete.sh

echo "Script de correction du build créé. Commandes à coller:"
echo ""
echo "# Coller ces commandes sur le VPS:"
echo "cat > /tmp/fix-build-complete.sh << 'BUILDEOF'"
cat /tmp/fix-build-complete.sh
echo "BUILDEOF"
echo ""
echo "chmod +x /tmp/fix-build-complete.sh"
echo "/tmp/fix-build-complete.sh"