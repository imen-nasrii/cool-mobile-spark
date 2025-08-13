# Finalisation du Déploiement - Configuration Nginx

## État actuel
✅ **Application déployée** : Tomati Market fonctionne sur le port 5000  
✅ **PM2 configuré** : Processus tomati-hamdi en cours d'exécution  
✅ **Test local réussi** : curl http://localhost:5000 retourne la page HTML  
❌ **Accès externe** : ERR_CONNECTION_REFUSED sur tomati.org  

## Solution : Configuration Nginx

L'application fonctionne localement mais n'est pas accessible depuis l'extérieur car Nginx n'est pas configuré pour rediriger le trafic de tomati.org vers le port 5000.

### Commandes à exécuter sur le VPS

```bash
# En tant qu'utilisateur avec privilèges sudo (ubuntu ou hamdi)

# 1. Installer Nginx si nécessaire
sudo apt update
sudo apt install nginx -y

# 2. Configurer Nginx pour tomati.org
sudo tee /etc/nginx/sites-available/tomati.org << 'EOF'
server {
    listen 80;
    server_name tomati.org www.tomati.org;

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
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# 3. Activer la configuration
sudo ln -sf /etc/nginx/sites-available/tomati.org /etc/nginx/sites-enabled/

# 4. Supprimer la configuration par défaut si elle existe
sudo rm -f /etc/nginx/sites-enabled/default

# 5. Tester la configuration
sudo nginx -t

# 6. Redémarrer Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

# 7. Vérifier le statut
sudo systemctl status nginx

# 8. Tester l'accès externe
curl -I http://tomati.org

# 9. Vérifier que l'application PM2 est toujours active
pm2 status
```

### Configuration du pare-feu (si UFW est activé)

```bash
# Vérifier le statut du pare-feu
sudo ufw status

# Si UFW est activé, autoriser HTTP et HTTPS
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw --force enable
```

### Configuration SSL avec Let's Encrypt (optionnel)

```bash
# Installer certbot
sudo apt install snapd -y
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# Obtenir le certificat SSL
sudo certbot --nginx -d tomati.org -d www.tomati.org
```

## Validation finale

Une fois Nginx configuré :
- ✅ https://tomati.org devrait être accessible
- ✅ L'application Tomati Market s'affichera correctement
- ✅ Toutes les fonctionnalités (auth, base de données) opérationnelles

## Logs de débogage

Si problèmes persistants :
```bash
# Logs Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Logs PM2
pm2 logs tomati-hamdi

# Test connectivité
curl -v http://localhost:5000
curl -v http://tomati.org
```