#!/bin/bash

echo "🔍 Test de diagnostic de la base de données..."

# Vérifier le statut de PostgreSQL
echo "📊 Statut PostgreSQL:"
sudo systemctl status postgresql --no-pager

# Vérifier les processus PostgreSQL
echo -e "\n📋 Processus PostgreSQL:"
ps aux | grep postgres

# Vérifier l'écoute sur le port 5432
echo -e "\n🔌 Port 5432 écouté:"
sudo netstat -tlnp | grep 5432

# Test de connexion avec l'utilisateur postgres
echo -e "\n🔑 Test connexion avec postgres:"
sudo -u postgres psql -c "\l"

# Test de connexion avec l'utilisateur tomati
echo -e "\n👤 Test connexion avec tomati:"
sudo -u postgres psql -c "SELECT usename, usecreatedb, usesuper FROM pg_user WHERE usename = 'tomati';"

# Vérifier la base de données tomati_db
echo -e "\n🗄️ Vérification base tomati_db:"
sudo -u postgres psql -c "SELECT datname FROM pg_database WHERE datname = 'tomati_db';"

# Test de connexion directe
echo -e "\n🔗 Test connexion directe:"
PGPASSWORD=tomati123 psql -h localhost -U tomati -d tomati_db -c "SELECT version();" || echo "❌ Échec de connexion"

echo -e "\n📝 Contenu du fichier .env:"
cat /home/tomati/tomati-market/.env

echo -e "\n📋 Logs d'erreur récents de l'application:"
sudo -u tomati pm2 logs tomati-production --err --lines 5