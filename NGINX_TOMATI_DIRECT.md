# Configuration Nginx Directe pour tomati.org

## Créer le fichier de configuration Nginx

```bash
sudo nano /etc/nginx/sites-available/tomati.org
```

**Contenu à copier-coller :**

```nginx
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
```

## Activer la configuration

```bash
# Lier le fichier
sudo ln -sf /etc/nginx/sites-available/tomati.org /etc/nginx/sites-enabled/

# Supprimer config par défaut
sudo rm -f /etc/nginx/sites-enabled/default

# Tester la configuration
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx
```

## Installation Certbot

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

## Attendre propagation DNS puis SSL

Une fois que `nslookup tomati.org` retourne `51.222.111.183` :

```bash
sudo certbot --nginx -d tomati.org -d www.tomati.org
```

## Test final

```bash
curl http://tomati.org
curl https://tomati.org
```