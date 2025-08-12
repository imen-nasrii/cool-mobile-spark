# Commandes de Correction Base de Données

## 🔍 DIAGNOSTIC POSTGRESQL

### Vérifier le statut PostgreSQL
```bash
sudo systemctl status postgresql
```

### Vérifier utilisateurs existants
```bash
sudo -u postgres psql -c "\du"
```

### Vérifier bases de données
```bash
sudo -u postgres psql -c "\l"
```

---

## 🔧 CORRECTION RAPIDE

### Si PostgreSQL existe déjà
```bash
sudo -u postgres psql -c "CREATE USER tomati_user WITH PASSWORD 'Tomati123_db';"
sudo -u postgres psql -c "CREATE DATABASE tomati_db OWNER tomati_user;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE tomati_db TO tomati_user;"
```

### Si PostgreSQL n'est pas installé
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Puis créer l'utilisateur et la base
```bash
sudo -u postgres createuser tomati_user --pwprompt
# Entrer le mot de passe: Tomati123_db

sudo -u postgres createdb tomati_db -O tomati_user
```

---

## 🧪 TEST DE CONNEXION
```bash
psql -h localhost -U tomati_user -d tomati_db -c "SELECT version();"
```

---

## 🚀 FINALISATION DÉPLOIEMENT

### Une fois la DB corrigée
```bash
cd /home/tomati/tomatimarket
npm run db:push
pm2 start ecosystem.config.js
pm2 save
pm2 status
pm2 logs tomati-production --lines 15
curl http://localhost:5000/api/categories
```

---

## 🔄 SOLUTION ALTERNATIVE

### Si problème persiste - Configuration simple
```bash
cd /home/tomati/tomatimarket
cat > .env << 'ENVEOF'
NODE_ENV=production
PORT=5000
JWT_SECRET=tomati-super-secret-jwt-key-production-2025
DATABASE_URL=postgresql://postgres@localhost:5432/tomati_db
PUBLIC_URL=https://tomati.org
VITE_API_URL=https://tomati.org/api
CORS_ORIGIN=https://tomati.org
ENVEOF

# Créer la base avec l'utilisateur postgres par défaut
sudo -u postgres createdb tomati_db
npm run db:push
```

---

## ✅ VALIDATION FINALE
```bash
pm2 start ecosystem.config.js && pm2 save && pm2 status && curl http://localhost:5000/api/categories
```