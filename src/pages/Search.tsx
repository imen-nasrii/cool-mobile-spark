import { useState } from "react";
import { Search as SearchIcon, Filter, MapPin, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "@/components/Products/ProductCard";

// Import product images
import teslaImage from "@/assets/tesla-model3.jpg";
import motherboardImage from "@/assets/motherboard-i5.jpg";
import sofaImage from "@/assets/modern-sofa.jpg";
import bikeImage from "@/assets/mountain-bike.jpg";
import tractorImage from "@/assets/tractor-holland.jpg";
import iphoneImage from "@/assets/iphone-15-pro.jpg";

const searchResults = [
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
    title: "iPhone 15 Pro - Like New",
    price: "2,800 DT",
    location: "Sousse, Tunisia",
    timeAgo: "1 week ago",
    image: iphoneImage,
    category: "Electronics",
    likes: 23
  }
];

const popularSearches = [
  "iPhone", "Tesla", "Sofa", "Gaming PC", "Mountain Bike", "Tractor"
];

export const Search = ({ activeTab, onTabChange, onProductClick }: { 
  activeTab?: string; 
  onTabChange?: (tab: string) => void;
  onProductClick?: (productId: string) => void;
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState(searchResults);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const filtered = searchResults.filter(product =>
        product.title.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults(searchResults);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="space-y-4">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            placeholder="Search products, cars, furniture..." 
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-12 pr-4 py-3 rounded-2xl border-2 border-tomati-red/20 focus:border-tomati-red focus:ring-tomati-red"
          />
          <Button variant="ghost" size="sm" className="absolute right-2 top-1/2 transform -translate-y-1/2 text-tomati-red">
            <Filter size={18} />
          </Button>
        </div>

        {/* Popular Searches */}
        {!searchQuery && (
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Popular Searches</h3>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((search) => (
                <Button
                  key={search}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSearch(search)}
                  className="text-xs rounded-full border-tomati-red/20 hover:bg-tomati-red/10 hover:border-tomati-red"
                >
                  {search}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Search Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            {searchQuery ? `Results for "${searchQuery}"` : "Recent Searches"}
          </h2>
          <Badge variant="secondary" className="bg-tomati-red/10 text-tomati-red">
            {results.length} results
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {results.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => onProductClick?.(product.id)}
              onLike={() => console.log("Liked:", product.id)}
              onMessage={() => console.log("Message:", product.id)}
            />
          ))}
        </div>

        {results.length === 0 && searchQuery && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <SearchIcon size={24} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No results found</h3>
            <p className="text-muted-foreground text-sm">
              Try searching with different keywords or check the spelling
            </p>
          </div>
        )}
      </div>
    </div>
  );
};