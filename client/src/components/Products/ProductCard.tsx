import { Heart, MapPin, Clock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { useState } from "react";

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
  isLiked?: boolean;
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
  const [isLiked, setIsLiked] = useState(product.isLiked || false);
  const [likesCount, setLikesCount] = useState(product.likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    onLike?.();
  };
  
  return (
    <Card 
      className={cn(
        "overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer w-full", 
        className
      )}
      onClick={onClick}
    >
      <div className="relative aspect-square bg-white overflow-hidden">
        {/* Product image */}
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-white border border-gray-200 flex items-center justify-center">
            <span className="text-muted-foreground text-xs sm:text-sm">{product.category}</span>
          </div>
        )}
        
        {/* Status badges */}
        <div className="absolute top-1 sm:top-2 left-1 sm:left-2 flex gap-1">
          {product.isFree && (
            <Badge className="bg-success text-success-foreground text-xs">Free</Badge>
          )}
          {product.isReserved && (
            <Badge className="bg-info text-info-foreground text-xs">Reserved</Badge>
          )}
        </div>
      </div>
      
      <CardContent className="p-2 sm:p-3 flex-1 flex flex-col justify-between min-h-[120px] sm:min-h-[140px]">
        <div>
          <h3 className="font-medium text-foreground text-xs sm:text-sm leading-tight mb-1 sm:mb-2 line-clamp-2">
            {product.title}
          </h3>
          
          <div className="text-sm sm:text-lg font-bold text-primary mb-1 sm:mb-2">
            {product.isFree ? "Gratuit" : product.price}
          </div>
          
          <div className="flex items-center text-xs text-muted-foreground mb-2">
            <MapPin size={10} className="mr-1 flex-shrink-0" />
            <span className="truncate">{product.location}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-auto pt-1 sm:pt-2">
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock size={10} className="mr-1" />
            <span className="truncate">{product.timeAgo}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 sm:h-7 sm:w-7 p-0 hover:bg-destructive/10 transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                handleLike();
              }}
            >
              <Heart 
                size={12} 
                className={`transition-all duration-200 ${
                  isLiked 
                    ? 'text-red-500 fill-red-500 scale-110' 
                    : 'text-muted-foreground hover:text-red-500'
                }`} 
              />
            </Button>
            <span className="text-xs text-muted-foreground">{likesCount}</span>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 sm:h-7 sm:w-7 p-0 hover:bg-primary/10 ml-1 sm:ml-2"
              onClick={(e) => {
                e.stopPropagation();
                onMessage?.();
              }}
            >
              <MessageCircle size={12} className="text-muted-foreground hover:text-primary" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};