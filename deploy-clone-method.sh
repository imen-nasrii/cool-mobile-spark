#!/bin/bash

# Déploiement par clonage Git - Méthode alternative
echo "🚀 Déploiement par clonage Git..."

cat > vps-clone-deploy.sh << 'EOF'
#!/bin/bash

echo "🔄 Déploiement par clonage depuis GitHub..."

# Variables
GITHUB_REPO="https://github.com/imen-nasrii/cool-mobile-spark.git"
APP_DIR="/home/tomati/tomati-market"
NEW_DIR="/home/tomati/tomati-market-new"
BACKUP_DIR="/home/tomati/backup-$(date +%Y%m%d_%H%M%S)"

# Arrêter l'application
echo "⏹️ Arrêt de l'application..."
pm2 stop tomati-production

# Sauvegarder l'ancienne version
echo "💾 Sauvegarde..."
if [ -d "$APP_DIR" ]; then
    cp -r "$APP_DIR" "$BACKUP_DIR"
    echo "✅ Sauvegarde créée : $BACKUP_DIR"
fi

# Sauvegarder .env si existe
if [ -f "$APP_DIR/.env" ]; then
    cp "$APP_DIR/.env" "/tmp/.env.backup"
    echo "✅ .env sauvegardé"
fi

# Cloner le nouveau code
echo "📥 Clonage depuis GitHub..."
rm -rf "$NEW_DIR"
git clone "$GITHUB_REPO" "$NEW_DIR"

if [ $? -ne 0 ]; then
    echo "❌ Échec du clonage Git"
    exit 1
fi

# Remplacer l'ancien répertoire
echo "🔄 Remplacement du code..."
rm -rf "$APP_DIR"
mv "$NEW_DIR" "$APP_DIR"
cd "$APP_DIR"

# Restaurer .env
if [ -f "/tmp/.env.backup" ]; then
    cp "/tmp/.env.backup" "$APP_DIR/.env"
    echo "✅ .env restauré"
else
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

# Installation
echo "📦 Installation dépendances..."
npm install --production

# Migration DB critique
echo "🗄️ Migration base de données..."
npm run db:push

# Build
echo "🔨 Build application..."
npm run build

# Redémarrer avec PM2
echo "🚀 Redémarrage PM2..."
pm2 restart tomati-production || pm2 start ecosystem.config.js

# Vérifications
echo "✅ Vérifications finales..."
sleep 5
pm2 status

echo ""
echo "📊 Logs PM2:"
pm2 logs tomati-production --lines 10

echo ""
echo "🧪 Tests API:"
echo "Products API:"
curl -s http://localhost:5000/api/products | head -100
echo ""
echo "Stats API:"
curl -s http://localhost:5000/api/stats

echo ""
echo "✅ Déploiement par clonage terminé!"
echo "🌐 Application disponible: http://51.222.111.183"
echo ""
echo "🎯 Nouvelles fonctionnalités déployées:"
echo "  - Layout horizontal des produits"
echo "  - Police Arial globale"
echo "  - ErrorBoundary pour gestion d'erreurs"
echo "  - Messages d'erreur en français"
echo "  - Retry automatique des API"
echo "  - Migration DB automatique"

EOF

chmod +x vps-clone-deploy.sh

echo "✅ Script de clonage créé : vps-clone-deploy.sh"
echo ""
echo "📋 Étapes de déploiement par clonage:"
echo ""
echo "1. Push vers GitHub (si pas fait):"
echo "   git add ."
echo "   git commit -m 'Fix Unknown Error and add horizontal layout'"
echo "   git push origin main"
echo ""
echo "2. Copier script sur VPS:"
echo "   scp vps-clone-deploy.sh ubuntu@51.222.111.183:/tmp/"
echo ""
echo "3. Exécuter sur VPS:"
echo "   ssh ubuntu@51.222.111.183"
echo "   sudo su - tomati"
echo "   chmod +x /tmp/vps-clone-deploy.sh"
echo "   /tmp/vps-clone-deploy.sh"
echo ""
echo "4. Vérifier:"
echo "   curl http://51.222.111.183/"
echo ""
echo "🎉 Avantages du clonage:"
echo "  - Code 100% frais depuis GitHub"
echo "  - Aucun conflit Git"
echo "  - Sauvegarde automatique"
echo "  - Rollback possible"