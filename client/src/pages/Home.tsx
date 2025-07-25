import { useState } from "react";
import { Car, Building, Briefcase, Grid3X3, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductGrid } from "@/components/Products/ProductGrid";
import { useLanguage } from "@/hooks/useLanguage";

interface HomeProps {
  onProductClick?: (productId: string) => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const Home = ({ onProductClick, activeTab, onTabChange }: HomeProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("date");
  const [showFilters, setShowFilters] = useState(false);
  const { t } = useLanguage();

  const categories = [
    { id: "Électronique", name: "Électronique", icon: Grid3X3 },
    { id: "Sport", name: "Sport", icon: Grid3X3 },
    { id: "Voiture", name: "Voiture", icon: Car },
    { id: "Bureautique", name: "Bureautique", icon: Briefcase },
    { id: "Jeux vidéo", name: "Jeux vidéo", icon: Grid3X3 },
    { id: "Mobilier", name: "Mobilier", icon: Building }
  ];

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
            Toutes les catégories
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

        {/* Quick Sort Options */}
        <div className="flex items-center justify-between mt-4 px-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-gray-600"
            >
              <SlidersHorizontal size={16} />
              Tri rapide
            </Button>
          </div>
          
          {showFilters && (
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Plus récent</SelectItem>
                  <SelectItem value="price-asc">Prix croissant</SelectItem>
                  <SelectItem value="price-desc">Prix décroissant</SelectItem>
                  <SelectItem value="title">Titre A-Z</SelectItem>
                  <SelectItem value="likes">Plus populaire</SelectItem>
                  <SelectItem value="location">Localisation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Products */}
      <ProductGrid 
        category={selectedCategory}
        sortBy={sortBy}
        onProductClick={onProductClick}
      />
    </div>
  );
};