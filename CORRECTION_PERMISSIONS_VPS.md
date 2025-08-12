# Correction Permissions Base de Données

## Problème actuel
- Connexion réussie à la base de données ✅
- Erreur: `permission denied for table categories`
- L'utilisateur `tomati_user` n'a pas les permissions sur les tables existantes

## Solutions

### Solution 1: Donner les permissions à tomati_user
```bash
sudo -u postgres psql -d tomati_db -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO tomati_user;"
sudo -u postgres psql -d tomati_db -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO tomati_user;"
sudo -u postgres psql -d tomati_db -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO tomati_user;"
```

### Solution 2: Utiliser postgres (plus simple)
```bash
cd /home/tomati/tomatimarket
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

### Solution 3: Recréer la base proprement
```bash
sudo -u postgres psql -c "DROP DATABASE IF EXISTS tomati_db;"
sudo -u postgres psql -c "CREATE DATABASE tomati_db OWNER tomati_user;"
sudo -u postgres psql -d tomati_db -c "GRANT ALL PRIVILEGES ON SCHEMA public TO tomati_user;"
```

## Commandes à exécuter maintenant

### Option rapide (recommandée)
```bash
cd /home/tomati/tomatimarket
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
pm2 status
curl http://localhost:5000/api/categories
```

### Option avec permissions (si vous voulez garder tomati_user)
```bash
sudo -u postgres psql -d tomati_db -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO tomati_user; GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO tomati_user; ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO tomati_user;"

cd /home/tomati/tomatimarket
npm run db:push
pm2 start ecosystem.config.js
pm2 save
pm2 status
curl http://localhost:5000/api/categories
```