import { useState } from "react";
import { Car, Building, Briefcase, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/Products/ProductGrid";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

interface HomeProps {
  onProductClick?: (productId: string) => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const Home = ({ onProductClick, activeTab, onTabChange }: HomeProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const { t } = useLanguage();

  const categories = [
    { id: "Voiture", name: t('cars'), icon: Car },
    { id: "Electronics", name: "Électronique", icon: Building },
    { id: "Furniture", name: "Mobilier", icon: Briefcase },
    { id: "Sports", name: "Sports", icon: Grid3X3 }
  ];

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? "" : categoryId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-green-50 pb-20">
      {/* Categories */}
      <div className="px-4 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={selectedCategory === "" ? "default" : "outline"}
            onClick={() => handleCategorySelect("")}
            className="whitespace-nowrap rounded-full px-6 py-2 text-sm font-medium bg-gradient-to-r from-purple-600 to-green-500 hover:from-purple-700 hover:to-green-600"
          >
            {t('allCategories')}
          </Button>
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => handleCategorySelect(category.id)}
                className={cn(
                  "whitespace-nowrap rounded-full px-6 py-2 text-sm font-medium flex items-center gap-2",
                  selectedCategory === category.id 
                    ? "bg-gradient-to-r from-purple-600 to-green-500 hover:from-purple-700 hover:to-green-600" 
                    : "border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                )}
              >
                <Icon size={16} />
                {category.name}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Products */}
      <ProductGrid 
        category={selectedCategory}
        onProductClick={onProductClick}
      />
    </div>
  );
};