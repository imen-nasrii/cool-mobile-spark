# Solution Immédiate - Variables d'Environnement

## Problème Identifié
❌ `Error: DATABASE_URL must be set`
- L'application démarre mais sans les variables d'environnement
- DATABASE_URL manquante

## Solution: Redémarrage avec Variables

### Commandes à exécuter :
```bash
pm2 delete tomati-production
NODE_ENV=production PORT=5000 DATABASE_URL="postgresql://tomati:Tomati123@localhost:5432/tomati_market" pm2 start dist/index.js --name tomati-production
pm2 status
pm2 logs tomati-production --lines 10
curl http://localhost:5000
exit
curl http://51.222.111.183
```

## Alternative: Créer fichier .env
```bash
cat > .env << 'EOF'
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://tomati:Tomati123@localhost:5432/tomati_market
EOF

pm2 delete tomati-production
pm2 start dist/index.js --name tomati-production
```