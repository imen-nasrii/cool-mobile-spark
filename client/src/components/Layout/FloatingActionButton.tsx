import { Plus, Camera, FileText, Car, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  onTabChange?: (tab: string) => void;
}

export const FloatingActionButton = ({ onTabChange }: FloatingActionButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const quickActions = [
    { 
      icon: MessageCircle, 
      label: "Messages", 
      color: "bg-blue-500",
      action: () => onTabChange?.("messages")
    },
    { 
      icon: FileText, 
      label: "Ajouter", 
      color: "bg-green-500",
      action: () => onTabChange?.("add")
    },
    { 
      icon: Car, 
      label: "Vendre", 
      color: "bg-purple-500",
      action: () => onTabChange?.("add")
    },
  ];

  return (
    <div className="fixed bottom-24 right-4 z-50">
      {/* Quick Action Buttons */}
      {isOpen && (
        <div className="flex flex-col gap-2 mb-3 animate-fade-in">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                size="sm"
                className={cn(
                  "w-12 h-12 rounded-full shadow-lg animate-scale-in",
                  action.color,
                  "hover:scale-110 transition-all duration-200"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => {
                  action.action();
                  setIsOpen(false);
                }}
              >
                <Icon size={20} className="text-white" />
              </Button>
            );
          })}
        </div>
      )}

      {/* Main FAB */}
      <Button
        size="lg"
        className={cn(
          "w-14 h-14 rounded-full shadow-xl bg-gradient-to-r from-red-500 to-red-600 hover:shadow-2xl transition-all duration-300",
          isOpen ? "rotate-45 scale-110" : "hover:scale-105"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X size={24} className="text-white" />
        ) : (
          <Plus size={24} className="text-white" />
        )}
      </Button>
    </div>
  );
};