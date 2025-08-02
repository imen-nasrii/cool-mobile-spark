#!/bin/bash

# Correction finale base de données VPS OVH
# Problème: base s'appelle tomati_market au lieu de tomati_db

echo "🔧 Correction finale base de données"
echo "VPS: 51.222.111.183"

# Créer la bonne base de données avec postgres
echo "📊 Création base tomati_db..."
sudo -u postgres psql << 'EOSQL'
-- Créer la base tomati_db que l'app attend
CREATE DATABASE tomati_db OWNER tomati;
GRANT ALL PRIVILEGES ON DATABASE tomati_db TO tomati;

-- Vérifier
\l

-- Sortir
\q
EOSQL

echo "✅ Base tomati_db créée"

# Corriger le fichier .env avec la bonne base
echo "📝 Correction .env avec bonne base..."
cat > .env << 'EOF'
# Configuration VPS OVH - Base corrigée
DATABASE_URL=postgresql://tomati:tomati123@localhost:5432/tomati_db
PGUSER=tomati
PGPASSWORD=tomati123
PGDATABASE=tomati_db
PGHOST=localhost
PGPORT=5432

# Application
NODE_ENV=production
PORT=5000
JWT_SECRET=tomati-ovh-jwt-secret-2025
SESSION_SECRET=tomati-ovh-session-secret-2025

# VPS Configuration
VPS_MODE=true
PUBLIC_IP=51.222.111.183
EOF

# Test connexion
echo "🔍 Test connexion base tomati_db..."
if psql -h localhost -U tomati -d tomati_db -c "SELECT 'Connection OK' as status;" >/dev/null 2>&1; then
    echo "✅ Connexion tomati_db OK"
else
    echo "⚠️ Problème connexion tomati_db"
fi

# Migration
echo "📊 Migration schéma..."
npm run db:push

# Redémarrage
echo "🚀 Redémarrage application..."
pm2 restart tomati-production

echo "⏳ Attente 10 secondes..."
sleep 10

# Tests finaux
echo "✅ Tests finaux:"
echo "1. Status PM2:"
pm2 status

echo -e "\n2. Test API products:"
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:5000/api/products

echo -e "\n3. Test API promoted:"
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:5000/api/products/promoted

echo -e "\n4. Test VPS public:"
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://51.222.111.183/

echo -e "\n5. Logs récents:"
pm2 logs tomati-production --lines 5 --nostream

echo ""
echo "🎉 CORRECTION TERMINÉE !"
echo "🌐 Application: http://51.222.111.183"
echo "🔧 Admin: http://51.222.111.183/admin"