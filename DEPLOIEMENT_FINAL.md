# Déploiement Version Finale - Tomati Market

## Étapes pour déployer la dernière version

### Sur votre serveur 51.222.111.183 :

```bash
# 1. Se connecter et arrêter l'application
su - tomati
cd ~/tomati-market
pm2 stop tomati-production

# 2. Sauvegarder la version actuelle
cp -r dist dist-backup-$(date +%Y%m%d_%H%M%S)

# 3. Récupérer la dernière version depuis GitHub
git pull origin main

# 4. Installer les dépendances si nécessaires
npm install

# 5. Compiler la nouvelle version
npm run build

# 6. Redémarrer l'application
pm2 restart tomati-production

# 7. Vérifier les logs
pm2 logs tomati-production --lines 10

# 8. Tester l'application
curl http://localhost:5000

# 9. Tester Nginx
exit
curl http://51.222.111.183
```

### Si Git n'est pas configuré :

```bash
# Alternative : téléchargement direct
cd ~/tomati-market
wget https://github.com/imen-nasrii/cool-mobile-spark/archive/refs/heads/main.zip
unzip main.zip
cp -r cool-mobile-spark-main/* .
rm -rf cool-mobile-spark-main main.zip

# Puis compiler et redémarrer
npm install
npm run build
pm2 restart tomati-production
pm2 logs tomati-production --lines 10
curl http://localhost:5000
```

Cette procédure déploiera la version la plus récente avec toutes les fonctionnalités actuelles.