# Instructions Déploiement GitHub vers VPS

## 🚀 Processus Complet

### Étape 1: Push vers GitHub (manuel)
Depuis votre machine locale avec accès Git :

```bash
# Télécharger les fichiers modifiés depuis Replit
# Ou copier manuellement ces fichiers vers votre repo local:
# - client/src/components/Products/ProductListCard.tsx (nouveau)
# - client/src/components/Products/ProductGrid.tsx (modifié)
# - client/src/index.css (police Arial)
# - client/src/pages/ProductDetail.tsx (styles Arial)

git add .
git commit -m "Add horizontal product layout and Arial font implementation

- Created ProductListCard component for horizontal display
- Updated ProductGrid to use list layout instead of grid  
- Applied Arial font globally in CSS with override classes
- Added inline font styles to ProductDetail page
- Fixed ProductGrid API endpoint for proper product display"

git push origin main
```

### Étape 2: Déployer automatiquement sur VPS

```bash
# 1. Copier le script de déploiement sur le VPS
scp vps-deploy-script.sh ubuntu@51.222.111.183:/tmp/

# 2. Se connecter et exécuter le déploiement automatique
ssh ubuntu@51.222.111.183
sudo su - tomati
chmod +x /tmp/vps-deploy-script.sh
/tmp/vps-deploy-script.sh
```

## 🎯 Ce que fait le script automatique:

1. **Sauvegarde** de la version actuelle
2. **Récupération** du code depuis GitHub
3. **Installation** des dépendances npm
4. **Migration DB** critique (npm run db:push) pour résoudre les erreurs 500
5. **Build** de l'application avec le nouveau layout
6. **Redémarrage PM2** avec la nouvelle version
7. **Tests automatiques** des API

## ✅ Résultat Final Attendu:

- **Interface**: Produits en ligne horizontale (image gauche + détails droite)
- **Police**: Arial partout dans l'application
- **API**: Plus d'erreurs 500, toutes les routes fonctionnelles
- **DB**: Nouvelles colonnes immobilier/emploi migrées
- **Performance**: Application rapide et responsive

## 🔧 Validation Post-Déploiement:

```bash
# Tester l'accès externe
curl http://51.222.111.183/
curl http://51.222.111.183/api/products
curl http://51.222.111.183/api/stats

# Ouvrir dans le navigateur
# http://51.222.111.183
```

## 📁 Fichiers Modifiés à Pousser:

1. `client/src/components/Products/ProductListCard.tsx` - Nouveau composant horizontal
2. `client/src/components/Products/ProductGrid.tsx` - Layout liste
3. `client/src/index.css` - Police Arial globale
4. `client/src/pages/ProductDetail.tsx` - Styles Arial
5. `vps-deploy-script.sh` - Script de déploiement automatique

Le déploiement via GitHub est maintenant entièrement automatisé avec migration DB incluse.