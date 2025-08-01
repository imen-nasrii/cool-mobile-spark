import { useState, useEffect } from "react";
import { Car, Building, Briefcase, Grid3X3, SlidersHorizontal, Search, TrendingUp, MapPin, Users, Star, Heart, ShoppingBag, Zap, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
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
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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

      {/* Hero Section */}
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
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-6 max-w-2xl mx-auto px-4">
              Découvrez des milliers de produits exceptionnels vendus par notre communauté locale.
              Achetez et vendez en toute confiance.
            </p>
            
            {/* Enhanced Search Bar */}
            <div className="max-w-4xl mx-auto px-4">
              <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <Input
                      placeholder="Rechercher des produits, marques, vendeurs..."
                      className="pl-10 pr-4 py-3 sm:py-4 text-base sm:text-lg rounded-xl border-gray-200 focus:border-primary bg-white"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          if (onTabChange) {
                            onTabChange('search');
                          }
                          toast({
                            title: "Recherche lancée",
                            description: `Recherche pour "${searchTerm}"`
                          });
                        }
                      }}
                    />
                  </div>
                  
                  {/* Category Filter */}
                  <div className="w-full lg:w-48">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="py-3 sm:py-4 text-base rounded-xl border-gray-200">
                        <SelectValue placeholder="Toutes catégories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes catégories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Search Button */}
                  <Button 
                    onClick={() => {
                      // Filter products based on search and category
                      if (onTabChange) {
                        onTabChange('search');
                      }
                      toast({
                        title: "Recherche lancée",
                        description: `Recherche pour "${searchTerm}" ${selectedCategory && selectedCategory !== 'all' ? `dans ${selectedCategory}` : ''}`
                      });
                    }}
                    className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-xl bg-primary hover:bg-primary/90 whitespace-nowrap"
                  >
                    <Search size={18} className="mr-2" />
                    Rechercher
                  </Button>
                </div>
                
                {/* Quick Filters */}
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-500 mr-2">Recherches populaires:</span>
                  {['Voitures', 'Téléphones', 'Immobilier', 'Emploi', 'Mode'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        setSearchTerm(tag);
                        setSelectedCategory('all');
                        if (onTabChange) {
                          onTabChange('search');
                        }
                      }}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
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
                className="whitespace-nowrap rounded-full px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2 shadow-lg"
              >
                <Icon size={16} />
                {category.name}
              </Button>
            );
          })}
        </div>

        {/* Quick Sort Options */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 sm:mt-6 px-2 gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 text-xs sm:text-sm"
            >
              <SlidersHorizontal size={14} />
              <span className="hidden sm:inline">Options de tri</span>
              <span className="sm:hidden">Trier</span>
            </Button>
          </div>
          
          {showFilters && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-44 h-9 sm:h-10 text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Plus récent</SelectItem>
                  <SelectItem value="price-asc">Prix croissant</SelectItem>
                  <SelectItem value="price-desc">Prix décroissant</SelectItem>
                  <SelectItem value="title">Titre A-Z</SelectItem>
                  <SelectItem value="likes">Plus populaire</SelectItem>
                  <SelectItem value="location">Localisation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Products Grid Full Width */}
      <div className="w-full relative z-10">
        <ProductGrid 
          category={selectedCategory}
          sortBy={sortBy}
          searchTerm={searchTerm}
          onProductClick={onProductClick}
          onProductLike={handleProductLike}
          onProductMessage={handleProductMessage}
        />
        
        {/* Between Products Ad */}
        <div className="my-4 px-2">
          <AdBanner position="between_products" category={selectedCategory} />
        </div>
      </div>

      {/* Footer Ad */}
      <div className="mt-12 relative z-10">
        <AdBanner position="footer" showCloseButton={false} />
      </div>
    </div>
  );
};