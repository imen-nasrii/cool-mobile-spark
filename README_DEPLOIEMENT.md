# 🚀 Déploiement Tomati sur VPS OVH - Guide de Référence

## 📋 Vos Paramètres de Configuration

- **Base de données** : `tomatii_db`
- **Utilisateur DB** : `tomatii_user`
- **Mot de passe DB** : `tomatii_password_2024!`
- **Repository** : https://github.com/imen-nasrii/cool-mobile-spark.git
- **Utilisateur système** : `tomati`
- **Port application** : `5000`

## 🎯 Choix de Méthode de Déploiement

### ⚡ Méthode 1: Installation Ultra-Rapide (5 minutes)
**Fichier** : `script-installation-complete.sh`
```bash
ssh root@VOTRE_IP_VPS
curl -o install-tomati.sh https://raw.githubusercontent.com/imen-nasrii/cool-mobile-spark/main/script-installation-complete.sh
chmod +x install-tomati.sh
nano install-tomati.sh  # Changez DOMAIN="votre-domaine.com"
./install-tomati.sh
```

### 🔧 Méthode 2: Étapes Simplifiées (15 minutes)
**Fichier** : `ETAPES_DEPLOIEMENT_VPS_SIMPLIFIEES.md`
- Guide étape par étape simplifié
- Parfait pour comprendre chaque action

### 📋 Méthode 3: Commandes Copier-Coller
**Fichier** : `COMMANDES_COPIER_COLLER_VPS.md`
- Blocs de commandes prêts à copier-coller
- Contrôle total de chaque étape

### 📖 Méthode 4: Guide Complet Détaillé
**Fichier** : `GUIDE_DEPLOIEMENT_VPS_OVH_COMPLET.md`
- Documentation complète avec explications
- Dépannage et maintenance inclus

## ✅ Après Installation

Votre application sera accessible sur :
- **HTTP** : http://votre-domaine.com
- **HTTPS** : https://votre-domaine.com (si SSL installé)

### Scripts de Gestion Créés Automatiquement

```bash
# Passer à l'utilisateur tomati
sudo su - tomati

# Monitoring complet
./monitor.sh

# Mise à jour de l'application
./deploy.sh

# Voir les logs en temps réel
pm2 logs tomati-production

# Redémarrer l'application
pm2 restart tomati-production
```

## 🔍 Vérifications Post-Installation

1. **Services actifs** :
   ```bash
   systemctl status nginx
   systemctl status postgresql
   sudo su - tomati -c "pm2 status"
   ```

2. **Application accessible** :
   ```bash
   curl -I http://localhost:5000
   curl -I http://votre-domaine.com
   ```

3. **Base de données fonctionnelle** :
   ```bash
   sudo -u postgres psql -d tomatii_db -c "SELECT version();"
   ```

## 🚨 Dépannage Rapide

### Si l'application ne démarre pas :
```bash
sudo su - tomati -c "pm2 logs tomati-production --lines 50"
```

### Si Nginx ne fonctionne pas :
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### Si problème de base de données :
```bash
sudo -u postgres psql -d tomatii_db -c "\dt"
```

## 📊 Architecture Déployée

```
Internet → Nginx (Port 80/443) → Application Node.js (Port 5000) → PostgreSQL
                ↓
            Certificat SSL
                ↓
            Compression Gzip
                ↓
            Headers Sécurité
```

## 🔐 Sécurité Implémentée

- ✅ Utilisateur non-root (`tomati`)
- ✅ Pare-feu UFW configuré
- ✅ Headers de sécurité Nginx
- ✅ Certificat HTTPS automatique
- ✅ Fichiers .env sécurisés (chmod 600)
- ✅ PM2 avec redémarrage automatique

## 📈 Fonctionnalités Actives

- ✅ Marketplace complète avec catégories
- ✅ Système d'authentification JWT
- ✅ Messagerie temps réel (WebSockets)
- ✅ Upload et gestion de photos
- ✅ Système d'évaluation et vues
- ✅ Préférences utilisateur personnalisées
- ✅ Dashboard administrateur
- ✅ Système de publicité sélective
- ✅ Carte interactive avec géolocalisation

---

## 🎉 Support

En cas de problème :
1. Consultez les logs : `sudo su - tomati -c "pm2 logs tomati-production"`
2. Vérifiez les services : `./monitor.sh`
3. Redémarrez si nécessaire : `pm2 restart tomati-production`

**Votre application Tomati est prête pour la production !**