import { Home, Search, MapPin, MessageCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { useState, useEffect } from "react";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const tabs = [
    { key: "home", icon: Home, label: "Accueil" },
    { key: "search", icon: Search, label: "Recherche" },
    { key: "map", icon: MapPin, label: "Carte" },
    { key: "messages", icon: MessageCircle, label: "Messages" },
    { key: "profile", icon: User, label: "Profil" }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-red-500">
      <div className="flex justify-around items-center py-2">
        {tabs.map(({ key, icon: Icon, label }) => (
          <Button
            key={key}
            variant="ghost"
            onClick={() => onTabChange(key)}
            className={cn(
              "flex flex-col items-center justify-center h-16 w-16 p-1",
              activeTab === key 
                ? "text-red-500" 
                : "text-gray-600 hover:text-red-500"
            )}
            style={{ fontFamily: 'Arial, sans-serif' }}
          >
            <Icon size={20} />
            <span className="text-xs mt-1">{label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};