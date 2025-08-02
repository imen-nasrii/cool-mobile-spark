# 🔍 Diagnostic et Hébergement VPS - Tomati Market

## Situation Actuelle
Le répertoire `/tomatimarket` n'existe pas, ce qui indique que l'application n'est pas correctement déployée.

## 🔍 ÉTAPE 1: Diagnostic Complet

```bash
# Retourner en mode ubuntu (sortir de l'utilisateur tomati)
exit

# Diagnostic complet
wget -O diagnostic.sh https://raw.githubusercontent.com/imen-nasrii/cool-mobile-spark/main/diagnostic-vps.sh
chmod +x diagnostic.sh
sudo ./diagnostic.sh
```

## 🚀 ÉTAPE 2: Déploiement Complet

Selon le diagnostic, vous devrez probablement faire un déploiement complet :

```bash
# Déploiement automatique depuis GitHub
wget -O deploy-complete.sh https://raw.githubusercontent.com/imen-nasrii/cool-mobile-spark/main/deploy-github-vps.sh
chmod +x deploy-complete.sh
sudo ./deploy-complete.sh
```

## 📋 ÉTAPE 3: Vérification Post-Déploiement

```bash
# Vérifier que l'application existe
ls -la /home/tomati/

# Statut PM2
sudo -u tomati pm2 status

# Test application
curl http://51.222.111.183
```

## 🎯 Répertoires Attendus Après Déploiement

```
/home/tomati/tomati-market/    # Application principale
├── client/                    # Frontend
├── server/                    # Backend
├── shared/                    # Types partagés
├── .env                      # Configuration
└── ecosystem.config.cjs      # PM2
```

## ⚡ Commandes Rapides de Récupération

Si vous voulez forcer un nouveau déploiement propre :

```bash
# Nettoyer complètement
sudo userdel -r tomati 2>/dev/null || true
sudo rm -rf /home/tomati 2>/dev/null || true
sudo pm2 kill 2>/dev/null || true

# Déploiement frais
curl -sSL https://raw.githubusercontent.com/imen-nasrii/cool-mobile-spark/main/deploy-github-vps.sh | sudo bash
```

Le diagnostic vous dira exactement ce qui manque pour héberger correctement votre application.