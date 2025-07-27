# Correction Assets - Synchronisation Version

## Problème Identifié
**Replit (version actuelle) :**
- `index-BeVWCdut.js`
- `index-ByxZQitR.css`

**Serveur (version servie) :**
- `index-D855KB25.js`
- `index-DzpysTtv.css`

## Solution: Forcer Nouveau Build et Redéploiement

### Sur le VPS:
```bash
ssh ubuntu@51.222.111.183
sudo su - tomati
cd ~/tomati-market

# Arrêter l'application
pm2 stop tomati-production

# Supprimer complètement l'ancien build
rm -rf dist/

# Récupérer la vraie dernière version depuis GitHub
git pull origin main

# Force un nouveau build complet
npm run build

# Vérifier les nouveaux assets
ls -la dist/public/assets/
cat dist/public/index.html | grep assets

# Redémarrer avec la nouvelle version
NODE_ENV=production PORT=5000 DATABASE_URL="postgresql://tomati:Tomati123@localhost:5432/tomati_market" pm2 start dist/index.js --name tomati-production

# Vérifier
pm2 status
curl http://localhost:5000 | grep assets
```

### Vérification finale:
```bash
exit
curl http://51.222.111.183 | grep assets
```

## Résultat Attendu
Après ces commandes, les assets devraient correspondre:
- `index-BeVWCdut.js`
- `index-ByxZQitR.css`

Et l'interface devrait afficher la nouvelle version minimaliste.