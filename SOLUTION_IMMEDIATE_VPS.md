# Solution Immédiate - Correction Database

## Situation actuelle
- PostgreSQL installé et actif ✅
- Build réussi ✅
- Utilisateur `tomati_user` existe ✅
- Base `tomati_db` existe ✅
- Problème : Authentification échoue

## Solution rapide

### 1. Réinitialiser le mot de passe
```bash
sudo -u postgres psql -c "ALTER USER tomati_user PASSWORD 'Tomati123_db';"
```

### 2. Tester la connexion
```bash
cd /home/tomati/tomatimarket
psql -h localhost -U tomati_user -d tomati_db -c "SELECT version();"
```

### 3. Si échec, utiliser postgres par défaut
```bash
cat > .env << 'ENVEOF'
NODE_ENV=production
PORT=5000
JWT_SECRET=tomati-super-secret-jwt-key-production-2025
DATABASE_URL=postgresql://postgres@localhost:5432/tomati_db
PUBLIC_URL=https://tomati.org
VITE_API_URL=https://tomati.org/api
CORS_ORIGIN=https://tomati.org
ENVEOF
```

### 4. Finaliser le déploiement
```bash
npm run db:push
pm2 start ecosystem.config.js
pm2 save
pm2 status
```

### 5. Vérification
```bash
curl http://localhost:5000/api/categories
```

## Commandes à exécuter maintenant
```bash
# Réinitialiser le mot de passe
sudo -u postgres psql -c "ALTER USER tomati_user PASSWORD 'Tomati123_db';"

# Tester
cd /home/tomati/tomatimarket
npm run db:push

# Si échec, utiliser postgres
cat > .env << 'ENVEOF'
NODE_ENV=production
PORT=5000
JWT_SECRET=tomati-super-secret-jwt-key-production-2025
DATABASE_URL=postgresql://postgres@localhost:5432/tomati_db
PUBLIC_URL=https://tomati.org
VITE_API_URL=https://tomati.org/api
CORS_ORIGIN=https://tomati.org
ENVEOF

npm run db:push
pm2 start ecosystem.config.js
pm2 save
```