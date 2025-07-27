# Diagnostic et Solution PM2 - Étapes Détaillées

## ✅ Ce qui fonctionne :
- Application démarre manuellement : `./start-app.sh` → "serving on port 5000"
- Base de données PostgreSQL connectée
- Variables d'environnement correctes

## ❌ Problème actuel :
- PM2 ne démarre pas l'application (logs vides)
- Configuration ecosystem.config.js corrompue lors de la saisie

## 🔧 Solution étape par étape :

### Étape 1 : Nettoyer PM2
```bash
# Se connecter en tant qu'utilisateur tomati
su - tomati
cd ~/tomati-market

# Supprimer toutes les instances PM2
pm2 delete all
pm2 kill
```

### Étape 2 : Créer une configuration PM2 propre
```bash
# Créer le fichier de configuration (IMPORTANT : copier exactement)
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'tomati-production',
    script: '/home/tomati/tomati-market/start-app.sh',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    log_file: '/home/tomati/.pm2/logs/tomati-production.log',
    out_file: '/home/tomati/.pm2/logs/tomati-production-out.log',
    error_file: '/home/tomati/.pm2/logs/tomati-production-error.log'
  }]
}
EOF

# Vérifier que le fichier est correct
cat ecosystem.config.js
```

### Étape 3 : Vérifier que le script fonctionne
```bash
# Tester le script directement
./start-app.sh
# Vous devez voir : "serving on port 5000"
# Appuyez sur Ctrl+C pour arrêter
```

### Étape 4 : Démarrer PM2
```bash
# Démarrer PM2 avec la nouvelle configuration
pm2 start ecosystem.config.js

# Vérifier le statut
pm2 status

# Voir les logs (IMPORTANT : utiliser le bon nom)
pm2 logs tomati-production --lines 10

# Sauvegarder la configuration
pm2 save
```

### Étape 5 : Tests
```bash
# Test local
curl http://localhost:5000
# Vous devez voir du HTML

# Si ça marche, tester Nginx
exit
curl http://51.222.111.183
# Vous devez voir la page web
```

## 🚨 Points critiques :
1. **Nom exact** : L'application s'appelle `tomati-production` (pas start-script)
2. **Script testé** : `./start-app.sh` doit fonctionner avant PM2
3. **Logs** : Utiliser `pm2 logs tomati-production` (pas start-script)
4. **Configuration** : Le fichier ecosystem.config.js doit être syntaxiquement correct

## 📋 Commandes de dépannage :
```bash
# Si PM2 ne fonctionne pas :
pm2 restart tomati-production
pm2 logs tomati-production --lines 20

# Si l'application ne démarre toujours pas :
pm2 describe tomati-production

# Pour recommencer complètement :
pm2 delete all
pm2 kill
# Puis reprendre à l'étape 2
```