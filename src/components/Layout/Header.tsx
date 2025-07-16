import { Search, Bell, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export const Header = ({ activeTab, onTabChange }: { activeTab?: string; onTabChange?: (tab: string) => void }) => {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold text-tomati-red">Tomati</div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon">
            <SlidersHorizontal size={20} />
          </Button>
          
          <Button variant="ghost" size="icon">
            <Search size={20} />
          </Button>
          
          <Button variant="ghost" size="icon">
            <Bell size={20} />
          </Button>
        </div>
      </div>
    </header>
  );
};