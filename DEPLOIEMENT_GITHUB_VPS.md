# 🚀 Déploiement VPS depuis GitHub - Tomati Market

## 📋 Commandes de Déploiement Rapide

### 🔥 Déploiement Complet (Première Installation)
```bash
# Connexion au VPS
ssh ubuntu@51.222.111.183

# Déploiement automatique en une commande
curl -sSL https://raw.githubusercontent.com/imen-nasrii/cool-mobile-spark/main/deploy-vps.sh | sudo bash
```

### ⚡ Mise à Jour Rapide (Application Existante)
```bash
# Connexion au VPS
ssh ubuntu@51.222.111.183

# Mise à jour depuis GitHub
curl -sSL https://raw.githubusercontent.com/imen-nasrii/cool-mobile-spark/main/deploy-simple.sh | bash
```

## 🎯 Vérification Post-Déploiement

### 1. Statut de l'Application
```bash
sudo -u tomati pm2 status
```

### 2. Test d'Accès
```bash
curl http://51.222.111.183
```

### 3. Logs en Temps Réel
```bash
sudo -u tomati pm2 logs tomati-production
```

## 🔧 Configuration Manuelle (Si Nécessaire)

### Variables d'Environnement
```bash
# Éditer le fichier .env
sudo -u tomati nano /home/tomati/tomati-market/.env
```

### Contenu du fichier .env :
```env
DATABASE_URL=postgresql://tomati:tomati123@localhost:5432/tomati_db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
SESSION_SECRET=your-super-secret-session-key-change-in-production
NODE_ENV=production
PORT=5000
REPL_ID=tomati-market
REPLIT_DOMAINS=51.222.111.183,tomati.org
```

## 📊 Monitoring

### Commandes Utiles
```bash
# Statut général
sudo -u tomati pm2 status

# Redémarrage
sudo -u tomati pm2 restart tomati-production

# Arrêt
sudo -u tomati pm2 stop tomati-production

# Monitoring en temps réel
sudo -u tomati pm2 monit
```

## 🌐 Accès Final

Une fois déployé, l'application sera accessible sur :
- **URL Production**: http://51.222.111.183
- **Port**: 5000
- **Domaine**: http://tomati.org (après configuration DNS)

## ⚠️ Important

1. **Première Installation**: Utilisez le script `deploy-vps.sh` 
2. **Mises à Jour**: Utilisez le script `deploy-simple.sh`
3. **Secrets**: Changez les clés JWT et Session en production
4. **DNS**: Configurez tomati.org pour pointer vers 51.222.111.183

## 🔍 Dépannage Rapide

### Si l'application ne démarre pas :
```bash
# Vérifier les logs d'erreur
sudo -u tomati pm2 logs tomati-production --err

# Vérifier la base de données
sudo systemctl status postgresql

# Redémarrage complet
sudo -u tomati pm2 restart all
sudo systemctl restart nginx
```

### Architecture du Déploiement
```
Internet → Nginx (Port 80) → Node.js App (Port 5000) → PostgreSQL (Port 5432)
```

---

**Repository**: https://github.com/imen-nasrii/cool-mobile-spark.git  
**Support**: Consultez les logs PM2 et Nginx pour diagnostiquer les problèmes