#!/bin/bash

# Script de sauvegarde pour Tomati Market
# Usage: ./backup.sh

set -e

echo "🍅 Début de la sauvegarde de Tomati Market..."

# Configuration
BACKUP_DIR="/home/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="tomati_market"
APP_DIR="/var/www/tomati-market"

# Créer le répertoire de sauvegarde s'il n'existe pas
mkdir -p $BACKUP_DIR

echo "🗃️ Sauvegarde de la base de données..."
pg_dump $DB_NAME > $BACKUP_DIR/tomati_db_$DATE.sql

echo "📁 Sauvegarde des fichiers d'application..."
tar -czf $BACKUP_DIR/tomati_files_$DATE.tar.gz -C $APP_DIR .

echo "🧹 Nettoyage des anciennes sauvegardes (>7 jours)..."
find $BACKUP_DIR -name "tomati_*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "tomati_*.tar.gz" -mtime +7 -delete

echo "✅ Sauvegarde terminée!"
echo "📁 Fichiers sauvegardés dans: $BACKUP_DIR"
ls -la $BACKUP_DIR/tomati_*$DATE*