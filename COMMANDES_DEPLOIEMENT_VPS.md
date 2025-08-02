# 🚀 Déploiement VPS 51.222.111.183

## Étape 1: Connexion au VPS
```bash
ssh ubuntu@51.222.111.183
```

## Étape 2: Déploiement en Une Commande

### Option A: Installation Complète (Première fois)
```bash
wget -O deploy.sh https://raw.githubusercontent.com/imen-nasrii/cool-mobile-spark/main/deploy-vps.sh && chmod +x deploy.sh && sudo ./deploy.sh
```

### Option B: Mise à Jour Rapide (Si déjà installé)
```bash
wget -O update.sh https://raw.githubusercontent.com/imen-nasrii/cool-mobile-spark/main/deploy-simple.sh && chmod +x update.sh && ./update.sh
```

## Étape 3: Vérification
```bash
# Vérifier le statut
sudo -u tomati pm2 status

# Tester l'accès
curl http://localhost:5000

# Voir les logs
sudo -u tomati pm2 logs tomati-production
```

## ✅ Application Accessible
Après déploiement, votre application sera disponible sur:
**http://51.222.111.183**

## 🔧 Commandes de Maintenance
```bash
# Redémarrer
sudo -u tomati pm2 restart tomati-production

# Arrêter
sudo -u tomati pm2 stop tomati-production

# Monitoring
sudo -u tomati pm2 monit
```