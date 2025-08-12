#!/bin/bash

# Script de déploiement pour VPS OVH - Tomati Market
# Utilisateur: tomati
# Mot de passe: Tomati123

echo "🚀 Démarrage du déploiement Tomati Market sur VPS OVH..."

# Variables de configuration
VPS_USER="tomati"
VPS_HOST="51.222.111.183"
APP_NAME="tomati-production"
REPO_URL="https://github.com/your-username/tomati-market.git"
APP_DIR="/home/tomati/tomatimarket"

echo "📋 Configuration du déploiement:"
echo "   - Serveur: $VPS_HOST"
echo "   - Utilisateur: $VPS_USER"
echo "   - Application: $APP_NAME"
echo "   - Répertoire: $APP_DIR"

# Fonction pour exécuter des commandes sur le VPS
execute_remote() {
    echo "📡 Exécution sur VPS: $1"
    ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST "$1"
}

# 1. Arrêter l'application existante
echo "🛑 Arrêt de l'application existante..."
execute_remote "pm2 delete $APP_NAME 2>/dev/null || echo 'Aucune application à arrêter'"

# 2. Sauvegarder l'ancienne version (si elle existe)
echo "💾 Sauvegarde de l'ancienne version..."
execute_remote "if [ -d $APP_DIR ]; then mv $APP_DIR ${APP_DIR}_backup_$(date +%Y%m%d_%H%M%S); fi"

# 3. Cloner la nouvelle version
echo "📥 Clonage de la nouvelle version..."
execute_remote "git clone $REPO_URL $APP_DIR"

# 4. Installation des dépendances
echo "📦 Installation des dépendances..."
execute_remote "cd $APP_DIR && npm install"

# 5. Configuration de l'environnement
echo "⚙️ Configuration de l'environnement..."
execute_remote "cd $APP_DIR && cat > .env << 'ENVEOF'
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
DATABASE_URL=postgresql://tomati_user:secure_password_123@localhost:5432/tomati_db
PUBLIC_URL=https://tomati.org
VITE_API_URL=https://tomati.org/api
ENVEOF"

# 6. Build de l'application
echo "🔨 Build de l'application..."
execute_remote "cd $APP_DIR && npm run build"

# 7. Configuration PM2
echo "⚡ Configuration PM2..."
execute_remote "cd $APP_DIR && cat > ecosystem.config.js << 'ECOSYSTEMEOF'
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

# 8. Créer le répertoire de logs
echo "📝 Création du répertoire de logs..."
execute_remote "cd $APP_DIR && mkdir -p logs"

# 9. Mise à jour de la base de données
echo "🗄️ Mise à jour de la base de données..."
execute_remote "cd $APP_DIR && npm run db:push"

# 10. Démarrage de l'application avec PM2
echo "🚀 Démarrage de l'application..."
execute_remote "cd $APP_DIR && pm2 start ecosystem.config.js"

# 11. Sauvegarde de la configuration PM2
echo "💾 Sauvegarde de la configuration PM2..."
execute_remote "pm2 save"

# 12. Vérification du statut
echo "✅ Vérification du statut..."
execute_remote "pm2 status"
execute_remote "pm2 logs $APP_NAME --lines 10"

# 13. Test de l'API
echo "🧪 Test de l'API..."
execute_remote "sleep 5 && curl -f http://localhost:5000/api/categories && echo 'API fonctionne ✅' || echo 'API ne répond pas ❌'"

echo "🎉 Déploiement terminé!"
echo ""
echo "📊 Commandes utiles:"
echo "   - Statut: ssh $VPS_USER@$VPS_HOST 'pm2 status'"
echo "   - Logs: ssh $VPS_USER@$VPS_HOST 'pm2 logs $APP_NAME'"
echo "   - Redémarrer: ssh $VPS_USER@$VPS_HOST 'pm2 restart $APP_NAME'"
echo "   - Arrêter: ssh $VPS_USER@$VPS_HOST 'pm2 stop $APP_NAME'"
echo ""
echo "🌐 Application disponible sur: https://tomati.org"