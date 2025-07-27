# Déploiement Étape par Étape - Tomati Market

## 📋 Prérequis
- VPS accessible : 51.222.111.183
- Accès SSH configuré
- Application actuelle fonctionnelle

## 🚀 Étapes de Déploiement

### Étape 1: Préparer la nouvelle version
```bash
# Sur Replit - Construction de l'application
npm run build
```

### Étape 2: Créer l'archive de déploiement
```bash
# Créer le package avec tous les fichiers nécessaires
tar -czf tomati-latest.tar.gz dist/ server/ package.json package-lock.json ecosystem.config.js shared/ drizzle.config.ts
```

### Étape 3: Transférer vers le VPS
```bash
# Copier l'archive vers le serveur
scp tomati-latest.tar.gz ubuntu@51.222.111.183:/home/tomati/
```

### Étape 4: Se connecter au VPS
```bash
# Connexion SSH
ssh ubuntu@51.222.111.183

# Basculer vers l'utilisateur tomati
sudo su - tomati

# Aller dans le répertoire de l'application
cd ~/tomati-market
```

### Étape 5: Sauvegarder la version actuelle
```bash
# Créer une sauvegarde horodatée
cp -r dist dist-backup-$(date +%Y%m%d_%H%M%S)

# Vérifier la sauvegarde
ls -la dist*
```

### Étape 6: Arrêter l'application
```bash
# Arrêter PM2
pm2 stop tomati-production

# Vérifier l'arrêt
pm2 status
```

### Étape 7: Déployer la nouvelle version
```bash
# Extraire la nouvelle version
tar -xzf ~/tomati-latest.tar.gz

# Vérifier l'extraction
ls -la dist/
```

### Étape 8: Installer les dépendances
```bash
# Installation des nouvelles dépendances
npm install --production --silent

# Vérifier node_modules
ls node_modules/ | wc -l
```

### Étape 9: Migrer la base de données
```bash
# Appliquer les changements de schéma
npm run db:push
```

### Étape 10: Redémarrer l'application
```bash
# Redémarrer avec PM2
pm2 restart tomati-production

# Attendre le démarrage
sleep 5

# Vérifier le statut
pm2 status tomati-production
```

### Étape 11: Vérifier les logs
```bash
# Consulter les logs récents
pm2 logs tomati-production --lines 20

# Si erreurs, voir les détails
pm2 logs tomati-production --err
```

### Étape 12: Tester l'application
```bash
# Test local sur le serveur
curl http://localhost:5000

# Test externe
curl http://51.222.111.183

# Test de l'API
curl http://51.222.111.183/api/products
```

### Étape 13: Nettoyage
```bash
# Supprimer l'archive
rm ~/tomati-latest.tar.gz

# Garder seulement les 3 dernières sauvegardes
ls -t dist-backup-* | tail -n +4 | xargs rm -rf
```

## 🚨 En cas de problème

### Restaurer l'ancienne version
```bash
pm2 stop tomati-production
rm -rf dist
mv dist-backup-YYYYMMDD_HHMMSS dist
pm2 restart tomati-production
```

### Consulter les logs détaillés
```bash
pm2 logs tomati-production --lines 100
tail -f /var/log/nginx/error.log
```

## ✅ Vérification finale

L'application doit être accessible sur :
- http://51.222.111.183
- Interface complète avec base de données
- Toutes les fonctionnalités opérationnelles

## 📞 Support

En cas de problème, vérifier :
1. Statut PM2 : `pm2 status`
2. Logs application : `pm2 logs tomati-production`
3. Logs Nginx : `sudo tail -f /var/log/nginx/error.log`
4. Base de données : Test de connexion PostgreSQL