# Déploiement GitHub vers VPS OVH

## Méthode 1: Déploiement Direct via GitHub

### Prérequis
- Repository GitHub avec le code Tomati Market
- Accès SSH au VPS OVH (tomati@51.222.111.183)

### Étapes de Déploiement

#### 1. Connexion au VPS
```bash
ssh tomati@51.222.111.183
```
**Mot de passe**: Tomati123

#### 2. Arrêt de l'application existante
```bash
pm2 delete tomati-production 2>/dev/null || echo "Aucune app à arrêter"
```

#### 3. Sauvegarde de l'ancienne version
```bash
if [ -d /home/tomati/tomatimarket ]; then
    mv /home/tomati/tomatimarket /home/tomati/tomatimarket_backup_$(date +%Y%m%d_%H%M%S)
fi
```

#### 4. Clone depuis GitHub
```bash
git clone https://github.com/VOTRE-USERNAME/tomati-market.git /home/tomati/tomatimarket
cd /home/tomati/tomatimarket
```

#### 5. Configuration de l'environnement
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

#### 6. Configuration PM2
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

#### 7. Installation et démarrage
```bash
mkdir -p logs uploads
npm install --production
npm run build
npm run db:push
pm2 start ecosystem.config.js
pm2 save
```

#### 8. Vérification
```bash
pm2 status
pm2 logs tomati-production --lines 10
curl http://localhost:5000/api/categories
```

---

## Méthode 2: Script Automatisé

### Création du script de déploiement
```bash
cat > deploy-from-github.sh << 'DEPLOYEOF'
#!/bin/bash
cd /home/tomati/tomatimarket
git pull origin main
npm install --production
npm run build
npm run db:push
pm2 restart tomati-production
pm2 logs tomati-production --lines 10
DEPLOYEOF

chmod +x deploy-from-github.sh
```

### Utilisation du script pour les mises à jour
```bash
ssh tomati@51.222.111.183 '/home/tomati/tomatimarket/deploy-from-github.sh'
```

---

## Workflow de Développement

### 1. Développement local
- Faire les modifications sur Replit
- Tester localement

### 2. Push vers GitHub
```bash
git add .
git commit -m "Nouvelle fonctionnalité"
git push origin main
```

### 3. Déploiement sur VPS
```bash
ssh tomati@51.222.111.183 'cd /home/tomati/tomatimarket && git pull && npm install && npm run build && npm run db:push && pm2 restart tomati-production'
```

---

## Configuration GitHub Repository

### 1. Créer le repository GitHub
- Nom: `tomati-market`
- Visibilité: Privé (recommandé)

### 2. Ajouter les fichiers essentiels
```
.env.example
.gitignore
README.md
package.json
server/
client/
shared/
```

### 3. Fichier .gitignore recommandé
```
node_modules/
.env
.env.local
.env.production
dist/
build/
logs/
*.log
.DS_Store
attached_assets/
*.tar.gz
```

### 4. Fichier .env.example
```
NODE_ENV=production
PORT=5000
JWT_SECRET=your-jwt-secret-here
DATABASE_URL=postgresql://user:password@localhost:5432/database
PUBLIC_URL=https://your-domain.com
VITE_API_URL=https://your-domain.com/api
CORS_ORIGIN=https://your-domain.com
```

---

## Commandes Utiles

### Logs en temps réel
```bash
ssh tomati@51.222.111.183 'pm2 logs tomati-production --lines 50'
```

### Redémarrage complet
```bash
ssh tomati@51.222.111.183 'cd /home/tomati/tomatimarket && pm2 stop tomati-production && git pull && npm install && npm run build && npm run db:push && pm2 start tomati-production'
```

### Statut de l'application
```bash
ssh tomati@51.222.111.183 'pm2 status && curl -I http://localhost:5000'
```

### Mise à jour rapide (sans rebuild)
```bash
ssh tomati@51.222.111.183 'cd /home/tomati/tomatimarket && git pull && pm2 restart tomati-production'
```

---

## Avantages du Déploiement GitHub

1. **Traçabilité**: Historique des versions
2. **Simplicité**: Un seul `git pull` pour mettre à jour
3. **Sécurité**: Code source centralisé
4. **Collaboration**: Plusieurs développeurs
5. **Rollback**: Retour à une version précédente facile

---

## URL Final
**Application**: https://tomati.org