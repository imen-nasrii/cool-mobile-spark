# Modification DNS OVH pour tomati.org

## Configuration DNS Actuelle
```
tomati.org.     A    213.186.33.5
www.tomati.org. A    213.186.33.5
```

## Configuration DNS Requise
```
tomati.org.     A    51.222.111.183
www.tomati.org. A    51.222.111.183
```

## Étapes de modification chez OVH

### 1. Accès au panneau OVH
- Connexion sur https://www.ovh.com/manager/
- Section "Domaines" → tomati.org
- Onglet "Zone DNS"

### 2. Modification des enregistrements A

**Modifier l'enregistrement principal :**
- Chercher : `tomati.org.` Type `A` Cible `213.186.33.5`
- Cliquer sur "Modifier"
- Changer la cible : `51.222.111.183`
- TTL : 3600
- Sauvegarder

**Modifier l'enregistrement www :**
- Chercher : `www.tomati.org.` Type `A` Cible `213.186.33.5`
- Cliquer sur "Modifier"  
- Changer la cible : `51.222.111.183`
- TTL : 3600
- Sauvegarder

### 3. Validation des modifications
- Cliquer sur "Appliquer la configuration"
- Attendre la propagation (15-30 minutes)

## Tests après modification

```bash
# Test résolution DNS
nslookup tomati.org
nslookup www.tomati.org

# Test fonctionnement
curl -H 'Host: tomati.org' http://51.222.111.183
```

## Configuration Nginx sur VPS

Une fois le DNS modifié, exécuter sur le VPS :

```bash
./script-https-tomati.sh
```

Puis après propagation DNS :

```bash
sudo certbot --nginx -d tomati.org -d www.tomati.org
```

## Résultat final
- tomati.org → 51.222.111.183 (votre VPS)
- HTTPS avec certificat Let's Encrypt
- Application Tomati Market accessible