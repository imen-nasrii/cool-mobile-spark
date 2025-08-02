# Commandes à Copier-Coller pour HTTPS tomati.org

## 1. Vérifier si Nginx est installé
```bash
sudo systemctl status nginx
```

Si pas installé :
```bash
sudo apt update && sudo apt install nginx -y
```

## 2. Créer configuration tomati.org
```bash
sudo tee /etc/nginx/sites-available/tomati.org > /dev/null << 'EOF'
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
    }
}
EOF
```

## 3. Activer la configuration
```bash
sudo ln -sf /etc/nginx/sites-available/tomati.org /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

## 4. Installer Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

## 5. Test DNS (attendre que ça retourne 51.222.111.183)
```bash
nslookup tomati.org
```

## 6. Certificat SSL (quand DNS OK)
```bash
sudo certbot --nginx -d tomati.org -d www.tomati.org
```

## 7. Tests finaux
```bash
curl http://tomati.org
curl https://tomati.org
pm2 status
```

## Résultat
- ✅ https://tomati.org → Tomati Market
- ✅ Certificat SSL valide
- ✅ Redirection automatique HTTP → HTTPS