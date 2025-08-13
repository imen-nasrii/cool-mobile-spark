# Étapes Simplifiées - Déploiement Tomati sur VPS OVH

## 🚀 Déploiement Express (15 minutes)

### Étape 1: Préparation VPS
```bash
# Connexion SSH
ssh root@VOTRE_IP_VPS

# Mise à jour système
apt update && apt upgrade -y
apt install curl git ufw build-essential nginx postgresql postgresql-contrib certbot python3-certbot-nginx -y
```

### Étape 2: Configuration PostgreSQL
```bash
# Démarrage PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Configuration base de données
sudo -u postgres psql << 'EOF'
CREATE DATABASE tomatii_db;
CREATE USER tomatii_user WITH ENCRYPTED PASSWORD 'tomatii_password_2024!';
GRANT ALL PRIVILEGES ON DATABASE tomatii_db TO tomatii_user;
ALTER USER tomatii_user CREATEDB;
\q
EOF
```

### Étape 3: Création Utilisateur et Installation Node.js
```bash
# Utilisateur système
adduser --disabled-password --gecos "" tomati
usermod -aG sudo tomati

# Passage à l'utilisateur tomati
sudo su - tomati

# Installation Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts
```

### Étape 4: Clone et Configuration Application
```bash
# Clone du projet
git clone https://github.com/imen-nasrii/cool-mobile-spark.git
cd cool-mobile-spark

# Installation dépendances
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
REPLIT_DOMAINS=votre-domaine.com
ISSUER_URL=https://replit.com/oidc
EOF

chmod 600 .env
```

### Étape 5: Migration et Build
```bash
# Migration base de données
npm run db:push

# Build application
npm run build
```

### Étape 6: Configuration PM2
```bash
# Installation PM2
npm install -g pm2

# Configuration ecosystem
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

# Démarrage
mkdir -p logs
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

### Étape 7: Configuration Nginx (retour en root)
```bash
exit  # Retour en root

# Configuration Nginx
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

# Activation
ln -sf /etc/nginx/sites-available/tomati /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
systemctl enable nginx
```

### Étape 8: Sécurité et HTTPS
```bash
# Pare-feu
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# HTTPS (optionnel)
# Remplacez votre-domaine.com par votre vrai domaine
certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
```

## ✅ Vérification Finale

```bash
# Test des services
systemctl status nginx
systemctl status postgresql
sudo su - tomati -c "pm2 status"

# Test application
curl -I http://localhost:5000
curl -I http://votre-domaine.com
```

## 📋 Scripts de Maintenance

### Créer les scripts de gestion
```bash
# Script de déploiement
sudo su - tomati -c 'cat > /home/tomati/deploy.sh << "EOF"
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
EOF'

# Script de monitoring
sudo su - tomati -c 'cat > /home/tomati/monitor.sh << "EOF"
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
echo ""
echo "📈 Status Nginx:"
sudo systemctl status nginx --no-pager
echo ""
echo "🗄️ Status PostgreSQL:"
sudo systemctl status postgresql --no-pager
EOF'

# Permissions
sudo su - tomati -c 'chmod +x /home/tomati/deploy.sh /home/tomati/monitor.sh'
```

## 🎉 Application Déployée !

Votre application Tomati est maintenant accessible sur :
- **HTTP** : http://votre-domaine.com
- **HTTPS** : https://votre-domaine.com (si SSL configuré)

### Commandes de gestion quotidiennes :
```bash
# Monitoring
sudo su - tomati -c './monitor.sh'

# Mise à jour
sudo su - tomati -c './deploy.sh'

# Logs
sudo su - tomati -c 'pm2 logs tomati-production'

# Redémarrage
sudo su - tomati -c 'pm2 restart tomati-production'
```