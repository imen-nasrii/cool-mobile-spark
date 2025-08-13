# Création Utilisateur Hamdi

## Commandes pour créer l'utilisateur hamdi

```bash
# Créer l'utilisateur hamdi
sudo adduser hamdi

# Ajouter hamdi au groupe sudo
sudo usermod -aG sudo hamdi

# Vérifier la création
id hamdi

# Passer à l'utilisateur hamdi
sudo su - hamdi
```

## Installation complète pour hamdi

```bash
# Installation Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts

# Clone du projet
git clone https://github.com/imen-nasrii/cool-mobile-spark.git
cd cool-mobile-spark
npm install

# Configuration .env
cat > .env << 'EOF'
DATABASE_URL=postgresql://tomatii_user:tomatii_password_2024!@localhost:5432/tomatii_db
PGDATABASE=tomatii_db
PGHOST=localhost
PGPORT=5432
PGUSER=tomatii_user
PGPASSWORD=tomatii_password_2024!
JWT_SECRET=tomati_super_secret_jwt_key_2024_production
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
SESSION_SECRET=tomati_session_secret_key_2024_production
REPL_ID=tomati-production
REPLIT_DOMAINS=tomati.org
ISSUER_URL=https://replit.com/oidc
EOF
chmod 600 .env

# Migration et build
npm run db:push
npm run build

# PM2
npm install -g pm2
pm2 start server/index.ts --name tomati-hamdi --interpreter-args="--loader tsx/esm"
pm2 save
pm2 startup

# Scripts de gestion
cat > deploy.sh << 'DEPLOYEOF'
#!/bin/bash
echo "🚀 Déploiement Tomati par Hamdi..."
cd /home/hamdi/cool-mobile-spark

# Backup de la base de données
sudo -u postgres pg_dump tomatii_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Chargement NVM
export NVM_DIR="/home/hamdi/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Mise à jour
git pull origin main
npm install
npm run db:push
npm run build
pm2 restart tomati-hamdi

echo "✅ Déploiement terminé par Hamdi !"
DEPLOYEOF

cat > monitor.sh << 'MONEOF'
#!/bin/bash
echo "📊 Status Tomati - Panel Hamdi:"
echo "==============================="

# Chargement NVM
export NVM_DIR="/home/hamdi/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

pm2 status
echo ""
echo "💾 Utilisation disque:"
df -h | head -5
echo ""
echo "🧠 Utilisation mémoire:"
free -h
MONEOF

chmod +x deploy.sh monitor.sh
```

## Commandes de gestion quotidienne

```bash
# Passer à hamdi
sudo su - hamdi

# Status de l'application
pm2 status

# Logs en temps réel
pm2 logs tomati-hamdi

# Redémarrer l'application
pm2 restart tomati-hamdi

# Monitoring complet
./monitor.sh

# Déploiement/mise à jour
./deploy.sh
```