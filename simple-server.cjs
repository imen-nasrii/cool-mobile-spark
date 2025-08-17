const express = require('express');
const path = require('path');
const app = express();

// Middleware basique
app.use(express.json());

// Données de test directes
const products = [
    { id: 1, title: 'Tesla Model 3', price: 85000, category: 'Auto', description: 'Voiture électrique premium', location: 'Tunis', image: 'tesla-model3.jpg', view_count: 156 },
    { id: 2, title: 'iPhone 15 Pro', price: 3200, category: 'Électronique', description: 'Smartphone dernière génération', location: 'Sfax', image: 'iphone-15-pro.jpg', view_count: 89 },
    { id: 3, title: 'Mountain Bike Trek', price: 1200, category: 'Sport', description: 'VTT professionnel tout terrain', location: 'Sousse', image: 'mountain-bike.jpg', view_count: 67 },
    { id: 4, title: 'Canapé Cuir Italien', price: 2800, category: 'Meubles', description: 'Canapé 3 places en cuir véritable', location: 'Ariana', image: 'modern-sofa.jpg', view_count: 234 },
    { id: 5, title: 'MacBook Pro M3', price: 4500, category: 'Électronique', description: 'Ordinateur portable professionnel', location: 'Tunis', image: 'macbook-pro.jpg', view_count: 145 }
];

// API Routes
app.get('/api/products', (req, res) => {
    console.log('API Products called');
    res.json(products);
});

// Page principale
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🍅 Tomati Market</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: black; 
            background: white; 
        }
        .header { 
            background: #ef4444; 
            color: white; 
            padding: 1.5rem 0; 
            text-align: center; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header h1 { 
            font-size: 2.5rem; 
            margin-bottom: 0.5rem; 
            font-weight: bold; 
        }
        .header p { 
            font-size: 1.2rem; 
            opacity: 0.9; 
        }
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 0 1rem; 
        }
        .main { 
            padding: 2rem 0; 
        }
        .section-header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-bottom: 2rem; 
            flex-wrap: wrap; 
            gap: 1rem; 
        }
        .section-title { 
            font-size: 2rem; 
            color: black; 
            font-weight: bold; 
        }
        .count-badge { 
            background: #ef4444; 
            color: white; 
            padding: 0.5rem 1rem; 
            border-radius: 25px; 
            font-weight: bold; 
        }
        .grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
            gap: 1.5rem; 
            margin-bottom: 3rem; 
        }
        .card { 
            background: white; 
            border: 3px solid black; 
            border-radius: 10px; 
            overflow: hidden; 
            transition: transform 0.2s, box-shadow 0.2s; 
        }
        .card:hover { 
            transform: translateY(-5px); 
            box-shadow: 0 15px 30px rgba(0,0,0,0.15); 
        }
        .card img { 
            width: 100%; 
            height: 200px; 
            object-fit: cover; 
            background: #f3f4f6; 
        }
        .card-content { 
            padding: 1.5rem; 
        }
        .card-title { 
            font-size: 1.3rem; 
            font-weight: bold; 
            color: black; 
            margin-bottom: 0.5rem; 
        }
        .card-price { 
            font-size: 1.8rem; 
            font-weight: bold; 
            color: #ef4444; 
            margin-bottom: 1rem; 
        }
        .card-meta { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-bottom: 1rem; 
        }
        .category-tag { 
            background: black; 
            color: white; 
            padding: 0.3rem 0.8rem; 
            border-radius: 15px; 
            font-size: 0.9rem; 
            font-weight: bold; 
        }
        .views { 
            color: black; 
            font-weight: bold; 
            font-size: 0.9rem; 
        }
        .description { 
            color: #333; 
            font-size: 0.95rem; 
            margin-bottom: 1rem; 
            line-height: 1.4; 
        }
        .card-footer { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
        }
        .location { 
            color: black; 
            font-weight: bold; 
            font-size: 0.9rem; 
        }
        .btn { 
            background: #ef4444; 
            color: white; 
            border: none; 
            padding: 0.6rem 1.2rem; 
            border-radius: 20px; 
            cursor: pointer; 
            font-weight: bold; 
            font-size: 0.9rem; 
            transition: background 0.2s; 
        }
        .btn:hover { 
            background: #dc2626; 
        }
        .footer { 
            background: black; 
            color: white; 
            text-align: center; 
            padding: 2rem 0; 
            margin-top: 3rem; 
        }
        .status { 
            background: #dcfce7; 
            border-left: 4px solid #16a34a; 
            padding: 1rem; 
            margin-bottom: 2rem; 
            border-radius: 0 4px 4px 0; 
        }
        .status h3 { 
            color: #166534; 
            margin-bottom: 0.5rem; 
        }
        .status p { 
            color: #166534; 
            margin: 0; 
        }
        @media (max-width: 768px) {
            .header h1 { font-size: 2rem; }
            .section-header { flex-direction: column; align-items: stretch; }
            .grid { grid-template-columns: 1fr; }
            .card-meta { flex-direction: column; gap: 0.5rem; align-items: flex-start; }
        }
    </style>
</head>
<body>
    <header class="header">
        <div class="container">
            <h1>🍅 tomati</h1>
            <p>Marketplace Tunisienne</p>
        </div>
    </header>
    
    <main class="main">
        <div class="container">
            <div class="status">
                <h3>✅ Statut Application</h3>
                <p><strong>Serveur:</strong> En ligne • <strong>API:</strong> Fonctionnelle • <strong>Base de données:</strong> ${products.length} produits disponibles</p>
            </div>
            
            <div class="section-header">
                <h2 class="section-title">Produits Disponibles</h2>
                <div class="count-badge">${products.length} produits</div>
            </div>
            
            <div class="grid">
                ${products.map(product => `
                    <div class="card">
                        <img src="https://via.placeholder.com/300x200/ef4444/ffffff?text=${encodeURIComponent(product.category)}" 
                             alt="${product.title}">
                        <div class="card-content">
                            <h3 class="card-title">${product.title}</h3>
                            <p class="card-price">${product.price.toLocaleString()} TND</p>
                            <div class="card-meta">
                                <span class="category-tag">${product.category}</span>
                                <span class="views">👁 ${product.view_count}</span>
                            </div>
                            <p class="description">${product.description}</p>
                            <div class="card-footer">
                                <span class="location">📍 ${product.location}</span>
                                <button class="btn" onclick="alert('Produit: ${product.title}\\nPrix: ${product.price} TND\\nLocalisation: ${product.location}\\nVues: ${product.view_count}')">
                                    Détails
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </main>
    
    <footer class="footer">
        <div class="container">
            <p>© 2025 Tomati Market - Marketplace Tunisienne</p>
            <p style="margin-top: 0.5rem; opacity: 0.8;">Application web fonctionnelle avec design plat rouge, noir, blanc</p>
        </div>
    </footer>
</body>
</html>
    `);
});

const port = process.env.PORT || 5000;
app.listen(port, '0.0.0.0', () => {
    console.log('🍅 Tomati Market Server ACTIVE');
    console.log(`📍 Port: ${port}`);
    console.log(`✅ Application accessible`);
    console.log(`🔗 API: http://localhost:${port}/api/products`);
});