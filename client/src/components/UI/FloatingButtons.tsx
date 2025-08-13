import React, { useState } from "react";
import { Plus, MessageCircle, Home, Car, Briefcase, Package, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FloatingButtonsProps {
  onCategorySelect: (categoryId: string) => void;
  onAIToggle: () => void;
}

export const FloatingButtons = ({ onCategorySelect, onAIToggle }: FloatingButtonsProps) => {
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  const categories = [
    { id: "immobilier", icon: Home, label: "Immobilier", color: "bg-blue-500 hover:bg-blue-600" },
    { id: "voiture", icon: Car, label: "Voiture", color: "bg-green-500 hover:bg-green-600" },
    { id: "emplois", icon: Briefcase, label: "Emplois", color: "bg-purple-500 hover:bg-purple-600" },
    { id: "autres", icon: Package, label: "Autres", color: "bg-orange-500 hover:bg-orange-600" },
  ];

  const handleCategorySelect = (categoryId: string) => {
    onCategorySelect(categoryId);
    setIsAddMenuOpen(false);
  };

  return (
    <>
      {/* Bouton IA - En bas à gauche */}
      <div className="fixed bottom-6 left-6 z-[9999]">
        <Button
          onClick={onAIToggle}
          className="h-16 w-16 rounded-full shadow-xl bg-blue-600 hover:bg-blue-700 transition-all duration-300 transform hover:scale-110 border-4 border-white"
          size="lg"
        >
          <MessageCircle size={28} className="text-white" />
        </Button>
        <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
          IA
        </div>
      </div>

      {/* Bouton Ajouter - En bas à droite */}
      <div className="fixed bottom-6 right-6 z-[9999]">
        {/* Menu des catégories */}
        {isAddMenuOpen && (
          <div className="absolute bottom-20 right-0 flex flex-col gap-3 mb-2">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <div
                  key={category.id}
                  className="flex items-center gap-3 animate-in slide-in-from-bottom-2 duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="bg-white px-3 py-2 rounded-lg shadow-lg border text-sm font-medium text-gray-700">
                    {category.label}
                  </div>
                  <Button
                    onClick={() => handleCategorySelect(category.id)}
                    className={cn(
                      "h-14 w-14 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 border-4 border-white",
                      category.color
                    )}
                  >
                    <Icon size={24} className="text-white" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {/* Bouton principal Ajouter */}
        <Button
          onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
          className={cn(
            "h-16 w-16 rounded-full shadow-xl transition-all duration-300 transform hover:scale-110 border-4 border-white",
            isAddMenuOpen 
              ? "bg-red-600 hover:bg-red-700 rotate-45" 
              : "bg-red-500 hover:bg-red-600"
          )}
        >
          {isAddMenuOpen ? (
            <X size={28} className="text-white" />
          ) : (
            <Plus size={28} className="text-white" />
          )}
        </Button>
        <div className="absolute -top-2 -left-4 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
          Ajouter
        </div>
      </div>
    </>
  );
};