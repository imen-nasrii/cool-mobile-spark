# Commandes à Copier-Coller pour Déploiement VPS OVH

## 🔗 CONNEXION
```bash
ssh tomati@51.222.111.183
```
**Mot de passe**: Tomati123

---

## 🛑 ARRÊT APPLICATION
```bash
pm2 delete tomati-production
```

---

## 💾 SAUVEGARDE
```bash
if [ -d /home/tomati/tomatimarket ]; then mv /home/tomati/tomatimarket /home/tomati/tomatimarket_backup_$(date +%Y%m%d_%H%M%S); fi
```

---

## 📁 CRÉATION RÉPERTOIRE
```bash
mkdir -p /home/tomati/tomatimarket && cd /home/tomati/tomatimarket
```

---

## ⚙️ FICHIER .ENV
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

## 📋 FICHIER PM2 CONFIG
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

## 📂 RÉPERTOIRES
```bash
mkdir -p logs uploads
```

---

## 📤 TRANSFERT ARCHIVE (Machine Locale)
```bash
scp tomati-deployment.tar.gz tomati@51.222.111.183:/home/tomati/
```

---

## 📦 EXTRACTION
```bash
cd /home/tomati/tomatimarket && tar -xzf /home/tomati/tomati-deployment.tar.gz && rm /home/tomati/tomati-deployment.tar.gz
```

---

## 🔧 INSTALLATION + BUILD + DÉMARRAGE
```bash
npm install --production && npm run build && npm run db:push && pm2 start ecosystem.config.js && pm2 save
```

---

## ✅ VÉRIFICATION
```bash
pm2 status && pm2 logs tomati-production --lines 10 && curl http://localhost:5000/api/categories
```

---

## 🔄 COMMANDES DE GESTION

### Statut
```bash
pm2 status
```

### Logs
```bash
pm2 logs tomati-production
```

### Redémarrer
```bash
pm2 restart tomati-production
```

### Arrêter
```bash
pm2 stop tomati-production
```

---

## 🌐 TEST FINAL
Ouvrir dans le navigateur: **https://tomati.org**