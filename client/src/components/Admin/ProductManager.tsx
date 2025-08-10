import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/queryClient';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Package, Search, Star, Heart, TrendingUp } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  description?: string;
  price: string;
  location: string;
  category: string;
  like_count: number;
  is_promoted: boolean;
  is_reserved: boolean;
  is_free: boolean;
  created_at: string;
  image_url?: string;
}

export function ProductManager() {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch products for admin
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['/api/admin/products'],
    queryFn: () => apiClient.request('/admin/products'),
  });

  // Filter products based on search
  const filteredProducts = products.filter((product: Product) =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProductBadges = (product: Product) => {
    const badges = [];
    
    if (product.is_promoted) {
      badges.push(
        <Badge key="promoted" className="bg-yellow-100 text-yellow-700">
          <Star className="w-3 h-3 mr-1" />
          Promu
        </Badge>
      );
    }
    
    if (product.is_reserved) {
      badges.push(
        <Badge key="reserved" variant="secondary">
          Réservé
        </Badge>
      );
    }
    
    if (product.is_free) {
      badges.push(
        <Badge key="free" className="bg-green-100 text-green-700">
          Gratuit
        </Badge>
      );
    }
    
    return badges;
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4 mx-auto"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Gestion des Produits</h2>
        <p className="text-gray-600">Superviser tous les produits de la marketplace Tomati</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Rechercher par titre, catégorie ou localisation..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Produits</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Promus</p>
                <p className="text-2xl font-bold">
                  {products.filter((product: Product) => product.is_promoted).length}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Réservés</p>
                <p className="text-2xl font-bold">
                  {products.filter((product: Product) => product.is_reserved).length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gratuits</p>
                <p className="text-2xl font-bold">
                  {products.filter((product: Product) => product.is_free).length}
                </p>
              </div>
              <Heart className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Résultats</p>
                <p className="text-2xl font-bold">{filteredProducts.length}</p>
              </div>
              <Search className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products List */}
      <div className="grid gap-4">
        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">Aucun produit trouvé</h3>
              <p className="text-gray-600">Aucun produit ne correspond à votre recherche</p>
            </CardContent>
          </Card>
        ) : (
          filteredProducts.map((product: Product) => (
            <Card key={product.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{product.title}</h3>
                        {getProductBadges(product)}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{product.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="font-semibold text-green-600">
                          {product.is_free ? 'Gratuit' : `${product.price} TND`}
                        </span>
                        <span>📍 {product.location}</span>
                        <Badge variant="outline">{product.category}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {product.like_count} likes
                        </span>
                        <span>Créé le {new Date(product.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(`/products/${product.id}`, '_blank')}
                    >
                      Voir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}