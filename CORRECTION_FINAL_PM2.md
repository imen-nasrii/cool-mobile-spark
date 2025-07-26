# Correction Finale - Variables d'environnement manquantes

## Problème identifié :
```
Error: DATABASE_URL must be set. Did you forget to provision a database?
```

## Solution :

```bash
# 1. Créer le fichier .env avec les variables PostgreSQL
cat > .env << 'EOF'
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://tomati:tomati_password@localhost:5432/tomati_market
PGHOST=localhost
PGPORT=5432
PGUSER=tomati
PGPASSWORD=tomati_password
PGDATABASE=tomati_market
EOF

# 2. Tester manuellement
NODE_ENV=production node dist/index.js

# 3. Si ça fonctionne, redémarrer PM2
pm2 restart start-tomati-fixed
pm2 logs start-tomati-fixed --lines 5

# 4. Tester la connexion
curl http://localhost:5000

# 5. Si ça marche, tester Nginx
exit
curl http://51.222.111.183
```

Note : Remplacez `tomati_password` par le vrai mot de passe PostgreSQL configuré lors de l'installation.