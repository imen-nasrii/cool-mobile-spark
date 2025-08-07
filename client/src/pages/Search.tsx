import { useState, useEffect } from "react";
import { Search as SearchIcon, MapPin, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "@/components/Products/ProductCard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

// Import product images
import teslaImage from "@/assets/tesla-model3.jpg";
import motherboardImage from "@/assets/motherboard-i5.jpg";
import sofaImage from "@/assets/modern-sofa.jpg";
import bikeImage from "@/assets/mountain-bike.jpg";
import tractorImage from "@/assets/tractor-holland.jpg";
import iphoneImage from "@/assets/iphone-15-pro.jpg";

// Map image URLs to imported images
const imageMap: { [key: string]: string } = {
  '/src/assets/tesla-model3.jpg': teslaImage,
  '/src/assets/motherboard-i5.jpg': motherboardImage,
  '/src/assets/modern-sofa.jpg': sofaImage,
  '/src/assets/mountain-bike.jpg': bikeImage,
  '/src/assets/tractor-holland.jpg': tractorImage,
  '/src/assets/iphone-15-pro.jpg': iphoneImage,
};

interface Product {
  id: string;
  title: string;
  price: string;
  location: string;
  image_url: string;
  category: string;
  likes: number;
  is_reserved: boolean;
  is_free: boolean;
  created_at: string;
}

// Helper function to format time ago
const formatTimeAgo = (dateString: string) => {
  const now = new Date();
  const created = new Date(dateString);
  const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 24) {
    return `${diffInHours}h`;
  } else if (diffInHours < 168) {
    const days = Math.floor(diffInHours / 24);
    return `${days}j`;
  } else {
    const weeks = Math.floor(diffInHours / 168);
    return `${weeks} sem`;
  }
};


export const Search = ({ activeTab, onTabChange, onProductClick }: { 
  activeTab?: string; 
  onTabChange?: (tab: string) => void;
  onProductClick?: (productId: string) => void;
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  // const { t } = useLanguage();

  // Use react-query to fetch products with search
  const { data: productsData = [], isLoading: queryLoading } = useQuery({
    queryKey: ['/products', searchQuery],
    queryFn: () => searchQuery ? 
      fetch(`/api/products?search=${encodeURIComponent(searchQuery)}`).then(res => res.json()) :
      apiClient.getProducts(),
    staleTime: 30 * 1000, // Reduced for search responsiveness
  });

  useEffect(() => {
    setProducts(productsData);
    if (productsData.length > 0) {
      applyFiltersAndSort(productsData);
    } else {
      setFilteredProducts([]);
    }
    setLoading(queryLoading);
  }, [productsData, queryLoading]);


  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setSearchLoading(true);
    
    try {
      if (query.trim()) {
        const filtered = products.filter(product =>
          product.title.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase()) ||
          product.location.toLowerCase().includes(query.toLowerCase())
        );
        applyFiltersAndSort(filtered);
      } else {
        applyFiltersAndSort(products);
      }
    } finally {
      setSearchLoading(false);
    }
  };

  const applyFiltersAndSort = (productsList: Product[]) => {
    // Sort by date (most recent first)
    const sorted = [...productsList].sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    setFilteredProducts(sorted);
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

  // Transform products for ProductCard component
  const transformedProducts = filteredProducts.map(product => ({
    id: product.id,
    title: product.title,
    price: product.price,
    location: product.location,
    timeAgo: formatTimeAgo(product.created_at),
    image: imageMap[product.image_url] || product.image_url,
    category: product.category,
    likes: product.likes,
    isReserved: product.is_reserved,
    isFree: product.is_free
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="tomati-brand animate-pulse mb-4">Tomati</div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tomati-red mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      {/* Search Bar */}
      <div className="space-y-4 max-w-4xl mx-auto">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            placeholder="Rechercher produits, voitures, meubles..." 
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-12 pr-4 py-3 rounded-2xl border-2 border-primary/20 focus:border-primary focus:ring-primary"
          />
          {searchLoading && (
            <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            </div>
          )}
        </div>

      </div>

      {/* Results Summary */}
      <div className="max-w-4xl mx-auto mb-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>
            {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
            {searchQuery && ` pour "${searchQuery}"`}
          </p>
          <p>
            Trié par date (plus récents en premier)
          </p>
        </div>
      </div>

      {/* Search Results */}
      <div className="max-w-4xl mx-auto mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            {searchQuery ? `Résultats pour "${searchQuery}"` : "Produits récents"}
          </h2>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {transformedProducts.length} résultats
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {transformedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => onProductClick?.(product.id)}
              onLike={() => handleProductLike(product.id)}
              onMessage={() => handleProductMessage(product.id)}
            />
          ))}
        </div>

        {transformedProducts.length === 0 && searchQuery && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <SearchIcon size={24} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Aucun résultat trouvé</h3>
            <p className="text-muted-foreground text-sm">
              Essayez avec des mots-clés différents ou vérifiez l'orthographe
            </p>
          </div>
        )}
      </div>
    </div>
  );
};