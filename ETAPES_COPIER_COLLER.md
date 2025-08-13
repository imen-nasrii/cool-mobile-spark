# Étapes Copier-Coller - Déploiement Tomati

## Étape 1: Connexion au VPS
```bash
ssh root@VOTRE_IP_VPS
```

## Étape 2: Mise à jour du système
```bash
apt update && apt upgrade -y
apt install curl git ufw build-essential nginx postgresql postgresql-contrib certbot python3-certbot-nginx -y
```

## Étape 3: Configuration PostgreSQL
```bash
systemctl start postgresql
systemctl enable postgresql
sudo -u postgres psql << 'EOF'
CREATE DATABASE tomatii_db;
CREATE USER tomatii_user WITH ENCRYPTED PASSWORD 'tomatii_password_2024!';
GRANT ALL PRIVILEGES ON DATABASE tomatii_db TO tomatii_user;
ALTER USER tomatii_user CREATEDB;
\q
EOF
```

## Étape 4: Création utilisateur système
```bash
adduser --disabled-password --gecos "" tomati
usermod -aG sudo tomati
sudo su - tomati
```

## Étape 5: Installation Node.js
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts
```

## Étape 6: Clone du projet
```bash
git clone https://github.com/imen-nasrii/cool-mobile-spark.git
cd cool-mobile-spark
npm install
```

## Étape 7: Configuration environnement
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

## Étape 8: Migration et build
```bash
npm run db:push
npm run build
```

## Étape 9: Configuration PM2
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

## Étape 10: Retour en root et configuration Nginx
```bash
exit
cat > /etc/nginx/sites-available/tomati << 'EOF'
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

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

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF
ln -sf /etc/nginx/sites-available/tomati /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
systemctl enable nginx
```

## Étape 11: Sécurité
```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
```

## Étape 12: SSL (optionnel)
```bash
certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
```

## Étape 13: Scripts de maintenance
```bash
sudo su - tomati
cat > deploy.sh << 'EOF'
#!/bin/bash
echo "🚀 Déploiement Tomati..."
cd /home/tomati/cool-mobile-spark
sudo -u postgres pg_dump tomatii_db > backup_$(date +%Y%m%d_%H%M%S).sql
git pull origin main
npm install
npm run db:push
npm run build
pm2 restart tomati-production
echo "✅ Déploiement terminé !"
EOF
cat > monitor.sh << 'EOF'
#!/bin/bash
echo "📊 Status de Tomati:"
echo "==================="
pm2 status
echo ""
echo "💾 Utilisation disque:"
df -h
echo ""
echo "🧠 Utilisation mémoire:"
free -h
EOF
chmod +x deploy.sh monitor.sh
```

## Étape 14: Test final
```bash
pm2 status
curl -I http://localhost:5000
```

## ✅ Commandes de gestion quotidienne
```bash
# Monitoring
sudo su - tomati -c "./monitor.sh"

# Logs
sudo su - tomati -c "pm2 logs tomati-production"

# Redémarrage
sudo su - tomati -c "pm2 restart tomati-production"

# Mise à jour
sudo su - tomati -c "./deploy.sh"
```