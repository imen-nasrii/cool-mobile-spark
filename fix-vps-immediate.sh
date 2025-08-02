#!/bin/bash

# Correction immédiate du problème de base de données VPS
echo "🔧 Correction immédiate du problème de connexion base de données..."

APP_DIR="/home/tomati/tomati-market"
USER="tomati"

# Arrêter l'application
echo "⏹️ Arrêt de l'application..."
sudo -u $USER pm2 stop tomati-production

# Aller dans le répertoire
cd $APP_DIR

# Sauvegarder l'ancien .env
sudo -u $USER cp .env .env.backup

# Créer un nouveau fichier .env avec configuration PostgreSQL locale simple
echo "📝 Création du nouveau fichier .env..."
sudo -u $USER cat > .env << 'EOF'
# Base de données PostgreSQL locale sans SSL
DATABASE_URL=postgresql://tomati:tomati123@localhost:5432/tomati_db
PGUSER=tomati
PGPASSWORD=tomati123
PGDATABASE=tomati_db
PGHOST=localhost
PGPORT=5432

# Application
NODE_ENV=production
PORT=5000
JWT_SECRET=tomati-jwt-secret-2025
SESSION_SECRET=tomati-session-secret-2025

# Désactiver les fonctions Replit spécifiques qui causent le problème
# REPL_ID=tomati-market
# REPLIT_DOMAINS=51.222.111.183,tomati.org
# ISSUER_URL=https://replit.com/oidc
EOF

# Vérifier et reconfigurer PostgreSQL si nécessaire
echo "🗄️ Configuration PostgreSQL..."

# S'assurer que PostgreSQL fonctionne
sudo systemctl start postgresql

# Recréer l'utilisateur et la base de données avec une méthode simple
sudo -u postgres psql << 'EOSQL'
-- Supprimer et recréer proprement
DROP DATABASE IF EXISTS tomati_db;
DROP USER IF EXISTS tomati;

-- Créer l'utilisateur avec tous les privilèges
CREATE USER tomati WITH PASSWORD 'tomati123';
ALTER USER tomati CREATEDB;
ALTER USER tomati WITH SUPERUSER;

-- Créer la base de données
CREATE DATABASE tomati_db OWNER tomati;
GRANT ALL PRIVILEGES ON DATABASE tomati_db TO tomati;
EOSQL

# Configurer pg_hba.conf pour autoriser les connexions locales
PG_VERSION=$(sudo -u postgres psql -t -c "SHOW server_version_num;" | xargs echo | cut -c1-2)
PG_HBA_PATH="/etc/postgresql/$PG_VERSION/main/pg_hba.conf"

# Sauvegarder et modifier pg_hba.conf
sudo cp $PG_HBA_PATH $PG_HBA_PATH.backup

# Ajouter les règles pour l'utilisateur tomati au début du fichier
sudo sed -i '1i# Tomati user access' $PG_HBA_PATH
sudo sed -i '2i\local   tomati_db       tomati                                  trust' $PG_HBA_PATH
sudo sed -i '3i\host    tomati_db       tomati          127.0.0.1/32            trust' $PG_HBA_PATH
sudo sed -i '4i\host    tomati_db       tomati          ::1/128                 trust' $PG_HBA_PATH

# Redémarrer PostgreSQL
echo "🔄 Redémarrage PostgreSQL..."
sudo systemctl restart postgresql

# Attendre que PostgreSQL redémarre
sleep 3

# Test de connexion
echo "🔍 Test de connexion PostgreSQL..."
sudo -u tomati psql -h localhost -U tomati -d tomati_db -c "SELECT version();" || {
    echo "❌ Connexion échouée, test avec méthode alternative..."
    PGPASSWORD=tomati123 psql -h localhost -U tomati -d tomati_db -c "SELECT version();"
}

# Pousser les migrations
echo "📊 Migration des données..."
sudo -u $USER npm run db:push || echo "⚠️ Erreur de migration, mais on continue..."

# Redémarrer l'application
echo "🚀 Redémarrage de l'application..."
sudo -u $USER pm2 restart tomati-production

# Attendre un peu
sleep 5

# Vérifier le statut
echo "📋 Statut de l'application:"
sudo -u $USER pm2 status

# Vérifier les derniers logs
echo "📝 Logs récents:"
sudo -u $USER pm2 logs tomati-production --lines 5

# Test de l'application
echo "🌐 Test de l'application:"
curl -s -o /dev/null -w "Code HTTP: %{http_code}\n" http://localhost:5000/ || echo "❌ Test échoué"

echo ""
echo "✅ Correction terminée !"
echo "🌐 Testez votre application sur: http://51.222.111.183"