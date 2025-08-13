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
    onCategorySelect(categoryId);
    setIsMenuOpen(false);
  };

  return (
    <div className="fixed bottom-20 right-4 z-[9999]">
      {/* Menu des catégories */}
      {isMenuOpen && (
        <div className="absolute bottom-20 right-0 bg-white rounded-2xl shadow-2xl border p-3 min-w-[180px]">
          <div className="grid grid-cols-1 gap-2">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:scale-105 text-left",
                    category.color.replace('bg-', 'hover:bg-').replace('hover:bg-', 'hover:bg-') + " hover:text-white text-gray-700 hover:shadow-lg"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Icon size={20} />
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