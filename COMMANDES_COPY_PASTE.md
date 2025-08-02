# 📋 Commandes Copy-Paste pour Déploiement VPS

## 🎯 Repository: https://github.com/imen-nasrii/cool-mobile-spark.git
## 🎯 VPS: 51.222.111.183

---

## **1. CONNEXION AU VPS**
```bash
ssh ubuntu@51.222.111.183
```

---

## **2. TÉLÉCHARGEMENT ET DÉPLOIEMENT**
```bash
wget -O deploy-tomati.sh https://raw.githubusercontent.com/imen-nasrii/cool-mobile-spark/main/deploy-github-vps.sh
chmod +x deploy-tomati.sh
sudo ./deploy-tomati.sh
```

---

## **3. VÉRIFICATION POST-DÉPLOIEMENT**

### Statut PM2
```bash
sudo -u tomati pm2 status
```

### Logs Application
```bash
sudo -u tomati pm2 logs tomati-production --lines 10
```

### Test Local
```bash
curl http://localhost:5000
```

### Test Public
```bash
curl http://51.222.111.183
```

---

## **4. SI PROBLÈME DE BASE DE DONNÉES**
```bash
wget -O fix-db.sh https://raw.githubusercontent.com/imen-nasrii/cool-mobile-spark/main/fix-vps-immediate.sh
chmod +x fix-db.sh
sudo ./fix-db.sh
```

---

## **5. COMMANDES DE MAINTENANCE**

### Redémarrage Application
```bash
sudo -u tomati pm2 restart tomati-production
```

### Logs en Temps Réel
```bash
sudo -u tomati pm2 logs tomati-production
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

### Redémarrage Services
```bash
sudo systemctl restart postgresql
sudo systemctl restart nginx
sudo -u tomati pm2 restart tomati-production
```

---

## **6. VÉRIFICATION FINALE**

### Test Complet
```bash
echo "=== VÉRIFICATION DÉPLOIEMENT ==="
echo "1. Statut PM2:"
sudo -u tomati pm2 status
echo ""
echo "2. Test application:"
curl -s -o /dev/null -w "Code HTTP: %{http_code}\n" http://51.222.111.183
echo ""
echo "3. Logs récents:"
sudo -u tomati pm2 logs tomati-production --lines 3
```

---

## **7. INFORMATION SYSTÈME**

### Configuration Créée
- **Utilisateur**: tomati (mot de passe: tomati123)
- **Base de données**: PostgreSQL avec utilisateur tomati
- **Application**: Port 5000 proxifié par Nginx sur port 80
- **URL finale**: http://51.222.111.183

### Fichiers Importants
- **Application**: `/home/tomati/tomati-market/`
- **Configuration PM2**: `/home/tomati/tomati-market/ecosystem.config.cjs`
- **Environment**: `/home/tomati/tomati-market/.env`
- **Nginx**: `/etc/nginx/sites-available/tomati`

---

## **✅ RÉSULTAT ATTENDU**
**Application Tomati Market accessible sur: http://51.222.111.183**