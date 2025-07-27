# Correction PM2 - Solution Alternative

## Problème
- Le fichier ecosystem.config.js n'a pas été créé correctement
- Erreur de syntaxe lors de la création du fichier

## Solution: Méthode Alternative

### Méthode 1: Créer le fichier correctement
```bash
# Supprimer le fichier corrompu
rm ecosystem.config.js

# Créer le fichier avec nano (plus sûr)
nano ecosystem.config.js
```

Contenu à coller dans nano :
```javascript
module.exports = {
  apps: [{
    name: 'tomati-production',
    script: 'dist/index.js',
    instances: 1,
    exec_mode: 'fork',
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000,
      DATABASE_URL: 'postgresql://tomati:Tomati123@localhost:5432/tomati_market'
    },
    error_file: '/tmp/tomati-error.log',
    out_file: '/tmp/tomati-out.log',
    log_file: '/tmp/tomati-combined.log',
    time: true
  }]
}
```

Puis : Ctrl+X, Y, Enter pour sauvegarder

### Méthode 2: Démarrage Direct (Plus Simple)
```bash
# Démarrer directement avec PM2 sans fichier config
pm2 start dist/index.js --name tomati-production --env production

# Définir les variables d'environnement
pm2 set pm2:tomati-production NODE_ENV production
pm2 set pm2:tomati-production PORT 5000
pm2 set pm2:tomati-production DATABASE_URL "postgresql://tomati:Tomati123@localhost:5432/tomati_market"

# Redémarrer pour prendre en compte les variables
pm2 restart tomati-production
```

### Vérification
```bash
pm2 status
pm2 logs tomati-production --lines 10
curl http://localhost:5000
```

## Commandes Exactes à Exécuter
Choisir une des deux méthodes ci-dessus.