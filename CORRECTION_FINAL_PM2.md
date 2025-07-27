# Correction Finale - Migration Base de Données VPS

## Situation Actuelle
- Erreurs 500 persistent sur toutes les API
- Base de données pas encore migrée
- Nouvelles colonnes manquantes

## Commandes Exactes VPS

```bash
# Se connecter au VPS
ssh ubuntu@51.222.111.183
sudo su - tomati
cd ~/tomati-market

# Vérifier l'état actuel PM2
pm2 status

# Arrêter l'application
pm2 stop tomati-production

# Appliquer la migration DB (CRITIQUE)
npm run db:push

# Si erreur, vérifier drizzle config
cat drizzle.config.ts

# Forcer la migration si nécessaire
npx drizzle-kit push

# Redémarrer l'application
pm2 restart tomati-production

# Vérifier les logs immédiatement
pm2 logs tomati-production --lines 20

# Test API direct
curl -v http://localhost:5000/api/stats
curl -v http://localhost:5000/api/products

# Si toujours erreur 500, voir logs détaillés
pm2 logs tomati-production --err --lines 50
```

## Diagnostic Avancé
```bash
# Vérifier connexion DB
psql -U tomati -d tomati_market -c "\d products"

# Voir les colonnes actuelles
psql -U tomati -d tomati_market -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'products';"

# Test direct Node
node -e "console.log(process.env.DATABASE_URL)"
```

## Solution Alternative
Si npm run db:push échoue:
```bash
# Recréer complètement la DB
dropdb -U tomati tomati_market
createdb -U tomati tomati_market
npm run db:push
```