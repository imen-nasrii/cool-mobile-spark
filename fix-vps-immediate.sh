#!/bin/bash

# Correction immédiate du problème port 443 sur VPS OVH
# Erreur: connect ECONNREFUSED 127.0.0.1:443

echo "🔧 Correction immédiate - Erreur port 443"
echo "VPS: 51.222.111.183"

# Arrêter l'application
echo "⏹️ Arrêt application..."
pm2 stop tomati-production

# Créer fichier .env correct (sans variables Replit qui causent port 443)
echo "📝 Création fichier .env corrigé..."
cat > .env << 'EOF'
# Configuration VPS OVH - Sans Replit Auth
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

# IMPORTANT: Variables Replit DÉSACTIVÉES (causent erreur port 443)
# REPL_ID=
# REPLIT_DOMAINS=
# ISSUER_URL=
EOF

# Forcer migration
echo "📊 Migration base de données..."
npm run db:push

# Redémarrer
echo "🚀 Redémarrage..."
pm2 start tomati-production

echo "⏳ Attente démarrage (10 secondes)..."
sleep 10

# Tests
echo "✅ Vérifications:"
echo "Status PM2:"
pm2 status

echo -e "\nTest API promoted:"
curl -s http://localhost:5000/api/products/promoted || echo "Échec test promoted"

echo -e "\nTest application:"
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:5000/

echo -e "\nLogs récents:"
pm2 logs tomati-production --lines 5 --nostream

echo ""
echo "🎯 Si plus d'erreurs 127.0.0.1:443, le problème est résolu !"
echo "🌐 Testez: http://51.222.111.183"