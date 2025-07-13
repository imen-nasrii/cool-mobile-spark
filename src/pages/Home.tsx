import { useState } from "react";
import { Search, Bell, Car, Home as HomeIcon } from "lucide-react";
import { CategoryGrid } from "@/components/Categories/CategoryGrid";
import { ProductGrid } from "@/components/Products/ProductGrid";

interface HomeProps {
  onProductClick?: (productId: string) => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const Home = ({ onProductClick, activeTab, onTabChange }: HomeProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? "" : categoryId);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-4">
      {/* Products */}
      <div className="p-4 space-y-4">
        <ProductGrid 
          category=""
          onProductClick={onProductClick}
        />
      </div>
    </div>
  );
};