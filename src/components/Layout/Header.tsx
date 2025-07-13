import { Search, Bell, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const Header = () => {
  return (
    <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border z-40 px-4 py-3">
      <div className="flex items-center gap-3 max-w-md mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <span className="font-bold text-primary text-lg">Tomati</span>
        </div>
        
        {/* Location */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin size={14} />
          <span>Ariana, Tunisia</span>
        </div>
        
        {/* Notifications */}
        <div className="ml-auto relative">
          <Button variant="ghost" size="sm" className="p-2">
            <Bell size={20} />
            <Badge className="absolute -top-1 -right-1 w-5 h-5 text-xs bg-accent border-0">
              3
            </Badge>
          </Button>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="mt-3 max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            placeholder="Search products, cars, furniture..." 
            className="pl-10 pr-4 py-2 rounded-xl border-muted"
          />
        </div>
      </div>
    </div>
  );
};