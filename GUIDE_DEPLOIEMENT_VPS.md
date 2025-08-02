# Guide de Déploiement VPS - Tomati Market

## 🚀 Déploiement Automatisé

### Étape 1: Connexion au VPS
```bash
ssh ubuntu@51.222.111.183
```

### Étape 2: Téléchargement et Exécution du Script
```bash
# Télécharger le script de déploiement
wget https://raw.githubusercontent.com/imen-nasrii/cool-mobile-spark/main/deploy-vps.sh

# Rendre le script exécutable
chmod +x deploy-vps.sh

# Exécuter le déploiement
sudo ./deploy-vps.sh
```

## 📋 Ce que fait le script automatiquement

### 1. **Installation des Prérequis**
- Git
- Node.js 18
- PM2 (Process Manager)
- PostgreSQL
- Nginx

### 2. **Configuration de l'Application**
- Clone du repository GitHub
- Installation des dépendances npm
- Build de l'application
- Configuration de l'environnement (.env)

### 3. **Configuration de la Base de Données**
- Création de l'utilisateur PostgreSQL `tomati`
- Création de la base de données `tomati_db`
- Migration des tables via Drizzle

### 4. **Configuration PM2**
- Démarrage en mode cluster
- Configuration du redémarrage automatique
- Logs centralisés
- Monitoring des performances

### 5. **Configuration Nginx**
- Proxy reverse vers l'application
- Gestion des fichiers statiques
- Configuration du cache
- Support des WebSockets

## 🔧 Variables d'Environnement

Le script configure automatiquement ces variables dans `.env` :

```env
# Base de données
DATABASE_URL=postgresql://tomati:tomati123@localhost:5432/tomati_db
PGUSER=tomati
PGPASSWORD=tomati123
PGDATABASE=tomati_db
PGHOST=localhost
PGPORT=5432

# Sécurité
JWT_SECRET=your-super-secret-jwt-key-change-in-production
SESSION_SECRET=your-super-secret-session-key-change-in-production

# Application
NODE_ENV=production
PORT=5000
REPL_ID=tomati-market
REPLIT_DOMAINS=51.222.111.183,tomati.org
```

## 📊 Commandes de Gestion

### Statut de l'Application
```bash
sudo -u tomati pm2 status
```

### Logs en Temps Réel
```bash
sudo -u tomati pm2 logs tomati-production
```

### Redémarrage
```bash
sudo -u tomati pm2 restart tomati-production
```

### Arrêt
```bash
sudo -u tomati pm2 stop tomati-production
```

### Monitoring
```bash
sudo -u tomati pm2 monit
```

## 🔍 Vérifications Post-Déploiement

### 1. Vérifier l'Application
```bash
curl http://localhost:5000
```

### 2. Vérifier Nginx
```bash
sudo nginx -t
sudo systemctl status nginx
```

### 3. Vérifier PostgreSQL
```bash
sudo systemctl status postgresql
sudo -u postgres psql -c "\l" # Lister les bases de données
```

### 4. Vérifier les Logs
```bash
# Logs de l'application
sudo -u tomati pm2 logs tomati-production

# Logs Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🌐 Accès à l'Application

Une fois le déploiement terminé, l'application sera accessible sur :
- **IP**: http://51.222.111.183
- **Domaine**: http://tomati.org (après configuration DNS)

## 🔒 Sécurité

### Changement des Secrets (Important!)
```bash
# Éditer le fichier .env
sudo -u tomati nano /home/tomati/tomati-market/.env

# Générer de nouveaux secrets
openssl rand -hex 32  # Pour JWT_SECRET
openssl rand -hex 32  # Pour SESSION_SECRET

# Redémarrer après modification
sudo -u tomati pm2 restart tomati-production
```

### Firewall
```bash
# Configurer UFW
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## 🔄 Mise à Jour de l'Application

### Script de Mise à Jour Rapide
```bash
#!/bin/bash
cd /home/tomati/tomati-market
sudo -u tomati git pull origin main
sudo -u tomati npm install
sudo -u tomati npm run build
sudo -u tomati npm run db:push
sudo -u tomati pm2 restart tomati-production
```

## ⚠️ Dépannage

### L'application ne démarre pas
```bash
# Vérifier les logs d'erreur
sudo -u tomati pm2 logs tomati-production --err

# Vérifier la configuration
sudo -u tomati pm2 describe tomati-production
```

### Problème de base de données
```bash
# Vérifier la connexion PostgreSQL
sudo -u tomati psql -h localhost -U tomati -d tomati_db -c "SELECT version();"

# Relancer les migrations
cd /home/tomati/tomati-market
sudo -u tomati npm run db:push
```

### Problème Nginx
```bash
# Tester la configuration
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx

# Vérifier les logs
sudo journalctl -u nginx
```

## 📈 Monitoring et Maintenance

### Sauvegarde de la Base de Données
```bash
# Créer une sauvegarde
sudo -u postgres pg_dump tomati_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurer une sauvegarde
sudo -u postgres psql tomati_db < backup_file.sql
```

### Nettoyage des Logs
```bash
# Nettoyer les logs PM2
sudo -u tomati pm2 flush

# Rotation des logs Nginx
sudo logrotate /etc/logrotate.d/nginx
```

## 🎯 Performance

### Optimisation PM2
- L'application utilise le mode cluster pour de meilleures performances
- Redémarrage automatique en cas de crash
- Monitoring de la mémoire (limite à 1GB)

### Optimisation Nginx
- Cache des fichiers statiques (1 an)
- Compression gzip activée
- Support des connexions persistantes

---

**Support**: Pour toute question, consultez les logs ou contactez l'équipe de développement.