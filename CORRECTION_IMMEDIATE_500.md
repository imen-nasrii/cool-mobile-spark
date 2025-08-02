# 🔧 Correction Immédiate - Erreurs 500 API

## 🚨 Problème Identifié
- Application fonctionne partiellement ✅
- Produits se chargent (4 items) ✅
- **Erreur 500** sur `/api/products/promoted` ❌
- Problème de base de données/schéma

## 🔧 SOLUTION IMMÉDIATE

### 1. Sortir de PostgreSQL (si vous y êtes encore)
```bash
\q
```

### 2. Aller dans le répertoire application
```bash
cd /home/tomati/tomati-market
```

### 3. Vérifier le statut PM2
```bash
pm2 status
```

### 4. Voir les logs pour comprendre l'erreur 500
```bash
pm2 logs tomati-production --lines 20
```

### 5. Corriger le fichier .env
```bash
nano .env
```

**Contenu exact à copier :**
```env
DATABASE_URL=postgresql://tomati:tomati123@localhost:5432/tomati_db
PGUSER=tomati
PGPASSWORD=tomati123
PGDATABASE=tomati_db
PGHOST=localhost
PGPORT=5432
NODE_ENV=production
PORT=5000
JWT_SECRET=tomati-ovh-jwt-secret-2025
SESSION_SECRET=tomati-ovh-session-secret-2025
```

**Sauvegarder avec Ctrl+X, Y, Entrée**

### 6. Forcer la migration base de données
```bash
npm run db:push
```

### 7. Redémarrer l'application
```bash
pm2 restart tomati-production
```

### 8. Vérifier les nouveaux logs
```bash
pm2 logs tomati-production --lines 10
```

### 9. Tester à nouveau
```bash
curl http://localhost:5000/api/products/promoted
```

## 🎯 RÉSULTAT ATTENDU

Après ces étapes :
- Plus d'erreurs 500 ✅
- API `/api/products/promoted` fonctionnelle ✅
- Application complètement opérationnelle ✅

## 📋 SI ÇA NE MARCHE TOUJOURS PAS

### Recréer la base de données complètement
```bash
sudo -u postgres psql
```

```sql
DROP DATABASE IF EXISTS tomati_db;
CREATE DATABASE tomati_db OWNER tomati;
\q
```

```bash
npm run db:push
pm2 restart tomati-production
```

L'erreur 500 vient probablement d'un problème de schéma de base de données. Ces étapes vont tout corriger !