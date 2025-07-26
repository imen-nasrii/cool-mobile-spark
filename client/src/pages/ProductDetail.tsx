import { useState, useEffect } from "react";
import { ArrowLeft, Share, Heart, MessageCircle, Phone, Shield, Star, MapPin, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ImageGallery } from "@/components/UI/ImageGallery";
import { ProductChat } from "@/components/Chat/ProductChat";
import { ProductMap } from "@/components/Map/ProductMap";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient, queryClient } from "@/lib/queryClient";
import { useLanguage } from "@/hooks/useLanguage";

// Default images for products
import teslaImage from "@/assets/tesla-model3.jpg";
import motherboardImage from "@/assets/motherboard-i5.jpg";
import sofaImage from "@/assets/modern-sofa.jpg";
import phoneImage from "@/assets/iphone-15-pro.jpg";
import bikeImage from "@/assets/mountain-bike.jpg";
import tractorImage from "@/assets/tractor-holland.jpg";

interface ProductDetailProps {
  productId?: string | null;
  onBack?: () => void;
  onEdit?: (productId: string) => void;
}

export const ProductDetail = ({ productId, onBack, onEdit }: ProductDetailProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [sellerProfile, setSellerProfile] = useState<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  const defaultImages = [teslaImage, motherboardImage, sofaImage, phoneImage, bikeImage, tractorImage];

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}j`;
    }
  };

  // Use React Query to fetch product
  const { data: productData, isLoading } = useQuery({
    queryKey: ['/products', productId],
    queryFn: () => apiClient.getProduct(productId!),
    enabled: !!productId && productId.trim() !== '',
    staleTime: 5 * 60 * 1000,
  });

  // Check if user has liked this product
  const { data: likedData } = useQuery({
    queryKey: ['/products', productId, 'liked'],
    queryFn: () => apiClient.request(`/products/${productId}/liked`),
    enabled: !!productId && !!user,
    staleTime: 1 * 60 * 1000,
  });

  // Like product mutation
  const likeMutation = useMutation({
    mutationFn: (id: string) => apiClient.request(`/products/${id}/like`, { method: 'POST' }),
    onSuccess: (data: any) => {
      setIsLiked(true);
      toast({
        title: "Succès",
        description: data.message || "Produit ajouté aux favoris",
      });
      // Refetch product to get updated like count
      queryClient.invalidateQueries({ queryKey: ['/products', productId] });
      queryClient.invalidateQueries({ queryKey: ['/products', productId, 'liked'] });
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
    if (productData) {
      setProduct(productData);
      setLoading(false);
      // TODO: Fetch seller profile if needed
      setSellerProfile(null);
    } else if (isLoading) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [productData, isLoading]);

  useEffect(() => {
    if (likedData) {
      setIsLiked(likedData.liked);
    }
  }, [likedData]);

  const handleLike = async () => {
    if (!user || !product) return;
    
    // Toggle like (simplified - in real app you'd have a likes table)
    setIsLiked(!isLiked);
  };

  const isOwner = user?.id === product?.user_id;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="tomati-brand animate-pulse mb-4">Tomati</div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tomati-red mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-4">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Produit introuvable</h2>
          <p className="text-gray-600 mb-4">Ce produit n'existe pas ou a été supprimé</p>
          <Button onClick={onBack}>Retour</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-20 md:pb-0">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 z-40 px-4 py-3">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2 hover:bg-gray-100 rounded-full -ml-2"
            onClick={onBack}
          >
            <ArrowLeft size={20} />
          </Button>
          
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="p-2">
              <Share size={18} />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`p-2 ${isLiked ? "text-red-600" : ""}`}
              onClick={handleLike}
            >
              <Heart size={18} className={isLiked ? "fill-current" : ""} />
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 hover:bg-gray-100 rounded-full"
              onClick={onBack}
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-2xl font-semibold text-foreground">
              Product Details
            </h1>
          </div>
          
          <div className="flex gap-3">
            {isOwner && (
              <Button variant="outline" size="sm" onClick={() => onEdit?.(product.id)}>
                <Edit size={16} />
              </Button>
            )}
            <Button variant="outline" size="sm" className="gap-2">
              <Share size={16} />
              Partager
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className={`gap-2 ${isLiked ? "bg-red-50 border-red-200 text-red-600" : ""}`}
              onClick={handleLike}
            >
              <Heart size={16} className={isLiked ? "fill-current" : ""} />
              {isLiked ? "Aimé" : "J'aime"}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        {/* Mobile Images */}
        <div className="w-full">
          <ImageGallery 
            images={product.image_url ? [product.image_url] : defaultImages.slice(0, 3)} 
            title={product.title}
            className="w-full aspect-square"
          />
        </div>

        {/* Mobile Content */}
        <div className="px-4 py-4 space-y-4">
          {/* Price & Title */}
          <div className="space-y-3">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">{product.title}</h2>
              <div className="flex gap-2 mb-3">
                <Badge variant="secondary">{product.category}</Badge>
                {product.is_free && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Gratuit
                  </Badge>
                )}
                {product.is_reserved && (
                  <Badge variant="outline" className="text-red-600 border-red-600">
                    Réservé
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <MapPin size={14} />
              <span>{product.location}</span>
              <span>•</span>
              <span>{formatTimeAgo(product.created_at)}</span>
            </div>
          </div>

          {/* Description */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold text-foreground mb-3">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description || "Aucune description fournie."}
              </p>
            </CardContent>
          </Card>

          {/* Seller Info */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold text-foreground mb-3">Vendeur</h3>
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {sellerProfile?.display_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-foreground">
                      {sellerProfile?.display_name || 'Utilisateur'}
                    </h4>
                    <Shield size={16} className="text-success" />
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                    <span>4.8</span>
                    <span>•</span>
                    <span>Vérifié</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Map */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-3">Localisation</h3>
              <ProductMap location={product.location} readonly className="w-full h-48" />
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-primary">{product.likes}</div>
                  <div className="text-xs text-muted-foreground">J'aime</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-primary">-</div>
                  <div className="text-xs text-muted-foreground">Vues</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-primary">-</div>
                  <div className="text-xs text-muted-foreground">Note</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chat Mobile */}
          {showChat && !isOwner && (
            <Card>
              <CardContent className="p-4">
                <ProductChat
                  productId={product.id}
                  sellerId={product.user_id}
                  onClose={() => setShowChat(false)}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Desktop Layout - 2 Column Grid */}
      <div className="hidden md:block max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Images */}
          <div className="space-y-6">
            <ImageGallery 
              images={product.image_url ? [product.image_url] : defaultImages.slice(0, 3)} 
              title={product.title}
              className="rounded-2xl shadow-xl w-full"
            />
            
            {/* Quick Stats Card */}
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{product.likes}</div>
                    <div className="text-sm text-muted-foreground">J'aime</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">-</div>
                    <div className="text-sm text-muted-foreground">Vues</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">-</div>
                    <div className="text-sm text-muted-foreground">Note</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map */}
            <Card className="glass-card">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Localisation</h3>
                <ProductMap location={product.location} readonly className="w-full" />
              </CardContent>
            </Card>

            {/* Chat */}
            {showChat && !isOwner && (
              <Card className="glass-card">
                <CardContent className="p-6">
                  <ProductChat
                    productId={product.id}
                    sellerId={product.user_id}
                    onClose={() => setShowChat(false)}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Product Details */}
          <div className="space-y-6">
            {/* Price & Title */}
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-2">{product.title}</h2>
                    <Badge variant="secondary" className="mb-4">{product.category}</Badge>
                    {product.is_free && (
                      <Badge variant="outline" className="mb-4 ml-2 text-green-600 border-green-600">
                        Gratuit
                      </Badge>
                    )}
                    {product.is_reserved && (
                      <Badge variant="outline" className="mb-4 ml-2 text-red-600 border-red-600">
                        Réservé
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-primary">{product.price}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin size={16} />
                    <span className="text-base">{product.location}</span>
                    <span>•</span>
                    <span>{formatTimeAgo(product.created_at)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="glass-card">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-4">Description</h3>
                <p className="text-muted-foreground leading-relaxed text-base mb-6">
                  {product.description || "Aucune description fournie."}
                </p>
              </CardContent>
            </Card>

            {/* Seller Info */}
            <Card className="glass-card">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-4">Informations vendeur</h3>
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium text-xl">
                      {sellerProfile?.display_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-lg font-semibold text-foreground">
                        {sellerProfile?.display_name || 'Utilisateur'}
                      </h4>
                      <Shield size={18} className="text-success" />
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Star size={14} className="text-yellow-500 fill-yellow-500" />
                      <span>4.8</span>
                      <span>•</span>
                      <span>Membre vérifié</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Membre depuis {new Date(sellerProfile?.created_at || '').getFullYear()}
                    </p>
                  </div>
                  
                  <Button variant="outline" className="border-primary/20 text-primary hover:bg-primary/10">
                    Voir profil
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            {!isOwner && (
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="flex-1 border-primary/20 text-primary hover:bg-primary/10 h-14 text-lg"
                >
                  <Phone size={20} className="mr-2" />
                  Appeler
                </Button>
                <Button 
                  size="lg" 
                  className="flex-1 bg-primary hover:bg-primary/90 text-white h-14 text-lg"
                  onClick={() => setShowChat(true)}
                >
                  <MessageCircle size={20} className="mr-2" />
                  Envoyer message
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Fixed Bottom Bar */}
      {!isOwner && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-2xl font-bold text-primary">{product.price}</div>
              <div className="text-xs text-muted-foreground">Prix</div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="px-4 py-2"
            >
              <Phone size={16} className="mr-1" />
              Appeler
            </Button>
            <Button 
              size="sm"
              className="bg-primary text-white px-4 py-2"
              onClick={() => setShowChat(true)}
            >
              <MessageCircle size={16} className="mr-1" />
              Message
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};