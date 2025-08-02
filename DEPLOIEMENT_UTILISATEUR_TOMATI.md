# 🚀 Déploiement Tomati Market - Utilisateur tomati

## 📋 Commandes de Déploiement Complet

### **1. Connexion au VPS**
```bash
ssh ubuntu@51.222.111.183
```

### **2. Déploiement avec Utilisateur tomati**
```bash
# Télécharger et exécuter le script de déploiement
wget -O deploy-tomati.sh https://raw.githubusercontent.com/imen-nasrii/cool-mobile-spark/main/deploy-tomati-user.sh
chmod +x deploy-tomati.sh
sudo ./deploy-tomati.sh
```

## ✅ **Ce que fait le script automatiquement**

### Installation et Configuration
- ✅ Création de l'utilisateur `tomati` (mot de passe: `tomati123`)
- ✅ Installation Node.js 18, PM2, PostgreSQL, Nginx
- ✅ Clone du repository GitHub
- ✅ Configuration de la base de données PostgreSQL
- ✅ Build de l'application Tomati Market
- ✅ Configuration PM2 avec redémarrage automatique
- ✅ Configuration Nginx comme proxy reverse
- ✅ Configuration du firewall

### Structure Créée
```
/home/tomati/
└── tomati-market/
    ├── client/
    ├── server/
    ├── dist/
    ├── logs/
    ├── .env
    ├── ecosystem.config.cjs
    └── package.json
```

## 🔧 **Gestion de l'Application**

### Commandes Principales
```bash
# Statut de l'application
sudo -u tomati pm2 status

# Voir les logs en temps réel
sudo -u tomati pm2 logs tomati-production

# Redémarrer l'application
sudo -u tomati pm2 restart tomati-production

# Arrêter l'application
sudo -u tomati pm2 stop tomati-production

# Monitoring en temps réel
sudo -u tomati pm2 monit
```

### Mise à Jour du Code
```bash
# Se connecter en tant qu'utilisateur tomati
sudo su - tomati

# Aller dans le répertoire de l'application
cd /home/tomati/tomati-market

# Mettre à jour le code depuis GitHub
git pull origin main

# Installer les nouvelles dépendances
npm install

# Rebuilder l'application
npm run build

# Pousser les changements de base de données
npm run db:push

# Redémarrer PM2
pm2 restart tomati-production
```

## 🌐 **Accès à l'Application**

Une fois le déploiement terminé :
- **URL**: http://51.222.111.183
- **Port interne**: 5000
- **Proxy**: Nginx (port 80)

## 🔐 **Informations de Connexion**

### Utilisateur Système
- **Utilisateur**: `tomati`
- **Mot de passe**: `tomati123`
- **Répertoire home**: `/home/tomati`

### Base de Données PostgreSQL
- **Utilisateur DB**: `tomati`
- **Mot de passe DB**: `tomati123`
- **Base de données**: `tomati_db`
- **Host**: `localhost`
- **Port**: `5432`

## 📊 **Vérification Post-Déploiement**

### 1. Vérifier l'Application
```bash
# Test de connexion locale
curl http://localhost:5000

# Test de connexion externe
curl http://51.222.111.183
```

### 2. Vérifier les Services
```bash
# Statut PostgreSQL
sudo systemctl status postgresql

# Statut Nginx
sudo systemctl status nginx

# Statut de l'application PM2
sudo -u tomati pm2 status
```

### 3. Vérifier les Logs
```bash
# Logs de l'application
sudo -u tomati pm2 logs tomati-production

# Logs Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## ⚠️ **Dépannage Rapide**

### Si l'application ne démarre pas
```bash
# Vérifier les logs d'erreur
sudo -u tomati pm2 logs tomati-production --err

# Vérifier que le build existe
ls -la /home/tomati/tomati-market/dist/

# Redémarrer tous les services
sudo -u tomati pm2 restart all
sudo systemctl restart nginx
sudo systemctl restart postgresql
```

### Si la base de données ne fonctionne pas
```bash
# Tester la connexion PostgreSQL
sudo -u tomati psql -h localhost -U tomati -d tomati_db -c "SELECT version();"

# Relancer les migrations
cd /home/tomati/tomati-market
sudo -u tomati npm run db:push
```

## 🔄 **Sauvegarde et Restauration**

### Sauvegarde de la Base de Données
```bash
# Créer une sauvegarde
sudo -u postgres pg_dump tomati_db > /home/tomati/backup_$(date +%Y%m%d_%H%M%S).sql
```

### Sauvegarde du Code
```bash
# Archiver l'application
tar -czf /home/tomati/tomati-market-backup-$(date +%Y%m%d_%H%M%S).tar.gz /home/tomati/tomati-market/
```

---

**Repository Source**: https://github.com/imen-nasrii/cool-mobile-spark.git  
**Application Finale**: http://51.222.111.183