import { useState, useEffect } from "react";
import { Search as SearchIcon, Filter, MapPin, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "@/components/Products/ProductCard";
import { AdvancedFilters } from "@/components/Filters/AdvancedFilters";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useLanguage } from "@/hooks/useLanguage";

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

const popularSearches = [
  "iPhone", "Tesla", "Canapé", "PC Gaming", "VTT", "Tracteur"
];

interface FilterOptions {
  category: string;
  minPrice: number;
  maxPrice: number;
  location: string;
  condition: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  freeOnly: boolean;
  availableOnly: boolean;
  dateRange: string;
}

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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    category: "",
    minPrice: 0,
    maxPrice: 10000,
    location: "",
    condition: "",
    sortBy: "date",
    sortOrder: "desc",
    freeOnly: false,
    availableOnly: true,
    dateRange: "all"
  });
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
    let filtered = [...productsList];

    // Apply filters
    if (activeFilters.category) {
      filtered = filtered.filter(p => p.category === activeFilters.category);
    }
    
    if (activeFilters.location) {
      filtered = filtered.filter(p => p.location === activeFilters.location);
    }
    
    if (activeFilters.freeOnly) {
      filtered = filtered.filter(p => p.is_free);
    }
    
    if (activeFilters.availableOnly) {
      filtered = filtered.filter(p => !p.is_reserved);
    }

    // Price filtering
    filtered = filtered.filter(p => {
      const price = parseFloat(p.price.replace(/[€,]/g, ''));
      return price >= activeFilters.minPrice && price <= activeFilters.maxPrice;
    });

    // Date filtering
    if (activeFilters.dateRange !== "all") {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (activeFilters.dateRange) {
        case "today":
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case "month":
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case "3months":
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
      }
      
      filtered = filtered.filter(p => new Date(p.created_at) >= cutoffDate);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (activeFilters.sortBy) {
        case "price":
          const priceA = parseFloat(a.price.replace(/[€,]/g, ''));
          const priceB = parseFloat(b.price.replace(/[€,]/g, ''));
          comparison = priceA - priceB;
          break;
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "likes":
          comparison = a.likes - b.likes;
          break;
        case "location":
          comparison = a.location.localeCompare(b.location);
          break;
        case "date":
        default:
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      
      return activeFilters.sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredProducts(filtered);
  };

  const handleFiltersChange = (filters: FilterOptions) => {
    setActiveFilters(filters);
    applyFiltersAndSort(searchQuery ? 
      products.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.location.toLowerCase().includes(searchQuery.toLowerCase())
      ) : products
    );
  };

  const handleClearFilters = () => {
    const defaultFilters = {
      category: "",
      minPrice: 0,
      maxPrice: 10000,
      location: "",
      condition: "",
      sortBy: "date",
      sortOrder: "desc" as const,
      freeOnly: false,
      availableOnly: true,
      dateRange: "all"
    };
    setActiveFilters(defaultFilters);
    applyFiltersAndSort(searchQuery ? 
      products.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.location.toLowerCase().includes(searchQuery.toLowerCase())
      ) : products
    );
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
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <Filter size={18} />
          </Button>
        </div>

        {/* Popular Searches */}
        {!searchQuery && (
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Recherches populaires</h3>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((search) => (
                <Button
                  key={search}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSearch(search)}
                  className="text-xs rounded-full border-primary/20 hover:bg-primary/10 hover:border-primary"
                >
                  {search}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Advanced Filters */}
        <AdvancedFilters
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          isOpen={filtersOpen}
          onToggle={() => setFiltersOpen(!filtersOpen)}
        />
      </div>

      {/* Results Summary */}
      <div className="max-w-4xl mx-auto mb-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>
            {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
            {searchQuery && ` pour "${searchQuery}"`}
          </p>
          <p>
            Trié par {activeFilters.sortBy === 'date' ? 'date' : 
                     activeFilters.sortBy === 'price' ? 'prix' :
                     activeFilters.sortBy === 'likes' ? 'popularité' : activeFilters.sortBy}
            {activeFilters.sortOrder === 'desc' ? ' ↓' : ' ↑'}
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
              onLike={() => console.log("Liked:", product.id)}
              onMessage={() => console.log("Message:", product.id)}
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