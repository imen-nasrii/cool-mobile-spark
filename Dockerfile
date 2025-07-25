# Dockerfile pour containerisation (alternative au VPS)
FROM node:20-alpine

# Définir le répertoire de travail
WORKDIR /app

# Installer les dépendances système
RUN apk add --no-cache \
    postgresql-client \
    curl \
    bash

# Copier les fichiers de configuration
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY drizzle.config.ts ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY shared/ ./shared/
COPY server/ ./server/
COPY client/ ./client/

# Construire l'application frontend
RUN npm run build

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs
RUN adduser -S tomati -u 1001

# Créer le dossier logs
RUN mkdir -p /app/logs && chown -R tomati:nodejs /app/logs

# Changer vers l'utilisateur non-root
USER tomati

# Exposer le port
EXPOSE 5000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

# Commande de démarrage
CMD ["npm", "start"]

# Métadonnées
LABEL maintainer="Tomati Team"
LABEL description="Tomati E-commerce Platform"
LABEL version="1.0.0"