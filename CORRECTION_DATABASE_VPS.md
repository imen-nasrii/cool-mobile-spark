# Correction Base de Données PostgreSQL

## Problème identifié
Erreur d'authentification PostgreSQL : `password authentication failed for user "tomati_user"`

## Solutions possibles

### Option 1: Vérifier la base de données existante
```bash
# Vérifier si PostgreSQL est installé et en cours d'exécution
sudo systemctl status postgresql

# Vérifier les utilisateurs PostgreSQL existants
sudo -u postgres psql -c "\du"

# Vérifier les bases de données existantes
sudo -u postgres psql -c "\l"
```

### Option 2: Créer l'utilisateur et la base de données
```bash
# Se connecter en tant que postgres
sudo -u postgres psql

# Dans psql, exécuter :
CREATE USER tomati_user WITH PASSWORD 'Tomati123_db';
CREATE DATABASE tomati_db OWNER tomati_user;
GRANT ALL PRIVILEGES ON DATABASE tomati_db TO tomati_user;
\q
```

### Option 3: Configuration alternative avec utilisateur système
```bash
# Modifier le .env pour utiliser l'utilisateur système
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

### Option 4: Utiliser une base de données externe (Neon/Supabase)
Si PostgreSQL local pose problème, utiliser une base externe :
```bash
# Modifier le .env avec une URL de base externe
DATABASE_URL=postgresql://username:password@host:port/database
```

## Commandes de vérification et correction à exécuter
```bash
# 1. Vérifier PostgreSQL
sudo systemctl status postgresql

# 2. Si PostgreSQL n'est pas installé
sudo apt update
sudo apt install postgresql postgresql-contrib

# 3. Créer l'utilisateur et la base
sudo -u postgres createuser --interactive tomati_user
sudo -u postgres createdb tomati_db -O tomati_user
sudo -u postgres psql -c "ALTER USER tomati_user PASSWORD 'Tomati123_db';"

# 4. Tester la connexion
psql -h localhost -U tomati_user -d tomati_db -c "SELECT version();"

# 5. Retry db:push
cd /home/tomati/tomatimarket
npm run db:push
```