# Guide de Déploiement Tomati sur VPS OVH

## Prérequis
- VPS OVH avec Ubuntu 22.04 LTS
- Domaine tomati.org configuré (✅ fait)
- Accès SSH au serveur
- IP du serveur : 213.186.33.5

## Étape 1 : Connexion au serveur

```bash
ssh root@213.186.33.5
```

## Étape 2 : Mise à jour du système

```bash
apt update && apt upgrade -y
apt install -y curl wget git vim htop ufw
```

## Étape 3 : Installation de Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs
node --version  # Vérifier la version
npm --version
```

## Étape 4 : Installation de PostgreSQL

```bash
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql

# Configuration de PostgreSQL
sudo -u postgres psql
```

Dans psql :
```sql
CREATE DATABASE tomati_production;
CREATE USER tomati_user WITH ENCRYPTED PASSWORD 'votre_mot_de_passe_securise';
GRANT ALL PRIVILEGES ON DATABASE tomati_production TO tomati_user;
\q
```

## Étape 5 : Configuration du firewall

```bash
ufw allow ssh
ufw allow 80
ufw allow 443
ufw enable
```

## Étape 6 : Installation de Nginx

```bash
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

## Étape 7 : Installation de Certbot (SSL)

```bash
apt install -y certbot python3-certbot-nginx
```

## Étape 8 : Clonage du projet

```bash
# Créer un utilisateur pour l'application
adduser tomati
usermod -aG sudo tomati
su - tomati

# Cloner le projet (vous devrez d'abord pousser votre code sur GitHub)
git clone https://github.com/votre-username/tomati-market.git
cd tomati-market
```

## Étape 9 : Installation des dépendances

```bash
npm install
npm run build
```

## Étape 10 : Configuration des variables d'environnement

```bash
# Créer le fichier .env
vim .env
```

Contenu du fichier .env :
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://tomati_user:votre_mot_de_passe_securise@localhost:5432/tomati_production
JWT_SECRET=votre_jwt_secret_super_securise_au_moins_32_caracteres
SESSION_SECRET=votre_session_secret_super_securise
```

## Étape 11 : Migration de la base de données

```bash
npm run db:push
```

## Étape 12 : Installation de PM2

```bash
npm install -g pm2
```

## Étape 13 : Configuration Nginx

```bash
sudo vim /etc/nginx/sites-available/tomati.org
```

Contenu :
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

    # WebSocket support
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
}
```

Activer le site :
```bash
sudo ln -s /etc/nginx/sites-available/tomati.org /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Étape 14 : Obtenir le certificat SSL

```bash
sudo certbot --nginx -d tomati.org -d www.tomati.org
```

## Étape 15 : Démarrer l'application avec PM2

```bash
# Revenir dans le dossier du projet
cd ~/tomati-market

# Démarrer avec PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

## Étape 16 : Vérification et monitoring

```bash
# Vérifier le statut
pm2 status
pm2 logs

# Vérifier Nginx
sudo nginx -t
sudo systemctl status nginx

# Vérifier PostgreSQL
sudo systemctl status postgresql
```

## Étape 17 : Script de sauvegarde automatique

```bash
# Créer le script de backup
vim ~/backup.sh
```

Contenu :
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/tomati/backups"
DB_NAME="tomati_production"
DB_USER="tomati_user"

mkdir -p $BACKUP_DIR

# Backup de la base de données
pg_dump -U $DB_USER -h localhost $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Backup du code (optionnel)
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz ~/tomati-market

# Garder seulement les 7 derniers backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

Rendre exécutable et programmer :
```bash
chmod +x ~/backup.sh
crontab -e
```

Ajouter :
```
0 2 * * * /home/tomati/backup.sh >> /home/tomati/backup.log 2>&1
```

## Commandes utiles pour la maintenance

```bash
# Redémarrer l'application
pm2 restart tomati-market

# Voir les logs
pm2 logs tomati-market

# Recharger Nginx
sudo systemctl reload nginx

# Voir l'utilisation des ressources
htop
pm2 monit

# Mettre à jour l'application
cd ~/tomati-market
git pull
npm install
npm run build
pm2 restart tomati-market
```

## Sécurité supplémentaire

```bash
# Désactiver l'accès root SSH
sudo vim /etc/ssh/sshd_config
# Changer: PermitRootLogin no
sudo systemctl restart ssh

# Configurer fail2ban
sudo apt install -y fail2ban
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

## Dépannage courant

1. **L'application ne démarre pas** : Vérifier les logs avec `pm2 logs`
2. **Erreur de base de données** : Vérifier la connection string dans `.env`
3. **SSL ne fonctionne pas** : Relancer `sudo certbot --nginx -d tomati.org -d www.tomati.org`
4. **Site inaccessible** : Vérifier `sudo nginx -t` et `sudo systemctl status nginx`

Votre application sera accessible sur https://tomati.org une fois toutes ces étapes terminées !