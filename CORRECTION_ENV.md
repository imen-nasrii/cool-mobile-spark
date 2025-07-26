# Correction du fichier .env

Le problème vient du caractère `!` dans le mot de passe qui est interprété par bash.

## Solution : Créer le fichier .env avec nano

```bash
# Sur le serveur, dans le dossier tomati-market
nano .env
```

Puis copiez-collez exactement ce contenu :

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://tomati_user:TomatiSecure2025\!@localhost:5432/tomati_production
JWT_SECRET=tomati_jwt_secret_super_securise_32_caracteres_minimum_pour_production_2025_france
SESSION_SECRET=tomati_session_secret_securise_pour_authentification_utilisateurs_marketplace_2025
BCRYPT_ROUNDS=12
```

**Notez le `\!` pour échapper le caractère spécial.**

Ensuite :
- Sauvegardez avec `Ctrl+O`
- Confirmez avec `Entrée`  
- Quittez avec `Ctrl+X`

## Ou alternative simple :

```bash
cat > .env << 'EOF'
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://tomati_user:TomatiSecure2025!@localhost:5432/tomati_production
JWT_SECRET=tomati_jwt_secret_super_securise_32_caracteres_minimum_pour_production_2025_france
SESSION_SECRET=tomati_session_secret_securise_pour_authentification_utilisateurs_marketplace_2025
BCRYPT_ROUNDS=12
EOF
```

Puis continuez avec :
```bash
npm run db:push
pm2 start ecosystem.config.js --env production
```