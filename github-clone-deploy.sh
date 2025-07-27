#!/bin/bash

echo "Création script de clonage GitHub..."

cat > deploy-github-clone.sh << 'EOF'
#!/bin/bash

echo "Déploiement par clonage GitHub..."

# Arrêter l'application
pm2 stop tomati-production

# Sauvegarde rapide
cp -r /home/tomati/tomati-market /home/tomati/backup-$(date +%H%M%S) 2>/dev/null

# Supprimer l'ancien code
rm -rf /home/tomati/tomati-market

# Cloner depuis GitHub
git clone https://github.com/imen-nasrii/cool-mobile-spark.git /home/tomati/tomati-market

# Aller dans le répertoire
cd /home/tomati/tomati-market

# Créer le fichier .env
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

# Installation des dépendances
npm install --production

# Migration de la base de données
npm run db:push

# Build de l'application
npm run build

# Redémarrer avec PM2
pm2 restart tomati-production

# Vérification
pm2 status
curl -s http://localhost:5000/api/stats

echo "Déploiement terminé! Application disponible sur http://51.222.111.183"
EOF

chmod +x deploy-github-clone.sh

echo "Script créé: deploy-github-clone.sh"
echo ""
echo "Commandes à exécuter:"
echo ""
echo "1. Copier le script:"
echo "   scp deploy-github-clone.sh ubuntu@51.222.111.183:/tmp/"
echo ""
echo "2. Se connecter et exécuter:"
echo "   ssh ubuntu@51.222.111.183"
echo "   sudo su - tomati"
echo "   chmod +x /tmp/deploy-github-clone.sh"
echo "   /tmp/deploy-github-clone.sh"
echo ""
echo "Le script va cloner le code depuis GitHub et déployer avec:"
echo "- Layout horizontal des produits"
echo "- Police Arial globale"
echo "- ErrorBoundary pour gestion d'erreurs"
echo "- Migration automatique de la base de données"