# Mise à Jour GitHub et Déploiement

## Étape 1: Commit et Push depuis Replit Interface
1. Dans l'interface Replit (image que vous avez partagée)
2. Message de commit: "Latest version with white/Arial minimalist design and responsive improvements"
3. Cliquer "Stage and commit all changes"
4. Puis Push vers GitHub

## Étape 2: Déployer sur VPS depuis GitHub
Une fois le push effectué, exécuter sur le VPS:

```bash
ssh ubuntu@51.222.111.183
sudo su - tomati
cd ~/tomati-market

# Arrêter l'application
pm2 stop tomati-production

# Récupérer la vraie dernière version depuis GitHub
git pull origin main

# Vérifier qu'on a la bonne version
git log --oneline -3

# Supprimer ancien build et rebuilder
rm -rf dist/
npm run build

# Vérifier les nouveaux assets
ls -la dist/public/assets/
head -15 dist/public/index.html

# Redémarrer
NODE_ENV=production PORT=5000 DATABASE_URL="postgresql://tomati:Tomati123@localhost:5432/tomati_market" pm2 start dist/index.js --name tomati-production

# Test
curl http://localhost:5000 | head -15
exit
curl http://51.222.111.183 | head -15
```

## Vérification Finale
Après ces étapes, vous devriez voir:
- Les bons assets: `index-BeVWCdut.js` et `index-ByxZQitR.css`
- Interface blanche/Arial minimaliste
- Design responsive correct

## Alternative: Transfert Direct
Si GitHub pose problème, je peux créer une archive tar.gz que vous transférez directement.