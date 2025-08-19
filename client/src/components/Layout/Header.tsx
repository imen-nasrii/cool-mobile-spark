import { Search, Plus, User, LogOut, LogIn, Settings, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { PreferencesDialog } from "@/components/preferences/PreferencesDialog";

interface HeaderProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onSearch?: (query: string) => void;
}

export const Header = ({ activeTab, onTabChange, onSearch }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // If we have a search callback, use it (for home page)
      if (onSearch) {
        onSearch(searchQuery.trim());
      } else {
        // Otherwise navigate to a search results page
        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  const handlePublishAd = () => {
    // Use the onTabChange callback to switch to add tab
    if (onTabChange) {
      onTabChange('add');
    } else {
      // Fallback to navigation
      navigate('/post');
    }
  };

  const handleConnect = () => {
    console.log('Header - handleConnect called, user:', user);
    if (user) {
      console.log('Navigating to /profile');
      navigate('/profile');
    } else {
      console.log('Navigating to /auth');
      navigate('/auth');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de se déconnecter",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="bg-white border-b-2 border-red-500 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <div className="text-3xl font-bold text-red-600">
              tomati
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-4">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="text"
                  placeholder="Rechercher sur tomati"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
            </form>
          </div>
          
          {/* Right Side Buttons */}
          <div className="flex items-center gap-2">
            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-2 rounded font-medium flex items-center gap-2 text-sm"
                  >
                    <User size={16} />
                    <span className="hidden sm:inline">
                      {user.display_name || 'Mon compte'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={handleConnect}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Mon profil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onTabChange?.('add')}>
                    <Plus className="mr-2 h-4 w-4" />
                    <span>Publier une annonce</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onTabChange?.('favorites')}>
                    <Search className="mr-2 h-4 w-4" />
                    <span>Mes favoris</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <PreferencesDialog 
                      trigger={
                        <div className="flex items-center cursor-pointer w-full px-2 py-1.5 hover:bg-gray-100 rounded">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Préférences</span>
                        </div>
                      }
                    />
                  </DropdownMenuItem>
                  {user?.role === 'admin' && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Dashboard Admin</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Se déconnecter</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={handleConnect}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium flex items-center gap-2 text-sm"
              >
                <LogIn size={16} />
                <span>Se connecter</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};