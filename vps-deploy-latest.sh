#!/bin/bash

echo "🔄 Déploiement version finale sur VPS..."

# Variables
GITHUB_REPO="https://github.com/imen-nasrii/cool-mobile-spark.git"
APP_DIR="/home/tomati/tomati-market"
BACKUP_DIR="/home/tomati/backup-$(date +%Y%m%d_%H%M%S)"

# Arrêter l'application
echo "⏹️ Arrêt de l'application..."
pm2 stop tomati-production

# Créer une sauvegarde complète
echo "💾 Sauvegarde complète..."
cp -r $APP_DIR $BACKUP_DIR

# Aller dans le répertoire de l'application
cd $APP_DIR

# Sauvegarder .env
cp .env .env.backup 2>/dev/null || echo "Pas de .env existant"

# Récupérer depuis GitHub
echo "📥 Récupération depuis GitHub..."
git fetch origin
git reset --hard origin/main

# Restaurer .env
if [ -f .env.backup ]; then
    cp .env.backup .env
    echo "✅ Variables d'environnement restaurées"
fi

# Créer .env si nécessaire
if [ ! -f .env ]; then
    echo "📝 Création .env..."
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
fi

# Installation et build
echo "📦 Installation dépendances..."
npm install --production

echo "🗄️ Migration base de données CRITIQUE..."
npm run db:push

echo "🔨 Build application..."
npm run build

# Redémarrer PM2
echo "🚀 Redémarrage PM2..."
pm2 restart tomati-production

# Tests et vérifications
echo "✅ Vérifications..."
sleep 5
pm2 status
echo ""
echo "📊 Logs:"
pm2 logs tomati-production --lines 10

echo ""
echo "🧪 Tests API:"
echo "Products:"
curl -s http://localhost:5000/api/products | head -100
echo ""
echo "Stats:"
curl -s http://localhost:5000/api/stats

echo ""
echo "✅ Déploiement version finale terminé!"
echo "🌐 Nouvelles fonctionnalités:"
echo "  - Layout horizontal des produits"
echo "  - Police Arial globale"
echo "  - ErrorBoundary pour erreurs"
echo "  - Gestion d'erreur améliorée"
echo "  - Messages d'erreur en français"
echo ""
echo "📱 Application disponible: http://51.222.111.183"
