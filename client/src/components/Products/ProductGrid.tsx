import { useState, useEffect } from "react";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
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
  onProductClick?: (productId: string) => void;
}

export const ProductGrid = ({ category, onProductClick }: ProductGridProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

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
          <p>{t('noProducts')}</p>
        </div>
      )}
    </div>
  );
};