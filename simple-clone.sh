#!/bin/bash

# Script simple de clonage pour déploiement VPS
echo "🚀 Création script de clonage simplifié..."

# Script à exécuter directement sur le VPS
cat > vps-simple-clone.sh << 'SCRIPT_EOF'
#!/bin/bash

echo "=== Déploiement par clonage GitHub ==="

# Variables
REPO_URL="https://github.com/imen-nasrii/cool-mobile-spark.git"
APP_DIR="/home/tomati/tomati-market"
BACKUP_DIR="/home/tomati/backup-$(date +%Y%m%d_%H%M%S)"

# 1. Arrêter l'application
echo "1. Arrêt de l'application..."
pm2 stop tomati-production 2>/dev/null || echo "Pas d'application PM2 en cours"

# 2. Sauvegarder l'ancien code
echo "2. Sauvegarde de l'ancien code..."
if [ -d "$APP_DIR" ]; then
    mv "$APP_DIR" "$BACKUP_DIR"
    echo "Sauvegarde créée: $BACKUP_DIR"
fi

# 3. Cloner depuis GitHub
echo "3. Clonage depuis GitHub..."
git clone "$REPO_URL" "$APP_DIR"
if [ $? -ne 0 ]; then
    echo "ERREUR: Échec du clonage Git"
    echo "Restauration de la sauvegarde..."
    mv "$BACKUP_DIR" "$APP_DIR" 2>/dev/null
    exit 1
fi

# 4. Configuration
echo "4. Configuration de l'environnement..."
cd "$APP_DIR"

# Créer le fichier .env
cat > .env << 'ENV_EOF'
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://tomati:Tomati123@localhost:5432/tomati_market
PGHOST=localhost
PGPORT=5432
PGUSER=tomati
PGPASSWORD=Tomati123
PGDATABASE=tomati_market
ENV_EOF

# 5. Installation des dépendances
echo "5. Installation des dépendances..."
npm install --production
if [ $? -ne 0 ]; then
    echo "ERREUR: Échec de l'installation npm"
    exit 1
fi

# 6. Migration de la base de données
echo "6. Migration de la base de données..."
npm run db:push
if [ $? -ne 0 ]; then
    echo "ATTENTION: Migration DB échouée, mais on continue..."
fi

# 7. Build de l'application
echo "7. Build de l'application..."
npm run build
if [ $? -ne 0 ]; then
    echo "ERREUR: Échec du build"
    exit 1
fi

# 8. Démarrage/Redémarrage PM2
echo "8. Démarrage de l'application avec PM2..."
pm2 restart tomati-production 2>/dev/null || pm2 start ecosystem.config.js --name tomati-production

# 9. Vérifications
echo "9. Vérifications..."
sleep 3
echo "Status PM2:"
pm2 status

echo ""
echo "Test API Stats:"
curl -s http://localhost:5000/api/stats 2>/dev/null || echo "API pas encore prête"

echo ""
echo "=== DÉPLOIEMENT TERMINÉ ==="
echo "Application disponible sur: http://51.222.111.183"
echo "Nouvelles fonctionnalités déployées:"
echo "- Layout horizontal des produits"
echo "- Police Arial globale"
echo "- ErrorBoundary pour gestion d'erreurs"
echo "- Gestion d'erreur robuste avec retry"
echo ""
echo "Sauvegarde de l'ancienne version: $BACKUP_DIR"
SCRIPT_EOF

# Rendre le script exécutable
chmod +x vps-simple-clone.sh

echo ""
echo "✅ Script de clonage créé: vps-simple-clone.sh"
echo ""
echo "📋 COMMANDES À EXÉCUTER:"
echo ""
echo "1. Copier le script sur le VPS:"
echo "   scp vps-simple-clone.sh ubuntu@51.222.111.183:/tmp/"
echo ""
echo "2. Se connecter et exécuter:"
echo "   ssh ubuntu@51.222.111.183"
echo "   sudo su - tomati"
echo "   chmod +x /tmp/vps-simple-clone.sh"
echo "   /tmp/vps-simple-clone.sh"
echo ""
echo "3. Vérifier le résultat:"
echo "   pm2 status"
echo "   curl http://localhost:5000/api/stats"
echo "   exit"
echo "   curl http://51.222.111.183/"
echo ""
echo "Le script fait tout automatiquement: sauvegarde, clonage, configuration, build et démarrage."