#!/bin/bash

# Test de connexion base de données VPS
echo "🔍 Test connexion PostgreSQL tomati_db"

echo "Test 1: Connexion avec psql"
if psql -h localhost -U tomati -d tomati_db -c "SELECT 'Connection OK' as status;" 2>/dev/null; then
    echo "✅ Connexion psql OK"
else
    echo "❌ Échec connexion psql"
fi

echo ""
echo "Test 2: Variables environnement"
echo "DATABASE_URL: $DATABASE_URL"
echo ""

echo "Test 3: Test avec curl localhost"
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:5000/api/products

echo ""
echo "Test 4: Test VPS public"
curl -s -o /dev/null -w "Status: %{http_code}\n" http://51.222.111.183/

echo ""
echo "Test 5: Status PM2"
pm2 status

echo ""
echo "Test 6: Logs récents"
pm2 logs tomati-production --lines 3 --nostream