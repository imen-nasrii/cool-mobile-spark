import express from "express";
import path from "path";
import { registerRoutes } from "./routes";

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

(async () => {
  const server = await registerRoutes(app);

  // Serve client assets directly
  app.use('/src', express.static(path.join(process.cwd(), 'client/src')));
  app.use(express.static(path.join(process.cwd(), 'client/public')));
  
  // Serve the simple HTML file directly
  app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'client/public/index.html'));
  });

  // Serve simple diagnostic page first
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API route not found' });
    }
    
    // Force text/html content type
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    res.send(`
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
    <title>Tomati Market - Marketplace Tunisienne</title>
    
    <!-- PWA Meta Tags -->
    <meta name="description" content="Plateforme de petites annonces tunisienne - Voitures, Immobilier, Emplois, Électronique" />
    <meta name="theme-color" content="#ef4444" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="Tomati" />
    
    <!-- Icons -->
    <link rel="icon" type="image/png" sizes="32x32" href="/icon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/icon-16x16.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/icon-192x192.png" />
    <link rel="mask-icon" href="/icon-192x192.png" color="#ef4444" />
    
    <!-- Manifest -->
    <link rel="manifest" href="/manifest.json" />
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 0; 
            background: white;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 16px; }
        .header { background: #ef4444; color: white; padding: 24px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .title { font-size: 2rem; font-weight: bold; margin: 0; }
        .subtitle { font-size: 1.125rem; margin: 4px 0 0 0; }
        .main { padding: 32px 0; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .section-title { font-size: 1.875rem; font-weight: bold; color: black; margin: 0; }
        .count-badge { background: #ef4444; color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
        .card { border: 2px solid black; border-radius: 8px; overflow: hidden; background: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .card:hover { box-shadow: 0 10px 25px rgba(0,0,0,0.15); }
        .card img { width: 100%; height: 200px; object-fit: cover; }
        .card-content { padding: 16px; }
        .card-title { font-size: 1.25rem; font-weight: bold; color: black; margin: 0 0 8px 0; }
        .card-price { font-size: 1.5rem; font-weight: bold; color: #ef4444; margin: 0 0 12px 0; }
        .card-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .category-tag { background: black; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.875rem; }
        .views { color: black; font-weight: bold; font-size: 0.875rem; }
        .description { color: black; font-size: 0.875rem; margin-bottom: 12px; }
        .card-footer { display: flex; justify-content: space-between; align-items: center; }
        .location { color: black; font-weight: bold; font-size: 0.875rem; }
        .btn { background: #ef4444; color: white; padding: 4px 12px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
        .btn:hover { background: #dc2626; }
        .loading { min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .loading-text { font-size: 1.5rem; font-weight: bold; color: #ef4444; }
        .footer { background: black; color: white; padding: 16px 0; margin-top: 48px; text-align: center; }
        .empty { text-align: center; padding: 64px 0; }
        .empty-icon { font-size: 4rem; margin-bottom: 16px; }
        .empty-title { font-size: 1.25rem; font-weight: bold; color: black; margin: 0 0 8px 0; }
        .empty-subtitle { color: black; margin: 0; }
        
        /* PWA Install Banner */
        .pwa-install-banner {
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            background: white;
            border: 3px solid #ef4444;
            border-radius: 10px;
            padding: 16px;
            z-index: 1000;
            animation: slideUp 0.3s ease-out;
        }
        
        .pwa-content {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .pwa-icon {
            font-size: 2rem;
            color: #ef4444;
        }
        
        .pwa-text {
            flex: 1;
        }
        
        .pwa-text strong {
            color: black;
            font-size: 1.1rem;
        }
        
        .pwa-text p {
            color: #666;
            margin: 4px 0 0 0;
            font-size: 0.9rem;
        }
        
        .pwa-button {
            background: #ef4444;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 20px;
            font-weight: bold;
            cursor: pointer;
        }
        
        .pwa-button:hover {
            background: #dc2626;
        }
        
        .pwa-dismiss {
            background: none;
            border: none;
            font-size: 1.5rem;
            color: #666;
            cursor: pointer;
            padding: 5px;
        }
        
        @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    </style>
</head>
<body>
    <div id="root"></div>
    <script>
        // Application Tomati en JavaScript vanilla
        let products = [];
        let loading = true;

        function createProductCard(product) {
            return \`
                <div class="card">
                    <img 
                        src="/src/assets/\${product.image}" 
                        alt="\${product.title}"
                        onerror="this.src='https://via.placeholder.com/300x200/ef4444/ffffff?text=TOMATI'"
                    />
                    <div class="card-content">
                        <h3 class="card-title">\${product.title}</h3>
                        <p class="card-price">\${product.price} TND</p>
                        <div class="card-meta">
                            <span class="category-tag">\${product.category}</span>
                            <span class="views">👁 \${product.view_count || 0}</span>
                        </div>
                        <p class="description">\${product.description}</p>
                        <div class="card-footer">
                            <span class="location">📍 \${product.location}</span>
                            <button class="btn" onclick="alert('Produit: \${product.title}')">Voir</button>
                        </div>
                    </div>
                </div>
            \`;
        }

        function renderApp() {
            const root = document.getElementById('root');
            
            if (loading) {
                root.innerHTML = \`
                    <!-- PWA Install Banner -->
                    <div id="pwa-install" class="pwa-install-banner" style="display: none;">
                        <div class="pwa-content">
                            <div class="pwa-icon">📱</div>
                            <div class="pwa-text">
                                <strong>Installer Tomati</strong>
                                <p>Accédez rapidement à vos annonces</p>
                            </div>
                            <button id="install-button" class="pwa-button">Installer</button>
                            <button id="dismiss-button" class="pwa-dismiss">×</button>
                        </div>
                    </div>
                    
                    <div class="loading">
                        <div class="loading-text">🍅 Chargement Tomati...</div>
                    </div>
                \`;
                return;
            }

            const productsHTML = products.map(createProductCard).join('');
            const emptyHTML = products.length === 0 ? \`
                <div class="empty">
                    <div class="empty-icon">🍅</div>
                    <p class="empty-title">Aucun produit disponible</p>
                    <p class="empty-subtitle">Vérifiez votre connexion API</p>
                </div>
            \` : '';

            root.innerHTML = \`
                <header class="header">
                    <div class="container">
                        <h1 class="title">tomati</h1>
                        <p class="subtitle">Marketplace Tunisienne</p>
                    </div>
                </header>
                
                <main class="main">
                    <div class="container">
                        <div class="section-header">
                            <h2 class="section-title">Produits Disponibles</h2>
                            <div class="count-badge">\${products.length} produits</div>
                        </div>
                        
                        \${products.length > 0 ? \`<div class="grid">\${productsHTML}</div>\` : emptyHTML}
                    </div>
                </main>
                
                <footer class="footer">
                    <div class="container">
                        <p>© 2025 Tomati Market - Marketplace Tunisienne</p>
                    </div>
                </footer>
            \`;
        }

        // Version immédiate sans fetch API (pour contourner problème ports)
        function loadProductsDirectly() {
            // Simuler des produits de démonstration pour test immédiat
            products = [
                { id: 1, title: 'Tesla Model 3', price: 85000, category: 'Auto', description: 'Voiture électrique haut de gamme, autonomie 500km', location: 'Tunis', image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=300&fit=crop', view_count: 123 },
                { id: 2, title: 'iPhone 15 Pro Max', price: 3200, category: 'Électronique', description: 'Smartphone 256GB, état neuf avec garantie', location: 'Sfax', image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop', view_count: 89 },
                { id: 3, title: 'VTT Trek X-Caliber', price: 850, category: 'Sport', description: 'VTT professionnel, suspension avant, 21 vitesses', location: 'Sousse', image: 'https://images.unsplash.com/photo-1544191696-15693072b5b7?w=400&h=300&fit=crop', view_count: 45 },
                { id: 4, title: 'Canapé 3 Places', price: 1200, category: 'Meubles', description: 'Canapé moderne en cuir italien, très bon état', location: 'Ariana', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop', view_count: 67 },
                { id: 5, title: 'Appartement S+2', price: 180000, category: 'Immobilier', description: 'Appartement neuf 90m², terrasse, proche métro', location: 'Tunis Centre', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop', view_count: 234 },
                { id: 6, title: 'Développeur Full Stack', price: 2500, category: 'Emplois', description: 'CDI, React/Node.js, 3+ ans expérience, télétravail', location: 'Sfax', image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=300&fit=crop', view_count: 156 }
            ];
            
            // Essayer de charger les vrais produits
            fetch('/api/products')
                .then(res => res.json())
                .then(data => {
                    if (data && data.length > 0) {
                        products = data;
                        renderApp();
                    }
                })
                .catch(err => {
                    console.log('Utilisation des produits de démonstration');
                });
                
            loading = false;
            renderApp();
        }

        // PWA Functionality
        let deferredPrompt;
        
        // Enregistrer le Service Worker
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then((registration) => {
                        console.log('SW registered: ', registration);
                    })
                    .catch((registrationError) => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }
        
        // Gérer l'événement beforeinstallprompt
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('beforeinstallprompt fired');
            e.preventDefault();
            deferredPrompt = e;
            
            // Créer et afficher la bannière d'installation
            const installBanner = document.createElement('div');
            installBanner.id = 'pwa-install';
            installBanner.className = 'pwa-install-banner';
            installBanner.innerHTML = \`
                <div class="pwa-content">
                    <div class="pwa-icon">📱</div>
                    <div class="pwa-text">
                        <strong>Installer Tomati</strong>
                        <p>Accédez rapidement à vos annonces</p>
                    </div>
                    <button id="install-button" class="pwa-button">Installer</button>
                    <button id="dismiss-button" class="pwa-dismiss">×</button>
                </div>
            \`;
            document.body.appendChild(installBanner);
            
            // Gérer le clic sur le bouton d'installation
            document.getElementById('install-button').addEventListener('click', async () => {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    console.log(\`User response: \${outcome}\`);
                    deferredPrompt = null;
                    installBanner.remove();
                }
            });
            
            // Gérer le clic sur le bouton de fermeture
            document.getElementById('dismiss-button').addEventListener('click', () => {
                installBanner.remove();
                localStorage.setItem('pwa-dismissed', 'true');
            });
        });

        // Démarrer immédiatement
        loadProductsDirectly();
    </script>
</body>
</html>
    `);
  });

  const port = parseInt(process.env.PORT || "5000", 10);
  const host = process.env.HOST || "0.0.0.0";
  
  server.listen({ port, host }, () => {
    console.log(`🍅 Tomati Server running on port ${port}`);
    console.log(`📍 Server accessible at: http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`);
    console.log(`🔗 API endpoint: http://${host === '0.0.0.0' ? 'localhost' : host}:${port}/api/products`);
    console.log(`✅ Application ready!`);
  });
})();