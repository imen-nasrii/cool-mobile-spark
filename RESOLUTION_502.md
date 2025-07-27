# Résolution Erreur 500 - Migration Base de Données

## Problème Identifié
```
Error: column "real_estate_type" of relation "products" does not exist
```

La nouvelle version contient des colonnes qui n'existent pas dans la base de données de production.

## Solution: Migration Base de Données sur VPS

### Commandes à exécuter sur le VPS:
```bash
ssh ubuntu@51.222.111.183
sudo su - tomati
cd ~/tomati-market

# Vérifier les logs PM2 pour confirmer l'erreur
pm2 logs tomati-production --lines 20

# Appliquer la migration de base de données
npm run db:push

# Redémarrer l'application
pm2 restart tomati-production

# Vérifier que ça fonctionne
pm2 logs tomati-production --lines 10
curl http://localhost:5000/api/stats
```

### Vérification finale:
```bash
exit
curl http://51.222.111.183/api/stats
```

## Colonnes Manquantes Probables
- `real_estate_type`
- `job_contract_type`
- `job_sector`
- Autres champs category-specific ajoutés récemment

## Alternative si Migration Échoue
```bash
# Voir le schéma actuel
psql -U tomati -d tomati_market
\d products
\q

# Forcer migration
npm run db:push --force
```

## Test de Fonctionnement
Une fois la migration appliquée:
- `/api/stats` doit retourner 200
- `/api/products` doit fonctionner
- Interface doit charger sans erreurs 500