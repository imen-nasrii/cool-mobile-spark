# Correction PM2 et suite du déploiement

## Sur votre serveur, exécutez :

### 1. Créer un fichier PM2 simple
```bash
cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'tomati-market',
    script: 'server/index.ts',
    interpreter: 'node',
    interpreter_args: '--loader tsx',
    instances: 1,
    exec_mode: 'fork',
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
}
EOF
```

### 2. Démarrer avec PM2
```bash
pm2 start ecosystem.config.cjs --env production
pm2 save
```

### 3. Exécuter la commande startup PM2
```bash
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u tomati --hp /home/tomati
```

### 4. Vérifier que ça fonctionne
```bash
pm2 status
pm2 logs tomati-market
```

### 5. Retourner à ubuntu pour Nginx
```bash
exit
```

### 6. Configuration Nginx
```bash
sudo nano /etc/nginx/sites-available/tomati.org
```

Puis continuez avec la configuration Nginx du guide précédent.