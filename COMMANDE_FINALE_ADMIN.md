# Commande Finale avec Utilisateur Admin

## 🚀 Une seule commande pour tout faire

```bash
curl -sSL https://raw.githubusercontent.com/imen-nasrii/cool-mobile-spark/main/deploy-avec-admin.sh | bash
```

## 📋 Ou télécharger et exécuter

```bash
wget https://raw.githubusercontent.com/imen-nasrii/cool-mobile-spark/main/deploy-avec-admin.sh
chmod +x deploy-avec-admin.sh
./deploy-avec-admin.sh
```

## ✅ Ce que fait le script automatiquement

1. **Crée l'utilisateur admin** avec privilèges sudo
2. **Configure PostgreSQL** avec vos paramètres (`tomatii_db`, `tomatii_user`, `tomatii_password_2024!`)
3. **Installe Node.js** via NVM pour l'utilisateur admin
4. **Clone votre application** depuis GitHub
5. **Configure l'environnement** (.env avec vos paramètres)
6. **Migre la base de données** avec `npm run db:push`
7. **Build l'application** pour la production
8. **Configure PM2** avec redémarrage automatique
9. **Configure Nginx** comme reverse proxy
10. **Active le pare-feu** UFW
11. **Crée les scripts** de gestion (deploy.sh, monitor.sh)

## 🎯 Après exécution

Votre application sera accessible sur:
- **http://tomati.org** (votre domaine)
- **http://localhost:5000** (local)

## 🔧 Commandes de gestion avec admin

```bash
# Passer à l'utilisateur admin
sudo su - admin

# Voir le statut de l'application
pm2 status

# Voir les logs en temps réel
pm2 logs tomati-production

# Redémarrer l'application
pm2 restart tomati-production

# Monitoring complet du système
./monitor.sh

# Mise à jour de l'application depuis GitHub
./deploy.sh
```

## 🚨 Si problème

```bash
# Vérifier les services
sudo systemctl status nginx
sudo systemctl status postgresql

# Logs détaillés
sudo su - admin -c "pm2 logs tomati-production --lines 50"

# Redémarrage complet
sudo su - admin -c "pm2 restart tomati-production"
sudo systemctl restart nginx
```

---

**Une seule commande suffit pour déployer complètement votre marketplace Tomati avec l'utilisateur admin !**