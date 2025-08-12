#!/bin/bash

# Script de déploiement automatique pour VPS OVH
# Usage: ./deploy-to-ovh.sh

set -e

echo "🚀 Déploiement Tomati Market sur VPS OVH..."

# Configuration
VPS_USER="tomati"
VPS_HOST="51.222.111.183"
VPS_PASS="Tomati123"
APP_NAME="tomati-production"
APP_DIR="/home/tomati/tomatimarket"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Fonction pour exécuter des commandes sur le VPS avec sshpass
run_remote() {
    echo "📡 Exécution: $1"
    sshpass -p "$VPS_PASS" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$VPS_USER@$VPS_HOST" "$1"
}

# Fonction pour transférer des fichiers
transfer_file() {
    echo "📂 Transfert: $1 -> $2"
    sshpass -p "$VPS_PASS" scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$1" "$VPS_USER@$VPS_HOST:$2"
}

# Vérifier si sshpass est installé
if ! command -v sshpass &> /dev/null; then
    print_error "sshpass n'est pas installé. Installation..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install hudochenkov/sshpass/sshpass
    else
        sudo apt-get update && sudo apt-get install -y sshpass
    fi
fi

print_status "Connexion au VPS OVH..."

# 1. Tester la connexion
print_status "Test de connexion..."
run_remote "echo 'Connexion réussie au VPS OVH'"

# 2. Arrêter l'application existante
print_warning "Arrêt de l'application existante..."
run_remote "pm2 delete $APP_NAME 2>/dev/null || echo 'Aucune application à arrêter'"

# 3. Sauvegarder l'ancienne version
print_status "Sauvegarde de l'ancienne version..."
run_remote "if [ -d $APP_DIR ]; then mv $APP_DIR ${APP_DIR}_backup_\$(date +%Y%m%d_%H%M%S); fi"

# 4. Créer le répertoire et cloner
print_status "Création du répertoire d'application..."
run_remote "mkdir -p $APP_DIR"

# 5. Transférer les fichiers depuis Replit
print_status "Transfert des fichiers de l'application..."

# Créer une archive temporaire
echo "📦 Création de l'archive de l'application..."
tar --exclude='node_modules' --exclude='.git' --exclude='attached_assets' --exclude='logs' -czf tomati-app.tar.gz .

# Transférer l'archive
transfer_file "tomati-app.tar.gz" "/home/tomati/"

# Extraire sur le VPS
run_remote "cd /home/tomati && tar -xzf tomati-app.tar.gz -C $APP_DIR --strip-components=0"
run_remote "rm /home/tomati/tomati-app.tar.gz"

# Nettoyer l'archive locale
rm tomati-app.tar.gz

# 6. Installation des dépendances
print_status "Installation des dépendances..."
run_remote "cd $APP_DIR && npm install --production"

# 7. Configuration de l'environnement
print_status "Configuration de l'environnement..."
run_remote "cd $APP_DIR && cat > .env << 'ENVEOF'
NODE_ENV=production
PORT=5000
JWT_SECRET=tomati-super-secret-jwt-key-production-2025
DATABASE_URL=postgresql://tomati_user:Tomati123_db@localhost:5432/tomati_db
PUBLIC_URL=https://tomati.org
VITE_API_URL=https://tomati.org/api
CORS_ORIGIN=https://tomati.org
ENVEOF"

# 8. Build de l'application
print_status "Build de l'application..."
run_remote "cd $APP_DIR && npm run build"

# 9. Configuration PM2
print_status "Configuration PM2..."
run_remote "cd $APP_DIR && cat > ecosystem.config.js << 'ECOSYSTEMEOF'
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: './server/index.ts',
    interpreter: 'tsx',
    cwd: '$APP_DIR',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    autorestart: true,
    max_restarts: 5,
    min_uptime: '10s'
  }]
};
ECOSYSTEMEOF"

# 10. Créer les répertoires nécessaires
print_status "Création des répertoires..."
run_remote "cd $APP_DIR && mkdir -p logs uploads"

# 11. Mise à jour de la base de données
print_status "Mise à jour de la base de données..."
run_remote "cd $APP_DIR && npm run db:push || echo 'Erreur DB push - continuons...'"

# 12. Démarrage de l'application
print_status "Démarrage de l'application..."
run_remote "cd $APP_DIR && pm2 start ecosystem.config.js"

# 13. Sauvegarde PM2
print_status "Sauvegarde de la configuration PM2..."
run_remote "pm2 save"

# 14. Vérification du statut
print_status "Vérification du statut..."
run_remote "pm2 status"

# 15. Attendre que l'application démarre
print_status "Attente du démarrage complet..."
sleep 10

# 16. Test de l'API
print_status "Test de l'API..."
if run_remote "curl -f http://localhost:5000/api/categories >/dev/null 2>&1"; then
    print_status "API fonctionne correctement ✅"
else
    print_warning "API ne répond pas encore, vérifiez les logs"
fi

# 17. Afficher les logs récents
print_status "Logs récents de l'application:"
run_remote "pm2 logs $APP_NAME --lines 15"

print_status "Déploiement terminé! 🎉"
echo ""
echo "📊 Informations de déploiement:"
echo "   - Serveur: $VPS_HOST"
echo "   - Application: $APP_NAME"
echo "   - Répertoire: $APP_DIR"
echo "   - URL: https://tomati.org"
echo ""
echo "🔧 Commandes utiles:"
echo "   - Statut: sshpass -p '$VPS_PASS' ssh $VPS_USER@$VPS_HOST 'pm2 status'"
echo "   - Logs: sshpass -p '$VPS_PASS' ssh $VPS_USER@$VPS_HOST 'pm2 logs $APP_NAME'"
echo "   - Redémarrer: sshpass -p '$VPS_PASS' ssh $VPS_USER@$VPS_HOST 'pm2 restart $APP_NAME'"