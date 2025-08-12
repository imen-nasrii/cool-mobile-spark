# Étapes de Déploiement - VPS OVH Tomati

## Informations de Connexion
- **Serveur**: 51.222.111.183
- **Utilisateur**: tomati
- **Mot de passe**: Tomati123
- **Archive prête**: tomati-deployment.tar.gz (86 MB)

## ÉTAPE 1: Connexion au VPS
```bash
ssh tomati@51.222.111.183
```
*Entrez le mot de passe: Tomati123*

## ÉTAPE 2: Arrêter l'application existante
```bash
pm2 delete tomati-production
```
*Si aucune application n'existe, ce n'est pas grave*

## ÉTAPE 3: Sauvegarder l'ancienne version
```bash
if [ -d /home/tomati/tomatimarket ]; then
    mv /home/tomati/tomatimarket /home/tomati/tomatimarket_backup_$(date +%Y%m%d_%H%M%S)
fi
```

## ÉTAPE 4: Créer le nouveau répertoire
```bash
mkdir -p /home/tomati/tomatimarket
cd /home/tomati/tomatimarket
```

## ÉTAPE 5: Configuration de l'environnement
```bash
cat > .env << 'ENVEOF'
NODE_ENV=production
PORT=5000
JWT_SECRET=tomati-super-secret-jwt-key-production-2025
DATABASE_URL=postgresql://tomati_user:Tomati123_db@localhost:5432/tomati_db
PUBLIC_URL=https://tomati.org
VITE_API_URL=https://tomati.org/api
CORS_ORIGIN=https://tomati.org
ENVEOF
```

## ÉTAPE 6: Configuration PM2
```bash
cat > ecosystem.config.js << 'ECOEOF'
module.exports = {
  apps: [{
    name: 'tomati-production',
    script: './server/index.ts',
    interpreter: 'tsx',
    cwd: '/home/tomati/tomatimarket',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    autorestart: true,
    max_restarts: 5,
    min_uptime: '10s'
  }]
};
ECOEOF
```

## ÉTAPE 7: Créer les répertoires nécessaires
```bash
mkdir -p logs uploads
```

## ÉTAPE 8: Transférer l'archive (NOUVELLE FENÊTRE TERMINAL)
*Ouvrez un nouveau terminal sur votre machine locale et exécutez:*
```bash
scp tomati-deployment.tar.gz tomati@51.222.111.183:/home/tomati/
```
*Mot de passe: Tomati123*

## ÉTAPE 9: Retour sur le VPS - Extraire l'archive
```bash
cd /home/tomati/tomatimarket
tar -xzf /home/tomati/tomati-deployment.tar.gz
rm /home/tomati/tomati-deployment.tar.gz
```

## ÉTAPE 10: Installation des dépendances
```bash
npm install --production
```

## ÉTAPE 11: Build de l'application
```bash
npm run build
```

## ÉTAPE 12: Mise à jour de la base de données
```bash
npm run db:push
```
*Si erreur, continuez quand même*

## ÉTAPE 13: Démarrage de l'application
```bash
pm2 start ecosystem.config.js
```

## ÉTAPE 14: Sauvegarder la configuration PM2
```bash
pm2 save
```

## ÉTAPE 15: Vérification
```bash
pm2 status
pm2 logs tomati-production --lines 10
curl http://localhost:5000/api/categories
```

## ÉTAPE 16: Test final
Dans votre navigateur, allez sur: **https://tomati.org**

---

## Commandes de Gestion Quotidienne

### Voir le statut
```bash
ssh tomati@51.222.111.183 'pm2 status'
```

### Voir les logs
```bash
ssh tomati@51.222.111.183 'pm2 logs tomati-production'
```

### Redémarrer l'application
```bash
ssh tomati@51.222.111.183 'pm2 restart tomati-production'
```

### Arrêter l'application
```bash
ssh tomati@51.222.111.183 'pm2 stop tomati-production'
```

---

## En cas de Problème

### Si l'application ne démarre pas:
```bash
ssh tomati@51.222.111.183
cd /home/tomati/tomatimarket
npm start
```

### Si erreur de base de données:
```bash
ssh tomati@51.222.111.183
cd /home/tomati/tomatimarket
npm run db:push
pm2 restart tomati-production
```

### Si erreur de permissions:
```bash
ssh tomati@51.222.111.183
sudo chown -R tomati:tomati /home/tomati/tomatimarket
```