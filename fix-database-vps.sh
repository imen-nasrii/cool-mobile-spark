#!/bin/bash

# Script de correction de la base de données pour VPS
echo "🔧 Correction de la configuration de base de données..."

APP_DIR="/home/tomati/tomati-market"
USER="tomati"

# Aller dans le répertoire de l'application
cd $APP_DIR

# Arrêter l'application
sudo -u $USER pm2 stop tomati-production

# Corriger le fichier .env pour utiliser une connexion PostgreSQL locale simple
sudo -u $USER cat > .env << 'EOF'
# Base de données PostgreSQL locale (sans SSL)
DATABASE_URL=postgresql://tomati:tomati123@localhost:5432/tomati_db?sslmode=disable
PGUSER=tomati
PGPASSWORD=tomati123
PGDATABASE=tomati_db
PGHOST=localhost
PGPORT=5432

# JWT Secret
JWT_SECRET=tomati-super-secret-jwt-key-production-2025
SESSION_SECRET=tomati-super-secret-session-key-production-2025

# Application
NODE_ENV=production
PORT=5000

# Replit compatibility - désactiver les fonctions Replit spécifiques
REPL_ID=tomati-market
REPLIT_DOMAINS=51.222.111.183,tomati.org
ISSUER_URL=https://replit.com/oidc
EOF

# Vérifier la connexion PostgreSQL
echo "🔍 Test de connexion PostgreSQL..."
sudo -u tomati psql -h localhost -U tomati -d tomati_db -c "SELECT version();" || {
    echo "❌ Erreur de connexion PostgreSQL. Reconfiguration..."
    
    # Reconfigurer PostgreSQL
    sudo -u postgres psql << 'EOSQL'
-- Recréer l'utilisateur avec tous les privilèges
DROP USER IF EXISTS tomati;
CREATE USER tomati WITH PASSWORD 'tomati123';
ALTER USER tomati CREATEDB;
ALTER USER tomati WITH SUPERUSER;

-- Recréer la base de données
DROP DATABASE IF EXISTS tomati_db;
CREATE DATABASE tomati_db OWNER tomati;
GRANT ALL PRIVILEGES ON DATABASE tomati_db TO tomati;
EOSQL

    # Configurer PostgreSQL pour autoriser les connexions locales
    sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = 'localhost'/" /etc/postgresql/*/main/postgresql.conf
    
    # Configurer pg_hba.conf pour autoriser les connexions locales
    PG_HBA=$(sudo find /etc/postgresql -name pg_hba.conf)
    sudo cp $PG_HBA $PG_HBA.backup
    
    # Ajouter une ligne pour l'utilisateur tomati
    echo "local   tomati_db       tomati                                  md5" | sudo tee -a $PG_HBA
    echo "host    tomati_db       tomati          127.0.0.1/32            md5" | sudo tee -a $PG_HBA
    
    # Redémarrer PostgreSQL
    sudo systemctl restart postgresql
    
    echo "⏳ Attente du redémarrage de PostgreSQL..."
    sleep 5
    
    # Test de connexion après reconfiguration
    sudo -u tomati psql -h localhost -U tomati -d tomati_db -c "SELECT version();"
}

# Pousser les migrations de base de données
echo "🗄️ Migration de la base de données..."
sudo -u $USER npm run db:push

# Redémarrer l'application
echo "🚀 Redémarrage de l'application..."
sudo -u $USER pm2 restart tomati-production

# Attendre un peu et vérifier le statut
sleep 5
sudo -u $USER pm2 status

echo "✅ Correction terminée. Vérification des logs..."
sudo -u $USER pm2 logs tomati-production --lines 10