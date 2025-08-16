import { useState, useEffect } from "react";
import { ProductCard } from "./ProductCard";
import { ProductListCard } from "./ProductListCard";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
// import { apiClient } from "@/lib/apiClient";
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
  is_advertisement: boolean;
  created_at: string;
}

// Helper function to format time ago
const formatTimeAgo = (dateString: string) => {
  const now = new Date();
  const created = new Date(dateString);
  const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  } else if (diffInHours < 168) {
    const days = Math.floor(diffInHours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  } else {
    const weeks = Math.floor(diffInHours / 168);
    return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  }
};

interface ProductGridProps {
  category?: string;
  sortBy?: string;
  searchTerm?: string;
  onProductClick?: (productId: string) => void;
  onProductLike?: (productId: string) => void;
  onProductMessage?: (productId: string) => void;
  viewMode?: 'grid' | 'list';
  filters?: any;
}

export const ProductGrid = ({ category, sortBy = "date", searchTerm, onProductClick, onProductLike, onProductMessage, viewMode = 'grid', filters }: ProductGridProps) => {
  // const { t } = useLanguage();

  // Use react-query to fetch products with pagination
  const { data: fetchedProducts = [], isLoading: loading, error } = useQuery({
    queryKey: ['/api/products', category, searchTerm],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (searchTerm) params.append('search', searchTerm);
        params.append('limit', '20'); // Paginate with 20 items
        
        const url = `/api/products?${params.toString()}`;
        console.log('Fetching products with URL:', url);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        console.log('Fetched products:', result.length, 'items for category:', category);
        return result;
      } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes cache for better performance
    retry: 1, // Reduced retries for faster error handling
    refetchOnWindowFocus: false,
  });

  // Apply search filter and sorting to products
  let filteredProducts = [...fetchedProducts];
  
  // Apply search filter if searchTerm is provided
  if (searchTerm && searchTerm.trim() !== '') {
    const searchLower = searchTerm.toLowerCase();
    filteredProducts = filteredProducts.filter((product: Product) =>
      product.title.toLowerCase().includes(searchLower) ||
      product.category.toLowerCase().includes(searchLower) ||
      product.location.toLowerCase().includes(searchLower)
    );
  }

  const products = filteredProducts.sort((a: Product, b: Product) => {
    switch (sortBy) {
      case "price-asc":
        return parseFloat(a.price.replace(/[€,]/g, '')) - parseFloat(b.price.replace(/[€,]/g, ''));
      case "price-desc":
        return parseFloat(b.price.replace(/[€,]/g, '')) - parseFloat(a.price.replace(/[€,]/g, ''));
      case "title":
        return a.title.localeCompare(b.title);
      case "location":
        return a.location.localeCompare(b.location);
      case "likes":
        return b.likes - a.likes;
      case "date":
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  // Transform products for ProductCard component
  const transformedProducts = products.map((product: any) => ({
    id: product.id,
    title: product.title,
    price: product.price,
    location: product.location,
    timeAgo: formatTimeAgo(product.created_at),
    image: imageMap[product.image_url] || product.image_url,
    category: product.category,
    likes: product.likes || 0,
    isReserved: product.is_reserved,
    isFree: product.is_free,
    isAdvertisement: product.is_advertisement,
    // Car details
    brand: product.brand,
    model: product.model,
    year: product.year,
    mileage: product.mileage,
    fuel_type: product.fuel_type,
    transmission: product.transmission,
    condition: product.condition,
    color: product.color,
    doors: product.doors,
    power: product.power,
    // Real estate details
    rooms: product.rooms,
    surface: product.surface,
    property_type: product.property_type,
    // Job details
    contract_type: product.contract_type,
    salary_range: product.salary_range
  }));

  if (loading) {
    return (
      <div className="px-4 py-3">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="tomati-brand animate-pulse mb-4">Tomati</div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tomati-red mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-4">Chargement des produits...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-3">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-600 mb-4">Erreur de chargement</div>
            <p className="text-sm text-muted-foreground">Impossible de charger les produits. Veuillez rafraîchir la page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-2 sm:px-4 py-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-2">
        <h2 className="text-base sm:text-lg font-semibold text-foreground order-2 sm:order-1">
          {category ? `Produits ${category}` : "Produits récents"}
        </h2>
        <Button variant="ghost" size="sm" className="text-tomati-red text-xs sm:text-sm font-medium order-1 sm:order-2 self-end sm:self-auto">
          Voir tout
        </Button>
      </div>
      
      <div className={viewMode === 'list' ? "flex flex-col gap-2 sm:gap-3" : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4"}>
        {transformedProducts.map((product: any) => (
          viewMode === 'list' ? (
            <ProductListCard
              key={product.id}
              product={product}
              onClick={() => onProductClick?.(product.id)}
              onLike={() => onProductLike?.(product.id)}
              onMessage={() => onProductMessage?.(product.id)}
              className="w-full"
            />
          ) : (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => onProductClick?.(product.id)}
              onLike={() => onProductLike?.(product.id)}
              onMessage={() => onProductMessage?.(product.id)}
            />
          )
        ))}
      </div>
      
      {transformedProducts.length === 0 && (
        <div className="text-center py-8 sm:py-12 text-muted-foreground">
          <p className="text-sm sm:text-base">Aucun produit disponible</p>
        </div>
      )}
    </div>
  );
};