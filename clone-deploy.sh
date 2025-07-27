#!/bin/bash

# Script de clonage simple pour VPS
cat > clone-simple.sh << 'EOF'
#!/bin/bash

echo "Arrêt application..."
pm2 stop tomati-production

echo "Sauvegarde..."
cp -r /home/tomati/tomati-market /home/tomati/backup-$(date +%H%M%S)

echo "Clonage GitHub..."
rm -rf /home/tomati/tomati-market-new
git clone https://github.com/imen-nasrii/cool-mobile-spark.git /home/tomati/tomati-market-new

echo "Remplacement code..."
rm -rf /home/tomati/tomati-market
mv /home/tomati/tomati-market-new /home/tomati/tomati-market

echo "Configuration..."
cd /home/tomati/tomati-market
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

echo "Installation..."
npm install --production

echo "Migration DB..."
npm run db:push

echo "Build..."
npm run build

echo "Redémarrage..."
pm2 restart tomati-production

echo "Tests..."
sleep 3
pm2 status
curl -s http://localhost:5000/api/stats

echo "Terminé! App disponible: http://51.222.111.183"
EOF

chmod +x clone-simple.sh
echo "Script créé: clone-simple.sh"