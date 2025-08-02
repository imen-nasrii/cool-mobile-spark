import { useState, useEffect } from "react";
import { Car, Building, Briefcase, Grid3X3, SlidersHorizontal, TrendingUp, MapPin, Users, Star, Heart, ShoppingBag, Zap, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductGrid } from "@/components/Products/ProductGrid";
import { AdBanner } from "@/components/Ads/AdBanner";
import { LikeButton } from "@/components/Likes/LikeButton";
import { useLanguage } from "@/hooks/useLanguage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface HomeProps {
  onProductClick?: (productId: string) => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const Home = ({ onProductClick, activeTab, onTabChange }: HomeProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("date");
  const [showFilters, setShowFilters] = useState(false);
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch statistics for the homepage
  const { data: stats } = useQuery({
    queryKey: ['/stats'],
    queryFn: () => apiClient.request('/stats'),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch promoted products
  const { data: promotedProducts } = useQuery({
    queryKey: ['/products/promoted'],
    queryFn: () => apiClient.request('/products/promoted'),
    staleTime: 2 * 60 * 1000,
  });

  const categories = [
    { id: "Électronique", name: "Électronique", icon: Grid3X3 },
    { id: "Sport", name: "Sport", icon: Grid3X3 },
    { id: "Voiture", name: "Voiture", icon: Car },
    { id: "Bureautique", name: "Bureautique", icon: Briefcase },
    { id: "Jeux vidéo", name: "Jeux vidéo", icon: Grid3X3 },
    { id: "Mobilier", name: "Mobilier", icon: Building }
  ];

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? "" : categoryId);
  };

  // Like product mutation
  const likeProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await fetch(`/api/products/${productId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to like product');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/products'] });
      toast({
        title: "Produit aimé !",
        description: "Vous avez aimé ce produit"
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'aimer ce produit",
        variant: "destructive"
      });
    }
  });

  const handleProductLike = (productId: string) => {
    likeProductMutation.mutate(productId);
  };

  const handleProductMessage = (productId: string) => {
    // Navigate to messages with the product owner
    navigate(`/messages?product=${productId}`);
    toast({
      title: "Redirection vers les messages",
      description: "Ouverture de la conversation avec le vendeur"
    });
  };

  return (
    <div className="min-h-screen pb-20 relative overflow-hidden bg-white">

      {/* Header Ad Banner */}
      <AdBanner position="header" className="mb-4 relative z-10" showCloseButton={false} />

      {/* Hero Section - Sans barre de recherche */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
          <div className="text-center mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
              <img 
                src="/tomati-logo.jpg" 
                alt="Tomati Market Logo" 
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover shadow-lg"
              />
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-gray-900 text-center">
                Tomati <span className="text-primary">Market</span>
              </h1>
            </div>

          </div>
        </div>
      </div>

      {/* Promoted Products Section */}
      {promotedProducts && promotedProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-primary" size={24} />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Produits Populaires</h2>
            </div>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
              <Star size={12} className="mr-1" />
              Tendances
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {promotedProducts.slice(0, 6).map((product: any) => (
              <Card 
                key={product.id} 
                className="bg-white shadow-lg border-0 hover:shadow-xl transition-all cursor-pointer group"
                onClick={() => onProductClick?.(product.id)}
              >
                <CardContent className="p-2 sm:p-3">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-2 sm:mb-3 overflow-hidden">
                    {product.image_url && (
                      <img 
                        src={product.image_url} 
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    )}
                  </div>
                  <h3 className="font-semibold text-xs sm:text-sm mb-1 line-clamp-2">{product.title}</h3>
                  <div className="text-primary font-bold text-sm sm:text-lg">{product.price}</div>
                  <div className="flex items-center justify-between mt-1 sm:mt-2">
                    <Badge variant="outline" className="text-xs hidden sm:block">
                      {product.category}
                    </Badge>
                    <LikeButton 
                      productId={product.id}
                      initialLikeCount={product.like_count || 0}
                      isPromoted={product.is_promoted}
                      size="sm"
                      showCount={true}
                      showPromotedBadge={false}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Parcourir par Catégorie</h2>
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-4 scrollbar-hide">
          <Button
            variant={selectedCategory === "" ? "default" : "outline"}
            onClick={() => handleCategorySelect("")}
            className="whitespace-nowrap rounded-full px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium shadow-lg"
          >
            <Grid3X3 size={16} className="mr-2" />
            Toutes les catégories
          </Button>
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => handleCategorySelect(category.id)}
                className="whitespace-nowrap rounded-full px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium shadow-lg"
              >
                <Icon size={16} className="mr-2" />
                {category.name}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Tous les produits</h2>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <SlidersHorizontal size={16} />
            Filtres
          </Button>
        </div>
        
        {showFilters && (
          <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Trier par</label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="date">Plus récent</option>
                  <option value="price_asc">Prix croissant</option>
                  <option value="price_desc">Prix décroissant</option>
                  <option value="popularity">Popularité</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ad Banner Between Products */}
      <AdBanner position="between_products" category={selectedCategory} className="mb-6 relative z-10" />

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <ProductGrid 
          category={selectedCategory === "" ? undefined : selectedCategory}
          sortBy={sortBy}
          searchTerm=""
          onProductClick={onProductClick}
          onProductLike={handleProductLike}
          onProductMessage={handleProductMessage}
        />
      </div>

      {/* Footer Ad Banner */}
      <AdBanner position="footer" category={selectedCategory} className="mt-8 relative z-10" />
      
      {/* Statistics Section */}
      {stats && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-primary/5 to-blue-50 rounded-2xl p-6 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 text-center">Notre Communauté</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <ShoppingBag className="mx-auto mb-2 text-primary" size={24} />
                <div className="text-2xl font-bold text-gray-900">{stats.totalProducts}</div>
                <div className="text-sm text-gray-600">Produits</div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <Users className="mx-auto mb-2 text-green-600" size={24} />
                <div className="text-2xl font-bold text-gray-900">{stats.totalUsers}</div>
                <div className="text-sm text-gray-600">Utilisateurs</div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <Zap className="mx-auto mb-2 text-yellow-600" size={24} />
                <div className="text-2xl font-bold text-gray-900">24h</div>
                <div className="text-sm text-gray-600">Support</div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <Shield className="mx-auto mb-2 text-blue-600" size={24} />
                <div className="text-2xl font-bold text-gray-900">100%</div>
                <div className="text-sm text-gray-600">Sécurisé</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};