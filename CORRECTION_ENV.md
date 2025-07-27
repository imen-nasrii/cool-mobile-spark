# Correction Configuration Environnement - Serveur Production

## Problèmes identifiés :
1. **Erreur PostgreSQL** : "password authentication failed for user"
2. **Erreur WebSocket** : Connection refused 127.0.0.1:443
3. **Configuration mixte** : Application utilise encore Supabase/Neon au lieu de PostgreSQL local

## Solution immédiate :

```bash
# Sur le serveur, vérifier le script start-app.sh
su - tomati
cd ~/tomati-market
cat start-app.sh

# Le script doit contenir EXACTEMENT :
cat > start-app.sh << 'EOF'
#!/bin/bash
cd /home/tomati/tomati-market
export NODE_ENV=production
export PORT=5000
export DATABASE_URL=postgresql://tomati:Tomati123@localhost:5432/tomati_market
export PGHOST=localhost
export PGPORT=5432
export PGUSER=tomati
export PGPASSWORD=Tomati123
export PGDATABASE=tomati_market
node dist/index.js
EOF

chmod +x start-app.sh

# Tester le script directement
./start-app.sh
# Doit afficher "serving on port 5000" sans erreurs

# Si ça marche, redémarrer PM2
pm2 restart tomati-production
pm2 logs tomati-production --lines 10
curl http://localhost:5000
```

## Vérifications base de données :
```bash
# Tester la connexion PostgreSQL
psql -h localhost -U tomati -d tomati_market
# Si erreur, recréer l'utilisateur :
sudo -u postgres createuser -s tomati
sudo -u postgres psql -c "ALTER USER tomati PASSWORD 'Tomati123';"
sudo -u postgres createdb -O tomati tomati_market
```