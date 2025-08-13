# Création de l'Utilisateur Admin

## Commandes à exécuter sur votre VPS

### 1. Créer l'utilisateur admin
```bash
sudo adduser admin
```

### 2. Ajouter les privilèges sudo
```bash
sudo usermod -aG sudo admin
```

### 3. Test de l'utilisateur admin
```bash
sudo su - admin
```

### 4. Vérification des privilèges
```bash
sudo whoami
```

### 5. Installation Node.js pour admin
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts
```

### 6. Clone du projet pour admin
```bash
git clone https://github.com/imen-nasrii/cool-mobile-spark.git
cd cool-mobile-spark
npm install
```

### 7. Configuration .env pour admin
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
REPLIT_DOMAINS=tomati.org
ISSUER_URL=https://replit.com/oidc
EOF
chmod 600 .env
```

### 8. Migration et démarrage avec admin
```bash
npm run db:push
npm run build
npm install -g pm2
pm2 start server/index.ts --name tomati-admin --interpreter-args="--loader tsx/esm"
pm2 save
pm2 startup
```

### 9. Scripts de gestion pour admin
```bash
cat > deploy.sh << 'EOF'
#!/bin/bash
echo "🚀 Déploiement Tomati par Admin..."
cd /home/admin/cool-mobile-spark
sudo -u postgres pg_dump tomatii_db > backup_$(date +%Y%m%d_%H%M%S).sql
git pull origin main
npm install
npm run db:push
npm run build
pm2 restart tomati-admin
echo "✅ Déploiement terminé par Admin !"
EOF

cat > monitor.sh << 'EOF'
#!/bin/bash
echo "📊 Status Tomati - Admin Panel:"
echo "==============================="
pm2 status
echo ""
echo "💾 Disque:"
df -h
echo ""
echo "🧠 Mémoire:"
free -h
EOF

chmod +x deploy.sh monitor.sh
```

## Commandes de gestion avec utilisateur admin

```bash
# Passer à l'utilisateur admin
sudo su - admin

# Status de l'application
pm2 status

# Logs
pm2 logs tomati-admin

# Redémarrage
pm2 restart tomati-admin

# Monitoring
./monitor.sh

# Déploiement
./deploy.sh
```

## Pour supprimer les anciens utilisateurs (optionnel)
```bash
# Retour en ubuntu
exit

# Supprimer l'utilisateur tomati
sudo userdel -r tomati

# Supprimer l'utilisateur tomatii
sudo userdel -r tomatii
```