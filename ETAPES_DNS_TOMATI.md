# Configuration DNS pour tomati.org

## Où configurer le DNS

Vous devez vous connecter au **panneau de contrôle de votre registraire** où vous avez acheté le domaine tomati.org (exemples : Gandi, OVH, Namecheap, GoDaddy, etc.)

## Enregistrements DNS à ajouter

### 1. Enregistrement A principal
```
Type: A
Nom: @ (ou tomati.org ou racine)
Valeur: 51.222.111.183
TTL: 3600
```

### 2. Enregistrement A pour www
```
Type: A
Nom: www
Valeur: 51.222.111.183  
TTL: 3600
```

## Vérification DNS

Après configuration, testez avec :

```bash
# Test résolution DNS
nslookup tomati.org
nslookup www.tomati.org

# Test avec dig
dig tomati.org A
dig www.tomati.org A
```

## Délai de propagation

- **Local** : 5-15 minutes
- **Mondial** : 24-48 heures maximum
- **Généralement** : 1-4 heures

## Test de fonctionnement

Une fois le DNS propagé :

```bash
# Test HTTP
curl -H 'Host: tomati.org' http://51.222.111.183
curl http://tomati.org

# Si ça fonctionne, installer SSL
sudo certbot --nginx -d tomati.org -d www.tomati.org
```

## Résultat final

- ✅ http://tomati.org → fonctionne
- ✅ https://tomati.org → avec SSL
- ✅ www.tomati.org → redirige vers tomati.org