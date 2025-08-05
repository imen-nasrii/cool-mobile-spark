import { Search, Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

export const Header = ({ activeTab, onTabChange }: { activeTab?: string; onTabChange?: (tab: string) => void }) => {
  const { user, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search functionality here
    console.log("Searching for:", searchQuery);
  };

  const handlePublishAd = () => {
    window.location.href = '/post';
  };

  const handleConnect = () => {
    if (user) {
      // User is logged in, show profile menu or logout
      window.location.href = '/profile';
    } else {
      // User is not logged in, redirect to login
      window.location.href = '/auth';
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
            {/* Publier une annonce Button */}
            <Button
              onClick={handlePublishAd}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full font-medium flex items-center gap-2"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Publier une annonce</span>
              <span className="sm:hidden">Publier</span>
            </Button>
            
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