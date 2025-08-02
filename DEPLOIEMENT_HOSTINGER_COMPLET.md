# 🚀 Déploiement Complet - Tomati Market sur VPS Hostinger

## 🎯 Objectif
Déployer l'application Tomati Market depuis GitHub sur votre VPS Hostinger avec configuration complète.

## 📋 Prérequis Hostinger
- VPS Hostinger avec Ubuntu
- Accès SSH configuré
- IP publique du VPS
- Accès root ou sudo

## 🔧 Étape 1: Connexion VPS Hostinger

```bash
# Remplacez YOUR_HOSTINGER_IP par votre IP réelle
ssh root@YOUR_HOSTINGER_IP
# ou
ssh ubuntu@YOUR_HOSTINGER_IP
```

## 🚀 Étape 2: Déploiement Automatique

### Option A: Déploiement en Une Commande
```bash
curl -sSL https://raw.githubusercontent.com/imen-nasrii/cool-mobile-spark/main/deploy-hostinger-complete.sh | sudo bash
```

### Option B: Déploiement Manuel
```bash
# Télécharger le script
wget -O deploy-hostinger.sh https://raw.githubusercontent.com/imen-nasrii/cool-mobile-spark/main/deploy-hostinger-complete.sh
chmod +x deploy-hostinger.sh
sudo ./deploy-hostinger.sh
```

## 📊 Ce que fait le script de déploiement

### Installation des Prérequis
1. **Mise à jour système Ubuntu**
2. **Node.js 18** avec npm
3. **PostgreSQL** avec configuration
4. **PM2** pour gestion processus
5. **Nginx** pour proxy web
6. **Git** pour clonage repository

### Configuration Application
1. **Utilisateur tomati** avec privilèges
2. **Base de données** tomati_db
3. **Clone repository** GitHub
4. **Installation dépendances** npm
5. **Build application** production
6. **Configuration PM2** avec auto-restart

### Configuration Web
1. **Nginx proxy** port 80 → 5000
2. **Firewall** ports 22, 80, 443
3. **SSL ready** pour HTTPS futur
4. **Domaine configuration** ready

## 🎯 Étape 3: Configuration Spécifique Hostinger

```bash
# Variables pour votre VPS Hostinger
HOSTINGER_IP="VOTRE_IP_HOSTINGER"
DOMAIN="votre-domaine.com"  # Optionnel

# Configuration DNS (si domaine)
# Pointer domaine vers IP Hostinger dans panneau Hostinger
```

## 📋 Étape 4: Vérification Déploiement

### Vérifier Services
```bash
# Statut application
sudo -u tomati pm2 status

# Statut services système
systemctl status postgresql nginx

# Test base de données
sudo -u tomati psql -h localhost -U tomati -d tomati_db -c "SELECT version();"
```

### Test Application
```bash
# Test local
curl http://localhost:5000

# Test public
curl http://VOTRE_IP_HOSTINGER

# Logs application
sudo -u tomati pm2 logs tomati-production
```

## 🌐 Étape 5: Configuration Domaine (Optionnel)

### Dans Panneau Hostinger
1. **DNS Management** → Votre domaine
2. **A Record** → @ → Votre IP VPS
3. **A Record** → www → Votre IP VPS

### Configuration Nginx pour Domaine
```bash
# Modifier configuration Nginx
sudo nano /etc/nginx/sites-available/tomati

# Ajouter server_name
server_name votre-domaine.com www.votre-domaine.com VOTRE_IP_HOSTINGER;
```

## 🔒 Étape 6: SSL/HTTPS (Optionnel)

```bash
# Installation Certbot
sudo apt install certbot python3-certbot-nginx

# Génération certificat SSL
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
```

## 📊 Structure Finale

```
/home/tomati/tomati-market/
├── client/              # Frontend React
├── server/              # Backend Express
├── shared/              # Types partagés
├── dist/                # Code compilé
├── logs/                # Logs PM2
├── .env                 # Configuration production
└── ecosystem.config.cjs # Configuration PM2
```

## 🔧 Maintenance Post-Déploiement

### Commandes Utiles
```bash
# Statut complet
sudo -u tomati pm2 monit

# Redémarrage application
sudo -u tomati pm2 restart tomati-production

# Mise à jour code
cd /home/tomati/tomati-market
sudo -u tomati git pull origin main
sudo -u tomati npm install
sudo -u tomati npm run build
sudo -u tomati npm run db:push
sudo -u tomati pm2 restart tomati-production

# Redémarrage services
sudo systemctl restart postgresql nginx
```

### Sauvegarde Base de Données
```bash
# Backup automatique
sudo -u tomati pg_dump -h localhost -U tomati tomati_db > backup_$(date +%Y%m%d).sql

# Restauration
sudo -u tomati psql -h localhost -U tomati tomati_db < backup_20250802.sql
```

## 🌍 URLs Finales

### Avec IP uniquement
- **Application**: http://VOTRE_IP_HOSTINGER
- **Admin**: http://VOTRE_IP_HOSTINGER/admin

### Avec domaine (si configuré)
- **Application**: https://votre-domaine.com
- **Admin**: https://votre-domaine.com/admin

## 🚨 Dépannage Hostinger

### Problèmes Courants

**Application inaccessible:**
```bash
# Vérifier firewall Hostinger
sudo ufw status
sudo ufw allow 80
sudo ufw allow 443
```

**Erreurs base de données:**
```bash
# Vérifier PostgreSQL
sudo systemctl status postgresql
sudo systemctl restart postgresql
```

**Erreurs Nginx:**
```bash
# Tester configuration
sudo nginx -t
sudo systemctl restart nginx
```

### Support Hostinger
- Panel Hostinger pour configuration DNS
- Support technique pour problèmes VPS
- Documentation Hostinger VPS

## ✅ Checklist Finale

- [ ] VPS Hostinger accessible via SSH
- [ ] Script de déploiement exécuté
- [ ] Application répond sur IP publique
- [ ] Base de données fonctionnelle
- [ ] PM2 montre processus online
- [ ] Nginx proxy configuré
- [ ] Domaine pointé (optionnel)
- [ ] SSL configuré (optionnel)

## 🎉 Succès Déploiement

Votre application Tomati Market sera accessible sur:
- **http://VOTRE_IP_HOSTINGER** (immédiat)
- **https://votre-domaine.com** (avec domaine + SSL)

Avec fonctionnalités complètes: produits, likes, admin, base de données PostgreSQL.