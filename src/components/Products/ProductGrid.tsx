import { useState, useEffect } from "react";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

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
  onProductClick?: (productId: string) => void;
}

export const ProductGrid = ({ category, onProductClick }: ProductGridProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (category) {
          query = query.ilike('category', `%${category}%`);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching products:', error);
          return;
        }

        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  // Transform products for ProductCard component
  const transformedProducts = products.map(product => ({
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            {category ? `${category} Products` : "Recent Listings"}
          </h2>
          <Button variant="ghost" size="sm" className="text-tomati-red text-sm font-medium">
            View All
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-7 gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 h-32 rounded-lg mb-2"></div>
              <div className="bg-gray-200 h-4 rounded mb-1"></div>
              <div className="bg-gray-200 h-3 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">
          {category ? `${category} Products` : "Recent Listings"}
        </h2>
        <Button variant="ghost" size="sm" className="text-tomati-red text-sm font-medium">
          View All
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
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
      
      {transformedProducts.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No products found in this category</p>
        </div>
      )}
    </div>
  );
};