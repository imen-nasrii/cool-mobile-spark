# Reconstruction avec port 5001 - Solution finale

## Problème identifié
L'application utilise toujours le port 5000 car le fichier `dist/index.js` a été construit avec l'ancienne configuration. Il faut reconstruire avec PORT=5001.

## Solution - Commandes à exécuter

```bash
# En tant qu'utilisateur hamdi

# 1. Arrêter l'application défaillante
cd ~/cool-mobile-spark
pm2 delete tomati-hamdi

# 2. Vérifier la configuration .env (doit contenir PORT=5001)
cat .env | grep PORT

# 3. Vérifier la configuration PM2 (doit contenir PORT: 5001)
cat ecosystem.config.cjs | grep PORT

# 4. IMPORTANT: Reconstruire avec les nouvelles variables
npm run build

# 5. Vérifier que Nginx pointe vers le bon port
sudo cat /etc/nginx/sites-available/tomati.org | grep proxy_pass

# 6. Démarrer l'application reconstruite
pm2 start ecosystem.config.cjs

# 7. Vérifications finales
sleep 5
pm2 status
pm2 logs tomati-hamdi --lines 5
curl http://localhost:5001
curl -I http://tomati.org

# 8. Sauvegarder si tout fonctionne
pm2 save

echo "✅ Application reconstruite et opérationnelle sur port 5001"
```

## Diagnostic supplémentaire

Si le problème persiste, vérifier les logs de construction :
```bash
# Voir si la construction utilise les bonnes variables
cat .env
npm run build 2>&1 | grep -i port
```

## Résultat attendu

Après la reconstruction :
- ✅ L'application utilisera le port 5001 (au lieu de 5000)
- ✅ PM2 montrera tomati-hamdi en statut "online" sans erreur
- ✅ Les logs ne montreront plus d'erreur EADDRINUSE
- ✅ curl http://localhost:5001 retournera la page HTML
- ✅ tomati.org sera accessible via Nginx (proxy vers :5001)