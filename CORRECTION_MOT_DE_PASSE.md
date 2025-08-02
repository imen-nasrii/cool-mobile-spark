# Correction Mot de Passe PostgreSQL

## Information Correcte
Le mot de passe de l'utilisateur PostgreSQL `tomati` est : **`Tomati123`** (avec T majuscule)

## Commandes Corrigées

### 1. Test connexion
```bash
psql -h localhost -U tomati -d tomati_db -c "SELECT 'Connection OK';"
```
**Mot de passe :** `Tomati123`

### 2. Correction fichier .env
```bash
nano .env
```

**Contenu .env corrigé :**
```env
DATABASE_URL=postgresql://tomati:Tomati123@localhost:5432/tomati_db
PGUSER=tomati
PGPASSWORD=Tomati123
PGDATABASE=tomati_db
PGHOST=localhost
PGPORT=5432
NODE_ENV=production
PORT=5000
JWT_SECRET=tomati-ovh-jwt-secret-2025
SESSION_SECRET=tomati-ovh-session-secret-2025
VPS_MODE=true
PUBLIC_IP=51.222.111.183
```

### 3. Migration et test
```bash
npm run db:push
pm2 restart tomati-production
curl http://51.222.111.183
```

Le mot de passe correct devrait résoudre l'erreur d'authentification PostgreSQL.