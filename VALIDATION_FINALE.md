# Solution Finale - Configuration PM2 avec Variables

## Problème identifié
PM2 ne charge pas automatiquement le fichier .env

## Solution 1: Configuration directe dans ecosystem.config.cjs
```bash
cd /home/tomati/tomatimarket
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
      PORT: 5000,
      JWT_SECRET: 'tomati-super-secret-jwt-key-production-2025',
      DATABASE_URL: 'postgresql://postgres@localhost:5432/postgres',
      PUBLIC_URL: 'https://tomati.org',
      VITE_API_URL: 'https://tomati.org/api',
      CORS_ORIGIN: 'https://tomati.org'
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

pm2 delete tomati-production
pm2 start ecosystem.config.cjs
pm2 save
pm2 status
curl http://localhost:5000/api/categories
```

## Solution 2: Restart avec --update-env
```bash
pm2 restart tomati-production --update-env
```

## Commande finale recommandée
```bash
cd /home/tomati/tomatimarket && cat > ecosystem.config.cjs << 'ECOEOF'
module.exports = {
  apps: [{
    name: 'tomati-production',
    script: './dist/index.js',
    cwd: '/home/tomati/tomatimarket',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
      JWT_SECRET: 'tomati-super-secret-jwt-key-production-2025',
      DATABASE_URL: 'postgresql://postgres@localhost:5432/postgres',
      PUBLIC_URL: 'https://tomati.org',
      VITE_API_URL: 'https://tomati.org/api',
      CORS_ORIGIN: 'https://tomati.org'
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
pm2 delete tomati-production && pm2 start ecosystem.config.cjs && pm2 save && pm2 status && sleep 5 && curl http://localhost:5000/api/categories
```