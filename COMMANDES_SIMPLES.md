# Commandes Simples - Déploiement Tomati

## 🚀 Une Seule Commande Pour Tout Installer

```bash
ssh root@VOTRE_IP_VPS
curl -sSL https://raw.githubusercontent.com/imen-nasrii/cool-mobile-spark/main/script-installation-complete.sh | bash
```

## 🔧 Si Vous Voulez Changer le Domaine

```bash
ssh root@VOTRE_IP_VPS
wget https://raw.githubusercontent.com/imen-nasrii/cool-mobile-spark/main/script-installation-complete.sh
nano script-installation-complete.sh
# Changez: DOMAIN="votre-domaine.com" 
# Par votre domaine réel
bash script-installation-complete.sh
```

## ✅ Après Installation - Commandes de Base

```bash
# Voir le statut
sudo su - tomati -c "pm2 status"

# Voir les logs
sudo su - tomati -c "pm2 logs"

# Redémarrer
sudo su - tomati -c "pm2 restart tomati-production"

# Monitoring
sudo su - tomati -c "./monitor.sh"

# Mise à jour
sudo su - tomati -c "./deploy.sh"
```

C'est tout ! Votre application sera accessible sur votre domaine.