# Correction du Déploiement - Erreur Vite

## Problème identifié
- Le clone GitHub a réussi
- L'installation npm a réussi mais `vite` n'est pas trouvé
- Erreur: `sh: 1: vite: not found`

## Solution

### Étapes de correction à exécuter sur le VPS

#### 1. Installation complète des dépendances
```bash
cd /home/tomati/tomatimarket
npm install
```

#### 2. Alternative si problème persiste - Build manuel
```bash
npx vite build
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
```

#### 3. Ou utilisation du script build existant
```bash
npm run build
```

#### 4. Mise à jour de la base de données
```bash
npm run db:push
```

#### 5. Démarrage de l'application
```bash
pm2 start ecosystem.config.js
pm2 save
```

#### 6. Vérification
```bash
pm2 status
pm2 logs tomati-production --lines 15
curl http://localhost:5000/api/categories
```

---

## Commandes de correction complètes à copier-coller

### Sur le VPS (vous êtes déjà connecté)
```bash
cd /home/tomati/tomatimarket
npm install
npm run build
npm run db:push
pm2 start ecosystem.config.js
pm2 save
pm2 status
pm2 logs tomati-production --lines 15
curl http://localhost:5000/api/categories
```

---

## Si le problème persiste

### Solution alternative - Installation globale de vite
```bash
npm install -g vite esbuild tsx
npm run build
```

### Ou modification temporaire du package.json
```bash
# Vérifier si les scripts existent
cat package.json | grep -A 10 '"scripts"'

# Si nécessaire, corriger le script build
npm run build:client
npm run build:server
```

---

## Statut attendu après correction
- PM2 status: `online`
- API répond: Status 200
- Logs: Aucune erreur critique
- Application accessible sur https://tomati.org