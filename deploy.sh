#!/bin/bash

# Script de déploiement automatique pour VPS Hostinger
# Usage: ./deploy.sh [production|staging]

set -e  # Arrêt en cas d'erreur

# Configuration
APP_NAME="tomati"
APP_DIR="/var/www/tomati"
USER="www-data"
NODE_VERSION="20"
ENVIRONMENT=${1:-production}

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonctions utiles
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérification des prérequis
check_prerequisites() {
    log_info "Vérification des prérequis..."
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js n'est pas installé"
        exit 1
    fi
    
    # Vérifier PostgreSQL
    if ! command -v psql &> /dev/null; then
        log_error "PostgreSQL n'est pas installé"
        exit 1
    fi
    
    # Vérifier PM2
    if ! command -v pm2 &> /dev/null; then
        log_error "PM2 n'est pas installé"
        exit 1
    fi
    
    # Vérifier Nginx
    if ! command -v nginx &> /dev/null; then
        log_error "Nginx n'est pas installé"
        exit 1
    fi
    
    log_info "Tous les prérequis sont satisfaits"
}

# Installation initiale
initial_setup() {
    log_info "Configuration initiale du serveur..."
    
    # Créer l'utilisateur et les dossiers
    sudo mkdir -p $APP_DIR
    sudo mkdir -p $APP_DIR/logs
    sudo chown -R $USER:$USER $APP_DIR
    
    # Configuration du firewall
    sudo ufw allow ssh
    sudo ufw allow 'Nginx Full'
    sudo ufw --force enable
    
    log_info "Configuration initiale terminée"
}

# Sauvegarde de la base de données
backup_database() {
    if [ "$ENVIRONMENT" = "production" ]; then
        log_info "Sauvegarde de la base de données..."
        
        BACKUP_FILE="$APP_DIR/backups/backup_$(date +%Y%m%d_%H%M%S).sql"
        sudo mkdir -p $APP_DIR/backups
        
        # Sauvegarde avec pg_dump
        pg_dump $DATABASE_URL > $BACKUP_FILE
        
        # Conserver seulement les 10 dernières sauvegardes
        ls -t $APP_DIR/backups/*.sql | tail -n +11 | xargs -r rm
        
        log_info "Sauvegarde créée: $BACKUP_FILE"
    fi
}

# Déploiement du code
deploy_code() {
    log_info "Déploiement du code..."
    
    cd $APP_DIR
    
    # Git pull ou copie des fichiers
    if [ -d ".git" ]; then
        git fetch origin main
        git reset --hard origin/main
    else
        log_warn "Pas de dépôt Git trouvé. Copiez manuellement les fichiers."
    fi
    
    # Installation des dépendances
    npm ci --only=production
    
    # Build du frontend
    npm run build
    
    log_info "Code déployé avec succès"
}

# Migration de la base de données
migrate_database() {
    log_info "Migration de la base de données..."
    
    cd $APP_DIR
    
    # Push du schéma Drizzle
    npm run db:push
    
    # Optimisations de la base de données
    if [ -f "database-optimization.sql" ]; then
        psql $DATABASE_URL -f database-optimization.sql
        log_info "Optimisations de la base de données appliquées"
    fi
    
    log_info "Migration terminée"
}

# Configuration PM2
setup_pm2() {
    log_info "Configuration PM2..."
    
    cd $APP_DIR
    
    # Arrêter l'application si elle tourne
    pm2 stop $APP_NAME 2>/dev/null || true
    pm2 delete $APP_NAME 2>/dev/null || true
    
    # Démarrer avec PM2
    pm2 start ecosystem.config.js
    pm2 save
    
    # Configuration du démarrage automatique
    sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp /home/$USER
    
    log_info "PM2 configuré"
}

# Configuration Nginx
setup_nginx() {
    log_info "Configuration Nginx..."
    
    # Copier la configuration Nginx
    sudo cp nginx.conf /etc/nginx/sites-available/$APP_NAME
    sudo ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
    
    # Supprimer la configuration par défaut
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test de la configuration
    sudo nginx -t
    
    # Redémarrage de Nginx
    sudo systemctl reload nginx
    
    log_info "Nginx configuré"
}

# Configuration SSL avec Let's Encrypt
setup_ssl() {
    if [ "$ENVIRONMENT" = "production" ]; then
        log_info "Configuration SSL..."
        
        read -p "Nom de domaine (ex: example.com): " DOMAIN
        
        if [ ! -z "$DOMAIN" ]; then
            # Installation Certbot
            sudo apt install certbot python3-certbot-nginx -y
            
            # Génération du certificat
            sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
            
            log_info "SSL configuré pour $DOMAIN"
        else
            log_warn "Nom de domaine non fourni, SSL ignoré"
        fi
    fi
}

# Tests de santé
health_check() {
    log_info "Vérification de l'état de l'application..."
    
    sleep 5  # Attendre le démarrage
    
    # Test API
    if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
        log_info "✅ API en ligne"
    else
        log_error "❌ API hors ligne"
        exit 1
    fi
    
    # Test frontend
    if curl -f http://localhost > /dev/null 2>&1; then
        log_info "✅ Frontend accessible"
    else
        log_error "❌ Frontend inaccessible"
        exit 1
    fi
    
    log_info "Application déployée avec succès!"
}

# Fonction principale
main() {
    log_info "Début du déploiement en mode $ENVIRONMENT"
    
    check_prerequisites
    
    if [ "$ENVIRONMENT" = "production" ]; then
        backup_database
    fi
    
    deploy_code
    migrate_database
    setup_pm2
    setup_nginx
    
    if [ "$ENVIRONMENT" = "production" ]; then
        setup_ssl
    fi
    
    health_check
    
    log_info "🎉 Déploiement terminé avec succès!"
    log_info "📊 Monitoring: pm2 monit"
    log_info "📝 Logs: pm2 logs $APP_NAME"
    log_info "🔄 Redémarrage: pm2 restart $APP_NAME"
}

# Vérifier si le script est exécuté en tant que root
if [ "$EUID" -eq 0 ]; then
    log_error "Ne pas exécuter ce script en tant que root"
    exit 1
fi

# Exécution
main "$@"