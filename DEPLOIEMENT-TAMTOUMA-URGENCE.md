# 🚨 DÉPLOIEMENT URGENCE TAMTOUMA

## ÉTAPES SIMPLES :

### 1. Télécharger
- Téléchargez le fichier `TAMTOUMA-URGENCE.tar.gz` depuis Replit

### 2. Upload sur VPS
- Uploadez `TAMTOUMA-URGENCE.tar.gz` sur votre VPS dans `/home/ubuntu/`

### 3. Commandes VPS
```bash
# Se connecter au VPS
ssh ubuntu@tomati.org

# Aller dans le répertoire
cd ~/cool-mobile-spark

# Sauvegarder l'ancienne version
mv dist dist-backup-$(date +%Y%m%d)

# Extraire la nouvelle version avec Tamtouma
cd ~
tar -xzf TAMTOUMA-URGENCE.tar.gz
cp -r dist ~/cool-mobile-spark/
cp -r server/* ~/cool-mobile-spark/server/

# Redémarrer l'application
cd ~/cool-mobile-spark
pm2 restart backend

# Vérifier
pm2 logs backend --lines 5
```

### 4. Test
- Visitez https://tomati.org
- Cherchez le bouton Tamtouma 🤖 en bas à gauche

## RÉSULTAT ATTENDU :
✅ Tamtouma apparaît en bas à gauche  
✅ Footer apparaît en bas de toutes les pages  
✅ Module rendez-vous fonctionne

## Si problème :
```bash
# Restaurer l'ancienne version
cd ~/cool-mobile-spark
rm -rf dist
mv dist-backup-* dist
pm2 restart backend
```