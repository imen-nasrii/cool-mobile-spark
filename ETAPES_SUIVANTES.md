# Étapes Suivantes Après Clonage

## Après avoir collé les commandes sur le VPS

Une fois que vous avez collé et exécuté le bloc de commandes sur le VPS, voici ce qui va se passer :

### 1. Vérification du déploiement
```bash
pm2 status
```
- Vous devriez voir `tomati-production` avec le statut `online`

### 2. Test des API
```bash
curl http://localhost:5000/api/stats
curl http://localhost:5000/api/products
```
- Ces commandes devraient retourner des données JSON

### 3. Test de l'accès externe
```bash
exit  # Pour sortir du user tomati
curl http://51.222.111.183/
```
- Devrait retourner du HTML de l'application

### 4. Ouvrir dans le navigateur
- Aller sur : http://51.222.111.183
- Vérifier que l'interface s'affiche avec :
  - Layout horizontal des produits
  - Police Arial
  - Pas d'erreur "Unknown Error"

## Si des erreurs apparaissent

### Problème PM2
```bash
pm2 restart tomati-production
pm2 logs tomati-production --lines 20
```

### Problème de build
```bash
cd /home/tomati/tomati-market
npm run build
pm2 restart tomati-production
```

### Problème de base de données
```bash
cd /home/tomati/tomati-market
npm run db:push
pm2 restart tomati-production
```

## Résultat attendu

Après un déploiement réussi, l'application Tomati Market sera accessible avec :
- Interface moderne avec layout horizontal
- Police Arial appliquée globalement
- Gestion d'erreur robuste avec ErrorBoundary
- Messages d'erreur en français
- Toutes les fonctionnalités opérationnelles

L'application sera stable et prête pour l'utilisation en production sur http://51.222.111.183