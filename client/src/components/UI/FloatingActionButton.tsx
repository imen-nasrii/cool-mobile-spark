import React, { useState } from 'react';
import { Plus, Car, Building, Briefcase, Grid3X3, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps {
  onCategorySelect: (category: string) => void;
}

const categories = [
  {
    id: 'immobilier',
    name: 'Immobilier',
    icon: Building,
    color: 'bg-blue-500 hover:bg-blue-600',
    iconColor: 'text-white'
  },
  {
    id: 'voiture',
    name: 'Voiture', 
    icon: Car,
    color: 'bg-green-500 hover:bg-green-600',
    iconColor: 'text-white'
  },
  {
    id: 'emplois',
    name: 'Emplois',
    icon: Briefcase, 
    color: 'bg-purple-500 hover:bg-purple-600',
    iconColor: 'text-white'
  },
  {
    id: 'autres',
    name: 'Autres',
    icon: Grid3X3,
    color: 'bg-orange-500 hover:bg-orange-600', 
    iconColor: 'text-white'
  }
];

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onCategorySelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleCategoryClick = (categoryId: string) => {
    onCategorySelect(categoryId);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-20 right-4 z-50">
      {/* Category buttons */}
      <div className={cn(
        "flex flex-col-reverse gap-3 mb-3 transition-all duration-300 ease-in-out",
        isOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible translate-y-4"
      )}>
        {categories.map((category, index) => {
          const Icon = category.icon;
          return (
            <Button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={cn(
                "w-14 h-14 rounded-full shadow-lg transition-all duration-300",
                category.color,
                "transform hover:scale-110"
              )}
              style={{
                transitionDelay: isOpen ? `${index * 50}ms` : '0ms'
              }}
            >
              <Icon size={24} className={category.iconColor} />
            </Button>
          );
        })}
      </div>

      {/* Main FAB button */}
      <Button
        onClick={toggleOpen}
        className={cn(
          "w-16 h-16 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110",
          isOpen 
            ? "bg-red-500 hover:bg-red-600 rotate-45" 
            : "bg-tomati-red hover:bg-red-600"
        )}
      >
        {isOpen ? (
          <X size={28} className="text-white" />
        ) : (
          <Plus size={28} className="text-white" />
        )}
      </Button>
    </div>
  );
};