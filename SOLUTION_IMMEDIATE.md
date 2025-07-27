# Solution Immédiate - Base de Données Vide

## Problème identifié :
La connexion PostgreSQL fonctionne mais la base de données `tomati_market` est vide (pas de tables).

## Solution sur le serveur :

```bash
# 1. Vérifier si npm run db:push fonctionne
cd ~/tomati-market
npm run db:push

# 2. Si erreur, installer drizzle-kit
npm install drizzle-kit

# 3. Retenter la création des tables
npm run db:push

# 4. Vérifier que les tables sont créées
psql -h localhost -U tomati -d tomati_market -c "\dt"

# 5. Si les tables existent, tester l'application
./start-app.sh

# 6. Si tout fonctionne, redémarrer PM2
pm2 start tomati-production
pm2 logs tomati-production --lines 10
curl http://localhost:5000
```

## Alternative si npm run db:push ne fonctionne pas :
```bash
# Créer les tables manuellement via SQL
psql -h localhost -U tomati -d tomati_market

-- Dans psql, créer les tables principales :
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    user_id INTEGER REFERENCES users(id),
    image_url VARCHAR(500),
    like_count INTEGER DEFAULT 0,
    is_promoted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

\q
```

La priorité est d'exécuter `npm run db:push` pour créer automatiquement toutes les tables.