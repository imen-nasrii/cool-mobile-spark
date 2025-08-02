# 🚀 Déploiement Final - Tomati Market

## Repository: https://github.com/imen-nasrii/cool-mobile-spark.git
## VPS: 51.222.111.183

### **Commande de Déploiement Unique**

```bash
# 1. Connexion au VPS
ssh ubuntu@51.222.111.183

# 2. Déploiement automatique complet
curl -sSL https://raw.githubusercontent.com/imen-nasrii/cool-mobile-spark/main/deploy-github-vps.sh | sudo bash
```

### **Vérification Post-Déploiement**

```bash
# Statut de l'application
sudo -u tomati pm2 status

# Logs en temps réel
sudo -u tomati pm2 logs tomati-production

# Test de l'application
curl http://51.222.111.183
```

### **Résultat Final**

✅ **Application accessible sur: http://51.222.111.183**

### **Configuration Créée**

- **Utilisateur**: `tomati` (mot de passe: `tomati123`)
- **Base de données**: PostgreSQL avec utilisateur `tomati`
- **Application**: Clonée depuis GitHub et buildée
- **Services**: PM2 + Nginx + PostgreSQL
- **Port**: 5000 (proxifié par Nginx sur port 80)

### **Maintenance**

```bash
# Mise à jour du code
cd /home/tomati/tomati-market
sudo -u tomati git pull origin main
sudo -u tomati npm install
sudo -u tomati npm run build
sudo -u tomati npm run db:push
sudo -u tomati pm2 restart tomati-production

# Redémarrage complet
sudo -u tomati pm2 restart all
sudo systemctl restart nginx
sudo systemctl restart postgresql
```