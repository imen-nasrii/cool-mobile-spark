import { Search, Bell, SlidersHorizontal, Languages, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useState, useEffect } from "react";
// Removed Supabase import - admin role checking not implemented yet
import { useNavigate } from "react-router-dom";

export const Header = ({ activeTab, onTabChange }: { activeTab?: string; onTabChange?: (tab: string) => void }) => {
  const { user, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminRole();
  }, [user]);

  const checkAdminRole = async () => {
    if (!user) return;
    
    // Temporarily enable admin access for all authenticated users
    setIsAdmin(true);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="tomati-brand">{t('tomati')}</div>
        </div>
        
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2"
            >
              <Shield size={16} />
              Admin
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLanguage(language === 'fr' ? 'ar' : 'fr')}
            className="flex items-center gap-2"
          >
            <Languages size={16} />
            {language === 'fr' ? 'العربية' : 'Français'}
          </Button>
          
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