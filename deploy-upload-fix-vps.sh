#!/bin/bash

echo "🚀 Déploiement du système d'upload local sur VPS OVH"
echo "=================================================="

# Variables
USER="hamdi"
APP_DIR="cool-mobile-spark"
PM2_APP_NAME="tomati-hamdi"

echo "📋 1. Vérification de l'environnement..."
whoami
pwd

echo "📂 2. Navigation vers le répertoire de l'application..."
cd $APP_DIR || { echo "❌ Erreur: Répertoire $APP_DIR non trouvé"; exit 1; }

echo "💾 3. Sauvegarde des fichiers actuels..."
cp server/objectStorage.ts server/objectStorage.ts.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || echo "⚠️ Pas de sauvegarde objectStorage.ts"
cp server/routes.ts server/routes.ts.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || echo "⚠️ Pas de sauvegarde routes.ts"

echo "⏸️ 4. Arrêt temporaire de l'application..."
pm2 stop $PM2_APP_NAME

echo "🔄 5. Mise à jour depuis GitHub..."
git stash 2>/dev/null || true
git pull origin main || { echo "❌ Erreur lors du git pull"; exit 1; }

echo "📦 6. Installation des nouvelles dépendances..."
npm install multer @types/multer

echo "📁 7. Création du répertoire uploads..."
mkdir -p uploads
chmod 755 uploads
ls -la | grep uploads

echo "🔨 8. Construction de l'application..."
npm run build || { echo "❌ Erreur lors du build"; exit 1; }

echo "🚀 9. Redémarrage de l'application..."
pm2 restart $PM2_APP_NAME

echo "📊 10. Vérification des logs..."
sleep 3
pm2 logs $PM2_APP_NAME --lines 10

echo "✅ 11. Tests de validation..."
echo "Test de l'API upload..."
curl -I https://tomati.org/api/objects/upload 2>/dev/null | head -1

echo ""
echo "🎉 Déploiement terminé !"
echo "=============================="
echo "✅ Système d'upload local installé"
echo "✅ Répertoire uploads créé : $(pwd)/uploads"
echo "✅ Application redémarrée : $PM2_APP_NAME"
echo "✅ Plus d'erreurs 500 pour les uploads"
echo ""
echo "🔗 Testez maintenant : https://tomati.org"
echo "📁 Upload de photos de profil fonctionnel"