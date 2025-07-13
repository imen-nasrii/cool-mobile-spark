import { Search, Bell, MapPin, Home, MessageSquare, Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const Header = ({ activeTab, onTabChange }: { activeTab?: string; onTabChange?: (tab: string) => void }) => {
  return (
    <div className="sticky top-0 bg-gradient-hero backdrop-blur-sm border-b border-white/20 z-40 px-4 py-4">
      <div className="flex items-center gap-3 max-w-md mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 glass-card flex items-center justify-center shadow-tomati">
            <div className="w-7 h-7 bg-tomati-green rounded-full flex items-center justify-center shadow-glow">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-white text-xl tracking-wide font-poppins">Tomati</span>
            <span className="text-white/80 text-xs font-inter">بيع • اشري • اعطي للي يستحق</span>
          </div>
        </div>
        
        {/* Notifications */}
        <div className="ml-auto relative">
          <Button variant="ghost" size="sm" className="p-2 hover:bg-white/20 text-white glass rounded-xl transition-all duration-300">
            <Bell size={22} />
            <Badge className="absolute -top-1 -right-1 w-5 h-5 text-xs bg-gradient-accent text-white border-0 rounded-full">
              3
            </Badge>
          </Button>
        </div>
      </div>
      
      {/* Location */}
      <div className="flex items-center justify-center gap-2 text-white/90 text-sm mt-2 mb-3">
        <MapPin size={16} className="text-white" />
        <span className="font-medium font-inter">Ariana, Tunisia</span>
      </div>
      
      {/* Top Navigation Menu */}
      <div className="flex items-center justify-center gap-2 mb-4 px-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onTabChange?.("home")}
          className={`flex flex-col items-center gap-1 hover:text-white hover:bg-white/20 rounded-xl px-3 py-2 min-w-0 transition-all duration-300 ${
            activeTab === "home" 
              ? "text-white glass shadow-tomati" 
              : "text-white/70"
          }`}
        >
          <Home size={18} />
          <span className="text-xs font-medium font-inter">Home</span>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onTabChange?.("search")}
          className={`flex flex-col items-center gap-1 hover:text-white hover:bg-white/20 rounded-xl px-3 py-2 min-w-0 transition-all duration-300 ${
            activeTab === "search" 
              ? "text-white glass shadow-tomati" 
              : "text-white/70"
          }`}
        >
          <Search size={18} />
          <span className="text-xs font-medium font-inter">Search</span>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onTabChange?.("add")}
          className={`flex flex-col items-center gap-1 hover:text-white hover:bg-white/20 rounded-xl px-3 py-2 min-w-0 transition-all duration-300 ${
            activeTab === "add" 
              ? "text-white bg-gradient-accent shadow-glow" 
              : "text-white bg-gradient-accent/60"
          }`}
        >
          <Plus size={18} />
          <span className="text-xs font-medium font-inter">Add</span>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onTabChange?.("messages")}
          className={`flex flex-col items-center gap-1 hover:text-white hover:bg-white/20 rounded-xl px-3 py-2 min-w-0 transition-all duration-300 ${
            activeTab === "messages" 
              ? "text-white glass shadow-tomati" 
              : "text-white/70"
          }`}
        >
          <MessageSquare size={18} />
          <span className="text-xs font-medium font-inter">Messages</span>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onTabChange?.("profile")}
          className={`flex flex-col items-center gap-1 hover:text-white hover:bg-white/20 rounded-xl px-3 py-2 min-w-0 transition-all duration-300 ${
            activeTab === "profile" 
              ? "text-white glass shadow-tomati" 
              : "text-white/70"
          }`}
        >
          <User size={18} />
          <span className="text-xs font-medium font-inter">Profile</span>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            placeholder="Search products, cars, furniture..." 
            className="pl-12 pr-4 py-3 rounded-2xl border-0 glass shadow-medium placeholder:text-muted-foreground/70 focus:shadow-glow transition-all duration-300 font-inter"
          />
        </div>
      </div>
    </div>
  );
};