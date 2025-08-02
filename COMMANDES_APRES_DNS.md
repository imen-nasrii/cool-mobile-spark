# Commandes après modification DNS

## 1. Test immédiat (avant propagation)
```bash
# Test avec l'IP directement
curl -H 'Host: tomati.org' http://51.222.111.183
```

## 2. Configuration Nginx
```bash
# Exécuter le script de configuration
./script-https-tomati.sh
```

## 3. Vérification propagation DNS
```bash
# Test résolution DNS
nslookup tomati.org
dig tomati.org A

# Doit retourner : 51.222.111.183
```

## 4. Test HTTP
```bash
# Une fois DNS propagé
curl http://tomati.org
curl http://www.tomati.org
```

## 5. Installation SSL
```bash
# Certificat Let's Encrypt
sudo certbot --nginx -d tomati.org -d www.tomati.org
```

## 6. Tests finaux HTTPS
```bash
curl https://tomati.org
curl https://www.tomati.org
```

## 7. Vérification PM2
```bash
pm2 status
pm2 logs tomati-production --lines 5
```

## Délais attendus
- Modification DNS OVH : Immédiat
- Propagation mondiale : 1-4 heures
- Configuration Nginx : 5 minutes
- Certificat SSL : 2-5 minutes

## URLs finales
- https://tomati.org (principal)
- https://www.tomati.org (redirection)
- Interface admin : https://tomati.org/admin