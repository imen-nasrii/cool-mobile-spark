# Commandes de Déploiement Rapide - Application Tomati

## 🚀 Déploiement en Une Commande

Connectez-vous à votre VPS OVH en SSH et exécutez ces commandes :

```bash
# 1. Connexion SSH à votre VPS
ssh root@VOTRE_IP_VPS

# 2. Téléchargement du script de déploiement
wget -O deploy-tomati.sh https://raw.githubusercontent.com/imen-nasrii/cool-mobile-spark/main/deploy-automatique-vps.sh

# 3. Donner les permissions d'exécution
chmod +x deploy-tomati.sh

# 4. (IMPORTANT) Modifier le domaine dans le script
nano deploy-tomati.sh
# Changez la ligne : DOMAIN="votre-domaine.com"
# Par votre vrai domaine : DOMAIN="tomati.org"

# 5. Lancement du déploiement automatique
./deploy-tomati.sh
```

## 🔧 Base de Données (Vos Paramètres)

Le script utilise automatiquement vos paramètres de base de données :

```sql
CREATE DATABASE tomatii_db;
CREATE USER tomatii_user WITH ENCRYPTED PASSWORD 'tomatii_password_2024!';
GRANT ALL PRIVILEGES ON DATABASE tomatii_db TO tomatii_user;
ALTER USER tomatii_user CREATEDB;
```

## ⚡ Après le Déploiement

Une fois le script terminé, votre application sera accessible sur :
- **HTTP** : http://votre-domaine.com
- **HTTPS** : https://votre-domaine.com (si SSL configuré)

### Commandes de Gestion

```bash
# Passer à l'utilisateur tomati
sudo su - tomati

# Voir le status de l'application
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

## 🛠️ Résolution de Problèmes

### Si l'application ne démarre pas :
```bash
sudo su - tomati
cd cool-mobile-spark
pm2 logs tomati-production --lines 50
```

### Si Nginx ne fonctionne pas :
```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

### Si la base de données ne se connecte pas :
```bash
sudo -u postgres psql -d tomatii_db -c "SELECT version();"
```

## 📋 Checklist de Vérification

Après le déploiement, vérifiez que :

- [ ] L'application répond sur votre domaine
- [ ] Les utilisateurs peuvent se connecter/s'inscrire
- [ ] Les produits s'affichent correctement
- [ ] Les messages en temps réel fonctionnent
- [ ] Les uploads de photos fonctionnent
- [ ] Les préférences utilisateur se sauvegardent
- [ ] Le système d'évaluation fonctionne
- [ ] HTTPS est activé (si certificat SSL installé)

## 🎉 Votre Application est Prête !

Une fois toutes les vérifications passées, votre marketplace Tomati fonctionne en production avec toutes les fonctionnalités avancées !

---

**Support** : En cas de problème, consultez les logs avec les commandes ci-dessus ou référez-vous au guide détaillé `GUIDE_DEPLOIEMENT_VPS_OVH_COMPLET.md`.