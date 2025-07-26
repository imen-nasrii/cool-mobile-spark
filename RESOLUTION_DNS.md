# Résolution du problème DNS - Déploiement final

## Problème identifié
Le domaine `tomati.org` ne pointe pas vers votre serveur IP `213.186.33.5`. C'est pourquoi Let's Encrypt ne peut pas valider le certificat SSL.

## Solutions possibles :

### Option 1 : Configuration DNS (Recommandée)
Vous devez configurer les enregistrements DNS de `tomati.org` pour pointer vers `213.186.33.5` :

**Chez votre registrar de domaine :**
- Type A : `tomati.org` → `213.186.33.5`
- Type A : `www.tomati.org` → `213.186.33.5`

### Option 2 : Test temporaire avec IP directe
En attendant la configuration DNS, testons directement :

```bash
# Tester l'application directement sur IP
curl http://213.186.33.5:5000

# Ou créer une configuration temporaire
sudo nano /etc/nginx/sites-available/ip-temp
```

Configuration temporaire :
```nginx
server {
    listen 80 default_server;
    server_name 213.186.33.5;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/ip-temp /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### Option 3 : Vérification du service
```bash
# Vérifier que l'application fonctionne
sudo su - tomati
pm2 status
pm2 logs tomati-market --lines 5

# Tester directement
curl http://localhost:5000
```

## Prochaines étapes :

1. **Configurez DNS** chez votre registrar de domaine
2. **Attendez propagation** (5-60 minutes)
3. **Retry SSL** : `sudo certbot --nginx -d tomati.org -d www.tomati.org`

## Vérification DNS :
```bash
# Vérifier la résolution DNS
nslookup tomati.org
dig tomati.org A
```

Une fois DNS configuré, votre marketplace sera accessible sur https://tomati.org !