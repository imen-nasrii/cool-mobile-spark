# Commandes Finales - Déploiement GitHub

## 🔗 CONNEXION
```bash
ssh tomati@51.222.111.183
```
**Mot de passe**: Tomati123

---

## 🛑 ARRÊT ET SAUVEGARDE
```bash
pm2 delete tomati-production 2>/dev/null || echo "Aucune app à arrêter"
if [ -d /home/tomati/tomatimarket ]; then mv /home/tomati/tomatimarket /home/tomati/tomatimarket_backup_$(date +%Y%m%d_%H%M%S); fi
```

---

## 📥 CLONE GITHUB
```bash
git clone https://github.com/imen-nasrii/cool-mobile-spark.git /home/tomati/tomatimarket
cd /home/tomati/tomatimarket
```

---

## ⚙️ CONFIGURATION .ENV
```bash
cat > .env << 'ENVEOF'
NODE_ENV=production
PORT=5000
JWT_SECRET=tomati-super-secret-jwt-key-production-2025
DATABASE_URL=postgresql://tomati_user:Tomati123_db@localhost:5432/tomati_db
PUBLIC_URL=https://tomati.org
VITE_API_URL=https://tomati.org/api
CORS_ORIGIN=https://tomati.org
ENVEOF
```

---

## 📋 CONFIGURATION PM2
```bash
cat > ecosystem.config.js << 'ECOEOF'
module.exports = {
  apps: [{
    name: 'tomati-production',
    script: './server/index.ts',
    interpreter: 'tsx',
    cwd: '/home/tomati/tomatimarket',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    autorestart: true,
    max_restarts: 5,
    min_uptime: '10s'
  }]
};
ECOEOF
```

---

## 🚀 INSTALLATION ET DÉMARRAGE
```bash
mkdir -p logs uploads && npm install --production && npm run build && npm run db:push && pm2 start ecosystem.config.js && pm2 save
```

---

## ✅ VÉRIFICATION
```bash
pm2 status && pm2 logs tomati-production --lines 15 && curl http://localhost:5000/api/categories
```

---

## 🔧 CRÉATION DU SCRIPT DE MISE À JOUR
```bash
cat > /home/tomati/deploy-update.sh << 'DEPLOYEOF'
#!/bin/bash
cd /home/tomati/tomatimarket
echo "📥 Récupération des dernières modifications..."
git pull origin main
echo "📦 Installation des dépendances..."
npm install --production
echo "🔨 Build de l'application..."
npm run build
echo "🗄️ Mise à jour de la base de données..."
npm run db:push
echo "🔄 Redémarrage de l'application..."
pm2 restart tomati-production
echo "📝 Affichage des logs..."
pm2 logs tomati-production --lines 10
echo "✅ Mise à jour terminée!"
echo "🌐 Application disponible sur: https://tomati.org"
DEPLOYEOF

chmod +x /home/tomati/deploy-update.sh
```

---

## 🔄 COMMANDES DE GESTION FUTURES

### Mise à jour complète
```bash
ssh tomati@51.222.111.183 '/home/tomati/deploy-update.sh'
```

### Mise à jour rapide
```bash
ssh tomati@51.222.111.183 'cd /home/tomati/tomatimarket && git pull && pm2 restart tomati-production'
```

### Statut
```bash
ssh tomati@51.222.111.183 'pm2 status'
```

### Logs
```bash
ssh tomati@51.222.111.183 'pm2 logs tomati-production'
```

### Redémarrer
```bash
ssh tomati@51.222.111.183 'pm2 restart tomati-production'
```

---

## 🌐 URLS FINALES
- **Application**: https://tomati.org
- **Admin Dashboard**: https://tomati.org/admin

---

## 📝 WORKFLOW DÉVELOPPEMENT
1. **Coder sur Replit** → Tester
2. **Push GitHub** → `git push origin main`  
3. **Déployer VPS** → `ssh tomati@51.222.111.183 '/home/tomati/deploy-update.sh'`

**TERMINÉ !** 🎉