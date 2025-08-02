import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient, queryClient } from "@/lib/queryClient";

interface LikeButtonProps {
  productId: string;
  initialLikeCount?: number;
  isPromoted?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'outline';
  showCount?: boolean;
  showPromotedBadge?: boolean;
  className?: string;
}

export const LikeButton = ({ 
  productId, 
  initialLikeCount = 0, 
  isPromoted = false,
  size = 'md', 
  variant = 'outline',
  showCount = true,
  showPromotedBadge = true,
  className = "" 
}: LikeButtonProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isAnimating, setIsAnimating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Check if user has liked this product
  const { data: likedData } = useQuery({
    queryKey: ['/products', productId, 'liked'],
    queryFn: () => apiClient.request(`/products/${productId}/liked`),
    enabled: !!productId && !!user,
    staleTime: 1 * 60 * 1000,
  });

  // Fetch current product data for like count
  const { data: productData } = useQuery({
    queryKey: ['/products', productId],
    queryFn: () => apiClient.request(`/products/${productId}`),
    enabled: !!productId,
    staleTime: 2 * 60 * 1000,
  });

  // Like product mutation
  const likeMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Like mutation called for product:', id);
      const token = localStorage.getItem('authToken');
      console.log('Token for like request:', token ? `Present (${token.substring(0, 20)}...)` : 'Missing');
      
      // Direct fetch to ensure token is sent
      const response = await fetch(`/api/products/${id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || 'Request failed');
      }
      
      return response.json();
    },
    onSuccess: (data: any) => {
      setIsLiked(true);
      setLikeCount(data.newLikeCount || likeCount + 1);
      setIsAnimating(true);
      
      // Show success message
      toast({
        title: "Produit aimé !",
        description: data.message || "Produit ajouté à vos favoris",
      });

      // Show promotion notification if product was promoted
      if (data.wasPromoted) {
        setTimeout(() => {
          toast({
            title: "🎉 Produit promu !",
            description: "Ce produit est maintenant en tendance grâce à vos likes !",
            duration: 5000,
          });
        }, 1000);
      }

      // Reset animation after delay
      setTimeout(() => setIsAnimating(false), 600);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['/products', productId] });
      queryClient.invalidateQueries({ queryKey: ['/products', productId, 'liked'] });
      queryClient.invalidateQueries({ queryKey: ['/products/promoted'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'aimer ce produit",
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    if (likedData) {
      setIsLiked(likedData.liked);
    }
  }, [likedData]);

  useEffect(() => {
    if (productData) {
      setLikeCount(productData.like_count || 0);
    }
  }, [productData]);

  const handleLike = async () => {
    console.log('=== LIKE BUTTON CLICKED ===');
    console.log('User state:', user ? 'Logged in' : 'Not logged in');
    console.log('Product ID:', productId);
    
    if (!user) {
      console.log('No user, showing toast');
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour aimer des produits",
        variant: "destructive"
      });
      return;
    }

    if (isLiked) {
      console.log('Already liked, showing toast');
      toast({
        title: "Déjà aimé",
        description: "Vous avez déjà aimé ce produit",
        variant: "default"
      });
      return;
    }

    if (likeMutation.isPending) {
      console.log('Mutation already pending, return');
      return;
    }

    console.log('Proceeding with like...');
    likeMutation.mutate(productId);
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return "h-8 px-2 text-sm";
      case 'lg':
        return "h-12 px-6 text-lg";
      default:
        return "h-10 px-4";
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 14;
      case 'lg':
        return 20;
      default:
        return 16;
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant={isLiked ? "default" : variant}
        size="sm"
        onClick={handleLike}
        disabled={likeMutation.isPending}
        className={`
          ${getSizeStyles()} 
          ${isLiked 
            ? "bg-red-500 hover:bg-red-600 text-white border-red-500" 
            : "hover:bg-red-50 hover:border-red-200 hover:text-red-600"
          }
          ${isAnimating ? "animate-pulse scale-110" : ""}
          transition-all duration-300 flex items-center gap-1
        `}
      >
        <Heart 
          size={getIconSize()} 
          className={`
            ${isLiked ? "fill-current" : ""} 
            ${isAnimating ? "animate-bounce" : ""}
            transition-all duration-300
          `} 
        />
        {showCount && (
          <span className={`${size === 'sm' ? 'text-xs' : 'text-sm'} font-medium`}>
            {likeMutation.isPending ? "..." : likeCount}
          </span>
        )}
      </Button>

      {showPromotedBadge && isPromoted && (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <TrendingUp size={12} className="mr-1" />
          Tendance
        </Badge>
      )}

      {/* Like milestone indicators */}
      {likeCount > 0 && showCount && (
        <div className="flex items-center gap-1">
          {likeCount >= 10 && (
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
              🔥 Populaire
            </Badge>
          )}
          {likeCount >= 25 && (
            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
              ⭐ Top
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};