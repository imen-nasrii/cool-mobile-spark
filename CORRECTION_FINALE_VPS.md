# Correction Finale - Déploiement VPS

## Problèmes identifiés
1. Erreur PostgreSQL: "client password must be a string" 
2. Erreur PM2: "module is not defined" dans ecosystem.config.js

## Solutions

### 1. Configuration PostgreSQL sans mot de passe
```bash
cd /home/tomati/tomatimarket
cat > .env << 'ENVEOF'
NODE_ENV=production
PORT=5000
JWT_SECRET=tomati-super-secret-jwt-key-production-2025
DATABASE_URL=postgresql://postgres@localhost:5432/postgres
PUBLIC_URL=https://tomati.org
VITE_API_URL=https://tomati.org/api
CORS_ORIGIN=https://tomati.org
ENVEOF
```

### 2. Correction du fichier PM2
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

### 3. Alternative simple - Démarrage direct
```bash
# Au lieu de PM2, démarrer directement
NODE_ENV=production PORT=5000 tsx server/index.ts &
```

## Commandes de correction complètes
```bash
cd /home/tomati/tomatimarket

# Configuration simple
cat > .env << 'ENVEOF'
NODE_ENV=production
PORT=5000
JWT_SECRET=tomati-super-secret-jwt-key-production-2025
DATABASE_URL=postgresql://postgres@localhost:5432/postgres
PUBLIC_URL=https://tomati.org
VITE_API_URL=https://tomati.org/api
CORS_ORIGIN=https://tomati.org
ENVEOF

# Création de la base dans postgres par défaut
sudo -u postgres psql -c "CREATE DATABASE tomati_db;" 2>/dev/null || echo "DB existe déjà"

# Utiliser la DB créée
cat > .env << 'ENVEOF'
NODE_ENV=production
PORT=5000
JWT_SECRET=tomati-super-secret-jwt-key-production-2025
DATABASE_URL=postgresql://postgres@localhost:5432/tomati_db
PUBLIC_URL=https://tomati.org
VITE_API_URL=https://tomati.org/api
CORS_ORIGIN=https://tomati.org
ENVEOF

# Migration
npm run db:push

# Démarrage direct
NODE_ENV=production PORT=5000 tsx server/index.ts &

# Vérification
sleep 5
curl http://localhost:5000/api/categories
```