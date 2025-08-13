import { useState, useEffect } from "react";
import { SlidersHorizontal, TrendingUp, MapPin, Star, Heart } from "lucide-react";
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
  searchTerm?: string;
}

export const Home = ({ onProductClick, activeTab, onTabChange, searchTerm: externalSearchTerm }: HomeProps) => {
  const [sortBy, setSortBy] = useState<string>("date");
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Use external search term if provided, otherwise use local state
  const effectiveSearchTerm = externalSearchTerm || searchTerm;

  const handleSearch = (query: string) => {
    setSearchTerm(query);
    // The ProductGrid will automatically update with the new search term
  };

  // Fetch promoted products
  const { data: promotedProducts } = useQuery({
    queryKey: ['/products/promoted'],
    queryFn: () => apiClient.request('/products/promoted'),
    staleTime: 2 * 60 * 1000,
  });

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
      <AdBanner position="between_products" className="mb-6 relative z-10" />

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <ProductGrid 
          sortBy={sortBy}
          searchTerm={effectiveSearchTerm}
          onProductClick={onProductClick}
          onProductLike={handleProductLike}
          onProductMessage={handleProductMessage}
          viewMode="grid"
        />
      </div>

      {/* Footer Ad Banner */}
      <AdBanner position="footer" className="mt-8 relative z-10" />
      

    </div>
  );
};