# Correction finale SSL - Migration PostgreSQL local

## Problème identifié
L'application utilise encore `@neondatabase/serverless` qui fait des connexions HTTPS externes, causant l'erreur :
`Hostname/IP does not match certificate's altnames: Host: localhost. is not in the cert's altnames: DNS:tomati.org, DNS:www.tomati.org`

## Solution : Migration vers PostgreSQL local

```bash
# Arrêter l'application
pm2 stop tomati-hamdi

# Sauvegarder la configuration actuelle
cp .env .env.backup

# Créer nouvelle configuration PostgreSQL local
cat > .env << 'EOF'
DATABASE_URL=postgresql://tomatii_user:tomatii_password_2024!@localhost:5432/tomatii_db
PGDATABASE=tomatii_db
PGHOST=localhost
PGPORT=5432
PGUSER=tomatii_user
PGPASSWORD=tomatii_password_2024!
JWT_SECRET=tomati_super_secret_jwt_key_2024_production
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
SESSION_SECRET=tomati_session_secret_key_2024_production
REPL_ID=tomati-production
REPLIT_DOMAINS=tomati.org,www.tomati.org
ISSUER_URL=https://replit.com/oidc
BASE_URL=https://tomati.org
PRIVATE_OBJECT_DIR=
PUBLIC_OBJECT_SEARCH_PATHS=
EOF

# Remplacer le driver de base de données
cat > server/db.ts << 'EOF'
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Use local PostgreSQL instead of Neon
const connectionString = process.env.DATABASE_URL;
export const sql = postgres(connectionString);
export const db = drizzle(sql, { schema });
EOF

# Installer postgres driver et supprimer neon
npm install postgres
npm uninstall @neondatabase/serverless

# Pousser le schéma
npm run db:push

# Reconstruire
npm run build

# Redémarrer
pm2 start tomati-hamdi

# Vérifications
sleep 10
pm2 status
pm2 logs tomati-hamdi --lines 5

# Tests HTTPS
curl -I https://tomati.org
curl -I https://tomati.org/api/products

echo "✅ Migration PostgreSQL terminée - SSL corrigé"
```

## Résultat attendu
- ✅ Aucune connexion HTTPS externe (Neon supprimé)
- ✅ Base de données locale PostgreSQL
- ✅ API fonctionne en HTTPS sans erreurs
- ✅ Tomati Market pleinement opérationnel