import { Search, Bell, SlidersHorizontal, Languages, MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useNotifications } from "@/hooks/useNotifications";
import { UserMenu } from "@/components/Auth/UserMenu";
import { useState, useEffect } from "react";

export const Header = ({ activeTab, onTabChange }: { activeTab?: string; onTabChange?: (tab: string) => void }) => {
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { unreadCount } = useNotifications();
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
          <img 
            src="/tomati-logo.jpg" 
            alt="Tomati Market Logo" 
            className="w-8 h-8 rounded-full object-cover shadow-sm"
          />
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
            onClick={() => onTabChange?.('search')}
            className={activeTab === 'search' ? 'bg-gray-100' : ''}
          >
            <Search size={20} />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => window.location.href = '/map'}
            title="Carte interactive"
          >
            <MapPin size={20} />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => window.location.href = '/messages'}
            title="Messages"
          >
            <MessageCircle size={20} />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onTabChange?.('notifications')}
            className={`relative ${activeTab === 'notifications' ? 'bg-gray-100' : ''}`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>

          <UserMenu showAdminButton={isAdmin} />
        </div>
      </div>
    </header>
  );
};