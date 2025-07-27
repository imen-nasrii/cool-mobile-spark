# Correction Dépendances - Installation Complète

## Problème Identifié
- `vite` et `drizzle-kit` ne sont pas installés (dépendances de développement manquantes)
- Installation `--production` exclut les outils de build nécessaires

## Solution: Installer Toutes les Dépendances

### Commandes à Exécuter :

```bash
# 1. Installer TOUTES les dépendances (dev + production)
npm install

# 2. Construire l'application
npm run build

# 3. Appliquer les migrations
npm run db:push

# 4. Redémarrer l'application
pm2 start ecosystem.config.js --env production --name tomati-production

# 5. Vérifier le statut
pm2 status

# 6. Consulter les logs
pm2 logs tomati-production --lines 10

# 7. Tester l'application
curl http://localhost:5000
```

## Explication
- `npm install --production` exclut vite, drizzle-kit, esbuild
- Ces outils sont nécessaires pour le build même en production
- Solution: `npm install` (sans --production) pour avoir tous les outils

## Test Final
```bash
# Tester depuis l'extérieur
exit
curl http://51.222.111.183
```