#!/bin/bash

echo "🔄 Déploiement depuis GitHub sur VPS..."

# Variables
GITHUB_REPO="https://github.com/imen-nasrii/cool-mobile-spark.git"
APP_DIR="/home/tomati/tomati-market"
BACKUP_DIR="/home/tomati/backup-$(date +%Y%m%d_%H%M%S)"

# Arrêter l'application
echo "⏹️ Arrêt de l'application..."
pm2 stop tomati-production

# Créer une sauvegarde
echo "💾 Création sauvegarde..."
cp -r $APP_DIR $BACKUP_DIR

# Aller dans le répertoire de l'application
cd $APP_DIR

# Sauvegarder les variables d'environnement
cp .env .env.backup 2>/dev/null || echo "Pas de .env existant"

# Récupérer les dernières modifications depuis GitHub
echo "📥 Récupération depuis GitHub..."
git fetch origin
git reset --hard origin/main

# Restaurer les variables d'environnement si elles existent
if [ -f .env.backup ]; then
    cp .env.backup .env
    echo "✅ Variables d'environnement restaurées"
fi

# Vérifier si .env existe, sinon le créer
if [ ! -f .env ]; then
    echo "📝 Création du fichier .env..."
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

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install --production

# MIGRATION CRITIQUE - Appliquer les nouvelles colonnes DB
echo "🗄️ Migration de la base de données..."
npm run db:push

# Build de l'application
echo "🔨 Build de l'application..."
npm run build

# Redémarrer avec PM2
echo "🚀 Redémarrage de l'application..."
pm2 restart tomati-production

# Vérifications
echo "✅ Vérifications..."
sleep 3
pm2 status
echo ""
echo "📊 Logs récents:"
pm2 logs tomati-production --lines 10

# Tests API
echo ""
echo "🧪 Tests API:"
echo "Stats API:"
curl -s http://localhost:5000/api/stats | head -100
echo ""
echo "Products API:"
curl -s http://localhost:5000/api/products | head -200

echo ""
echo "✅ Déploiement terminé!"
echo "🌐 Application disponible sur: http://51.222.111.183"
