# Résolution Erreur 502 Bad Gateway

## Diagnostic requis

L'erreur 502 indique que Nginx ne peut pas se connecter à l'application sur le port 5000.

### Commandes à exécuter sur le serveur :

```bash
# 1. Vérifier le statut PM2
sudo su - tomati
pm2 status
pm2 logs tomati-market --lines 10

# 2. Vérifier si le port 5000 écoute
netstat -tlnp | grep :5000
ss -tlnp | grep :5000

# 3. Tester la connexion locale
curl http://localhost:5000

# 4. Si PM2 est arrêté, le redémarrer
pm2 restart tomati-market

# 5. Si problème persiste, démarrer manuellement pour voir les erreurs
NODE_ENV=production node dist/index.js
```

### Solutions possibles :

1. **Redémarrer PM2** si l'application s'est arrêtée
2. **Vérifier les variables d'environnement** dans le fichier .env
3. **Corriger la configuration Nginx** si nécessaire
4. **Vérifier les permissions** et dépendances