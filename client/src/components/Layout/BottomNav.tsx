import { Home, Search, MapPin, MessageCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const { t } = useLanguage();
  
  const tabs = [
    { id: "home", icon: Home, label: t('home') },
    { id: "search", icon: Search, label: t('search') },
    { id: "map", icon: MapPin, label: "Carte" },
    { id: "messages", icon: MessageCircle, label: t('messages') },
    { id: "profile", icon: User, label: t('profile') },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-red-500 px-4 py-3 z-[1000] shadow-lg">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {tabs.map(({ id, icon: Icon, label }) => (
          <Button
            key={id}
            variant="ghost"
            size="sm"
            onClick={() => onTabChange(id)}
            className={cn(
              "flex flex-col items-center gap-1 p-2 h-auto rounded-lg transition-all duration-300",
              activeTab === id 
                ? "text-red-600 bg-red-100 shadow-sm scale-105 font-bold" 
                : "text-gray-600 hover:text-red-600 hover:bg-red-50"
            )}
          >
            <Icon size={20} />
            <span className="text-xs font-medium">{label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};