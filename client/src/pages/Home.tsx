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
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/queryClient";

interface HomeProps {
  onProductClick?: (productId: string) => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const Home = ({ onProductClick, activeTab, onTabChange }: HomeProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("date");
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { t } = useLanguage();

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

  return (
    <div className="min-h-screen tomato-bg pb-20 relative overflow-hidden">

      {/* Header Ad Banner */}
      <AdBanner position="header" className="mb-4 relative z-10" showCloseButton={false} />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-500/10 via-orange-500/5 to-transparent relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <ShoppingBag className="text-primary" size={32} />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">
                Tomati <span className="text-primary">Market</span>
              </h1>
            </div>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              Découvrez des milliers de produits exceptionnels vendus par notre communauté locale.
              Achetez et vendez en toute confiance.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Rechercher des produits, marques, catégories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 text-lg border-2 border-gray-200 focus:border-primary rounded-full"
                />
                <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full px-6">
                  Rechercher
                </Button>
              </div>
            </div>
          </div>


        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Transactions Sécurisées</h3>
              <p className="text-gray-600">Tous les paiements sont protégés et les vendeurs sont vérifiés</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Livraison Rapide</h3>
              <p className="text-gray-600">Recevez vos achats rapidement avec notre réseau local</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="text-orange-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Support 24/7</h3>
              <p className="text-gray-600">Notre équipe est disponible pour vous aider à tout moment</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Promoted Products Section */}
      {promotedProducts && promotedProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="text-primary" size={28} />
            <h2 className="text-2xl font-bold text-gray-900">Produits Populaires</h2>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              <Star size={12} className="mr-1" />
              Tendances
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            {promotedProducts.slice(0, 6).map((product: any) => (
              <Card 
                key={product.id} 
                className="bg-white shadow-lg border-0 hover:shadow-xl transition-all cursor-pointer group"
                onClick={() => onProductClick?.(product.id)}
              >
                <CardContent className="p-3">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                    {product.image_url && (
                      <img 
                        src={product.image_url} 
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    )}
                  </div>
                  <h3 className="font-semibold text-sm mb-1 line-clamp-2">{product.title}</h3>
                  <div className="text-primary font-bold text-lg">{product.price}</div>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline" className="text-xs">
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
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Parcourir par Catégorie</h2>
        <div className="flex gap-3 overflow-x-auto pb-4">
          <Button
            variant={selectedCategory === "" ? "default" : "outline"}
            onClick={() => handleCategorySelect("")}
            className="whitespace-nowrap rounded-full px-6 py-3 text-sm font-medium shadow-lg"
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
                className="whitespace-nowrap rounded-full px-6 py-3 text-sm font-medium flex items-center gap-2 shadow-lg"
              >
                <Icon size={16} />
                {category.name}
              </Button>
            );
          })}
        </div>

        {/* Quick Sort Options */}
        <div className="flex items-center justify-between mt-6 px-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-gray-600 hover:bg-gray-100"
            >
              <SlidersHorizontal size={16} />
              Options de tri
            </Button>
          </div>
          
          {showFilters && (
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-44 h-10">
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

      {/* Products Grid with Integrated Ads */}
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="flex gap-6">
          {/* Sidebar Ad */}
          <div className="hidden lg:block w-80">
            <div className="sticky top-4 space-y-4">
              <AdBanner position="sidebar" category={selectedCategory} />
              <AdBanner position="sidebar" />
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            <ProductGrid 
              category={selectedCategory}
              sortBy={sortBy}
              searchTerm={searchTerm}
              onProductClick={onProductClick}
            />
            
            {/* Between Products Ad */}
            <div className="my-8">
              <AdBanner position="between_products" category={selectedCategory} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Ad */}
      <div className="mt-12 relative z-10">
        <AdBanner position="footer" showCloseButton={false} />
      </div>
    </div>
  );
};