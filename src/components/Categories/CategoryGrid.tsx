import { Car, Sofa, Home, ShirtIcon as Shirt, Laptop, Dumbbell, Baby, Gamepad2, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  count: number;
}

const categories: Category[] = [
  { id: "cars", name: "Cars", icon: Car, color: "bg-blue-100 text-blue-600", count: 245 },
  { id: "furniture", name: "Furniture", icon: Sofa, color: "bg-amber-100 text-amber-600", count: 189 },
  { id: "real-estate", name: "Real Estate", icon: Home, color: "bg-emerald-100 text-emerald-600", count: 156 },
  { id: "fashion", name: "Fashion", icon: Shirt, color: "bg-pink-100 text-pink-600", count: 432 },
  { id: "electronics", name: "Electronics", icon: Laptop, color: "bg-purple-100 text-purple-600", count: 298 },
  { id: "sports", name: "Sports", icon: Dumbbell, color: "bg-red-100 text-red-600", count: 134 },
  { id: "baby", name: "Baby & Kids", icon: Baby, color: "bg-cyan-100 text-cyan-600", count: 89 },
  { id: "gaming", name: "Gaming", icon: Gamepad2, color: "bg-indigo-100 text-indigo-600", count: 76 },
];

interface CategoryGridProps {
  selectedCategory?: string;
  onCategorySelect?: (categoryId: string) => void;
}

export const CategoryGrid = ({ selectedCategory, onCategorySelect }: CategoryGridProps) => {
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
          const isSelected = selectedCategory === category.id;
          
          return (
            <Button
              key={category.id}
              variant="ghost"
              onClick={() => onCategorySelect?.(category.id)}
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