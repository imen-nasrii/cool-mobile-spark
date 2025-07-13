import { Search, Bell, MapPin, Home, MessageSquare, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const Header = () => {
  return (
    <div className="sticky top-0 bg-gradient-tomati backdrop-blur-sm border-b border-border z-40 px-4 py-4">
      <div className="flex items-center gap-3 max-w-md mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
            <div className="w-6 h-6 bg-tomati-green rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-white text-xl tracking-wide">Tomati</span>
            <span className="text-white/80 text-xs">بيع • اشري • اعطي للي يستحق</span>
          </div>
        </div>
        
        {/* Notifications */}
        <div className="ml-auto relative">
          <Button variant="ghost" size="sm" className="p-2 hover:bg-white/20 text-white">
            <Bell size={22} />
            <Badge className="absolute -top-1 -right-1 w-5 h-5 text-xs bg-yellow-400 text-black border-0 animate-pulse">
              3
            </Badge>
          </Button>
        </div>
      </div>
      
      {/* Location */}
      <div className="flex items-center justify-center gap-2 text-white/90 text-sm mt-2 mb-3">
        <MapPin size={16} className="text-white" />
        <span className="font-medium">Ariana, Tunisia</span>
      </div>
      
      {/* Navigation Menu */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <Button variant="ghost" size="sm" className="text-white/90 hover:text-white hover:bg-white/20 rounded-xl px-3 py-2 text-sm font-medium">
          <Home size={16} className="mr-1" />
          Accueil
        </Button>
        <Button variant="ghost" size="sm" className="text-white/90 hover:text-white hover:bg-white/20 rounded-xl px-3 py-2 text-sm font-medium">
          <MessageSquare size={16} className="mr-1" />
          Messages
        </Button>
        <Button variant="ghost" size="sm" className="text-white/90 hover:text-white hover:bg-white/20 rounded-xl px-3 py-2 text-sm font-medium">
          <User size={16} className="mr-1" />
          Profil
        </Button>
        <Button variant="ghost" size="sm" className="text-white/90 hover:text-white hover:bg-white/20 rounded-xl px-3 py-2 text-sm font-medium">
          <Settings size={16} className="mr-1" />
          Paramètres
        </Button>
      </div>
      
      {/* Search Bar */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            placeholder="Search products, cars, furniture..." 
            className="pl-12 pr-4 py-3 rounded-2xl border-0 bg-white/95 backdrop-blur-sm shadow-lg placeholder:text-muted-foreground/70 focus:bg-white focus:shadow-xl transition-all duration-300"
          />
        </div>
      </div>
    </div>
  );
};