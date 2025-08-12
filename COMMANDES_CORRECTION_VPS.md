# Commandes de Correction - VPS OVH

## 🔧 CORRECTION DE L'ERREUR VITE

### Vous êtes déjà connecté au VPS, exécutez :

```bash
cd /home/tomati/tomatimarket
```

### 📦 INSTALLATION COMPLÈTE DES DÉPENDANCES
```bash
npm install
```

### 🔨 BUILD DE L'APPLICATION
```bash
npm run build
```

### 🗄️ MISE À JOUR BASE DE DONNÉES
```bash
npm run db:push
```

### 🚀 DÉMARRAGE APPLICATION
```bash
pm2 start ecosystem.config.js
pm2 save
```

### ✅ VÉRIFICATION FINALE
```bash
pm2 status && pm2 logs tomati-production --lines 15 && curl http://localhost:5000/api/categories
```

---

## 🔄 SI ERREUR PERSISTE

### Installation globale des outils
```bash
npm install -g vite esbuild tsx
npm run build
```

### Ou build manuel
```bash
npx vite build
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
```

---

## 📊 STATUT ATTENDU

### PM2 Status
```
┌────┬─────────────────────┬─────────────┬─────────┬─────────────┬──────────┬────────┐
│ id │ name                │ namespace   │ version │ mode        │ pid      │ uptime │
├────┼─────────────────────┼─────────────┼─────────┼─────────────┼──────────┼────────┤
│ 0  │ tomati-production   │ default     │ 1.0.0   │ fork        │ XXXX     │ 0s     │
└────┴─────────────────────┴─────────────┴─────────┴─────────────┴──────────┴────────┘
```

### Test API
```bash
curl http://localhost:5000/api/categories
# Devrait retourner la liste des catégories
```

---

## 🌐 ACCÈS FINAL
Une fois corrigé, votre application sera disponible sur :
**https://tomati.org**