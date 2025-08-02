# 🌐 Hébergement Final - Tomati Market sur VPS 51.222.111.183

## 🎯 OBJECTIF
Héberger définitivement l'application Tomati Market sur votre VPS avec une correction complète des problèmes de base de données.

## 📋 COMMANDES D'HÉBERGEMENT

### **ÉTAPE 1: Connexion VPS**
```bash
ssh ubuntu@51.222.111.183
```

### **ÉTAPE 2: Correction et Hébergement Final**
```bash
# Télécharger script de correction finale
wget -O fix-final.sh https://raw.githubusercontent.com/imen-nasrii/cool-mobile-spark/main/fix-final-deployment.sh

# Rendre exécutable
chmod +x fix-final.sh

# Exécuter correction complète
sudo ./fix-final.sh
```

## ✅ CE QUE LE SCRIPT CORRIGE

**Problèmes Base de Données:**
- ❌ Erreur `connect ECONNREFUSED 127.0.0.1:443`
- ❌ Endpoints `/api/products/promoted` et `/api/products/liked` en erreur 500
- ❌ Configuration `.env` incorrecte

**Solutions Appliquées:**
- ✅ Configuration PostgreSQL locale sans SSL
- ✅ Recréation utilisateur `tomati` avec privilèges complets
- ✅ Correction `pg_hba.conf` pour autoriser connexions locales
- ✅ Nouveau fichier `.env` avec DATABASE_URL correct
- ✅ Redémarrage application avec PM2

## 🎯 RÉSULTAT ATTENDU

**URL Application:** **http://51.222.111.183**

**Fonctionnalités Opérationnelles:**
- ✅ Page d'accueil avec produits
- ✅ Système de likes fonctionnel
- ✅ Produits promus affichés
- ✅ Interface administrateur
- ✅ Base de données complètement fonctionnelle

## 📊 VÉRIFICATION POST-HÉBERGEMENT

### **1. Statut Application**
```bash
sudo -u tomati pm2 status
```
**Résultat attendu:** `tomati-production` = `online`

### **2. Test Base de Données**
```bash
sudo -u tomati psql -h localhost -U tomati -d tomati_db -c "SELECT version();"
```
**Résultat attendu:** Version PostgreSQL affichée

### **3. Test Application**
```bash
curl http://51.222.111.183
```
**Résultat attendu:** Code HTML de la page Tomati Market

### **4. Logs Fonctionnels**
```bash
sudo -u tomati pm2 logs tomati-production --lines 10
```
**Résultat attendu:** Pas d'erreurs port 443, logs normaux

## 🔧 MAINTENANCE POST-HÉBERGEMENT

### **Commandes de Gestion**
```bash
# Statut détaillé
sudo -u tomati pm2 monit

# Redémarrage si nécessaire
sudo -u tomati pm2 restart tomati-production

# Mise à jour code (futur)
cd /home/tomati/tomati-market
sudo -u tomati git pull origin main
sudo -u tomati npm install
sudo -u tomati npm run build
sudo -u tomati npm run db:push
sudo -u tomati pm2 restart tomati-production
```

### **Services Système**
```bash
# PostgreSQL
sudo systemctl status postgresql

# Nginx
sudo systemctl status nginx

# Redémarrage complet si nécessaire
sudo systemctl restart postgresql nginx
sudo -u tomati pm2 restart all
```

## 📋 CONFIGURATION FINALE

**Structure Hébergement:**
```
/home/tomati/tomati-market/
├── client/              # Frontend React
├── server/              # Backend Express  
├── shared/              # Types partagés
├── dist/                # Code compilé
├── logs/                # Logs PM2
├── .env                 # Configuration corrigée
└── ecosystem.config.cjs # PM2 configuration
```

**Base de Données:**
- **Nom:** `tomati_db`
- **Utilisateur:** `tomati` / `tomati123`
- **Host:** `localhost:5432`
- **Connexions:** Autorisées sans SSL

**Services Web:**
- **Application:** Port 5000
- **Nginx Proxy:** Port 80 → 5000
- **PM2:** Gestionnaire de processus
- **Auto-restart:** Configuré

## 🌐 ACCÈS FINAL

**URL Publique:** **http://51.222.111.183**

**Admin Access:**
- **URL:** http://51.222.111.183/admin
- **Login:** admin@tomati.com
- **Password:** admin123

## 🚨 DÉPANNAGE RAPIDE

**Si application inaccessible:**
```bash
# Vérifier processus
sudo -u tomati pm2 status

# Vérifier logs
sudo -u tomati pm2 logs tomati-production

# Redémarrer
sudo -u tomati pm2 restart tomati-production
```

**Si erreurs base de données:**
```bash
# Test connexion
sudo -u tomati psql -h localhost -U tomati -d tomati_db -c "SELECT NOW();"

# Redémarrer PostgreSQL
sudo systemctl restart postgresql
```

## ✅ SUCCÈS HÉBERGEMENT

Votre application Tomati Market sera hébergée avec succès sur **http://51.222.111.183** après exécution du script de correction finale.

**Durée totale:** 3-5 minutes pour la correction
**État final:** Application 100% fonctionnelle en production