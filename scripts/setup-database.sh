#!/bin/bash

# Script de configuration de la base de données PostgreSQL
# À exécuter sur le serveur VPS

echo "🗄️ Configuration de PostgreSQL pour Tomati Market"

# Demander les informations de base de données
read -p "Nom de la base de données [tomati_production]: " DB_NAME
DB_NAME=${DB_NAME:-tomati_production}

read -p "Nom d'utilisateur de la base [tomati_user]: " DB_USER
DB_USER=${DB_USER:-tomati_user}

read -s -p "Mot de passe de la base (sera masqué): " DB_PASSWORD
echo ""

# Créer la base de données et l'utilisateur
sudo -u postgres psql << EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER DATABASE $DB_NAME OWNER TO $DB_USER;
\q
EOF

echo "✅ Base de données configurée avec succès!"
echo "📝 Variables d'environnement à utiliser:"
echo "DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"
echo ""
echo "💡 Copiez cette ligne dans votre fichier .env"