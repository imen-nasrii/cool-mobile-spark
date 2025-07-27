# Résolution Problèmes - WebSocket et Base de Données

## Problèmes Identifiés

### 1. Sur VPS (Production)
- Erreur 500: colonnes manquantes (`real_estate_type`, etc.)
- Solution: Migration base de données nécessaire

### 2. Sur Replit (Développement)  
- WebSocket error: URL invalide `wss://localhost:undefined`
- Solution: Configuration WebSocket à corriger

## Solution VPS (Priority 1)
```bash
ssh ubuntu@51.222.111.183
sudo su - tomati
cd ~/tomati-market
npm run db:push
pm2 restart tomati-production
curl http://localhost:5000/api/stats
```

## Solution Replit WebSocket
Le problème vient de la configuration WebSocket dans le code client qui essaie de se connecter à `localhost:undefined`.

## Étapes de Correction
1. Corriger WebSocket config pour Replit
2. Push vers GitHub
3. Migrer base de données VPS
4. Redéployer version corrigée

## Test Final
Après corrections:
- VPS: http://51.222.111.183 doit fonctionner sans erreur 500
- Replit: Pas d'erreurs WebSocket en console