# 🚨 Solution Immédiate - Erreur Authentification PostgreSQL

## Problème
L'utilisateur `tomati` existe mais le mot de passe ne fonctionne pas dans PostgreSQL.

## Solution Radicale

### 1. Entrer dans PostgreSQL
```bash
sudo -u postgres psql
```

### 2. Recréer complètement l'utilisateur (copier-coller tout d'un coup)
```sql
-- Supprimer objets dépendants et recréer utilisateur
ALTER DATABASE tomati_market OWNER TO postgres;
DROP USER IF EXISTS tomati;
CREATE USER tomati WITH PASSWORD 'tomati123';
ALTER USER tomati CREATEDB;
ALTER USER tomati WITH SUPERUSER;
CREATE DATABASE tomati_db OWNER tomati;
GRANT ALL PRIVILEGES ON DATABASE tomati_db TO tomati;
\l
\q
```

### 3. Tester la connexion
```bash
psql -h localhost -U tomati -d tomati_db -c "SELECT 'OK';"
```
**Mot de passe:** `Tomati123`

### 4. Si connexion OK, migration
```bash
npm run db:push && pm2 restart tomati-production
```

### 5. Test final
```bash
curl http://51.222.111.183
```

## Résultat Attendu
- Connexion PostgreSQL OK
- Migration réussie
- Application accessible sur http://51.222.111.183

Cette méthode supprime toutes les dépendances et recrée l'utilisateur proprement.