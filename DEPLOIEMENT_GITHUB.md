# Déploiement via GitHub

## Processus Automatisé

### 1. Pousser vers GitHub
```bash
git add .
git commit -m "Add horizontal layout and Arial font implementation"
git push origin main
```

### 2. Déployer sur VPS
```bash
# Copier le script sur le VPS
scp vps-deploy-script.sh ubuntu@51.222.111.183:/tmp/

# Se connecter et exécuter
ssh ubuntu@51.222.111.183
sudo su - tomati
chmod +x /tmp/vps-deploy-script.sh
/tmp/vps-deploy-script.sh
```

## Ce que fait le script automatique:

✅ **Sauvegarde automatique** de la version actuelle
✅ **Récupération GitHub** des dernières modifications  
✅ **Migration base de données** (npm run db:push)
✅ **Installation dépendances** et build
✅ **Redémarrage PM2** avec nouveau code
✅ **Tests automatiques** des API
✅ **Logs de vérification**

## Nouvelles fonctionnalités déployées:

- **Layout horizontal** : Produits affichés en ligne
- **Police Arial** : Appliquée à toute l'interface
- **ProductListCard** : Nouveau composant optimisé
- **Migration DB** : Colonnes immobilier/emploi
- **Correction API** : Plus d'erreurs 500

## Validation post-déploiement:

```bash
# Tester l'accès externe
curl http://51.222.111.183/
curl http://51.222.111.183/api/products
curl http://51.222.111.183/api/stats

# Vérifier l'interface dans un navigateur
# Ouvrir: http://51.222.111.183
```

Le déploiement est entièrement automatisé et sécurisé avec sauvegarde automatique.