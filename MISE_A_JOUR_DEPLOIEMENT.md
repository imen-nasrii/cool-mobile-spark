# Mise à Jour Déploiement - Nouvelle Version

## 🔄 Commandes de Mise à Jour Rapide

### Étape 1: Se connecter au VPS
```bash
ssh ubuntu@51.222.111.183
sudo su - tomati
cd ~/tomati-market
```

### Étape 2: Sauvegarder et arrêter
```bash
# Créer sauvegarde rapide
cp -r dist dist-backup-$(date +%Y%m%d_%H%M%S)

# Arrêter l'application
pm2 stop tomati-production
```

### Étape 3: Récupérer nouvelle version
```bash
# Récupérer les derniers changements
git pull origin main

# Réinstaller les dépendances si nécessaire
npm install --production
```

### Étape 4: Rebuilder et redémarrer
```bash
# Rebuild l'application
npm run build

# Appliquer migrations DB si nécessaire
npm run db:push

# Redémarrer l'application
pm2 restart tomati-production

# Vérifier le statut
pm2 status tomati-production
pm2 logs tomati-production --lines 10
```

### Étape 5: Test final
```bash
# Test local
curl http://localhost:5000

# Sortir et tester externe
exit
curl http://51.222.111.183
```

## 🚀 Script de Mise à Jour Automatique

Si vous préférez un script automatique, utilisez les commandes ci-dessus dans l'ordre.

## ⚠️ En cas de problème

### Restaurer l'ancienne version
```bash
pm2 stop tomati-production
rm -rf dist
mv dist-backup-YYYYMMDD_HHMMSS dist
pm2 restart tomati-production
```

### Vérifier les logs
```bash
pm2 logs tomati-production --err
tail -f /var/log/nginx/error.log
```