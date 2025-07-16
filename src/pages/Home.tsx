import { useState } from "react";
import { Car, Building, Briefcase, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/Products/ProductGrid";

interface HomeProps {
  onProductClick?: (productId: string) => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const categories = [
  { id: "voiture", name: "🚗 سيارات", icon: Car },
  { id: "immobilier", name: "🏠 عقارات", icon: Building },
  { id: "emplois", name: "💼 وظائف", icon: Briefcase },
  { id: "autres", name: "📦 أخرى", icon: Grid3X3 }
];

export const Home = ({ onProductClick, activeTab, onTabChange }: HomeProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? "" : categoryId);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Categories */}
      <div className="px-4 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={selectedCategory === "" ? "default" : "outline"}
            onClick={() => handleCategorySelect("")}
            className="whitespace-nowrap rounded-full px-6 py-2 text-sm font-medium"
          >
            جميع الفئات
          </Button>
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => handleCategorySelect(category.id)}
                className="whitespace-nowrap rounded-full px-6 py-2 text-sm font-medium flex items-center gap-2"
              >
                <Icon size={16} />
                {category.name}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Products */}
      <div className="px-4 space-y-4">
        <ProductGrid 
          category={selectedCategory}
          onProductClick={onProductClick}
        />
      </div>
    </div>
  );
};