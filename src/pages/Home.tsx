import { useState } from "react";
import { Header } from "@/components/Layout/Header";
import { CategoryGrid } from "@/components/Categories/CategoryGrid";
import { ProductGrid } from "@/components/Products/ProductGrid";

interface HomeProps {
  onProductClick?: (productId: string) => void;
}

export const Home = ({ onProductClick }: HomeProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? "" : categoryId);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
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
    </div>
  );
};