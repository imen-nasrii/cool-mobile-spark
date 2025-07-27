#!/bin/bash

echo "Correction des variables d'environnement DATABASE_URL..."

cat > /tmp/fix-env.sh << 'EOF'
#!/bin/bash

echo "=== Correction variables d'environnement ==="

cd /home/tomati/tomati-market

# Arrêter PM2
pm2 stop tomati-production

# Vérifier si .env existe
echo "1. Vérification du fichier .env:"
if [ -f .env ]; then
    echo "✅ .env existe"
    cat .env
else
    echo "❌ .env manquant, création..."
fi

# Recréer .env avec toutes les variables
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

echo ""
echo "2. Contenu du .env créé:"
cat .env

echo ""
echo "3. Test de connexion PostgreSQL:"
psql postgresql://tomati:Tomati123@localhost:5432/tomati_market -c "SELECT 1;" 2>/dev/null && echo "✅ DB accessible" || echo "❌ DB inaccessible"

echo ""
echo "4. Migration DB (au cas où):"
npm run db:push

echo ""
echo "5. Mise à jour ecosystem.config.cjs avec env_file:"
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
    env_file: './.env',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
      DATABASE_URL: 'postgresql://tomati:Tomati123@localhost:5432/tomati_market'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
ECOEOF

echo ""
echo "6. Redémarrage PM2:"
pm2 restart tomati-production

echo ""
echo "7. Attente du démarrage..."
sleep 5

echo ""
echo "8. Status PM2:"
pm2 status

echo ""
echo "9. Test port 5000:"
netstat -tlnp | grep :5000

echo ""
echo "10. Test API:"
curl -s http://localhost:5000/api/stats && echo "✅ API fonctionne" || echo "❌ API ne répond pas"

echo ""
echo "11. Logs récents:"
pm2 logs tomati-production --lines 5

echo ""
echo "=== Correction terminée ==="
echo "Si API fonctionne, testez: curl http://51.222.111.183/"
EOF

chmod +x /tmp/fix-env.sh

echo "Script de correction DATABASE_URL créé. Commandes à coller:"
echo ""
echo "# Coller ces commandes sur le VPS:"
echo "cat > /tmp/fix-env.sh << 'ENVEOF'"
cat /tmp/fix-env.sh
echo "ENVEOF"
echo ""
echo "chmod +x /tmp/fix-env.sh"
echo "/tmp/fix-env.sh"