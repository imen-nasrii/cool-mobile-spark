#!/bin/bash

echo "Correction finale des variables d'environnement..."

cat > /tmp/final-fix.sh << 'EOF'
#!/bin/bash

echo "=== Correction finale DATABASE_URL ==="

cd /home/tomati/tomati-market

# Arrêter et supprimer PM2
pm2 stop tomati-production
pm2 delete tomati-production

# Forcer la création du .env
echo "1. Création forcée du .env:"
cat > .env << 'ENVEOF'
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://tomati:Tomati123@localhost:5432/tomati_market
PGHOST=localhost
PGPORT=5432
PGUSER=tomati
PGPASSWORD=Tomati123
PGDATABASE=tomati_market
ENVEOF

# Vérifier le .env
echo "2. Vérification .env:"
ls -la .env
cat .env

# Migration DB depuis le bon répertoire
echo ""
echo "3. Migration DB:"
npm run db:push

# Créer ecosystem avec variables directes
echo ""
echo "4. Configuration PM2 avec variables intégrées:"
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
      PORT: '5000',
      DATABASE_URL: 'postgresql://tomati:Tomati123@localhost:5432/tomati_market',
      PGHOST: 'localhost',
      PGPORT: '5432',
      PGUSER: 'tomati',
      PGPASSWORD: 'Tomati123',
      PGDATABASE: 'tomati_market'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
ECOEOF

# Créer logs
mkdir -p logs

# Démarrer PM2
echo ""
echo "5. Démarrage PM2 avec variables d'environnement:"
pm2 start ecosystem.config.cjs

echo ""
echo "6. Attente 10 secondes..."
sleep 10

echo ""
echo "7. Status final:"
pm2 status

echo ""
echo "8. Test port:"
netstat -tlnp | grep :5000

echo ""
echo "9. Test API final:"
curl -s http://localhost:5000/api/stats && echo "✅ API FONCTIONNE!" || echo "❌ API ne répond toujours pas"

echo ""
echo "10. Logs détaillés si erreur:"
pm2 logs tomati-production --lines 10

echo ""
echo "=== Si API fonctionne, testez l'accès externe ==="
echo "curl http://51.222.111.183/"
echo "Ouvrir navigateur: http://51.222.111.183"
EOF

chmod +x /tmp/final-fix.sh

echo "Script de correction finale créé. Commandes à coller:"
echo ""
echo "# Coller ce bloc sur le VPS:"
echo "cat > /tmp/final-fix.sh << 'FINALEOF'"
cat /tmp/final-fix.sh
echo "FINALEOF"
echo ""
echo "chmod +x /tmp/final-fix.sh"
echo "/tmp/final-fix.sh"