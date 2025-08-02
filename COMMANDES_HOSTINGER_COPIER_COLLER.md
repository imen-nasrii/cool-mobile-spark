# 📋 Commandes Copy-Paste - Déploiement Hostinger

## 🎯 Repository: https://github.com/imen-nasrii/cool-mobile-spark.git
## 🎯 VPS: Hostinger

---

## **1. CONNEXION VPS HOSTINGER**
```bash
# Remplacez VOTRE_IP par l'IP de votre VPS Hostinger
ssh root@VOTRE_IP_HOSTINGER
# ou si utilisateur différent
ssh ubuntu@VOTRE_IP_HOSTINGER
```

---

## **2. DÉPLOIEMENT EN UNE COMMANDE**
```bash
curl -sSL https://raw.githubusercontent.com/imen-nasrii/cool-mobile-spark/main/deploy-hostinger-complete.sh | sudo bash
```

---

## **3. OU DÉPLOIEMENT MANUEL**
```bash
wget -O deploy-hostinger.sh https://raw.githubusercontent.com/imen-nasrii/cool-mobile-spark/main/deploy-hostinger-complete.sh
chmod +x deploy-hostinger.sh
sudo ./deploy-hostinger.sh
```

---

## **4. VÉRIFICATION POST-DÉPLOIEMENT**

### Statut Application
```bash
sudo -u tomati pm2 status
```

### Test Local et Public
```bash
# Test local
curl http://localhost:5000

# Test public (remplacez VOTRE_IP)
curl http://VOTRE_IP_HOSTINGER
```

### Logs Application
```bash
sudo -u tomati pm2 logs tomati-production --lines 10
```

---

## **5. MAINTENANCE HOSTINGER**

### Redémarrage Application
```bash
sudo -u tomati pm2 restart tomati-production
```

### Monitoring en Temps Réel
```bash
sudo -u tomati pm2 monit
```

### Mise à Jour Code
```bash
cd /home/tomati/tomati-market
sudo -u tomati git pull origin main
sudo -u tomati npm install
sudo -u tomati npm run build
sudo -u tomati npm run db:push
sudo -u tomati pm2 restart tomati-production
```

### Redémarrage Services Système
```bash
sudo systemctl restart postgresql nginx
sudo -u tomati pm2 restart tomati-production
```

---

## **6. CONFIGURATION DOMAINE (OPTIONNEL)**

### Dans Panel Hostinger
1. **DNS Zone Editor** → Votre domaine
2. **A Record** → @ → IP de votre VPS
3. **A Record** → www → IP de votre VPS

### Modifier Configuration Nginx
```bash
sudo nano /etc/nginx/sites-available/tomati
# Modifier la ligne server_name:
# server_name votre-domaine.com www.votre-domaine.com VOTRE_IP;
sudo systemctl restart nginx
```

---

## **7. SSL/HTTPS (OPTIONNEL)**
```bash
# Installation Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Génération certificat (après configuration domaine)
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com

# Renouvellement automatique
sudo crontab -e
# Ajouter: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## **8. SAUVEGARDE BASE DE DONNÉES**
```bash
# Sauvegarde manuelle
sudo -u tomati pg_dump -h localhost -U tomati tomati_db > backup_$(date +%Y%m%d).sql

# Sauvegarde automatique quotidienne
sudo crontab -e
# Ajouter: 0 2 * * * sudo -u tomati pg_dump -h localhost -U tomati tomati_db > /home/tomati/backup_$(date +\%Y\%m\%d).sql
```

---

## **9. DÉPANNAGE RAPIDE**

### Application Inaccessible
```bash
# Vérifier processus
sudo -u tomati pm2 status

# Vérifier Nginx
sudo nginx -t
sudo systemctl status nginx

# Vérifier firewall
sudo ufw status
sudo ufw allow 80
sudo ufw allow 443
```

### Erreurs Base de Données
```bash
# Test connexion PostgreSQL
sudo -u tomati psql -h localhost -U tomati -d tomati_db -c "SELECT NOW();"

# Redémarrer PostgreSQL
sudo systemctl restart postgresql
```

### Performance
```bash
# Monitoring ressources
htop
sudo -u tomati pm2 monit

# Logs système
journalctl -f
```

---

## **10. URLS FINALES**

### Avec IP
- **Application**: http://VOTRE_IP_HOSTINGER
- **Admin**: http://VOTRE_IP_HOSTINGER/admin

### Avec Domaine + SSL
- **Application**: https://votre-domaine.com
- **Admin**: https://votre-domaine.com/admin

---

## **11. INFORMATIONS TECHNIQUES**

### Configuration Créée
- **Utilisateur**: tomati (mot de passe: tomati123)
- **Base de données**: PostgreSQL avec utilisateur tomati
- **Application**: Port 5000 proxifié par Nginx sur port 80
- **Auto-restart**: PM2 configuré avec startup system

### Fichiers Importants
- **Application**: `/home/tomati/tomati-market/`
- **Configuration**: `/home/tomati/tomati-market/.env`
- **Nginx**: `/etc/nginx/sites-available/tomati`
- **Logs**: `/home/tomati/tomati-market/logs/`

---

## **✅ SUCCÈS DÉPLOIEMENT**

Votre application Tomati Market sera accessible sur:
**http://VOTRE_IP_HOSTINGER**

Avec toutes les fonctionnalités: produits, likes, admin, base de données PostgreSQL complète.