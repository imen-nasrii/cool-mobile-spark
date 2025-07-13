import { useState } from "react";
import { Header } from "@/components/Layout/Header";
import { CategoryGrid } from "@/components/Categories/CategoryGrid";
import { ProductGrid } from "@/components/Products/ProductGrid";

export const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? "" : categoryId);
  };

  const handleProductClick = (productId: string) => {
    console.log("Product clicked:", productId);
    // Navigate to product detail page
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
          onProductClick={handleProductClick}
        />
      </div>
    </div>
  );
};