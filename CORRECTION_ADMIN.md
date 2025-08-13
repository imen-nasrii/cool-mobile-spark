# Correction Création Utilisateur Admin

## Situation actuelle
Le groupe `admin` existe mais pas l'utilisateur. Voici les commandes corrigées :

### 1. Créer l'utilisateur admin (différent nom)
```bash
sudo adduser tomati-admin
```

### 2. Ou forcer la création avec le nom admin
```bash
sudo useradd -m -s /bin/bash admin
sudo passwd admin
```

### 3. Ajouter aux groupes sudo
```bash
sudo usermod -aG sudo admin
```

### 4. Vérifier la création
```bash
id admin
```

### 5. Passer à l'utilisateur admin
```bash
sudo su - admin
```

### 6. Installation complète pour admin
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

## Alternative : Utiliser l'utilisateur tomati existant

Si vous préférez utiliser l'utilisateur `tomati` déjà créé :

```bash
sudo su - tomati
# Puis continuer avec l'installation Node.js et le projet
```