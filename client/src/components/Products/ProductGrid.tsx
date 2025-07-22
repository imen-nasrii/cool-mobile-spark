import { useState, useEffect } from "react";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/queryClient";
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
  is_promoted: boolean;
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
  onProductClick?: (productId: string) => void;
}

export const ProductGrid = ({ category, onProductClick }: ProductGridProps) => {
  const { t } = useLanguage();

  // Use react-query to fetch products with improved filtering
  const { data: products = [], isLoading: loading } = useQuery({
    queryKey: ['products', category],
    queryFn: () => {
      if (category && category.trim() !== '') {
        return apiClient.getProducts(category);
      }
      return apiClient.getProducts();
    },
    staleTime: 5 * 60 * 1000,
  });

  // Séparer les produits promus des autres
  const promotedProducts = products.filter((product: Product) => product.is_promoted);
  const regularProducts = products.filter((product: Product) => !product.is_promoted);
  
  // Transform products for ProductCard component
  const transformProduct = (product: Product) => ({
    id: product.id,
    title: product.title,
    price: product.price,
    location: product.location,
    timeAgo: formatTimeAgo(product.created_at),
    image: imageMap[product.image_url] || product.image_url,
    category: product.category,
    likes: product.likes,
    isReserved: product.is_reserved,
    isFree: product.is_free,
    isPromoted: product.is_promoted
  });
  
  const transformedPromotedProducts = promotedProducts.map(transformProduct);
  const transformedRegularProducts = regularProducts.map(transformProduct);

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

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">
          {category ? `${t('recentListings')} ${category}` : t('recentListings')}
        </h2>
        <Button variant="ghost" size="sm" className="text-tomati-red text-sm font-medium">
          {t('viewAll')}
        </Button>
      </div>
      
      <div className="flex flex-col gap-3">
        {/* Produits promus en premier */}
        {transformedPromotedProducts.length > 0 && (
          <>
            <div className="text-sm font-medium text-orange-600 mb-2 flex items-center gap-2">
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-semibold">PUBLICITÉ</span>
              Produits populaires
            </div>
            {transformedPromotedProducts.map((product: any) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => onProductClick?.(product.id)}
                onLike={() => console.log("Liked:", product.id)}
                onMessage={() => console.log("Message:", product.id)}
                className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50"
              />
            ))}
            <div className="border-b border-gray-200 my-4"></div>
          </>
        )}
        
        {/* Produits réguliers */}
        {transformedRegularProducts.map((product: any) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={() => onProductClick?.(product.id)}
            onLike={() => console.log("Liked:", product.id)}
            onMessage={() => console.log("Message:", product.id)}
          />
        ))}
      </div>
      
      {(transformedPromotedProducts.length + transformedRegularProducts.length) === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>{t('noProducts')}</p>
        </div>
      )}
    </div>
  );
};