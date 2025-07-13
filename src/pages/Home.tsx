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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-red-500">Tomati</h1>
          <div className="flex items-center gap-3">
            <button className="p-2">
              <Search size={20} className="text-gray-600" />
            </button>
            <button className="p-2 relative">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">1</span>
            </button>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white px-4 py-3 border-b">
        <div className="flex gap-4 overflow-x-auto">
          <button className="px-4 py-2 bg-gray-100 rounded-lg text-sm whitespace-nowrap">Tous les catégories</button>
          <button className="px-4 py-2 bg-gray-100 rounded-lg text-sm whitespace-nowrap flex items-center gap-2">
            <Car size={16} />
            Voiture
          </button>
          <button className="px-4 py-2 bg-gray-100 rounded-lg text-sm whitespace-nowrap flex items-center gap-2">
            <HomeIcon size={16} />
            Immobilie
          </button>
        </div>
      </div>

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