import { Heart, MapPin, Clock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { useState } from "react";

// Format price in TND (Tunisian Dinar)
const formatPrice = (price: string | number) => {
  // Handle null, undefined, or empty values
  if (price === null || price === undefined || price === '') {
    return "Prix non défini";
  }
  
  // Handle "Free" text
  if (typeof price === 'string' && (price.toLowerCase() === 'free' || price.toLowerCase() === 'gratuit')) {
    return "Gratuit";
  }
  
  // Remove currency symbols and clean the price string
  let cleanPrice = typeof price === 'string' ? price.replace(/[€$,\s]/g, '') : price.toString();
  
  const numPrice = Number(cleanPrice);
  
  // Check if the conversion resulted in NaN
  if (isNaN(numPrice)) {
    return "Prix invalide";
  }
  
  if (numPrice === 0) return "Gratuit";
  return `${numPrice.toLocaleString()} TND`;
};

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
        "overflow-hidden glass-card card-3d border-0 modern-shadow hover:modern-shadow-lg transition-all duration-300 cursor-pointer w-full group", 
        className
      )}
      onClick={onClick}
    >
      <div className="relative aspect-square bg-gradient-to-br from-white to-gray-50 overflow-hidden">
        {/* Product image */}
        {(() => {
          const images = (product as any).images ? JSON.parse((product as any).images) : [];
          const mainImage = images.length > 0 ? images[0] : product.image;
          
          if (mainImage) {
            return (
              <img 
                src={mainImage} 
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            );
          } else {
            return (
              <div className="w-full h-full bg-white border border-gray-200 flex items-center justify-center">
                <span className="text-muted-foreground text-xs sm:text-sm">{product.category}</span>
              </div>
            );
          }
        })()}
        
        {/* Status badges */}
        <div className="absolute top-2 left-2 flex gap-2">
          {product.isFree && (
            <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs modern-shadow">
              Gratuit
            </Badge>
          )}
          {product.isReserved && (
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs modern-shadow">
              Réservé
            </Badge>
          )}

        </div>
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      <CardContent className="p-3 sm:p-4 flex-1 flex flex-col justify-between min-h-[120px] sm:min-h-[140px] relative bg-gradient-to-b from-white to-gray-50/50">
        <div>
          <h3 className="font-medium text-foreground text-xs sm:text-sm leading-tight mb-1 sm:mb-2 line-clamp-2">
            {product.title}
          </h3>
          
          <div className="text-sm sm:text-lg font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1 sm:mb-2">
            {product.isFree ? "Gratuit" : formatPrice(product.price)}
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
              className="h-7 w-7 p-0 glass-card border-0 modern-shadow hover:modern-shadow-lg hover:scale-110 transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation();
                handleLike();
              }}
            >
              <Heart 
                size={14} 
                className={`transition-all duration-300 ${
                  isLiked 
                    ? 'text-red-500 fill-red-500 scale-125 drop-shadow-sm' 
                    : 'text-muted-foreground hover:text-red-500'
                }`} 
              />
            </Button>
            <span className="text-xs text-muted-foreground">{likesCount}</span>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 glass-card border-0 modern-shadow hover:modern-shadow-lg hover:scale-110 transition-all duration-300 ml-2"
              onClick={(e) => {
                e.stopPropagation();
                onMessage?.();
              }}
            >
              <MessageCircle size={14} className="text-muted-foreground hover:text-blue-500 transition-colors duration-300" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};