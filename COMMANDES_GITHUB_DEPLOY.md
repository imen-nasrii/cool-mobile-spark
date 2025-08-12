# Commandes de Déploiement GitHub vers VPS OVH

## 🔗 CONNEXION AU VPS
```bash
ssh tomati@51.222.111.183
```
**Mot de passe**: Tomati123

---

## 🛑 ARRÊT APPLICATION
```bash
pm2 delete tomati-production 2>/dev/null || echo "Aucune app à arrêter"
```

---

## 💾 SAUVEGARDE
```bash
if [ -d /home/tomati/tomatimarket ]; then mv /home/tomati/tomatimarket /home/tomati/tomatimarket_backup_$(date +%Y%m%d_%H%M%S); fi
```

---

## 📥 CLONE GITHUB (Remplacez VOTRE-USERNAME)
```bash
git clone https://github.com/VOTRE-USERNAME/tomati-market.git /home/tomati/tomatimarket
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

## 🔧 INSTALLATION COMPLÈTE
```bash
mkdir -p logs uploads && npm install --production && npm run build && npm run db:push && pm2 start ecosystem.config.js && pm2 save
```

---

## ✅ VÉRIFICATION
```bash
pm2 status && pm2 logs tomati-production --lines 10 && curl http://localhost:5000/api/categories
```

---

## 🔄 SCRIPT DE MISE À JOUR AUTOMATIQUE
```bash
cat > deploy-from-github.sh << 'DEPLOYEOF'
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
DEPLOYEOF

chmod +x deploy-from-github.sh
```

---

## 🚀 MISES À JOUR FUTURES

### Mise à jour rapide (sans rebuild)
```bash
ssh tomati@51.222.111.183 'cd /home/tomati/tomatimarket && git pull && pm2 restart tomati-production'
```

### Mise à jour complète
```bash
ssh tomati@51.222.111.183 '/home/tomati/tomatimarket/deploy-from-github.sh'
```

### Redémarrage complet
```bash
ssh tomati@51.222.111.183 'cd /home/tomati/tomatimarket && pm2 stop tomati-production && git pull && npm install && npm run build && npm run db:push && pm2 start tomati-production'
```

---

## 📊 COMMANDES DE MONITORING

### Statut de l'application
```bash
ssh tomati@51.222.111.183 'pm2 status'
```

### Logs en temps réel
```bash
ssh tomati@51.222.111.183 'pm2 logs tomati-production'
```

### Test de l'API
```bash
ssh tomati@51.222.111.183 'curl -I http://localhost:5000/api/categories'
```

---

## 🔧 COMMANDES DE DÉPANNAGE

### Redémarrer l'application
```bash
ssh tomati@51.222.111.183 'pm2 restart tomati-production'
```

### Arrêter l'application
```bash
ssh tomati@51.222.111.183 'pm2 stop tomati-production'
```

### Voir les erreurs
```bash
ssh tomati@51.222.111.183 'pm2 logs tomati-production --err'
```

### Repartir à zéro
```bash
ssh tomati@51.222.111.183 'pm2 delete tomati-production && cd /home/tomati/tomatimarket && pm2 start ecosystem.config.js'
```

---

## 🌐 TEST FINAL
Ouvrir dans le navigateur: **https://tomati.org**

---

## 📋 WORKFLOW DÉVELOPPEMENT

1. **Modifier le code sur Replit**
2. **Push vers GitHub**:
   ```bash
   git add .
   git commit -m "Nouvelle fonctionnalité"
   git push origin main
   ```
3. **Déployer sur VPS**:
   ```bash
   ssh tomati@51.222.111.183 '/home/tomati/tomatimarket/deploy-from-github.sh'
   ```