import { useState } from "react";
import { Plus, Car, Building, Briefcase, Grid3X3, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FloatingAddButtonProps {
  onCategorySelect: (category: string) => void;
}

export const FloatingAddButton = ({ onCategorySelect }: FloatingAddButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const categories = [
    {
      id: "voiture",
      name: "Voiture",
      icon: Car,
      color: "bg-blue-500 hover:bg-blue-600",
      position: { x: -80, y: -80 }
    },
    {
      id: "immobilier",
      name: "Immobilier",
      icon: Building,
      color: "bg-green-500 hover:bg-green-600",
      position: { x: 0, y: -100 }
    },
    {
      id: "emplois",
      name: "Emploi",
      icon: Briefcase,
      color: "bg-purple-500 hover:bg-purple-600",
      position: { x: 80, y: -80 }
    },
    {
      id: "autres",
      name: "Autres",
      icon: Grid3X3,
      color: "bg-orange-500 hover:bg-orange-600",
      position: { x: 0, y: -40 }
    }
  ];

  const handleCategoryClick = (categoryId: string) => {
    onCategorySelect(categoryId);
    setIsOpen(false);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 transition-opacity duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Category Buttons */}
      <div className="relative">
        {isOpen && categories.map((category, index) => (
          <div
            key={category.id}
            className={`
              absolute bottom-0 right-0 transition-all duration-300 ease-out
              ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}
            `}
            style={{
              transform: `translate(${category.position.x}px, ${category.position.y}px)`,
              transitionDelay: `${index * 50}ms`
            }}
          >
            <Button
              onClick={() => handleCategoryClick(category.id)}
              className={`
                w-14 h-14 rounded-full shadow-lg ${category.color} 
                text-white border-4 border-white
                hover:scale-110 transition-all duration-200
                flex items-center justify-center
              `}
              title={`Ajouter ${category.name}`}
            >
              <category.icon size={20} />
            </Button>
            
            {/* Category Label */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              <div className="bg-black text-white text-xs px-2 py-1 rounded-md shadow-lg">
                {category.name}
              </div>
            </div>
          </div>
        ))}

        {/* Main Add Button */}
        <div
          className={`
            transition-all duration-200
            ${isOpen ? 'rotate-45 scale-110' : 'rotate-0 scale-100'}
          `}
        >
          <Button
            onClick={toggleMenu}
            className={`
              w-16 h-16 rounded-full shadow-xl
              ${isOpen 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-red-500 hover:bg-red-600'
              }
              text-white border-4 border-white
              flex items-center justify-center
              hover:scale-105 transition-all duration-200
            `}
            style={{
              boxShadow: '0 8px 25px rgba(239, 68, 68, 0.3)'
            }}
          >
            {isOpen ? <X size={24} /> : <Plus size={24} />}
          </Button>
        </div>

        {/* Pulse animation when closed */}
        {!isOpen && (
          <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20" />
        )}
      </div>


    </div>
  );
};