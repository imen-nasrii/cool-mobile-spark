# Étapes Suivantes - Migration Base de Données

## Configuration Vérifiée ✅
- Fichier .env correct avec DATABASE_URL
- Variables PostgreSQL configurées

## Commandes à Exécuter Maintenant

```bash
# Appliquer la migration pour ajouter les nouvelles colonnes
npm run db:push

# Redémarrer l'application
pm2 restart tomati-production

# Vérifier les logs
pm2 logs tomati-production --lines 10

# Tester l'API
curl http://localhost:5000/api/stats
curl http://localhost:5000/api/products

# Test externe
exit
curl http://51.222.111.183/api/stats
```

## Colonnes à Ajouter
La migration va créer ces nouvelles colonnes dans la table `products`:
- `real_estate_type`
- `real_estate_rooms`
- `real_estate_bathrooms`
- `real_estate_surface`
- `job_type`
- `job_sector`
- Et toutes les autres nouvelles colonnes

## Résultat Attendu
- Erreurs 500 disparaissent
- API retourne 200
- Interface fonctionne sans erreurs
- Nouvelles fonctionnalités immobilier/emploi opérationnelles