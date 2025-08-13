# Commandes pour Votre Situation Actuelle

D'après votre terminal, vous avez déjà des utilisateurs créés. Voici les commandes adaptées :

## 1. Authentification avec mot de passe
Entrez le mot de passe de l'utilisateur `ubuntu` quand demandé

## 2. Terminer la configuration PostgreSQL
```bash
sudo systemctl enable postgresql
sudo -u postgres psql << 'EOF'
CREATE DATABASE tomatii_db;
CREATE USER tomatii_user WITH ENCRYPTED PASSWORD 'tomatii_password_2024!';
GRANT ALL PRIVILEGES ON DATABASE tomatii_db TO tomatii_user;
ALTER USER tomatii_user CREATEDB;
\q
EOF
```

## 3. Utiliser l'utilisateur tomati existant
```bash
sudo su - tomati
```

## 4. Installation Node.js
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts
```

## 5. Clone du projet
```bash
git clone https://github.com/imen-nasrii/cool-mobile-spark.git
cd cool-mobile-spark
npm install
```

## 6. Configuration .env
```bash
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
REPLIT_DOMAINS=votre-domaine.com
ISSUER_URL=https://replit.com/oidc
EOF
chmod 600 .env
```

## 7. Migration et build
```bash
npm run db:push
npm run build
```

## 8. PM2
```bash
npm install -g pm2
cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'tomati-production',
    script: 'server/index.ts',
    interpreter: 'node',
    interpreter_args: '--loader tsx/esm',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF
mkdir -p logs
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

## 9. Retour en ubuntu pour Nginx
```bash
exit
sudo cat > /etc/nginx/sites-available/tomati << 'EOF'
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;

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
        proxy_read_timeout 86400;
    }

    location /ws {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
sudo ln -sf /etc/nginx/sites-available/tomati /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

## 10. Test final
```bash
sudo su - tomati -c "pm2 status"
curl -I http://localhost:5000
```

## Commandes de gestion
```bash
# Status
sudo su - tomati -c "pm2 status"

# Logs
sudo su - tomati -c "pm2 logs tomati-production"

# Redémarrage
sudo su - tomati -c "pm2 restart tomati-production"
```