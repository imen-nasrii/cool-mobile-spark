import { Heart, MapPin, Clock, MessageCircle } from "lucide-react";
import { formatPrice } from "@/utils/currency";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/hooks/useAuth";
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
  isPromoted?: boolean;
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
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentLikes, setCurrentLikes] = useState(product.likes);

  // Get like status for current user
  const { data: likeStatus } = useQuery({
    queryKey: ['like-status', product.id],
    queryFn: () => apiClient.getLikeStatus(product.id),
    enabled: !!user,
  });

  // Like/Unlike mutation
  const likeMutation = useMutation({
    mutationFn: () => apiClient.toggleLike(product.id),
    onSuccess: (data) => {
      setCurrentLikes(data.likes);
      queryClient.invalidateQueries({ queryKey: ['like-status', product.id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      console.error('Like error:', error);
    }
  });

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      // Could show login modal or redirect to auth
      return;
    }
    likeMutation.mutate();
  };
  
  return (
    <Card 
      className={cn(
        "overflow-hidden hover:shadow-md transition-shadow cursor-pointer w-full flex flex-row", 
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
          {product.isPromoted && (
            <Badge className="bg-orange-500 text-white text-xs animate-pulse">🔥 PUB</Badge>
          )}
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
          
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-tomati-red text-white px-2 py-1 rounded text-xs font-medium">
              {product.isFree ? t('free') : t('sold')}
            </div>
            <span className="font-bold text-gray-900 text-sm">
              {product.isFree ? 'Gratuit' : formatPrice(parseFloat(product.price.replace(/[^\d.-]/g, '') || '0'), product.isFree)}
            </span>
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
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-6 h-6 rounded-full p-0"
              onClick={handleLike}
              disabled={likeMutation.isPending}
            >
              <Heart 
                size={12} 
                className={cn(
                  "transition-all",
                  likeStatus?.isLiked 
                    ? "text-red-500 fill-red-500" 
                    : "text-gray-500 hover:text-red-500 hover:fill-red-500"
                )}
              />
            </Button>
            <span className="text-xs">{currentLikes}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};