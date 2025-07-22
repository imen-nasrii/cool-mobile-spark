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
    if (!user) return;
    
    // Check if user has admin role
    setIsAdmin(user.role === 'admin');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="tomati-brand">{t('tomati')}</div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLanguage(language === 'fr' ? 'ar' : 'fr')}
            className="flex items-center gap-2"
          >
            <Languages size={16} />
            {language === 'fr' ? 'العربية' : 'Français'}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onFilterClick}
            title={t('filters')}
          >
            <SlidersHorizontal size={20} />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onSearchClick}
            title={t('searchBtn')}
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