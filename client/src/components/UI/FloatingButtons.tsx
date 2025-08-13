import React from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIButtonProps {
  onAIToggle: () => void;
}

export const AIButton = ({ onAIToggle }: AIButtonProps) => {
  return (
    <div className="fixed bottom-20 right-4 z-[9999]">
      <Button
        onClick={onAIToggle}
        className="h-16 w-16 rounded-full shadow-xl bg-blue-600 hover:bg-blue-700 transition-all duration-300 transform hover:scale-110 border-4 border-white"
        size="lg"
      >
        <MessageCircle size={28} className="text-white" />
      </Button>
      <div className="absolute -top-3 -right-3 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
        IA
      </div>
    </div>
  );
};