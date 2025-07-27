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
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center gap-2">
          <img 
            src="/tomati-logo.jpg" 
            alt="Tomati Market Logo" 
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover shadow-sm"
          />
          <div className="tomati-brand text-sm sm:text-base">{t('tomati')}</div>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
          {/* Language Button - Hidden on small mobile */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLanguage(language === 'fr' ? 'ar' : 'fr')}
            className="hidden sm:flex items-center gap-2 text-xs sm:text-sm px-2 sm:px-3"
          >
            <Languages size={14} />
            <span className="hidden md:inline">
              {language === 'fr' ? 'العربية' : 'Français'}
            </span>
            <span className="md:hidden">
              {language === 'fr' ? 'ع' : 'FR'}
            </span>
          </Button>
          
          {/* Search Button */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onTabChange?.('search')}
            className={`w-8 h-8 sm:w-10 sm:h-10 ${activeTab === 'search' ? 'bg-white border border-gray-300' : ''}`}
          >
            <Search size={16} className="sm:hidden" />
            <Search size={20} className="hidden sm:block" />
          </Button>
          
          {/* Map Button */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => window.location.href = '/map'}
            title="Carte interactive"
            className="w-8 h-8 sm:w-10 sm:h-10"
          >
            <MapPin size={16} className="sm:hidden" />
            <MapPin size={20} className="hidden sm:block" />
          </Button>
          
          {/* Messages Button */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => window.location.href = '/messages'}
            title="Messages"
            className="w-8 h-8 sm:w-10 sm:h-10"
          >
            <MessageCircle size={16} className="sm:hidden" />
            <MessageCircle size={20} className="hidden sm:block" />
          </Button>
          
          {/* Notifications Button */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onTabChange?.('notifications')}
            className={`relative w-8 h-8 sm:w-10 sm:h-10 ${activeTab === 'notifications' ? 'bg-white border border-gray-300' : ''}`}
          >
            <Bell size={16} className="sm:hidden" />
            <Bell size={20} className="hidden sm:block" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
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