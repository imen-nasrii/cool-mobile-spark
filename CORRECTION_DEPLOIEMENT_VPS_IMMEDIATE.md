# Correction Immédiate - Déploiement VPS Upload

## Problèmes identifiés
1. ❌ Vous êtes dans `/home/ubuntu` au lieu de `/home/hamdi/cool-mobile-spark`
2. ❌ Erreurs de permissions npm (EACCES)
3. ❌ L'ancienne version du code fonctionne encore (erreur "Object storage not available")

## SOLUTION IMMÉDIATE - Copier-coller ces commandes :

```bash
# 1. Navigation vers le bon répertoire
cd /home/hamdi/cool-mobile-spark
pwd

# 2. Vérifier que nous sommes dans le bon dossier
ls -la package.json

# 3. Arrêter l'application
pm2 stop tomati-hamdi

# 4. Mise à jour du code depuis GitHub
git pull origin main

# 5. Installation de multer (dans le bon répertoire)
npm install multer @types/multer

# 6. Création du répertoire uploads avec permissions
mkdir -p uploads
chmod 755 uploads

# 7. Build avec npm
npm run build

# 8. Redémarrage
pm2 restart tomati-hamdi

# 9. Test immédiat
curl -I https://tomati.org/
pm2 logs tomati-hamdi --lines 5
```

## Si les erreurs npm persistent :

```bash
# Alternative avec sudo pour les permissions
sudo npm install multer @types/multer --prefix /home/hamdi/cool-mobile-spark

# OU nettoyer le cache npm
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## Vérification finale

```bash
# L'application doit démarrer sans l'erreur "Object storage not available"
pm2 logs tomati-hamdi --lines 10

# Test API
curl -X POST https://tomati.org/api/objects/upload \
  -H "Content-Type: application/json" \
  -d '{}' 2>/dev/null | head -1
```

**IMPORTANT :** Exécutez d'abord `cd /home/hamdi/cool-mobile-spark` avant tout autre commande !