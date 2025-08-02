#!/bin/bash

# Correction de l'application existante dans /home/tomati/tomati-market
# Résolution des erreurs de connexion base de données port 443

echo "🔧 Correction application Tomati Market existante"
echo "Répertoire: /home/tomati/tomati-market"

APP_DIR="/home/tomati/tomati-market"
USER="tomati"

# Vérifier que nous sommes dans le bon répertoire
if [ ! -d "$APP_DIR" ]; then
    echo "❌ Répertoire $APP_DIR non trouvé"
    exit 1
fi

cd $APP_DIR

echo "📋 État actuel:"
echo "- Répertoire: $(pwd)"
echo "- Utilisateur: $(whoami)"

# Arrêter l'application
echo "⏹️ Arrêt application..."
pm2 stop tomati-production 2>/dev/null || true

# Sauvegarder ancien .env
echo "💾 Sauvegarde configuration..."
cp .env .env.backup-$(date +%Y%m%d-%H%M%S) 2>/dev/null || true

# Créer nouveau fichier .env corrigé
echo "📝 Correction fichier .env..."
cat > .env << 'EOF'
# Configuration PostgreSQL locale - CORRIGÉE pour éviter port 443
DATABASE_URL=postgresql://tomati:tomati123@localhost:5432/tomati_db
PGUSER=tomati
PGPASSWORD=tomati123
PGDATABASE=tomati_db
PGHOST=localhost
PGPORT=5432

# Configuration application
NODE_ENV=production
PORT=5000
JWT_SECRET=tomati-jwt-secret-production-2025
SESSION_SECRET=tomati-session-secret-production-2025

# Désactiver Replit Auth (cause des erreurs port 443)
# REPL_ID=
# REPLIT_DOMAINS=
# ISSUER_URL=
EOF

echo "✅ Nouveau fichier .env créé"

# Test connexion base de données
echo "🗄️ Test connexion base de données..."
if psql -h localhost -U tomati -d tomati_db -c "SELECT version();" >/dev/null 2>&1; then
    echo "✅ Connexion PostgreSQL OK"
else
    echo "⚠️ Problème connexion PostgreSQL - configuration requise"
fi

# Mise à jour dépendances si nécessaire
echo "📦 Vérification dépendances..."
npm install

# Migration base de données
echo "📊 Migration base de données..."
npm run db:push || echo "⚠️ Migration échouée, mais on continue"

# Redémarrer application
echo "🚀 Redémarrage application..."
pm2 restart tomati-production || pm2 start ecosystem.config.cjs

echo "⏳ Attente démarrage (10 secondes)..."
sleep 10

# Vérification
echo "📊 Vérification état:"
pm2 status

echo "📝 Logs récents:"
pm2 logs tomati-production --lines 5 --nostream

echo "🌐 Test application:"
curl -s -o /dev/null -w "Code HTTP: %{http_code}\n" http://localhost:5000/

echo ""
echo "✅ Correction terminée !"
echo "🌐 Testez votre application: http://51.222.111.183"
echo "📋 Commandes utiles:"
echo "   - Statut: pm2 status"
echo "   - Logs: pm2 logs tomati-production"
echo "   - Redémarrage: pm2 restart tomati-production"