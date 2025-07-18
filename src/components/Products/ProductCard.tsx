import { Heart, MapPin, Clock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

interface Product {
  id: string;
  title: string;
  price: string;
  location: string;
  timeAgo: string;
  image?: string;
  isFree?: boolean;
  isReserved?: boolean;
  likes: number;
  category: string;
}

interface ProductCardProps {
  product: Product;
  onLike?: () => void;
  onMessage?: () => void;
  onClick?: () => void;
  className?: string;
}

export const ProductCard = ({ 
  product, 
  onLike, 
  onMessage, 
  onClick,
  className 
}: ProductCardProps) => {
  const { t } = useLanguage();
  
  return (
    <Card 
      className={cn(
        "overflow-hidden hover:shadow-md transition-shadow cursor-pointer w-full min-w-0 flex-shrink-0", 
        className
      )}
      onClick={onClick}
    >
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {/* Product image */}
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/10 flex items-center justify-center">
            <span className="text-muted-foreground text-sm">{product.category}</span>
          </div>
        )}
        
        {/* Status badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          {product.isFree && (
            <Badge className="bg-success text-success-foreground text-xs">Free</Badge>
          )}
          {product.isReserved && (
            <Badge className="bg-info text-info-foreground text-xs">Reserved</Badge>
          )}
        </div>
        
        {/* Like button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm"
          onClick={(e) => {
            e.stopPropagation();
            onLike?.();
          }}
        >
          <Heart size={16} className="text-tomati-red hover:fill-tomati-red transition-all" />
        </Button>
      </div>
      
      <CardContent className="p-3">
        <h3 className="font-medium text-foreground text-sm leading-tight mb-1 line-clamp-2">
          {product.title}
        </h3>
        
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <div className="bg-tomati-red text-white px-2 py-1 rounded text-xs font-medium">
              {product.isFree ? t('free') : t('sold')}
            </div>
            <span className="font-bold text-gray-900 text-sm">
              {product.price}
            </span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Heart size={12} />
            <span className="text-xs">{product.likes}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin size={12} />
            <span className="truncate">{product.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{product.timeAgo}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};