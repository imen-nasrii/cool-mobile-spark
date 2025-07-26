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
        "overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer w-full", 
        className
      )}
      onClick={onClick}
    >
      <div className="relative w-24 h-24 bg-muted overflow-hidden flex-shrink-0">
        {/* Product image */}
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/10 flex items-center justify-center">
            <span className="text-muted-foreground text-xs">{product.category}</span>
          </div>
        )}
        
        {/* Status badges */}
        <div className="absolute top-1 left-1 flex gap-1">
          {product.isFree && (
            <Badge className="bg-success text-success-foreground text-xs">Free</Badge>
          )}
          {product.isReserved && (
            <Badge className="bg-info text-info-foreground text-xs">Reserved</Badge>
          )}
        </div>
      </div>
      
      <CardContent className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-medium text-foreground text-sm leading-tight mb-1 line-clamp-2">
            {product.title}
          </h3>
          
          <div className="text-lg font-bold text-primary mb-1">
            {product.isFree ? "Gratuit" : product.price}
          </div>
          
          <div className="flex items-center text-xs text-muted-foreground mb-2">
            <MapPin size={12} className="mr-1" />
            <span className="truncate">{product.location}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock size={12} className="mr-1" />
            <span>{product.timeAgo}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation();
                onLike?.();
              }}
            >
              <Heart size={14} className="text-muted-foreground hover:text-destructive" />
            </Button>
            <span className="text-xs text-muted-foreground">{product.likes}</span>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-primary/10 ml-2"
              onClick={(e) => {
                e.stopPropagation();
                onMessage?.();
              }}
            >
              <MessageCircle size={14} className="text-muted-foreground hover:text-primary" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};