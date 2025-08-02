# 🚀 Déploiement VPS - Commandes Rapides

## Pour IP: 51.222.111.183

### 1. Connexion
```bash
ssh ubuntu@51.222.111.183
```

### 2. Déploiement Complet
```bash
curl -sSL https://raw.githubusercontent.com/imen-nasrii/cool-mobile-spark/main/deploy-tomati-user.sh | sudo bash
```

### 3. Si Problème Base de Données
```bash
curl -sSL https://raw.githubusercontent.com/imen-nasrii/cool-mobile-spark/main/fix-database-vps.sh | sudo bash
```

### 4. Vérification
```bash
sudo -u tomati pm2 status
curl http://51.222.111.183
```

## Résultat
Application accessible sur: **http://51.222.111.183**