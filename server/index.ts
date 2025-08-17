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
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tomati Market</title>
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
                    <div class="loading">
                        <div class="loading-text">Chargement Tomati...</div>
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
                { id: 1, title: 'Tesla Model 3', price: 85000, category: 'Auto', description: 'Voiture électrique haut de gamme', location: 'Tunis', image: 'tesla-model3.jpg', view_count: 123 },
                { id: 2, title: 'iPhone 15 Pro', price: 3200, category: 'Électronique', description: 'Smartphone dernière génération', location: 'Sfax', image: 'iphone-15-pro.jpg', view_count: 89 },
                { id: 3, title: 'Mountain Bike', price: 850, category: 'Sport', description: 'VTT professionnel', location: 'Sousse', image: 'mountain-bike.jpg', view_count: 45 },
                { id: 4, title: 'Canapé Moderne', price: 1200, category: 'Meubles', description: 'Canapé 3 places en cuir', location: 'Ariana', image: 'modern-sofa.jpg', view_count: 67 }
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