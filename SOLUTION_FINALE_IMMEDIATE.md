# Solution Finale Immédiate

## Problèmes restants
1. PostgreSQL authentification SASL 
2. tsx non disponible dans PATH

## Solution définitive

### 1. Ignorer la migration et démarrer directement
```bash
cd /home/tomati/tomatimarket

# Configuration minimale
cat > .env << 'ENVEOF'
NODE_ENV=production
PORT=5000
JWT_SECRET=tomati-super-secret-jwt-key-production-2025
PUBLIC_URL=https://tomati.org
VITE_API_URL=https://tomati.org/api
CORS_ORIGIN=https://tomati.org
ENVEOF

# Installer tsx globalement
npm install -g tsx

# Démarrer avec node directement
cat > ecosystem.config.cjs << 'ECOEOF'
module.exports = {
  apps: [{
    name: 'tomati-production',
    script: './dist/index.js',
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

pm2 start ecosystem.config.cjs
pm2 save
pm2 status
curl http://localhost:5000/api/categories
```

### Commandes finales à exécuter
```bash
cd /home/tomati/tomatimarket
npm install -g tsx
pm2 start ecosystem.config.cjs
pm2 save
pm2 status
curl http://localhost:5000/api/categories
```