#!/bin/bash

# Script de déploiement de la dernière version
echo "Déploiement de la dernière version de Tomati Market..."

# Étapes à exécuter sur le serveur :
echo "1. Sauvegarder la version actuelle"
echo "2. Télécharger la nouvelle version"
echo "3. Redémarrer PM2 avec la nouvelle version"

echo ""
echo "Commandes à exécuter sur votre serveur (51.222.111.183) :"
echo ""
echo "# Se connecter en tant qu'utilisateur tomati"
echo "su - tomati"
echo "cd ~/tomati-market"
echo ""
echo "# Sauvegarder la version actuelle"
echo "cp -r dist dist-backup-$(date +%Y%m%d_%H%M%S)"
echo ""
echo "# Télécharger et extraire la nouvelle version depuis Replit"
echo "# (Vous devez transférer le fichier tomati-market-latest.tar.gz)"
echo ""
echo "# Une fois le fichier transféré :"
echo "tar -xzf tomati-market-latest.tar.gz"
echo ""
echo "# Redémarrer PM2 avec la nouvelle version"
echo "pm2 restart tomati-production"
echo "pm2 logs tomati-production --lines 10"
echo ""
echo "# Tester la nouvelle version"
echo "curl http://localhost:5000"
echo "exit"
echo "curl http://51.222.111.183"