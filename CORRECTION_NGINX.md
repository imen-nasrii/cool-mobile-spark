# Correction Nginx - Erreur de syntaxe

## Sur votre serveur, exécutez ces commandes :

### 1. Désactiver le site par défaut qui pose problème
```bash
sudo rm /etc/nginx/sites-enabled/default
```

### 2. Vérifier et corriger la configuration tomati.org
```bash
sudo nginx -t
```

### 3. Si erreur persiste, recréer le fichier proprement
```bash
sudo rm /etc/nginx/sites-available/tomati.org
sudo nano /etc/nginx/sites-available/tomati.org
```

### 4. Reactiver le site
```bash
sudo ln -s /etc/nginx/sites-available/tomati.org /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Continuer avec SSL
```bash
sudo certbot --nginx -d tomati.org -d www.tomati.org
```