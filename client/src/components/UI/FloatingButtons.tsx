import React, { useState } from "react";
import { Plus, Home, Car, Briefcase, Package, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AddButtonProps {
  onCategorySelect: (categoryId: string) => void;
}

export const AddButton = ({ onCategorySelect }: AddButtonProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const categories = [
    { id: "immobilier", icon: Home, label: "Immobilier", color: "bg-blue-500 hover:bg-blue-600" },
    { id: "voiture", icon: Car, label: "Voiture", color: "bg-green-500 hover:bg-green-600" },
    { id: "emplois", icon: Briefcase, label: "Emplois", color: "bg-purple-500 hover:bg-purple-600" },
    { id: "autres", icon: Package, label: "Autres", color: "bg-orange-500 hover:bg-orange-600" },
  ];

  const handleCategorySelect = (categoryId: string) => {
    console.log('FloatingButton: Category selected:', categoryId);
    onCategorySelect(categoryId);
    setIsMenuOpen(false);
  };

  return (
    <div className="fixed bottom-20 right-4 z-[10000]">
      {/* Menu des catégories */}
      {isMenuOpen && (
        <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl border border-gray-200 p-2 min-w-[160px] z-[10001]">
          <div className="space-y-1">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Clicking category:', category.id);
                    handleCategorySelect(category.id);
                  }}
                  className="flex items-center gap-3 p-3 w-full text-left text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors rounded-md"
                >
                  <Icon size={16} />
                  <span className="font-medium text-sm">{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Bouton principal Ajouter */}
      <Button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={cn(
          "h-16 w-16 rounded-full shadow-xl transition-all duration-300 transform hover:scale-110 border-4 border-white",
          isMenuOpen 
            ? "bg-red-600 hover:bg-red-700 rotate-45" 
            : "bg-red-500 hover:bg-red-600"
        )}
      >
        {isMenuOpen ? (
          <X size={28} className="text-white" />
        ) : (
          <Plus size={28} className="text-white" />
        )}
      </Button>
      <div className="absolute -top-3 -left-4 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
        Ajouter
      </div>
    </div>
  );
};