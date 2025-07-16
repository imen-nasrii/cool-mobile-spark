import { Search, Bell, MapPin, Home, MessageSquare, Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const Header = ({ activeTab, onTabChange }: { activeTab?: string; onTabChange?: (tab: string) => void }) => {
  return (
    <header className="sticky top-0 bg-gradient-hero backdrop-blur-sm border-b border-white/20 z-40">
      <div className="container mx-auto px-4 py-2 md:py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 glass-card flex items-center justify-center shadow-tomati">
              <div className="w-5 h-5 md:w-7 md:h-7 bg-tomati-green rounded-full flex items-center justify-center shadow-glow">
                <div className="w-3 h-3 md:w-4 md:h-4 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white text-lg md:text-xl tracking-wide font-poppins">Tomati</span>
              <span className="hidden md:block text-white/80 text-xs font-inter">بيع • اشري • اعطي للي يستحق</span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onTabChange?.("home")}
              className={`flex items-center gap-2 hover:text-white hover:bg-white/20 rounded-xl px-4 py-2 transition-all duration-300 ${
                activeTab === "home" 
                  ? "text-white glass shadow-tomati" 
                  : "text-white/70"
              }`}
            >
              <Home size={18} />
              <span className="font-medium font-inter">Home</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onTabChange?.("search")}
              className={`flex items-center gap-2 hover:text-white hover:bg-white/20 rounded-xl px-4 py-2 transition-all duration-300 ${
                activeTab === "search" 
                  ? "text-white glass shadow-tomati" 
                  : "text-white/70"
              }`}
            >
              <Search size={18} />
              <span className="font-medium font-inter">Search</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onTabChange?.("add")}
              className={`flex items-center gap-2 hover:text-white hover:bg-white/20 rounded-xl px-4 py-2 transition-all duration-300 ${
                activeTab === "add" 
                  ? "text-white bg-gradient-accent shadow-glow" 
                  : "text-white bg-gradient-accent/60"
              }`}
            >
              <Plus size={18} />
              <span className="font-medium font-inter">Add Product</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onTabChange?.("messages")}
              className={`flex items-center gap-2 hover:text-white hover:bg-white/20 rounded-xl px-4 py-2 transition-all duration-300 ${
                activeTab === "messages" 
                  ? "text-white glass shadow-tomati" 
                  : "text-white/70"
              }`}
            >
              <MessageSquare size={18} />
              <span className="font-medium font-inter">Messages</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onTabChange?.("profile")}
              className={`flex items-center gap-2 hover:text-white hover:bg-white/20 rounded-xl px-4 py-2 transition-all duration-300 ${
                activeTab === "profile" 
                  ? "text-white glass shadow-tomati" 
                  : "text-white/70"
              }`}
            >
              <User size={18} />
              <span className="font-medium font-inter">Profile</span>
            </Button>
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Search Bar - Desktop */}
            <div className="hidden lg:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input 
                  placeholder="Search products..." 
                  className="pl-10 pr-4 py-2 w-64 rounded-xl border-0 glass shadow-medium placeholder:text-muted-foreground/70 focus:shadow-glow transition-all duration-300 font-inter"
                />
              </div>
            </div>

            {/* Location */}
            <div className="hidden md:flex items-center gap-2 text-white/90 text-sm">
              <MapPin size={16} className="text-white" />
              <span className="font-medium font-inter">Ariana, Tunisia</span>
            </div>
            
            {/* Notifications */}
            <div className="relative">
              <Button variant="ghost" size="sm" className="p-1.5 md:p-2 hover:bg-white/20 text-white glass rounded-xl transition-all duration-300">
                <Bell size={18} className="md:w-5 md:h-5" />
                <Badge className="absolute -top-1 -right-1 w-5 h-5 text-xs bg-gradient-accent text-white border-0 rounded-full">
                  3
                </Badge>
              </Button>
            </div>
          </div>
        </div>


        {/* Mobile Search Bar */}
        <div className="lg:hidden mt-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <Input 
              placeholder="Rechercher..." 
              className="pl-10 pr-4 py-2 rounded-xl border-0 glass shadow-medium placeholder:text-muted-foreground/70 focus:shadow-glow transition-all duration-300 font-inter"
            />
          </div>
        </div>
      </div>
    </header>
  );
};