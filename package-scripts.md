# Scripts NPM pour le déploiement

## Scripts de production recommandés

Ajoutez ces scripts à votre package.json pour faciliter le déploiement :

```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build",
    "start": "NODE_ENV=production tsx server/index.ts",
    "db:push": "drizzle-kit push",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio",
    "db:backup": "pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql",
    "production:install": "npm ci --production",
    "production:build": "npm run build && npm run db:push",
    "production:start": "pm2 start ecosystem.config.js",
    "production:stop": "pm2 stop ecosystem.config.js",
    "production:restart": "pm2 restart ecosystem.config.js",
    "production:logs": "pm2 logs tomati-app",
    "production:monitor": "pm2 monit",
    "health-check": "curl -f http://localhost:5000/api/health || exit 1"
  }
}
```

## Commandes de déploiement

### Déploiement initial
```bash
npm run production:install
npm run production:build
npm run production:start
```

### Mise à jour
```bash
git pull
npm install
npm run production:build
npm run production:restart
```

### Monitoring
```bash
npm run production:logs
npm run production:monitor
```

### Sauvegarde
```bash
npm run db:backup
```