#!/bin/bash

# Deploy Horizontal Layout to VPS
echo "🚀 Déploiement Layout Horizontal vers VPS..."

# Variables
VPS_IP="51.222.111.183"
VPS_USER="ubuntu"
APP_USER="tomati"
APP_DIR="/home/tomati/tomati-market"

# Créer l'archive avec les dernières modifications
echo "📦 Création de l'archive..."
tar -czf tomati-horizontal-layout.tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=dist \
  --exclude=build \
  --exclude="*.log" \
  --exclude="*.tar.gz" \
  client/src/components/Products/ProductListCard.tsx \
  client/src/components/Products/ProductGrid.tsx \
  client/src/index.css \
  client/src/pages/ProductDetail.tsx \
  package.json \
  server/ \
  shared/ \
  drizzle.config.ts \
  ecosystem.config.js

echo "✅ Archive créée: tomati-horizontal-layout.tar.gz"

# Instructions de déploiement
echo ""
echo "🔧 Commandes à exécuter sur le VPS:"
echo ""
echo "# 1. Copier l'archive sur le VPS"
echo "scp tomati-horizontal-layout.tar.gz ubuntu@$VPS_IP:/tmp/"
echo ""
echo "# 2. Se connecter au VPS et déployer"
echo "ssh ubuntu@$VPS_IP"
echo "sudo su - tomati"
echo "cd ~/tomati-market"
echo ""
echo "# 3. Sauvegarder la version actuelle"
echo "cp -r client/src/components/Products client/src/components/Products.backup"
echo "cp client/src/index.css client/src/index.css.backup"
echo ""
echo "# 4. Extraire les nouvelles modifications"
echo "tar -xzf /tmp/tomati-horizontal-layout.tar.gz -C ."
echo ""
echo "# 5. Reconstruire l'application"
echo "npm run build"
echo ""
echo "# 6. Redémarrer PM2"
echo "pm2 restart tomati-production"
echo ""
echo "# 7. Vérifier le statut"
echo "pm2 status"
echo "pm2 logs tomati-production --lines 10"
echo ""
echo "# 8. Tester l'application"
echo "curl http://localhost:5000/api/products"
echo "exit"
echo "curl http://51.222.111.183/api/products"
echo ""
echo "🎯 Résultat attendu:"
echo "- Interface avec produits en ligne horizontale"
echo "- Police Arial sur tous les éléments"
echo "- Responsive design maintenu"
echo "- Performance optimisée"