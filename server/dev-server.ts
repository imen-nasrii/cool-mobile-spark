import express from "express";
import path from "path";
import { registerRoutes } from "./routes";

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

(async () => {
  const server = await registerRoutes(app);

  // Serve client files directly from client directory
  app.use('/src', express.static(path.join(process.cwd(), 'client/src')));
  app.use('/node_modules', express.static(path.join(process.cwd(), 'node_modules')));
  app.use(express.static(path.join(process.cwd(), 'client/public')));

  // Simple HTML with basic React setup
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API route not found' });
    }
    
    res.send(`
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tomati Market</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        const { useState, useEffect } = React;
        
        function App() {
            const [products, setProducts] = useState([]);
            const [loading, setLoading] = useState(true);

            useEffect(() => {
                fetch('/api/products')
                    .then(res => res.json())
                    .then(data => {
                        setProducts(data);
                        setLoading(false);
                    })
                    .catch(err => {
                        console.error('Erreur:', err);
                        setLoading(false);
                    });
            }, []);

            if (loading) {
                return (
                    <div className="min-h-screen bg-white flex items-center justify-center">
                        <div className="text-red-500 text-xl">Chargement...</div>
                    </div>
                );
            }

            return (
                <div className="min-h-screen bg-white">
                    <header className="bg-red-500 text-white p-4">
                        <h1 className="text-2xl font-bold">tomati</h1>
                        <p className="text-sm">Marketplace Tunisienne</p>
                    </header>
                    
                    <main className="container mx-auto px-4 py-8">
                        <h2 className="text-2xl font-bold text-black mb-6">Produits Disponibles</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {products.map(product => (
                                <div key={product.id} className="border border-gray-300 rounded-lg p-4 bg-white hover:shadow-lg">
                                    <img 
                                        src={\`/src/assets/\${product.image}\`}
                                        alt={product.title}
                                        className="w-full h-48 object-cover rounded mb-4"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/300x200?text=Image+Non+Disponible';
                                        }}
                                    />
                                    <h3 className="font-bold text-lg text-black mb-2">{product.title}</h3>
                                    <p className="text-red-500 font-bold text-xl mb-2">{product.price} TND</p>
                                    <p className="text-gray-600 text-sm mb-2">{product.category}</p>
                                    <p className="text-gray-700 text-sm">{product.description}</p>
                                    <div className="mt-4 flex justify-between items-center">
                                        <span className="text-sm text-gray-500">{product.location}</span>
                                        <span className="text-sm text-gray-500">👁 {product.view_count || 0}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {products.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-600">Aucun produit disponible</p>
                            </div>
                        )}
                    </main>
                </div>
            );
        }

        ReactDOM.render(<App />, document.getElementById('root'));
    </script>
</body>
</html>
    `);
  });

  const port = parseInt(process.env.PORT || "5000", 10);
  const host = process.env.HOST || "0.0.0.0";
  
  server.listen({ port, host }, () => {
    console.log(`Dev server running on port ${port}`);
  });
})();