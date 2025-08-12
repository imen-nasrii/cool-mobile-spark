# Guide de Déploiement - VPS OVH Production

## Informations de Connexion
- **Serveur**: 51.222.111.183
- **Utilisateur**: tomati
- **Mot de passe**: Tomati123
- **Domaine**: tomati.org

## Étapes de Déploiement

### 1. Connexion au VPS
```bash
ssh tomati@51.222.111.183
# Mot de passe: Tomati123
```

### 2. Préparation de l'environnement
```bash
# Arrêter l'ancienne version
pm2 delete tomati-production

# Sauvegarder l'ancienne version
mv tomatimarket tomatimarket_backup_$(date +%Y%m%d_%H%M%S)

# Cloner la nouvelle version
git clone https://github.com/your-username/tomati-market.git tomatimarket
cd tomatimarket
```

### 3. Installation et Configuration
```bash
# Installer les dépendances
npm install

# Créer le fichier .env
cat > .env << 'EOF'
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
DATABASE_URL=postgresql://tomati_user:secure_password_123@localhost:5432/tomati_db
PUBLIC_URL=https://tomati.org
VITE_API_URL=https://tomati.org/api
EOF

# Build l'application
npm run build
```

### 4. Configuration PM2
```bash
# Créer ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
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
EOF

# Créer le répertoire de logs
mkdir -p logs
```

### 5. Mise à jour de la base de données
```bash
# Pousser les changements de schéma
npm run db:push
```

### 6. Démarrage de l'application
```bash
# Démarrer avec PM2
pm2 start ecosystem.config.js

# Sauvegarder la configuration
pm2 save

# Vérifier le statut
pm2 status
pm2 logs tomati-production --lines 20
```

### 7. Test de fonctionnement
```bash
# Tester l'API localement
curl http://localhost:5000/api/categories

# Tester depuis l'extérieur
curl https://tomati.org/api/categories
```

## Commandes de Gestion

### Statut et Monitoring
```bash
pm2 status                          # Statut de toutes les apps
pm2 logs tomati-production         # Logs en temps réel
pm2 logs tomati-production --lines 50  # Dernières 50 lignes
pm2 monit                          # Interface de monitoring
```

### Contrôle de l'application
```bash
pm2 restart tomati-production      # Redémarrer
pm2 stop tomati-production         # Arrêter
pm2 start tomati-production        # Démarrer
pm2 reload tomati-production       # Rechargement à chaud
```

### Mise à jour
```bash
# Mise à jour depuis Git
cd /home/tomati/tomatimarket
git pull origin main
npm install
npm run build
npm run db:push
pm2 restart tomati-production
```

## Configuration Nginx
```nginx
# /etc/nginx/sites-available/tomati.org
server {
    listen 80;
    server_name tomati.org www.tomati.org;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tomati.org www.tomati.org;

    ssl_certificate /etc/letsencrypt/live/tomati.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tomati.org/privkey.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /ws {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

## Résolution de Problèmes

### Application ne démarre pas
```bash
# Vérifier les logs
pm2 logs tomati-production

# Vérifier la configuration
cat ecosystem.config.js

# Tester manuellement
cd /home/tomati/tomatimarket
npm start
```

### Base de données
```bash
# Vérifier la connexion
psql postgresql://tomati_user:secure_password_123@localhost:5432/tomati_db

# Recréer les tables si nécessaire
npm run db:push
```

### Erreurs 500
```bash
# Vérifier les logs d'erreur
pm2 logs tomati-production --err

# Redémarrer complètement
pm2 restart tomati-production
```

## Sauvegardes

### Base de données
```bash
# Dump de la base
pg_dump tomati_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restauration
psql tomati_db < backup_file.sql
```

### Application
```bash
# Sauvegarde complète
tar -czf tomati_backup_$(date +%Y%m%d_%H%M%S).tar.gz /home/tomati/tomatimarket
```

## URLs Importantes
- **Application**: https://tomati.org
- **API**: https://tomati.org/api
- **Admin**: https://tomati.org/admin
- **WebSocket**: wss://tomati.org/ws

## Contacts de Support
- Admin principal: tomati@tomati.org
- Support technique: Via dashboard admin