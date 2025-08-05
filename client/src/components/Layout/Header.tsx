import { Search, Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { useLocation } from "wouter";

interface HeaderProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onSearch?: (query: string) => void;
}

export const Header = ({ activeTab, onTabChange, onSearch }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // If we have a search callback, use it (for home page)
      if (onSearch) {
        onSearch(searchQuery.trim());
      } else {
        // Otherwise navigate to a search results page
        setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  const handlePublishAd = () => {
    // Use the onTabChange callback to switch to add tab
    if (onTabChange) {
      onTabChange('add');
    } else {
      // Fallback to navigation
      setLocation('/post');
    }
  };

  const handleConnect = () => {
    if (user) {
      setLocation('/profile');
    } else {
      setLocation('/auth');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-red-500">tomati</div>
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
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </form>
          </div>
          
          {/* Right Side Buttons */}
          <div className="flex items-center gap-3">

            
            {/* Se connecter Button */}
            <Button
              onClick={handleConnect}
              variant="outline"
              className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-full font-medium flex items-center gap-2"
            >
              <User size={18} />
              <span className="hidden sm:inline">
                {user ? 'Mon profil' : 'Se connecter'}
              </span>
              <span className="sm:hidden">
                {user ? 'Profil' : 'Login'}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};