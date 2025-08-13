# Correction du conflit de port 5000

## Problème identifié
L'application ne peut pas démarrer car le port 5000 est déjà utilisé par un autre processus.

## Solution - Commandes à exécuter sur le VPS

```bash
# En tant qu'utilisateur hamdi sur le VPS

# 1. Arrêter tous les processus PM2
pm2 delete all
pm2 kill

# 2. Identifier et arrêter tous les processus utilisant le port 5000
sudo lsof -ti :5000 | xargs sudo kill -9 2>/dev/null || true
sudo fuser -k 5000/tcp 2>/dev/null || true
sudo killall node 2>/dev/null || true

# 3. Vérifier que le port est libre
sudo lsof -i :5000
# (Cette commande ne devrait rien retourner)

# 4. Aller dans le répertoire de l'application
cd ~/cool-mobile-spark

# 5. Vérifier que la configuration PM2 utilise le bon port
cat ecosystem.config.cjs

# 6. Redémarrer l'application proprement
pm2 start ecosystem.config.cjs

# 7. Vérifier le statut
pm2 status
pm2 logs tomati-hamdi --lines 5

# 8. Tester l'accès
curl http://localhost:5000
curl -I http://tomati.org

# 9. Sauvegarder la configuration
pm2 save

echo "✅ Port 5000 libéré et application redémarrée"
```

## Vérification finale

Une fois ces commandes exécutées :
- PM2 devrait montrer tomati-hamdi en statut "online"
- Les logs ne devraient plus montrer d'erreur EADDRINUSE
- http://tomati.org devrait être accessible avec la nouvelle version

## En cas de problème persistant

Si le problème persiste, utiliser un port alternatif :

```bash
# Modifier la configuration pour utiliser le port 3001
sed -i 's/PORT: 5000/PORT: 3001/g' ecosystem.config.cjs

# Mettre à jour la configuration Nginx
sudo sed -i 's/proxy_pass http:\/\/localhost:5000/proxy_pass http:\/\/localhost:3001/g' /etc/nginx/sites-available/tomati.org
sudo nginx -t
sudo systemctl reload nginx

# Redémarrer avec le nouveau port
pm2 restart tomati-hamdi
```