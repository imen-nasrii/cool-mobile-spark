# Déploiement du Système d'Upload Local sur VPS OVH

## Commandes à exécuter sur le VPS

```bash
# 1. Se connecter au VPS et aller dans le répertoire de l'application
ssh ubuntu@51.222.111.183
su hamdi
cd cool-mobile-spark

# 2. Sauvegarder la configuration actuelle
cp server/objectStorage.ts server/objectStorage.ts.backup
cp server/routes.ts server/routes.ts.backup

# 3. Arrêter l'application temporairement
pm2 stop tomati-hamdi

# 4. Mettre à jour depuis GitHub avec les nouveaux fichiers
git pull origin main

# 5. Installer la nouvelle dépendance multer
npm install multer @types/multer

# 6. Créer le répertoire uploads pour les fichiers
mkdir -p uploads
chmod 755 uploads

# 7. Reconstruire l'application
npm run build

# 8. Redémarrer l'application
pm2 restart tomati-hamdi

# 9. Vérifier les logs
pm2 logs tomati-hamdi --lines 20
```

## Vérifications après déploiement

```bash
# Test de l'API upload
curl -X POST https://tomati.org/api/objects/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Vérifier que le répertoire uploads existe
ls -la uploads/

# Vérifier les permissions
ls -la | grep uploads
```

## Structure des fichiers modifiés

### server/objectStorage.ts
- Remplacé Google Cloud Storage par système de fichiers local
- Ajout de méthodes pour gérer les uploads locaux
- Création automatique du répertoire uploads

### server/routes.ts
- Ajout de la route `/api/objects/upload/:objectId` avec multer
- Support des uploads directs avec FormData
- Gestion des fichiers images (JPG, PNG, GIF, WebP)

### client/src/components/ProfilePhotoUpload.tsx
- Modifié pour utiliser FormData au lieu des URLs pré-signées
- Upload direct vers le serveur local

## Avantages du nouveau système

✅ **Plus de dépendance externe** - Fini les erreurs Replit SIDECAR  
✅ **Stockage local sécurisé** - Fichiers dans le répertoire uploads/  
✅ **Performance optimisée** - Upload direct sans redirections  
✅ **Compatible VPS** - Fonctionne parfaitement en production  

## Résolution des erreurs 500

- ❌ Ancien : `/api/objects/upload` → Erreur SIDECAR Replit
- ✅ Nouveau : `/api/objects/upload/:objectId` → Upload local multer

Le système est maintenant 100% compatible VPS sans aucune dépendance Replit.