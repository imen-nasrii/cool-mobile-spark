import { useState, useEffect } from "react";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";
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
}

export const ProductGrid = ({ category, sortBy = "date", searchTerm, onProductClick, onProductLike, onProductMessage }: ProductGridProps) => {
  // const { t } = useLanguage();

  // Use react-query to fetch products
  const { data: fetchedProducts = [], isLoading: loading } = useQuery({
    queryKey: ['/products', category],
    queryFn: () => apiClient.getProducts(category),
    staleTime: 5 * 60 * 1000,
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
  const transformedProducts = products.map((product: Product) => ({
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
    <div className="w-full px-2 py-2">
      <div className="flex items-center justify-between mb-2">
        <Button variant="ghost" size="sm" className="text-tomati-red text-sm font-medium">
          Voir tout
        </Button>
        <h2 className="text-lg font-semibold text-foreground">
          {category ? `Produits ${category}` : "Produits récents"}
        </h2>
      </div>
      
      <div className="product-grid">
        {transformedProducts.map((product: any) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={() => onProductClick?.(product.id)}
            onLike={() => onProductLike?.(product.id)}
            onMessage={() => onProductMessage?.(product.id)}
            className="product-card"
          />
        ))}
      </div>
      
      {transformedProducts.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Aucun produit disponible</p>
        </div>
      )}
    </div>
  );
};