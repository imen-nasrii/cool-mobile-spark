import { useState } from "react";
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
    <div className="space-y-6">
      <CategoryGrid 
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
      />
      
      <ProductGrid 
        category={selectedCategory}
        onProductClick={onProductClick}
      />
    </div>
  );
};