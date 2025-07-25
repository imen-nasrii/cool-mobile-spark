import { Search, SlidersHorizontal, Languages } from "lucide-react";
import { NotificationBell } from "@/components/Notifications/NotificationBell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { UserMenu } from "@/components/Auth/UserMenu";
import { useState, useEffect } from "react";

interface HeaderProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onSearchClick?: () => void;
  onFilterClick?: () => void;
}

export const Header = ({ activeTab, onTabChange, onSearchClick, onFilterClick }: HeaderProps) => {
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminRole();
  }, [user]);

  const checkAdminRole = async () => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    
    // Check if user has admin role
    console.log('User role:', user.role); // Debug log
    setIsAdmin(user.role === 'admin');
  };

  return (
    <header className="bg-gradient-to-r from-purple-600 to-green-500 border-b border-purple-200 sticky top-0 z-40 shadow-lg">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="text-white font-bold text-xl tracking-wide">{t('tomati')}</div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLanguage(language === 'fr' ? 'ar' : 'fr')}
            className="flex items-center gap-2 bg-white/20 border-white/30 text-white hover:bg-white/30"
          >
            <Languages size={16} />
            {language === 'fr' ? 'العربية' : 'Français'}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onFilterClick}
            title={t('filters')}
            className="text-white hover:bg-white/20"
          >
            <SlidersHorizontal size={20} />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onSearchClick}
            title={t('searchBtn')}
            className="text-white hover:bg-white/20"
          >
            <Search size={20} />
          </Button>
          
          <NotificationBell />

          <UserMenu showAdminButton={isAdmin} />
        </div>
      </div>
    </header>
  );
};