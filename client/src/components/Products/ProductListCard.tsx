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

interface ProductListCardProps {
  product: Product;
  onLike?: () => void;
  onMessage?: () => void;
  onClick?: () => void;
  className?: string;
}

export const ProductListCard = ({ 
  product, 
  onLike, 
  onMessage, 
  onClick,
  className 
}: ProductListCardProps) => {
  const { t } = useLanguage();
  
  return (
    <Card 
      className={cn(
        "overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer w-full", 
        className
      )}
      onClick={onClick}
      style={{ fontFamily: 'Arial, sans-serif' }}
    >
      <CardContent className="p-3 flex gap-4">
        {/* Product image - Fixed size on left */}
        <div className="relative w-24 h-24 bg-white overflow-hidden rounded-lg flex-shrink-0">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-white border border-gray-200 flex items-center justify-center">
              <span className="text-muted-foreground text-xs" style={{ fontFamily: 'Arial, sans-serif' }}>{product.category}</span>
            </div>
          )}
          
          {/* Status badges */}
          <div className="absolute top-1 left-1 flex gap-1">
            {product.isFree && (
              <Badge className="bg-success text-success-foreground text-xs" style={{ fontFamily: 'Arial, sans-serif' }}>Free</Badge>
            )}
            {product.isReserved && (
              <Badge className="bg-info text-info-foreground text-xs" style={{ fontFamily: 'Arial, sans-serif' }}>Reserved</Badge>
            )}
          </div>
        </div>
        
        {/* Product details - Takes remaining space */}
        <div className="flex-1 flex flex-col justify-between min-h-[90px]">
          <div>
            <h3 className="font-medium text-foreground text-sm leading-tight mb-1 line-clamp-2" style={{ fontFamily: 'Arial, sans-serif' }}>
              {product.title}
            </h3>
            
            <div className="text-lg font-bold text-primary mb-2" style={{ fontFamily: 'Arial, sans-serif' }}>
              {product.isFree ? "Gratuit" : product.price}
            </div>
            
            <div className="flex items-center text-xs text-muted-foreground mb-2">
              <MapPin size={10} className="mr-1 flex-shrink-0" />
              <span className="truncate" style={{ fontFamily: 'Arial, sans-serif' }}>{product.location}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock size={10} className="mr-1" />
              <span className="truncate" style={{ fontFamily: 'Arial, sans-serif' }}>{product.timeAgo}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onLike?.();
                }}
              >
                <Heart size={12} className="text-muted-foreground hover:text-destructive" />
              </Button>
              <span className="text-xs text-muted-foreground" style={{ fontFamily: 'Arial, sans-serif' }}>{product.likes}</span>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-primary/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onMessage?.();
                }}
              >
                <MessageCircle size={12} className="text-muted-foreground hover:text-primary" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};