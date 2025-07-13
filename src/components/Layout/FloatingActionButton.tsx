import { Plus, Camera, FileText, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const quickActions = [
    { icon: Camera, label: "Take Photo", color: "bg-blue-500" },
    { icon: FileText, label: "Add Text", color: "bg-green-500" },
    { icon: Car, label: "Sell Car", color: "bg-purple-500" },
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
                onClick={() => console.log(action.label)}
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
          "w-14 h-14 rounded-full shadow-xl bg-gradient-tomati hover:shadow-2xl transition-all duration-300",
          isOpen ? "rotate-45 scale-110" : "hover:scale-105"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Plus size={24} className="text-white" />
      </Button>
    </div>
  );
};