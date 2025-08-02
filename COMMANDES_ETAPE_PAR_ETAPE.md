# 🔧 Commandes Étape par Étape - OVH VPS

## 📍 État Actuel
- Application PM2 supprimée ✅
- Dans PostgreSQL (il faut sortir)
- Prêt pour la configuration

---

## 🚪 ÉTAPE 1: Sortir de PostgreSQL

**Tapez dans le terminal PostgreSQL :**
```sql
\q
```

**Vous devriez revenir à :**
```bash
tomati@vps-8dfc48b5:~/tomati-market$
```

---

## 🗄️ ÉTAPE 2: Configuration Base de Données

**Entrer dans PostgreSQL correctement :**
```bash
sudo -u postgres psql
```

**Dans PostgreSQL, exécuter UNE PAR UNE :**
```sql
DROP DATABASE IF EXISTS tomati_db;
```
```sql
DROP USER IF EXISTS tomati;
```
```sql
CREATE USER tomati WITH PASSWORD 'tomati123';
```
```sql
ALTER USER tomati CREATEDB;
```
```sql
ALTER USER tomati WITH SUPERUSER;
```
```sql
CREATE DATABASE tomati_db OWNER tomati;
```
```sql
GRANT ALL PRIVILEGES ON DATABASE tomati_db TO tomati;
```
```sql
\q
```

---

## ✅ ÉTAPE 3: Tester la Connexion

```bash
psql -h localhost -U tomati -d tomati_db -c "SELECT version();"
```

**Mot de passe :** `tomati123`

---

## 📝 ÉTAPE 4: Créer fichier .env

```bash
nano .env
```

**Copier ce contenu EXACTEMENT :**
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
OVH_VPS=true
PUBLIC_IP=51.222.111.183
```

**Sauvegarder :**
- `Ctrl + X`
- `Y`
- `Entrée`

---

## 📦 ÉTAPE 5: Dépendances

```bash
rm -rf node_modules
```
```bash
rm -f package-lock.json
```
```bash
npm install
```

---

## 🏗️ ÉTAPE 6: Build

```bash
npm run build
```

---

## 🗄️ ÉTAPE 7: Migration

```bash
npm run db:push
```

---

## ⚙️ ÉTAPE 8: Configuration PM2

```bash
nano ecosystem.config.cjs
```

**Copier ce contenu :**
```javascript
module.exports = {
  apps: [{
    name: 'tomati-production',
    script: 'tsx',
    args: 'server/index.ts',
    cwd: '/home/tomati/tomati-market',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    watch: false,
    max_memory_restart: '1G',
    restart_delay: 4000,
    min_uptime: '10s',
    max_restarts: 10
  }]
};
```

**Sauvegarder :**
- `Ctrl + X`
- `Y`
- `Entrée`

---

## 📁 ÉTAPE 9: Créer dossier logs

```bash
mkdir -p logs
```

---

## 🚀 ÉTAPE 10: Démarrer

```bash
pm2 start ecosystem.config.cjs
```

---

## ✅ ÉTAPE 11: Vérifier

```bash
pm2 status
```
```bash
pm2 logs tomati-production --lines 10
```
```bash
curl http://localhost:5000
```

**Si tout fonctionne, on continue avec Nginx !**

---

## 🌐 ÉTAPE 12: Configuration Nginx

```bash
sudo nano /etc/nginx/sites-available/tomati
```

**Copier cette configuration :**
```nginx
server {
    listen 80;
    server_name 51.222.111.183 _;
    client_max_body_size 50M;

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

    access_log /var/log/nginx/tomati.access.log;
    error_log /var/log/nginx/tomati.error.log;
}
```

---

## 🔗 ÉTAPE 13: Activer Nginx

```bash
sudo ln -sf /etc/nginx/sites-available/tomati /etc/nginx/sites-enabled/
```
```bash
sudo rm -f /etc/nginx/sites-enabled/default
```
```bash
sudo nginx -t
```
```bash
sudo systemctl restart nginx
```

---

## 🎯 ÉTAPE 14: Test Final

```bash
curl http://51.222.111.183
```

**Votre application sera accessible sur :** http://51.222.111.183

---

## 📋 COMMANDES SUIVANTES

**Sortez d'abord de PostgreSQL avec :** `\q`

**Puis suivez les étapes 2 à 14 dans l'ordre !**