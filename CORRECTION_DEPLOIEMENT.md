# Correction Déploiement - Commandes Exactes

## Situation Actuelle
- Vous êtes connecté en tant que `tomati@vps-8dfc48b5:~$`
- L'application existe déjà dans `tomati-market/`
- PM2 a été arrêté correctement

## Commandes Correctes à Exécuter

### Étape 1: Aller dans le répertoire existant
```bash
cd tomati-market
```

### Étape 2: Sauvegarder la version actuelle
```bash
cp -r dist dist-backup-$(date +%Y%m%d_%H%M%S)
```

### Étape 3: Récupérer la nouvelle version depuis GitHub
```bash
git pull origin main
```

### Étape 4: Installer les nouvelles dépendances
```bash
npm install --production
```

### Étape 5: Construire la nouvelle version
```bash
npm run build
```

### Étape 6: Appliquer les migrations de base de données
```bash
npm run db:push
```

### Étape 7: Redémarrer l'application
```bash
pm2 start ecosystem.config.js --env production --name tomati-production
```

### Étape 8: Vérifier le statut
```bash
pm2 status
pm2 logs tomati-production --lines 10
```

### Étape 9: Tester l'application
```bash
curl http://localhost:5000
```

## Commandes Une par Une
Tapez ces commandes exactement dans cet ordre :

1. `cd tomati-market`
2. `cp -r dist dist-backup-$(date +%Y%m%d_%H%M%S)`
3. `git pull origin main`
4. `npm install --production`
5. `npm run build`
6. `npm run db:push`
7. `pm2 start ecosystem.config.js --env production --name tomati-production`
8. `pm2 status`
9. `curl http://localhost:5000`