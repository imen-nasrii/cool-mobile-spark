# 📋 Guide Déploiement Détaillé - Tomati Market

## 🎯 Objectif
Déployer l'application Tomati Market depuis le repository GitHub `https://github.com/imen-nasrii/cool-mobile-spark.git` sur le VPS `51.222.111.183`.

## 📋 Prérequis
- VPS Ubuntu avec accès SSH
- Clés SSH configurées
- Accès sudo sur le serveur

## 🚀 Étapes Détaillées

### **Étape 1: Connexion au VPS**
```bash
# Ouvrir un terminal et se connecter au VPS
ssh ubuntu@51.222.111.183
```

**Vérification :**
- Vous devriez voir le prompt : `ubuntu@vps-8dfc48b5:~$`

### **Étape 2: Téléchargement du Script de Déploiement**
```bash
# Télécharger le script de déploiement automatique
wget -O deploy-tomati.sh https://raw.githubusercontent.com/imen-nasrii/cool-mobile-spark/main/deploy-github-vps.sh

# Rendre le script exécutable
chmod +x deploy-tomati.sh

# Vérifier que le script a été téléchargé
ls -la deploy-tomati.sh
```

**Vérification :**
- Le fichier `deploy-tomati.sh` doit apparaître avec les permissions `-rwxr-xr-x`

### **Étape 3: Exécution du Script de Déploiement**
```bash
# Lancer le déploiement automatique
sudo ./deploy-tomati.sh
```

**Ce qui va se passer :**
1. **Mise à jour système** (1-2 minutes)
2. **Installation Node.js 18** (2-3 minutes)
3. **Installation PostgreSQL** (2-3 minutes)
4. **Installation PM2 et Nginx** (1-2 minutes)
5. **Création utilisateur tomati** (30 secondes)
6. **Configuration base de données** (1 minute)
7. **Clone repository GitHub** (1-2 minutes)
8. **Installation dépendances** (3-5 minutes)
9. **Build application** (2-3 minutes)
10. **Configuration PM2** (30 secondes)
11. **Configuration Nginx** (30 secondes)
12. **Démarrage application** (1 minute)

**Durée totale estimée : 15-20 minutes**

### **Étape 4: Vérification du Déploiement**

#### 4.1 Vérifier le statut PM2
```bash
# Passer à l'utilisateur tomati
sudo -u tomati pm2 status
```

**Résultat attendu :**
```
┌─────┬────────────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id  │ name               │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├─────┼────────────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 0   │ tomati-production  │ default     │ 1.0.0   │ cluster │ 12345    │ 5s     │ 0    │ online    │ 0%       │ 50.0mb   │ tomati   │ disabled │
└─────┴────────────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
```

#### 4.2 Vérifier les logs
```bash
# Voir les logs récents
sudo -u tomati pm2 logs tomati-production --lines 10
```

**Logs attendus :**
```
0|tomati-p | 10:30:15 AM [express] serving on port 5000
0|tomati-p | Database connected successfully
0|tomati-p | Server started on port 5000
```

#### 4.3 Tester l'application en local
```bash
# Test de connexion locale
curl http://localhost:5000
```

**Réponse attendue :**
- Code HTML de la page d'accueil Tomati Market

#### 4.4 Tester l'application depuis l'extérieur
```bash
# Test depuis l'IP publique
curl http://51.222.111.183
```

### **Étape 5: Accéder à l'Application**

Ouvrir un navigateur web et aller à : **http://51.222.111.183**

**Page attendue :**
- Interface Tomati Market avec produits
- Design minimaliste sans titre
- Produits affichés en grille horizontale

### **Étape 6: Test des Fonctionnalités**

#### 6.1 Test Navigation
- Cliquer sur différentes catégories
- Vérifier que les produits se chargent

#### 6.2 Test Détail Produit
- Cliquer sur un produit
- Vérifier l'affichage des détails avec équipements

#### 6.3 Test Admin (optionnel)
- Aller à `http://51.222.111.183/admin`
- Se connecter avec : `admin@tomati.com` / `admin123`

## 🛠️ Configuration Créée

### **Structure des Fichiers**
```
/home/tomati/tomati-market/
├── client/              # Frontend React
├── server/              # Backend Express
├── shared/              # Types partagés
├── dist/                # Code compilé
├── logs/                # Logs PM2
├── .env                 # Variables d'environnement
├── ecosystem.config.cjs # Configuration PM2
└── package.json         # Dépendances
```

### **Services Configurés**
- **Node.js 18** : Runtime JavaScript
- **PostgreSQL** : Base de données avec utilisateur `tomati`
- **PM2** : Gestionnaire de processus
- **Nginx** : Proxy inverse et serveur web

### **Base de Données**
- **Nom** : `tomati_db`
- **Utilisateur** : `tomati`
- **Mot de passe** : `tomati123`
- **Port** : `5432`

### **Application**
- **Port interne** : `5000`
- **Port public** : `80` (via Nginx)
- **Processus** : `tomati-production`
- **Mode** : `cluster`

## 🔧 Commandes de Maintenance

### **Gestion PM2**
```bash
# Statut
sudo -u tomati pm2 status

# Logs en temps réel
sudo -u tomati pm2 logs tomati-production

# Redémarrage
sudo -u tomati pm2 restart tomati-production

# Arrêt
sudo -u tomati pm2 stop tomati-production

# Démarrage
sudo -u tomati pm2 start tomati-production
```

### **Gestion Services**
```bash
# PostgreSQL
sudo systemctl status postgresql
sudo systemctl restart postgresql

# Nginx
sudo systemctl status nginx
sudo systemctl restart nginx
```

### **Mise à Jour Code**
```bash
# Aller dans le répertoire
cd /home/tomati/tomati-market

# Récupérer les nouveautés
sudo -u tomati git pull origin main

# Installer nouvelles dépendances
sudo -u tomati npm install

# Rebuild
sudo -u tomati npm run build

# Migrer base de données
sudo -u tomati npm run db:push

# Redémarrer
sudo -u tomati pm2 restart tomati-production
```

## 🚨 Dépannage

### **Application ne démarre pas**
```bash
# Vérifier les logs d'erreur
sudo -u tomati pm2 logs tomati-production --err

# Vérifier la configuration
cat /home/tomati/tomati-market/.env

# Tester la base de données
sudo -u tomati psql -h localhost -U tomati -d tomati_db -c "SELECT version();"
```

### **Erreur 502 Bad Gateway**
```bash
# Vérifier que l'application tourne
sudo -u tomati pm2 status

# Vérifier Nginx
sudo nginx -t
sudo systemctl status nginx

# Redémarrer Nginx
sudo systemctl restart nginx
```

### **Problème de base de données**
```bash
# Vérifier PostgreSQL
sudo systemctl status postgresql

# Recréer la base
sudo -u postgres psql -c "DROP DATABASE IF EXISTS tomati_db;"
sudo -u postgres psql -c "CREATE DATABASE tomati_db OWNER tomati;"

# Refaire les migrations
cd /home/tomati/tomati-market
sudo -u tomati npm run db:push
```

## ✅ Vérification Finale

**Application déployée avec succès si :**
- PM2 montre `tomati-production` en statut `online`
- `curl http://51.222.111.183` retourne du HTML
- La page web s'affiche correctement dans le navigateur
- Les produits se chargent sans erreur

**URL finale :** **http://51.222.111.183**