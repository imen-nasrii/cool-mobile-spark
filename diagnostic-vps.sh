#!/bin/bash

# Script de diagnostic complet VPS pour localiser et corriger Tomati Market

echo "🔍 DIAGNOSTIC COMPLET VPS 51.222.111.183"
echo "========================================="

# Vérification utilisateur tomati
echo "👤 Utilisateur tomati:"
id tomati 2>/dev/null || echo "❌ Utilisateur tomati n'existe pas"

# Recherche de l'application
echo -e "\n📁 Recherche application Tomati Market:"
find /home -name "*tomati*" -type d 2>/dev/null || echo "Aucun dossier tomati trouvé"
find /home -name "package.json" -exec grep -l "tomati\|rest-express" {} \; 2>/dev/null

# Vérification PM2
echo -e "\n🔄 Processus PM2:"
su - tomati -c "pm2 list" 2>/dev/null || echo "❌ PM2 non configuré pour tomati"

# Vérification services
echo -e "\n🗄️ Services installés:"
systemctl status postgresql --no-pager -l | head -3
systemctl status nginx --no-pager -l | head -3
node --version 2>/dev/null || echo "❌ Node.js non installé"
npm --version 2>/dev/null || echo "❌ NPM non installé"

# Vérification ports
echo -e "\n🌐 Ports en écoute:"
netstat -tulpn | grep ":5000\|:80\|:5432" || echo "Aucun port standard ouvert"

# Vérification base de données
echo -e "\n🗄️ Base de données:"
su - postgres -c "psql -l" 2>/dev/null | grep tomati || echo "❌ Base tomati_db non trouvée"

# Vérification Nginx
echo -e "\n🌍 Configuration Nginx:"
ls -la /etc/nginx/sites-enabled/ | grep tomati || echo "❌ Site tomati non configuré"

echo -e "\n📋 Recommandation:"
echo "Il semble que l'application ne soit pas correctement déployée."
echo "Exécuter le script de déploiement complet:"
echo "wget -O deploy-complete.sh https://raw.githubusercontent.com/imen-nasrii/cool-mobile-spark/main/deploy-github-vps.sh"
echo "chmod +x deploy-complete.sh"
echo "sudo ./deploy-complete.sh"