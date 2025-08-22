import { useState, useEffect } from "react";
import { Car, Sofa, Home, ShirtIcon as Shirt, Laptop, Dumbbell, Baby, Gamepad2, LucideIcon, Smartphone, Bike, CarFront, Grid3X3, Briefcase, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  count: number;
}

interface DatabaseCategory {
  id: string;
  name: string;
  icon: string;
  created_at: string;
}

// Map icon names to Lucide icons
const iconMap: { [key: string]: LucideIcon } = {
  'Car': Car,
  'car': Car,
  'car-front': CarFront,
  'CarFront': CarFront,
  'Sofa': Sofa,
  'sofa': Sofa,
  'Home': Home,
  'home': Home,
  'Building': Building,
  'building': Building,
  'Shirt': Shirt,
  'shirt': Shirt,
  'Laptop': Laptop,
  'laptop': Laptop,
  'Smartphone': Smartphone,
  'smartphone': Smartphone,
  'Dumbbell': Dumbbell,
  'dumbbell': Dumbbell,
  'Baby': Baby,
  'baby': Baby,
  'Gamepad2': Gamepad2,
  'gamepad2': Gamepad2,
  'Bike': Bike,
  'bike': Bike,
  'Grid3X3': Grid3X3,
  'grid3x3': Grid3X3,
  'Briefcase': Briefcase,
  'briefcase': Briefcase,
  '📱': Smartphone, // Handle emoji icons
  'phone': Smartphone,
};

// Color combinations for categories
const colorCombinations = [
  "bg-blue-100 text-blue-600",
  "bg-amber-100 text-amber-600",
  "bg-emerald-100 text-emerald-600",
  "bg-pink-100 text-pink-600",
  "bg-purple-100 text-purple-600",
  "bg-red-100 text-red-600",
  "bg-cyan-100 text-cyan-600",
  "bg-indigo-100 text-indigo-600",
];

interface CategoryGridProps {
  selectedCategory?: string;
  onCategorySelect?: (categoryId: string) => void;
}

export const CategoryGrid = ({ selectedCategory, onCategorySelect }: CategoryGridProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        
        // Fetch categories from our API
        const categoriesData = await apiClient.getCategories();
        
        const categoriesWithCounts = categoriesData.map((category: DatabaseCategory, index: number) => {
          // Safe icon resolution
          const IconComponent = iconMap[category.icon] || iconMap[category.icon?.toLowerCase()] || Laptop;
          
          return {
            id: category.id,
            name: category.name,
            icon: IconComponent,
            color: colorCombinations[index % colorCombinations.length],
            count: Math.floor(Math.random() * 20) + 1 // Mock count for now
          };
        });

        setCategories(categoriesWithCounts);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Set fallback categories if API fails
        setCategories([
          { id: '1', name: 'Auto', icon: Car, color: 'bg-blue-100 text-blue-600', count: 5 },
          { id: '2', name: 'Immobilier', icon: Building, color: 'bg-green-100 text-green-600', count: 3 },
          { id: '3', name: 'Emplois', icon: Briefcase, color: 'bg-purple-100 text-purple-600', count: 8 },
          { id: '4', name: 'Autres', icon: Grid3X3, color: 'bg-gray-100 text-gray-600', count: 12 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">Categories</h2>
          <Button variant="ghost" size="sm" className="text-tomati-red text-sm font-medium">
            See All
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 w-12 h-12 rounded-xl mx-auto mb-2"></div>
              <div className="bg-gray-200 h-3 rounded w-16 mx-auto mb-1"></div>
              <div className="bg-gray-200 h-2 rounded w-8 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-foreground">Categories</h2>
        <Button variant="ghost" size="sm" className="text-tomati-red text-sm font-medium">
          See All
        </Button>
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        {categories.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.name;
          
          return (
            <Button
              key={category.id}
              variant="ghost"
              onClick={() => onCategorySelect?.(category.name)}
              className={cn(
                "flex flex-col items-center gap-2 p-3 h-auto rounded-xl transition-all duration-300 hover:scale-105",
                isSelected 
                  ? "bg-tomati-red/10 border-2 border-tomati-red/30 shadow-lg scale-105" 
                  : "hover:bg-muted/50 hover:shadow-md"
              )}
            >
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", category.color)}>
                <Icon size={24} />
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-foreground leading-tight">{category.name}</p>
                <p className="text-xs text-muted-foreground">{category.count}</p>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
};