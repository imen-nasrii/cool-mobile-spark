import { Home, Search, PlusCircle, MessageCircle, User, MapPin } from "lucide-react";
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
    { id: "add", icon: PlusCircle, label: t('add') },
    { id: "messages", icon: MessageCircle, label: t('messages') },
    { id: "profile", icon: User, label: t('profile') },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2 z-50">
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
                ? "text-tomati-red bg-tomati-red/10 shadow-sm scale-105" 
                : "text-muted-foreground hover:text-tomati-red hover:bg-tomati-red/5"
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