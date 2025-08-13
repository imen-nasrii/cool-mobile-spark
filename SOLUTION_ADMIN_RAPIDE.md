# Solution Rapide - Création Utilisateur Admin

## Commandes à exécuter maintenant

```bash
# Créer l'utilisateur admin avec le groupe users comme groupe principal
sudo useradd -m -s /bin/bash -g users admin
sudo passwd admin

# Ajouter admin au groupe sudo
sudo usermod -aG sudo admin

# Vérifier la création
id admin

# Passer à l'utilisateur admin
sudo su - admin
```

## Installation complète une fois connecté en tant qu'admin

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
pm2 start server/index.ts --name tomati-admin --interpreter-args="--loader tsx/esm"
pm2 save
pm2 startup
```