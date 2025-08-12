import { useState, useEffect } from "react";
import { ArrowLeft, Share, Heart, MessageCircle, Phone, Shield, Star, MapPin, Edit, Trash2, X, Car, Fuel, Settings, Calendar, Gauge, Users, Home, Briefcase, GraduationCap, DollarSign, MapPinIcon, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageGallery } from "@/components/UI/ImageGallery";
import { ProductChat } from "@/components/Chat/ProductChat";
import { ProductMap } from "@/components/Map/ProductMap";
import { LikeButton } from "@/components/Likes/LikeButton";
import { AdBanner } from "@/components/Ads/AdBanner";
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
  const [showSellerProfile, setShowSellerProfile] = useState(false);
  const [sellerProfile, setSellerProfile] = useState<any>(null);
  const [userRating, setUserRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
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

  const formatPrice = (price: string) => {
    if (!price) return '';
    // Remove any existing currency symbols
    const cleanPrice = price.replace(/[€$TND]/g, '').trim();
    return `${cleanPrice} TND`;
  };

  // Use React Query to fetch product
  const { data: productData, isLoading } = useQuery({
    queryKey: ['/products', productId],
    queryFn: () => apiClient.getProduct(productId!),
    enabled: !!productId && productId.trim() !== '',
    staleTime: 5 * 60 * 1000,
  });

  // Fetch seller profile when product is loaded
  const { data: sellerData } = useQuery({
    queryKey: ['/users', productData?.user_id, 'profile'],
    queryFn: () => apiClient.request(`/users/${productData?.user_id}/profile`),
    enabled: !!productData?.user_id,
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
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('authToken');
      console.log('ProductDetail like - Token:', token ? `Present (${token.substring(0, 20)}...)` : 'Missing');
      
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

  const rateProductMutation = useMutation({
    mutationFn: async ({ productId, rating }: { productId: string; rating: number }) => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/products/${productId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to rate product');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      setUserRating(variables.rating);
      toast({
        title: "Note enregistrée",
        description: `Vous avez donné ${variables.rating} étoile${variables.rating > 1 ? 's' : ''} à ce produit.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/products', productId] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'enregistrer votre note",
        variant: "destructive",
      });
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete product');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Produit supprimé",
        description: "Votre produit a été supprimé avec succès",
      });
      // Go back to main page
      onBack?.();
      // Invalidate products cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le produit",
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    if (productData) {
      setProduct(productData);
      setLoading(false);
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

  useEffect(() => {
    if (sellerData) {
      setSellerProfile(sellerData);
    }
  }, [sellerData]);

  const handleRating = (rating: number) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour noter ce produit.",
        variant: "destructive",
      });
      return;
    }

    if (productId) {
      rateProductMutation.mutate({ productId, rating });
    }
  };

  const handleShare = async () => {
    if (!product) return;
    
    const shareData = {
      title: product.title,
      text: `${product.title} - ${product.price}`,
      url: window.location.href,
    };
    
    try {
      // Try using Web Share API first (mobile/modern browsers)
      if (navigator.share) {
        await navigator.share(shareData);
        toast({
          title: "Partagé",
          description: "Le produit a été partagé avec succès",
        });
      } else {
        // Fallback: copy to clipboard
        try {
          await navigator.clipboard.writeText(window.location.href);
          toast({
            title: "Lien copié",
            description: "Le lien du produit a été copié dans le presse-papiers",
          });
        } catch (clipboardError) {
          // Fallback pour HTTP (non-HTTPS)
          const textArea = document.createElement('textarea');
          textArea.value = window.location.href;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          toast({
            title: "Lien copié",
            description: "Le lien du produit a été copié dans le presse-papiers",
          });
        }
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Erreur",
        description: "Impossible de partager ce produit",
        variant: "destructive"
      });
    }
  };

  const handleLike = async () => {
    if (!user || !product) return;
    
    if (isLiked) {
      toast({
        title: "Information",
        description: "Vous avez déjà aimé ce produit",
        variant: "default"
      });
      return;
    }
    
    likeMutation.mutate(product.id);
  };

  const handleDelete = () => {
    if (!user || !product) return;
    
    if (confirm("Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.")) {
      deleteProductMutation.mutate(product.id);
    }
  };

  const isOwner = user?.id === product?.user_id;

  // Function to render product details with icons based on category
  const renderProductDetails = () => {
    if (!product) return null;

    const category = product.category?.toLowerCase();
    
    // Car details with complete equipment system
    console.log('Category check:', category, 'Product category:', product.category, 'Product ID:', product.id, 'Car details:', {
      brand: product.car_brand, model: product.car_model, year: product.car_year, fuel_type: product.car_fuel_type
    });
    if (category === 'voitures' || category === 'véhicules' || category === 'voiture') {
      const carDetails = [
        { icon: Calendar, label: 'Année', value: product.car_year, color: 'text-green-600' },
        { icon: Gauge, label: 'Kilométrage', value: product.car_mileage ? `${Number(product.car_mileage).toLocaleString()} km` : null, color: 'text-orange-600' }
      ].filter(detail => detail.value);

      // Complete equipment list with icons (black if available, gray if not)
      // Get equipment array from car_equipment field (parse JSON string)
      let selectedEquipment = [];
      try {
        selectedEquipment = product.car_equipment ? JSON.parse(product.car_equipment) : [];
      } catch (error) {
        console.error('Error parsing car_equipment:', error);
        selectedEquipment = [];
      }
      console.log('Equipment from database:', selectedEquipment);
      
      const equipmentList = [
        { key: 'seats_ventilated', icon: '🪑', label: 'Sièges ventilés', available: selectedEquipment.includes('seats_ventilated') },
        { key: 'steering_heated', icon: '🔥', label: 'Volant chauffant', available: selectedEquipment.includes('steering_heated') },
        { key: 'navigation', icon: '🧭', label: 'Navigation', available: selectedEquipment.includes('navigation') },
        { key: 'speed_regulator', icon: '⏱️', label: 'Régulateur de vitesse', available: selectedEquipment.includes('speed_regulator') },
        { key: 'parking_sensors', icon: '📡', label: 'Capteurs stationnement', available: selectedEquipment.includes('parking_sensors') },
        { key: 'camera_rear', icon: '📹', label: 'Caméra arrière', available: selectedEquipment.includes('camera_rear') },
        { key: 'traffic_aid', icon: '🛡️', label: 'Aide trafic transversal', available: selectedEquipment.includes('traffic_aid') },
        { key: 'emergency_brake', icon: '🛑', label: 'Freinage d\'urgence', available: selectedEquipment.includes('emergency_brake') },
        { key: 'view_360', icon: '👁️', label: 'Vue 360°', available: selectedEquipment.includes('view_360') },
        { key: 'voice_alert', icon: '🛣️', label: 'Avertissement voie', available: selectedEquipment.includes('voice_alert') },
        { key: 'roof_opening', icon: '☀️', label: 'Toit ouvrant', available: selectedEquipment.includes('roof_opening') },
        { key: 'smoking_allowed', icon: '🚭', label: 'Fumeur autorisé', available: selectedEquipment.includes('smoking_allowed') }
      ];

      console.log('Car details found:', carDetails.length, carDetails);

      return (
        <div className="space-y-4">


          {/* Equipment section with all features */}
          <Card className="glass-card">
            <CardContent className="p-4 md:p-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-4" style={{ fontFamily: 'Arial, sans-serif' }}>
                Équipements disponibles
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {equipmentList.map((equipment) => (
                  <div 
                    key={equipment.key} 
                    className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                      equipment.available 
                        ? 'bg-green-50 border-green-200 text-green-800' 
                        : 'bg-gray-50 border-gray-200 text-gray-500'
                    }`}
                  >
                    <span 
                      className="text-lg"
                      style={{ 
                        filter: equipment.available ? 'none' : 'grayscale(100%) brightness(0.7)',
                        color: equipment.available ? '#000' : '#999'
                      }}
                    >
                      {equipment.icon}
                    </span>
                    <span className="text-xs font-medium" style={{ fontFamily: 'Arial, sans-serif' }}>
                      {equipment.label}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Real Estate details
    if (category === 'immobilier' || category === 'logement') {
      const realEstateDetails = [
        { icon: Home, label: 'Type', value: product.property_type },
        { icon: Users, label: 'Chambres', value: product.rooms ? `${product.rooms} pièces` : null },
        { icon: Users, label: 'Salles de bain', value: product.bathrooms },
        { icon: Layers, label: 'Surface', value: product.surface ? `${product.surface} m²` : null },
        { icon: Layers, label: 'Étage', value: product.floor },
        { icon: Car, label: 'Parking', value: product.parking ? 'Oui' : 'Non' },
        { icon: Layers, label: 'Jardin', value: product.garden ? 'Oui' : 'Non' },
        { icon: Home, label: 'Balcon', value: product.balcony ? 'Oui' : 'Non' }
      ].filter(detail => detail.value);

      if (realEstateDetails.length === 0) return null;

      return (
        <Card className="glass-card">
          <CardContent className="p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-semibold text-foreground mb-4" style={{ fontFamily: 'Arial, sans-serif' }}>
              Caractéristiques du bien
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {realEstateDetails.map((detail, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                  <detail.icon size={18} className="text-primary flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-sm text-muted-foreground" style={{ fontFamily: 'Arial, sans-serif' }}>
                      {detail.label}
                    </span>
                    <div className="text-sm font-medium text-foreground" style={{ fontFamily: 'Arial, sans-serif' }}>
                      {detail.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    // Job details
    if (category === 'emploi' || category === 'travail' || category === 'job') {
      const jobDetails = [
        { icon: Briefcase, label: 'Type de contrat', value: product.contract_type },
        { icon: Layers, label: 'Secteur', value: product.sector },
        { icon: Star, label: 'Expérience', value: product.experience_level },
        { icon: GraduationCap, label: 'Formation', value: product.education_level },
        { icon: DollarSign, label: 'Salaire', value: product.salary_range },
        { icon: Home, label: 'Télétravail', value: product.remote_work ? 'Possible' : 'Non' },
        { icon: Briefcase, label: 'Entreprise', value: product.company }
      ].filter(detail => detail.value);

      if (jobDetails.length === 0) return null;

      return (
        <Card className="glass-card">
          <CardContent className="p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-semibold text-foreground mb-4" style={{ fontFamily: 'Arial, sans-serif' }}>
              Détails de l'offre d'emploi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {jobDetails.map((detail, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                  <detail.icon size={18} className="text-primary flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-sm text-muted-foreground" style={{ fontFamily: 'Arial, sans-serif' }}>
                      {detail.label}
                    </span>
                    <div className="text-sm font-medium text-foreground" style={{ fontFamily: 'Arial, sans-serif' }}>
                      {detail.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Produit introuvable</h2>
          <p className="text-gray-600 mb-4">Ce produit n'existe pas ou a été supprimé</p>
          <Button onClick={onBack}>Retour</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-20 md:pb-0 tomati-font-override">
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
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 hover:bg-blue-50 hover:text-blue-600"
              onClick={handleShare}
            >
              <Share size={18} />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`p-2 hover:bg-red-50 ${isLiked ? "text-red-600" : "hover:text-red-600"}`}
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
              <>
                <Button variant="outline" size="sm" onClick={() => onEdit?.(product.id)}>
                  <Edit size={16} />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDelete}
                  disabled={deleteProductMutation.isPending}
                  className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                >
                  <Trash2 size={16} />
                </Button>
              </>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 hover:bg-blue-50 hover:text-blue-600"
              onClick={handleShare}
            >
              <Share size={16} />
              Partager
            </Button>
            <LikeButton 
              productId={product.id}
              initialLikeCount={product.like_count || 0}
              isPromoted={product.is_promoted}
              size="md"
              variant="outline"
              showCount={true}
              showPromotedBadge={true}
            />
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        {/* Mobile Images */}
        <div className="w-full">
          <ImageGallery 
            images={(() => {
              const images = (product as any).images ? JSON.parse((product as any).images) : [];
              return images.length > 0 ? images : (product.image_url ? [product.image_url] : defaultImages.slice(0, 3));
            })()} 
            title={product.title}
            className="w-full aspect-square"
          />
        </div>

        {/* Mobile Content */}
        <div className="px-4 py-4 space-y-4">
          {/* Price & Title */}
          <div className="space-y-3">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: 'Arial, sans-serif' }}>{product.title}</h2>
              <div className="text-2xl font-bold text-primary mb-3" style={{ fontFamily: 'Arial, sans-serif' }}>
                {product.is_free ? 'Gratuit' : formatPrice(product.price)}
              </div>
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

          {/* Product Details with Icons */}
          {renderProductDetails()}

          {/* Description with Car Details */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: 'Arial, sans-serif' }}>Description</h3>

              
              <p className="text-muted-foreground leading-relaxed" style={{ fontFamily: 'Arial, sans-serif' }}>
                {product.description || "Aucune description fournie."}
              </p>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-primary">{product.like_count || 0}</div>
                  <div className="text-xs text-muted-foreground" style={{ fontFamily: 'Arial, sans-serif' }}>J'aime</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-primary">{product.view_count || 0}</div>
                  <div className="text-xs text-muted-foreground" style={{ fontFamily: 'Arial, sans-serif' }}>Vues</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-primary">
                    {product.rating && product.rating > 0 ? product.rating.toFixed(1) : "0.0"}
                  </div>
                  <div className="text-xs text-muted-foreground" style={{ fontFamily: 'Arial, sans-serif' }}>Note</div>
                  {/* Interactive Rating Stars */}
                  <div className="flex gap-1 mt-2 justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "w-4 h-4 cursor-pointer transition-colors",
                          (hoveredRating || userRating) >= star
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300 hover:text-yellow-300"
                        )}
                        onClick={() => handleRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                      />
                    ))}
                  </div>
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

      {/* Desktop Layout - 2 Column Grid with Sticky Images */}
      <div className="hidden md:block max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Sticky Images */}
          <div className="sticky top-24 h-fit space-y-6">
            <ImageGallery 
              images={(() => {
                const images = (product as any).images ? JSON.parse((product as any).images) : [];
                return images.length > 0 ? images : (product.image_url ? [product.image_url] : defaultImages.slice(0, 3));
              })()} 
              title={product.title}
              className="rounded-2xl shadow-xl w-full"
            />
            
            {/* Quick Stats Card */}
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{product.like_count || 0}</div>
                    <div className="text-sm text-muted-foreground">J'aime</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{product.view_count || 0}</div>
                    <div className="text-sm text-muted-foreground">Vues</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {product.rating && product.rating > 0 ? product.rating.toFixed(1) : "5.0"}
                    </div>
                    <div className="text-sm text-muted-foreground">Note</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Scrollable Product Details */}
          <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-12rem)] pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
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
                    <span className="text-4xl font-bold text-primary">{product.is_free ? 'Gratuit' : formatPrice(product.price)}</span>
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

            {/* Product Details with Icons */}
            {renderProductDetails()}

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
                  <Avatar className="w-16 h-16 border-2 border-primary/20">
                    {sellerProfile?.avatar_url ? (
                      <img 
                        src={sellerProfile.avatar_url} 
                        alt={sellerProfile?.display_name || "Vendeur"} 
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <AvatarFallback className="bg-primary/10 text-primary font-medium text-xl">
                        {(sellerProfile?.display_name || sellerProfile?.email || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-lg font-semibold text-foreground">
                        {sellerProfile?.display_name || sellerProfile?.email?.split('@')[0] || 'Vendeur'}
                      </h4>
                      <Shield size={18} className="text-green-600" />
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Star size={14} className="text-yellow-500 fill-yellow-500" />
                      <span>4.8</span>
                      <span>•</span>
                      <span>Membre vérifié</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Membre depuis {sellerProfile?.created_at ? new Date(sellerProfile.created_at).getFullYear() : '2025'}
                    </p>
                    {sellerProfile?.bio && (
                      <p className="text-sm text-muted-foreground mt-2 italic">
                        "{sellerProfile.bio}"
                      </p>
                    )}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="border-primary/20 text-primary hover:bg-primary/10"
                    onClick={() => setShowSellerProfile(true)}
                  >
                    Voir profil
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Sidebar Ad */}
            <AdBanner position="sidebar" category={product.category} />

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

            {/* Owner Action Buttons */}
            {isOwner && (
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="flex-1 border-blue-500/20 text-blue-600 hover:bg-blue-50 h-14 text-lg"
                  onClick={() => onEdit?.(product.id)}
                >
                  <Edit size={20} className="mr-2" />
                  Modifier
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="flex-1 border-red-500/20 text-red-600 hover:bg-red-50 h-14 text-lg"
                  onClick={handleDelete}
                  disabled={deleteProductMutation.isPending}
                >
                  <Trash2 size={20} className="mr-2" />
                  {deleteProductMutation.isPending ? "Suppression..." : "Supprimer"}
                </Button>
              </div>
            )}

            {/* Map Section */}
            <Card className="glass-card">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Localisation</h3>
                <ProductMap location={product.location} readonly className="w-full" />
              </CardContent>
            </Card>

            {/* Chat Section */}
            {showChat && !isOwner && (
              <Card className="glass-card">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Discussion avec le vendeur</h3>
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

      {/* Footer Ad */}
      <div className="mt-8 px-4">
        <AdBanner position="footer" showCloseButton={false} />
      </div>

      {/* Seller Profile Modal */}
      <Dialog open={showSellerProfile} onOpenChange={setShowSellerProfile}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Profil du vendeur</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Avatar and Basic Info */}
            <div className="text-center">
              <Avatar className="w-24 h-24 mx-auto border-4 border-primary/20 mb-4">
                {sellerProfile?.avatar_url ? (
                  <img 
                    src={sellerProfile.avatar_url} 
                    alt={sellerProfile?.display_name || "Vendeur"} 
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <AvatarFallback className="bg-primary/10 text-primary font-medium text-3xl">
                    {(sellerProfile?.display_name || sellerProfile?.email || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {sellerProfile?.display_name || sellerProfile?.email?.split('@')[0] || 'Vendeur'}
              </h3>
              
              <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <span>4.8 • Membre vérifié</span>
                <Shield size={16} className="text-green-600" />
              </div>
              
              <p className="text-sm text-muted-foreground">
                Membre depuis {sellerProfile?.created_at ? new Date(sellerProfile.created_at).getFullYear() : '2025'}
              </p>
            </div>

            {/* Bio */}
            {sellerProfile?.bio && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">À propos</h4>
                <p className="text-sm text-muted-foreground">
                  {sellerProfile.bio}
                </p>
              </div>
            )}

            {/* Contact Info */}
            <div className="space-y-3">
              {sellerProfile?.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin size={16} className="text-muted-foreground" />
                  <span>{sellerProfile.location}</span>
                </div>
              )}
              
              {sellerProfile?.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone size={16} className="text-muted-foreground" />
                  <span>{sellerProfile.phone}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowSellerProfile(false)}
              >
                <Phone size={16} className="mr-2" />
                Appeler
              </Button>
              <Button 
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={() => {
                  setShowSellerProfile(false);
                  setShowChat(true);
                }}
              >
                <MessageCircle size={16} className="mr-2" />
                Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};