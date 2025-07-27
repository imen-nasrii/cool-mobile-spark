# Retour à la Version Précédente

## Situation
- Version actuelle semble poser problème
- Besoin de revenir à la version qui fonctionnait

## Commandes pour Restaurer

### Sur le VPS:
```bash
# Se connecter au VPS
ssh ubuntu@51.222.111.183
sudo su - tomati
cd ~/tomati-market

# Arrêter l'application actuelle
pm2 stop tomati-production
pm2 delete tomati-production

# Restaurer l'ancienne version (si sauvegarde disponible)
ls -la dist*
# Choisir la sauvegarde la plus récente qui fonctionnait
# Exemple: mv dist-backup-20250727_112000 dist

# OU : Récupérer une version spécifique depuis GitHub
git log --oneline -10
git checkout <commit-hash-qui-fonctionnait>
npm install
npm run build

# Redémarrer
NODE_ENV=production PORT=5000 DATABASE_URL="postgresql://tomati:Tomati123@localhost:5432/tomati_market" pm2 start dist/index.js --name tomati-production

# Vérifier
pm2 status
pm2 logs tomati-production --lines 10
curl http://localhost:5000
```

### Vérification externe:
```bash
exit
curl http://51.222.111.183
```

## Alternative: Version Stable Connue
Si vous avez une version spécifique qui fonctionnait bien, nous pouvons:
1. Identifier le commit exact
2. Faire un checkout sur ce commit
3. Rebuilder et redéployer

## Questions
- Quelle était la dernière version qui fonctionnait bien ?
- Y a-t-il un problème spécifique avec la version actuelle ?
- Voulez-vous revenir à une sauvegarde ou un commit spécifique ?