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
    <header className="glass-card border-0 border-b border-white/20 sticky top-0 z-40 modern-shadow-lg backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="text-3xl font-black bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent drop-shadow-lg">
              tomati
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-4">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="text"
                  placeholder="Rechercher sur tomati"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full glass-card border-0 rounded-full modern-shadow focus:outline-none focus:ring-2 focus:ring-blue-400 focus:modern-shadow-lg transition-all duration-300"
                />
              </div>
            </form>
          </div>
          
          {/* Right Side Buttons */}
          <div className="flex items-center gap-3">

            
            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="glass-card border-0 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 px-4 py-2 rounded-full font-medium flex items-center gap-2 modern-shadow hover:modern-shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <User size={18} />
                    <span className="hidden sm:inline">
                      {user.display_name || 'Mon profil'}
                    </span>
                    <span className="sm:hidden">Profil</span>
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
                variant="outline"
                className="glass-card border-0 bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 px-4 py-2 rounded-full font-medium flex items-center gap-2 modern-shadow hover:modern-shadow-lg transition-all duration-300 hover:scale-105"
              >
                <LogIn size={18} />
                <span className="hidden sm:inline">Se connecter</span>
                <span className="sm:hidden">Login</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};