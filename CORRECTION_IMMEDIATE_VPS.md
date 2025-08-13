# Correction Immédiate VPS - Port dynamique

## Problème résolu
✅ Modifié server/index.ts pour utiliser process.env.PORT au lieu du port fixé à 5000

## Commandes à exécuter maintenant

```bash
# 1. Rebuild l'application avec le code modifié
npm run build

# 2. Redémarrer PM2 avec la nouvelle version
pm2 delete tomati-hamdi
pm2 start ecosystem.config.cjs

# 3. Vérifier le fonctionnement
pm2 status
pm2 logs tomati-hamdi --lines 5
curl http://localhost:3001

# 4. Si ça fonctionne, sauvegarder la configuration
pm2 save

# 5. Configurer le démarrage automatique
sudo env PATH=$PATH:/home/hamdi/.nvm/versions/node/v22.18.0/bin /home/hamdi/.nvm/versions/node/v22.18.0/lib/node_modules/pm2/bin/pm2 startup systemd -u hamdi --hp /home/hamdi
```

## Configuration Nginx finale

```bash
# Configurer Nginx pour rediriger tomati.org vers le port 3001
sudo tee /etc/nginx/sites-available/tomati.org << 'EOF'
server {
    listen 80;
    server_name tomati.org www.tomati.org;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Activer la configuration
sudo ln -sf /etc/nginx/sites-available/tomati.org /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Test final
curl -I http://tomati.org
```

## Validation complète

```bash
# Vérifier tous les services
pm2 status
sudo systemctl status nginx
sudo systemctl status postgresql

# Test complet
curl http://localhost:3001
curl http://tomati.org

echo "✅ Tomati Market déployé avec succès sur tomati.org"
```