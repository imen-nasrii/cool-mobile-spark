#!/bin/bash

echo "Correction du fichier ecosystem.config.js..."

cat > /tmp/fix-ecosystem.sh << 'EOF'
#!/bin/bash

echo "=== Correction ecosystem.config.js ==="

cd /home/tomati/tomati-market

# Créer le bon fichier ecosystem.config.cjs (CommonJS)
cat > ecosystem.config.cjs << 'ECOEOF'
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

# Supprimer l'ancien fichier
rm -f ecosystem.config.js

# Créer le répertoire logs
mkdir -p logs

# Démarrer avec PM2
echo "Démarrage avec PM2..."
pm2 start ecosystem.config.cjs

echo "Attente du démarrage..."
sleep 5

echo "Status PM2:"
pm2 status

echo ""
echo "Test port 5000:"
netstat -tlnp | grep :5000

echo ""
echo "Test API:"
curl -s http://localhost:5000/api/stats && echo "✅ API fonctionne" || echo "❌ API ne répond pas"

echo ""
echo "Logs récents:"
pm2 logs tomati-production --lines 10

echo ""
echo "=== Correction terminée ==="
echo "Testez l'accès externe: curl http://51.222.111.183/"
EOF

chmod +x /tmp/fix-ecosystem.sh

echo "Script de correction créé. Commandes à coller:"
echo ""
echo "# Coller ces commandes sur le VPS:"
echo "cat > /tmp/fix-ecosystem.sh << 'FIXEOF'"
cat /tmp/fix-ecosystem.sh
echo "FIXEOF"
echo ""
echo "chmod +x /tmp/fix-ecosystem.sh"
echo "/tmp/fix-ecosystem.sh"