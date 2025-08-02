#!/bin/bash

# Script automatique HTTPS tomati.org
# VPS: 51.222.111.183

echo "🌐 Configuration HTTPS pour tomati.org"
echo "VPS: 51.222.111.183"

# Vérification prérequis
echo "📋 Vérification prérequis..."
if ! command -v nginx &> /dev/null; then
    echo "📦 Installation Nginx..."
    sudo apt update
    sudo apt install nginx -y
    sudo systemctl enable nginx
    sudo systemctl start nginx
fi

# Configuration Nginx pour tomati.org
echo "⚙️ Configuration Nginx..."
sudo tee /etc/nginx/sites-available/tomati.org > /dev/null << 'EOF'
server {
    listen 80;
    server_name tomati.org www.tomati.org;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Activer le site
echo "🔗 Activation du site..."
sudo ln -sf /etc/nginx/sites-available/tomati.org /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
echo "🧪 Test configuration Nginx..."
if sudo nginx -t; then
    sudo systemctl reload nginx
    echo "✅ Nginx configuré avec succès"
else
    echo "❌ Erreur configuration Nginx"
    exit 1
fi

# Installation Certbot
echo "🔐 Installation Certbot..."
sudo apt install certbot python3-certbot-nginx -y

echo ""
echo "🎯 ÉTAPES SUIVANTES MANUELLES:"
echo ""
echo "1. Configurer DNS tomati.org chez votre registraire:"
echo "   Type A: @ → 51.222.111.183"
echo "   Type A: www → 51.222.111.183"
echo ""
echo "2. Attendre propagation DNS (15-30 minutes)"
echo ""
echo "3. Tester: curl -H 'Host: tomati.org' http://51.222.111.183"
echo ""
echo "4. Obtenir certificat SSL:"
echo "   sudo certbot --nginx -d tomati.org -d www.tomati.org"
echo ""
echo "5. Vérifier renouvellement auto:"
echo "   sudo certbot renew --dry-run"
echo ""
echo "🌟 Résultat final: https://tomati.org"