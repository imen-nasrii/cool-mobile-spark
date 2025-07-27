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
