# Déploiement Layout Horizontal + Migration DB

## État Actuel
- ✅ Layout horizontal créé dans Replit
- ✅ Police Arial appliquée globalement
- ✅ Archive prête pour déploiement
- ⚠️ VPS nécessite migration DB + nouveau layout

## Commandes VPS Complètes

### 1. Transférer l'archive
```bash
scp tomati-horizontal-layout.tar.gz ubuntu@51.222.111.183:/tmp/
```

### 2. Se connecter et déployer
```bash
ssh ubuntu@51.222.111.183
sudo su - tomati
cd ~/tomati-market

# Arrêter l'application
pm2 stop tomati-production

# Sauvegarder
cp -r client/src/components/Products client/src/components/Products.backup
cp client/src/index.css client/src/index.css.backup

# Extraire les nouvelles modifications
tar -xzf /tmp/tomati-horizontal-layout.tar.gz -C .

# MIGRATION CRITIQUE - Appliquer les nouvelles colonnes DB
npm run db:push

# Reconstruire avec le nouveau layout
npm run build

# Redémarrer PM2
pm2 restart tomati-production

# Vérifier immédiatement
pm2 logs tomati-production --lines 20
pm2 status
```

### 3. Tests de validation
```bash
# Test API local
curl http://localhost:5000/api/products
curl http://localhost:5000/api/stats

# Sortir et tester externe
exit
curl http://51.222.111.183/api/products
curl http://51.222.111.183/
```

## Résultat Attendu

### Interface
- ✅ Produits affichés en ligne horizontale
- ✅ Image 24x24 à gauche + détails à droite
- ✅ Police Arial sur tous les éléments
- ✅ Layout responsive conservé

### API
- ✅ Toutes les routes retournent 200 OK
- ✅ Plus d'erreurs 500 sur /api/products/promoted
- ✅ Base de données avec nouvelles colonnes

### Production
- ✅ Application accessible sur http://51.222.111.183
- ✅ Interface moderne et propre
- ✅ Performance optimisée

## Dépannage

Si erreurs 500 persistent :
```bash
# Voir les logs d'erreur
pm2 logs tomati-production --err --lines 50

# Forcer la migration DB
npx drizzle-kit push --config=drizzle.config.ts

# Vérifier la structure DB
psql -U tomati -d tomati_market -c "\d products"
```

## Prochaines Étapes
1. Validation complète de l'interface
2. Tests de performance
3. Configuration finale du domaine tomati.org