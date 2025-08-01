#!/bin/bash

# Script de déploiement final avec corrections d'erreurs
echo "🚀 Déploiement version finale avec ErrorBoundary..."

# Créer l'archive avec toutes les corrections
tar -czf tomati-latest-20250727_$(date +%H%M%S).tar.gz \
  client/src/components/Products/ProductListCard.tsx \
  client/src/components/Products/ProductGrid.tsx \
  client/src/components/ErrorBoundary.tsx \
  client/src/App.tsx \
  client/src/index.css \
  client/src/pages/ProductDetail.tsx \
  shared/schema.ts \
  package.json \
  --exclude-vcs

echo "📦 Archive créée : tomati-latest-20250727_$(date +%H%M%S).tar.gz"

# Script de déploiement VPS mis à jour
cat > vps-deploy-latest.sh << 'EOF'
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
EOF

chmod +x vps-deploy-latest.sh

echo ""
echo "🎯 Instructions de déploiement GitHub:"
echo ""
echo "# 1. Push vers GitHub (depuis votre machine locale):"
echo "git add ."
echo "git commit -m 'Fix Unknown Error with ErrorBoundary and improved error handling'"
echo "git push origin main"
echo ""
echo "# 2. Déployer sur VPS:"
echo "scp vps-deploy-latest.sh ubuntu@51.222.111.183:/tmp/"
echo "ssh ubuntu@51.222.111.183"
echo "sudo su - tomati"
echo "chmod +x /tmp/vps-deploy-latest.sh"
echo "/tmp/vps-deploy-latest.sh"
echo ""
echo "🎉 Cette version inclut:"
echo "  ✅ Correction erreur 'Unknown Error'"
echo "  ✅ ErrorBoundary global avec messages en français"
echo "  ✅ Layout horizontal des produits"
echo "  ✅ Police Arial partout"
echo "  ✅ Gestion d'erreur robuste avec retry"
echo "  ✅ Migration DB automatique"