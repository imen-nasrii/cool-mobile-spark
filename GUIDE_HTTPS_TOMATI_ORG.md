# Guide HTTPS tomati.org - Hébergement VPS

## Étapes pour configurer HTTPS tomati.org

### 1. Configuration DNS (chez votre registraire de domaine)

Connectez-vous au panneau de contrôle de votre domaine tomati.org et ajoutez :

```
Type: A
Nom: @ (ou tomati.org)
Valeur: 51.222.111.183
TTL: 3600
```

```
Type: A  
Nom: www
Valeur: 51.222.111.183
TTL: 3600
```

### 2. Installation Nginx (si pas déjà fait)

```bash
sudo apt update
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 3. Configuration Nginx pour tomati.org

```bash
sudo nano /etc/nginx/sites-available/tomati.org
```

**Contenu du fichier :**

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

### 4. Activer le site

```bash
sudo ln -s /etc/nginx/sites-available/tomati.org /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Installation Certbot pour SSL

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 6. Obtenir certificat SSL Let's Encrypt

```bash
sudo certbot --nginx -d tomati.org -d www.tomati.org
```

### 7. Test automatique du renouvellement

```bash
sudo certbot renew --dry-run
```

### 8. Vérification finale

- Test HTTP : http://tomati.org
- Test HTTPS : https://tomati.org
- Test www : https://www.tomati.org

## Résultat final

Votre application sera accessible sur :
- ✅ https://tomati.org
- ✅ https://www.tomati.org
- ✅ Certificat SSL valide
- ✅ Redirection automatique HTTP → HTTPS