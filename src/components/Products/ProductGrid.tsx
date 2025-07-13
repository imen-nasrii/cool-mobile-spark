import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";

// Import product images
import teslaImage from "@/assets/tesla-model3.jpg";
import motherboardImage from "@/assets/motherboard-i5.jpg";
import sofaImage from "@/assets/modern-sofa.jpg";
import bikeImage from "@/assets/mountain-bike.jpg";
import tractorImage from "@/assets/tractor-holland.jpg";
import iphoneImage from "@/assets/iphone-15-pro.jpg";

// Mock data inspired by the app screenshots with real images
const mockProducts = [
  {
    id: "1",
    title: "Vente carte mère i5 - Gaming PC Components",
    price: "170 DT",
    location: "Ariana, Tunisia",
    timeAgo: "1 day ago",
    image: motherboardImage,
    category: "Electronics",
    likes: 12,
    isReserved: false
  },
  {
    id: "2",
    title: "Canapé - Modern Sofa Set",
    price: "Free",
    location: "Tunis, Tunisia", 
    timeAgo: "2 days ago",
    image: sofaImage,
    category: "Furniture",
    likes: 8,
    isFree: true
  },
  {
    id: "3",
    title: "Craft 500 - Mountain Bike",
    price: "300 DT",
    location: "Ariana, Tunisia",
    timeAgo: "2 days ago", 
    image: bikeImage,
    category: "Sports",
    likes: 15,
    isReserved: true
  },
  {
    id: "4",
    title: "New Holland - Tractor Equipment",
    price: "Free",
    location: "Ariana, Tunisia",
    timeAgo: "2 days ago",
    image: tractorImage,
    category: "Vehicles",
    likes: 6,
    isFree: true
  },
  {
    id: "5",
    title: "Tesla Model 3 - Electric Car",
    price: "120,000 DT",
    location: "Gabes, Tunisia",
    timeAgo: "6 days ago",
    image: teslaImage,
    category: "Cars", 
    likes: 45,
    isReserved: false
  },
  {
    id: "6",
    title: "iPhone 15 Pro - Like New",
    price: "2,800 DT",
    location: "Sousse, Tunisia",
    timeAgo: "1 week ago",
    image: iphoneImage,
    category: "Electronics",
    likes: 23
  }
];

interface ProductGridProps {
  category?: string;
  onProductClick?: (productId: string) => void;
}

export const ProductGrid = ({ category, onProductClick }: ProductGridProps) => {
  const filteredProducts = category 
    ? mockProducts.filter(p => p.category.toLowerCase().includes(category.toLowerCase()))
    : mockProducts;

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
      
      <div className="grid grid-cols-2 gap-3">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={() => onProductClick?.(product.id)}
            onLike={() => console.log("Liked:", product.id)}
            onMessage={() => console.log("Message:", product.id)}
          />
        ))}
      </div>
      
      {filteredProducts.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No products found in this category</p>
        </div>
      )}
    </div>
  );
};