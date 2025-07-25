# 🚀 Guide de Déploiement VPS Hostinger - Tomati E-commerce

## 📋 Vue d'ensemble

Cette application e-commerce Tomati est maintenant **entièrement organisée et prête** pour le déploiement sur votre VPS Hostinger. Tous les composants sont connectés à la base de données PostgreSQL avec une architecture professionnelle.

## 🏗️ Architecture Complète

```
📁 Tomati E-commerce Platform
├── 🗄️  Base de données PostgreSQL (8+ tables optimisées)
├── 🔧 Backend Express.js avec API RESTful complète
├── ⚛️  Frontend React avec TypeScript et TanStack Query
├── 💬 Système de messagerie temps réel (WebSocket)
├── 👤 Profils utilisateur avec système de notation
├── 📍 Géolocalisation et carte interactive
├── 🔐 Authentification JWT sécurisée
└── 📊 Dashboard admin avec analytics avancées
```

## 📦 Fichiers de Déploiement Inclus

### Scripts et Configuration
- **`deploy.sh`** - Script de déploiement automatique
- **`ecosystem.config.js`** - Configuration PM2 pour la production
- **`nginx.conf`** - Configuration Nginx avec proxy et SSL
- **`Dockerfile`** - Containerisation (alternative)
- **`docker-compose.yml`** - Orchestration Docker complète

### Base de Données
- **`database-optimization.sql`** - Index et optimisations de performance
- **`shared/schema.ts`** - Schéma Drizzle avec 8+ tables
- **`drizzle.config.ts`** - Configuration de migration

### Documentation
- **`deployment-guide.md`** - Guide détaillé étape par étape
- **`package-scripts.md`** - Scripts NPM pour la production

## 🎯 Fonctionnalités Complètes

### ✅ Système de Base
- [x] **Base de données PostgreSQL** avec 8+ tables optimisées
- [x] **Authentification JWT** avec hachage bcrypt sécurisé
- [x] **API RESTful complète** avec validation Zod
- [x] **Frontend React moderne** avec TypeScript et Tailwind CSS

### ✅ Fonctionnalités Avancées
- [x] **Messagerie temps réel** WebSocket entre utilisateurs
- [x] **Profils utilisateur détaillés** avec biographie et statistiques
- [x] **Système de notation peer-to-peer** (1-5 étoiles)
- [x] **Géolocalisation interactive** avec carte et recherche par proximité
- [x] **Système de favoris** avec cœur temps réel
- [x] **Notifications en temps réel** avec compteur de non-lus

### ✅ Localisation Tunisie
- [x] **Prix en TND** (Dinars Tunisiens)
- [x] **Villes tunisiennes authentiques** (Tunis, Sfax, Sousse, etc.)
- [x] **Interface bilingue** Français/Arabe
- [x] **Coordonnées GPS tunisiennes** pour la géolocalisation

### ✅ Administration et Analytics
- [x] **Dashboard admin complet** avec statistiques authentiques
- [x] **Système de promotion automatique** (5+ messages = produit promu)
- [x] **Analytics avancées** : vues produits, recherches, comportement utilisateur
- [x] **Chatbot IA** pour support client
- [x] **Gestion des rôles** admin/utilisateur

## 🚀 Déploiement Rapide

### Option 1: Déploiement Automatique
```bash
# Copier tous les fichiers sur votre VPS
scp -r . user@votre-vps:/var/www/tomati/

# Exécuter le script de déploiement
cd /var/www/tomati
./deploy.sh production
```

### Option 2: Déploiement Manuel
```bash
# 1. Installer les prérequis
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs postgresql postgresql-contrib nginx -y
sudo npm install -g pm2

# 2. Configurer PostgreSQL
sudo -u postgres createdb tomati_db
sudo -u postgres createuser -P tomati_user

# 3. Configurer l'application
cd /var/www/tomati
npm install --production
npm run build
npm run db:push

# 4. Démarrer avec PM2
pm2 start ecosystem.config.js
pm2 save && pm2 startup

# 5. Configurer Nginx
sudo cp nginx.conf /etc/nginx/sites-available/tomati
sudo ln -s /etc/nginx/sites-available/tomati /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### Option 3: Docker (Alternative)
```bash
# Déploiement avec Docker Compose
docker-compose up -d

# Monitoring
docker-compose logs -f app
```

## 🔐 Configuration de Sécurité

### Variables d'Environnement Requises
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://tomati_user:mot_de_passe@localhost:5432/tomati_db
JWT_SECRET=votre_secret_jwt_tres_securise_32_caracteres_minimum
```

### SSL et Domaine
```bash
# Configuration SSL automatique avec Let's Encrypt
sudo certbot --nginx -d votre-domaine.com
```

## 📊 Monitoring et Maintenance

### Commandes Utiles
```bash
# Monitoring PM2
pm2 monit
pm2 logs tomati-app

# Santé de l'application
curl http://localhost:5000/api/health

# Sauvegarde base de données
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Mise à jour application
cd /var/www/tomati
git pull && npm run build && pm2 restart tomati-app
```

### Optimisation Base de Données
```bash
# Appliquer les optimisations incluses
psql $DATABASE_URL -f database-optimization.sql
```

## 🎯 Comptes de Test

### Administrateur
- **Email**: admin@tomati.com
- **Mot de passe**: admin123
- **Accès**: Dashboard admin complet

### Utilisateur Test
- **Email**: user@example.com
- **Mot de passe**: password123
- **Accès**: Fonctionnalités utilisateur standard

## 🏆 État du Projet

**✅ PRÊT POUR LA PRODUCTION**

L'application Tomati est maintenant **entièrement organisée** avec :
- Base de données PostgreSQL optimisée et connectée
- Toutes les fonctionnalités opérationnelles
- Configuration de déploiement VPS complète
- Scripts d'automatisation inclus
- Sécurité et monitoring configurés
- Documentation complète fournie

**🚀 Vous pouvez maintenant déployer sur votre VPS Hostinger !**

## 📞 Support

Pour toute question sur le déploiement :
1. Consultez `deployment-guide.md` pour les détails techniques
2. Vérifiez les logs avec `pm2 logs tomati-app`
3. Testez la santé avec `curl http://localhost:5000/api/health`

**L'application est maintenant prête pour vos utilisateurs tunisiens !**