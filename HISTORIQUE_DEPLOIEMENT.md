# 📋 Historique des Déploiements - Tomati Market

## 🎯 VPS: 51.222.111.183 (vps-8dfc48b5)

## 📅 Historique Chronologique

### **Déploiements Précédents**

#### **27 Janvier 2025 - Premier Déploiement**
- ✅ Installation initiale sur VPS OVH
- ✅ Configuration utilisateur `tomati`
- ✅ Installation PostgreSQL, Node.js, PM2, Nginx
- ✅ Déploiement depuis GitHub: `https://github.com/imen-nasrii/cool-mobile-spark.git`

#### **Problèmes Rencontrés et Solutions**

**1. Erreur Connexion Base de Données**
- ❌ **Problème**: `connect ECONNREFUSED 127.0.0.1:443`
- 🔧 **Cause**: Application tentait connexion HTTPS au lieu PostgreSQL
- ✅ **Solution**: Correction configuration `.env` avec DATABASE_URL local

**2. Erreur Build Application**
- ❌ **Problème**: Fichier `dist/index.js` manquant
- 🔧 **Cause**: Build incomplet ou échec compilation
- ✅ **Solution**: Utilisation de `tsx` pour exécuter TypeScript directement

**3. Erreur PM2 Configuration**
- ❌ **Problème**: Processus `tomati-production` ne démarrait pas
- 🔧 **Cause**: Configuration ecosystem.config.js incorrecte
- ✅ **Solution**: Création nouveau `ecosystem.config.cjs` avec bon chemin

### **État Actuel du Déploiement**

**Configuration Système:**
- **OS**: Ubuntu sur VPS OVH
- **IP**: 51.222.111.183
- **Utilisateur**: `tomati` (mot de passe: `tomati123`)
- **Répertoire**: `/home/tomati/tomati-market/`

**Services Installés:**
- **Node.js**: Version 18
- **PostgreSQL**: Version locale avec base `tomati_db`
- **PM2**: Gestionnaire de processus
- **Nginx**: Proxy inverse configuré

**Application:**
- **Nom processus**: `tomati-production`
- **Port interne**: 5000
- **Port public**: 80 (via Nginx)
- **Mode**: Cluster PM2

### **Derniers Logs Observés**

**Erreurs de Base de Données** (dernières traces):
```
Error: connect ECONNREFUSED 127.0.0.1:443
GET /api/products/promoted 500 - connect ECONNREFUSED 127.0.0.1:443
GET /api/products/liked 500 - connect ECONNREFUSED 127.0.0.1:443
```

**Succès Partiels**:
```
GET /api/products 304 - Produits chargés avec succès
GET /api/advertisements 304 - Publicités fonctionnelles
GET /api/stats 304 - Statistiques disponibles
```

### **Scripts de Correction Créés**

1. **fix-vps-immediate.sh** - Correction urgente base de données
2. **deploy-github-vps.sh** - Déploiement complet depuis GitHub
3. **fix-database-vps.sh** - Correction spécifique PostgreSQL

### **Configuration Actuelle Base de Données**

**Fichier .env requis:**
```env
DATABASE_URL=postgresql://tomati:tomati123@localhost:5432/tomati_db
PGUSER=tomati
PGPASSWORD=tomati123
PGDATABASE=tomati_db
PGHOST=localhost
PGPORT=5432
NODE_ENV=production
PORT=5000
JWT_SECRET=tomati-jwt-secret-production-2025
SESSION_SECRET=tomati-session-secret-production-2025
```

### **État du Processus PM2**

**Dernière vérification:**
- Processus `tomati-production` en cours d'exécution
- Erreurs de connexion base de données persistantes
- Application partiellement fonctionnelle (quelques endpoints OK)

### **Prochaines Actions Nécessaires**

1. **Diagnostic État Actuel**
   ```bash
   sudo -u tomati pm2 status
   sudo -u tomati pm2 logs tomati-production --lines 10
   ```

2. **Correction Base de Données**
   ```bash
   wget -O fix-now.sh https://raw.githubusercontent.com/imen-nasrii/cool-mobile-spark/main/fix-vps-immediate.sh
   chmod +x fix-now.sh
   sudo ./fix-now.sh
   ```

3. **Test Fonctionnel**
   ```bash
   curl http://51.222.111.183
   ```

### **Fichiers de Configuration Importants**

- **Application**: `/home/tomati/tomati-market/`
- **Environment**: `/home/tomati/tomati-market/.env`
- **PM2 Config**: `/home/tomati/tomati-market/ecosystem.config.cjs`
- **Nginx Config**: `/etc/nginx/sites-available/tomati`
- **Logs PM2**: `/home/tomati/tomati-market/logs/`

### **Commandes de Maintenance Courantes**

```bash
# Statut actuel
sudo -u tomati pm2 status

# Redémarrage application
sudo -u tomati pm2 restart tomati-production

# Mise à jour code
cd /home/tomati/tomati-market
sudo -u tomati git pull origin main
sudo -u tomati npm install
sudo -u tomati npm run build
sudo -u tomati npm run db:push
sudo -u tomati pm2 restart tomati-production

# Test base de données
sudo -u tomati psql -h localhost -U tomati -d tomati_db -c "SELECT version();"
```

## 🎯 **Résumé État Actuel**

**✅ Fonctionnel:**
- VPS configuré et accessible
- Services installés (Node.js, PostgreSQL, PM2, Nginx)
- Application déployée depuis GitHub
- Processus PM2 en cours d'exécution
- Certains endpoints API fonctionnels

**❌ Problématique:**
- Erreurs de connexion base de données (port 443 vs 5432)
- Endpoints promotion et likes non fonctionnels
- Configuration .env incomplète ou incorrecte

**🔧 Action Recommandée:**
Exécuter le script de correction immédiate pour résoudre les problèmes de base de données et obtenir une application 100% fonctionnelle.