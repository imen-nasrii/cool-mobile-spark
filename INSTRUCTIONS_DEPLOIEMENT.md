# 🚀 Instructions de Déploiement - Tomati Market sur VPS OVH

## Résumé Rapide

Votre domaine **tomati.org** est déjà configuré (✅) et pointe vers **213.186.33.5**.

## Étapes de Déploiement

### 1. Préparation du code
```bash
# Sur votre machine locale, préparez le code pour le déploiement
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### 2. Lancement du script automatisé
```bash
# Exécutez le script de déploiement
./scripts/deploy-ovh.sh
```

### 3. Connexion au serveur
```bash
ssh root@213.186.33.5
```

### 4. Configuration de la base de données
```bash
# Exécutez le script de configuration DB
./setup-database.sh
```

### 5. Déploiement de l'application
```bash
# Basculez sur l'utilisateur tomati
su - tomati

# Clonez votre projet (remplacez par votre repo GitHub)
git clone https://github.com/votre-username/tomati-market.git
cd tomati-market

# Installation et build
npm install
npm run build

# Configuration des variables d'environnement
nano .env
```

Contenu du fichier `.env` :
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://tomati_user:VOTRE_PASSWORD@localhost:5432/tomati_production
JWT_SECRET=votre_jwt_secret_super_long_et_securise_32_caracteres_minimum
SESSION_SECRET=votre_session_secret_tres_securise
```

### 6. Migration de la base de données
```bash
npm run db:push
```

### 7. Démarrage avec PM2
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 8. Configuration SSL
```bash
# Retour en root
exit
sudo certbot --nginx -d tomati.org -d www.tomati.org
```

### 9. Vérification
```bash
# Vérifier le statut
pm2 status
pm2 logs tomati-market

# Tester l'accès
curl http://localhost:5000
curl https://tomati.org
```

## ✅ Checklist Post-Déploiement

- [ ] Application accessible sur https://tomati.org
- [ ] SSL configuré et fonctionnel
- [ ] Base de données connectée
- [ ] Logs sans erreurs (`pm2 logs tomati-market`)
- [ ] Inscription/connexion fonctionnelle
- [ ] Création de produits opérationnelle
- [ ] Messages en temps réel actifs

## 🔧 Commandes de Maintenance

```bash
# Redémarrer l'application
pm2 restart tomati-market

# Voir les logs en temps réel
pm2 logs tomati-market --lines 50

# Voir l'utilisation des ressources
pm2 monit

# Mettre à jour l'application
cd ~/tomati-market
git pull
npm install
npm run build
pm2 restart tomati-market

# Backup de la base de données
./backup.sh
```

## 🆘 Dépannage Rapide

**Application ne démarre pas :**
```bash
pm2 logs tomati-market  # Voir les erreurs
npm run db:push  # Réinitialiser la DB si nécessaire
```

**Site inaccessible :**
```bash
sudo nginx -t  # Tester la config Nginx
sudo systemctl status nginx
sudo systemctl reload nginx
```

**Erreur de base de données :**
```bash
sudo -u postgres psql -l  # Lister les bases
sudo systemctl status postgresql
```

## 📱 Accès Final

Une fois terminé, votre application sera accessible sur :
- **https://tomati.org** (principal)
- **https://www.tomati.org** (redirection automatique)

Avec toutes les fonctionnalités :
- ✅ Authentification sécurisée
- ✅ Gestion des produits
- ✅ Système de messages en temps réel
- ✅ Likes et promotions automatiques
- ✅ Interface d'administration
- ✅ Géolocalisation et cartes
- ✅ Système publicitaire
- ✅ Sauvegardes automatiques

🎉 **Votre marketplace Tomati sera en ligne et opérationnelle !**