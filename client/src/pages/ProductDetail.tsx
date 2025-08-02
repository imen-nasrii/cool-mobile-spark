import { useState, useEffect } from "react";
import { ArrowLeft, Share, Heart, MessageCircle, Phone, Shield, Star, MapPin, Edit, Trash2, X, Car, Fuel, Settings, Calendar, Gauge, Users, Home, Briefcase, GraduationCap, DollarSign, MapPinIcon, Layers } from "lucide-react";
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
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Lien copié",
          description: "Le lien du produit a été copié dans le presse-papiers",
        });
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
        { icon: Car, label: 'Marque', value: product.car_brand, color: 'text-blue-600' },
        { icon: Settings, label: 'Modèle', value: product.car_model, color: 'text-purple-600' },
        { icon: Calendar, label: 'Année', value: product.car_year, color: 'text-green-600' },
        { icon: Gauge, label: 'Kilométrage', value: product.car_mileage ? `${Number(product.car_mileage).toLocaleString()} km` : null, color: 'text-orange-600' },
        { icon: Fuel, label: 'Carburant', value: product.car_fuel_type, color: 'text-red-600' },
        { icon: Settings, label: 'Transmission', value: product.car_transmission, color: 'text-indigo-600' },
        { icon: Star, label: 'État', value: product.car_condition, color: 'text-yellow-600' },
        { icon: Shield, label: 'Couleur', value: product.car_color, color: 'text-pink-600' },
        { icon: Users, label: 'Portes', value: product.car_doors ? `${product.car_doors} portes` : null, color: 'text-teal-600' },
        { icon: Car, label: 'Puissance', value: product.car_engine_size ? `${product.car_engine_size}` : null, color: 'text-cyan-600' }
      ].filter(detail => detail.value);

      // Complete equipment list with icons (black if available, gray if not)
      const equipmentList = [
        { key: 'car_ventilated_seats', icon: '🪑', label: 'Sièges ventilés', available: !!product.car_ventilated_seats },
        { key: 'car_heated_steering', icon: '🔥', label: 'Volant chauffant', available: !!product.car_heated_steering },
        { key: 'car_navigation', icon: '🧭', label: 'Navigation', available: !!product.car_navigation },
        { key: 'car_cruise_control', icon: '⏱️', label: 'Régulateur de vitesse', available: !!product.car_cruise_control },
        { key: 'car_parking_sensors', icon: '📡', label: 'Capteurs stationnement', available: !!product.car_parking_sensors },
        { key: 'car_rear_camera', icon: '📹', label: 'Caméra arrière', available: !!product.car_rear_camera },
        { key: 'car_traffic_assist', icon: '🛡️', label: 'Aide trafic transversal', available: !!product.car_traffic_assist },
        { key: 'car_emergency_braking', icon: '🛑', label: 'Freinage d\'urgence', available: !!product.car_emergency_braking },
        { key: 'car_360_view', icon: '👁️', label: 'Vue 360°', available: !!product.car_360_view },
        { key: 'car_lane_departure', icon: '🛣️', label: 'Avertissement voie', available: !!product.car_lane_departure },
        { key: 'car_sunroof', icon: '☀️', label: 'Toit ouvrant', available: !!product.car_sunroof },
        { key: 'car_non_smoking', icon: '🚭', label: product.car_non_smoking ? 'Non fumeur' : 'Fumeur autorisé', available: true }
      ];

      console.log('Car details found:', carDetails.length, carDetails);

      return (
        <div className="space-y-4">
          {/* Basic car characteristics */}
          {carDetails.length > 0 && (
            <Card className="glass-card">
              <CardContent className="p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-semibold text-foreground mb-4" style={{ fontFamily: 'Arial, sans-serif' }}>
                  Caractéristiques du véhicule
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {carDetails.map((detail, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-white/70 dark:bg-gray-800/70 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-md transition-all duration-200">
                      <div className={`p-2 rounded-lg bg-gray-50 dark:bg-gray-800 ${detail.color || 'text-primary'}`}>
                        <detail.icon size={20} className="flex-shrink-0" />
                      </div>
                      <div className="flex-1">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide" style={{ fontFamily: 'Arial, sans-serif' }}>
                          {detail.label}
                        </span>
                        <div className="text-sm font-semibold text-foreground" style={{ fontFamily: 'Arial, sans-serif' }}>
                          {detail.value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

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
              <Button variant="outline" size="sm" onClick={() => onEdit?.(product.id)}>
                <Edit size={16} />
              </Button>
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
              <h2 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: 'Arial, sans-serif' }}>{product.title}</h2>
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
              
              {/* Car specifications in description - Always show for car products */}
              {(product.category?.toLowerCase().includes('voiture') || product.brand || product.model || product.year || product.mileage || product.fuel_type) && (
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2" style={{ fontFamily: 'Arial, sans-serif' }}>
                    <Car size={18} />
                    Caractéristiques du véhicule
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {product.brand && (
                      <div className="flex items-center gap-2">
                        <Car size={14} className="text-blue-600" />
                        <span className="font-medium">Marque:</span>
                        <span className="text-blue-800 dark:text-blue-200">{product.brand}</span>
                      </div>
                    )}
                    {product.model && (
                      <div className="flex items-center gap-2">
                        <Settings size={14} className="text-purple-600" />
                        <span className="font-medium">Modèle:</span>
                        <span className="text-purple-800 dark:text-purple-200">{product.model}</span>
                      </div>
                    )}
                    {product.year && (
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-green-600" />
                        <span className="font-medium">Année:</span>
                        <span className="text-green-800 dark:text-green-200">{product.year}</span>
                      </div>
                    )}
                    {product.mileage && (
                      <div className="flex items-center gap-2">
                        <Gauge size={14} className="text-orange-600" />
                        <span className="font-medium">Kilométrage:</span>
                        <span className="text-orange-800 dark:text-orange-200">{Number(product.mileage).toLocaleString()} km</span>
                      </div>
                    )}
                    {product.fuel_type && (
                      <div className="flex items-center gap-2">
                        <Fuel size={14} className="text-red-600" />
                        <span className="font-medium">Carburant:</span>
                        <span className="text-red-800 dark:text-red-200">{product.fuel_type}</span>
                      </div>
                    )}
                    {product.transmission && (
                      <div className="flex items-center gap-2">
                        <Settings size={14} className="text-indigo-600" />
                        <span className="font-medium">Transmission:</span>
                        <span className="text-indigo-800 dark:text-indigo-200">{product.transmission}</span>
                      </div>
                    )}
                    {product.condition && (
                      <div className="flex items-center gap-2">
                        <Star size={14} className="text-yellow-600" />
                        <span className="font-medium">État:</span>
                        <span className="text-yellow-800 dark:text-yellow-200">{product.condition}</span>
                      </div>
                    )}
                    {product.color && (
                      <div className="flex items-center gap-2">
                        <Shield size={14} className="text-pink-600" />
                        <span className="font-medium">Couleur:</span>
                        <span className="text-pink-800 dark:text-pink-200">{product.color}</span>
                      </div>
                    )}
                    {product.doors && (
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-teal-600" />
                        <span className="font-medium">Portes:</span>
                        <span className="text-teal-800 dark:text-teal-200">{product.doors} portes</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Complete Equipment List like Tesla Model 3 */}
                  <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-700">
                    <h5 className="font-semibold text-blue-800 dark:text-blue-200 mb-3" style={{ fontFamily: 'Arial, sans-serif' }}>Équipements disponibles</h5>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {/* All equipment items with icons - black for available, gray for unavailable */}
                      <div className={`flex items-center gap-2 p-2 rounded-md transition-all ${product.car_ventilated_seats ? 'bg-black text-white border border-black' : 'bg-gray-200 text-gray-700 border border-gray-300'}`}>
                        <span className={`text-lg ${product.car_ventilated_seats ? 'opacity-100' : 'opacity-60'}`}>🪑</span>
                        <span style={{ fontFamily: 'Arial, sans-serif' }} className="text-xs font-medium">Sièges ventilés</span>
                      </div>

                      <div className={`flex items-center gap-2 p-2 rounded-md transition-all ${product.car_heated_steering ? 'bg-black text-white border border-black' : 'bg-gray-200 text-gray-700 border border-gray-300'}`}>
                        <span className={`text-lg ${product.car_heated_steering ? 'opacity-100' : 'opacity-60'}`}>🔥</span>
                        <span style={{ fontFamily: 'Arial, sans-serif' }} className="text-xs font-medium">Volant chauffant</span>
                      </div>

                      <div className={`flex items-center gap-2 p-2 rounded-md transition-all ${product.car_navigation ? 'bg-black text-white border border-black' : 'bg-gray-200 text-gray-700 border border-gray-300'}`}>
                        <span className={`text-lg ${product.car_navigation ? 'opacity-100' : 'opacity-60'}`}>🧭</span>
                        <span style={{ fontFamily: 'Arial, sans-serif' }} className="text-xs font-medium">Navigation</span>
                      </div>

                      <div className={`flex items-center gap-2 p-2 rounded-md transition-all ${product.car_cruise_control ? 'bg-black text-white border border-black' : 'bg-gray-200 text-gray-700 border border-gray-300'}`}>
                        <span className={`text-lg ${product.car_cruise_control ? 'opacity-100' : 'opacity-60'}`}>⏱️</span>
                        <span style={{ fontFamily: 'Arial, sans-serif' }} className="text-xs font-medium">Régulateur de vitesse</span>
                      </div>

                      <div className={`flex items-center gap-2 p-2 rounded-md transition-all ${product.car_parking_sensors ? 'bg-black text-white border border-black' : 'bg-gray-200 text-gray-700 border border-gray-300'}`}>
                        <span className={`text-lg ${product.car_parking_sensors ? 'opacity-100' : 'opacity-60'}`}>📡</span>
                        <span style={{ fontFamily: 'Arial, sans-serif' }} className="text-xs font-medium">Capteurs stationnement</span>
                      </div>

                      <div className={`flex items-center gap-2 p-2 rounded-md transition-all ${product.car_rear_camera ? 'bg-black text-white border border-black' : 'bg-gray-200 text-gray-700 border border-gray-300'}`}>
                        <span className={`text-lg ${product.car_rear_camera ? 'opacity-100' : 'opacity-60'}`}>📹</span>
                        <span style={{ fontFamily: 'Arial, sans-serif' }} className="text-xs font-medium">Caméra arrière</span>
                      </div>

                      <div className={`flex items-center gap-2 p-2 rounded-md transition-all ${product.car_traffic_assist ? 'bg-black text-white border border-black' : 'bg-gray-200 text-gray-700 border border-gray-300'}`}>
                        <span className={`text-lg ${product.car_traffic_assist ? 'opacity-100' : 'opacity-60'}`}>🛡️</span>
                        <span style={{ fontFamily: 'Arial, sans-serif' }} className="text-xs font-medium">Aide trafic transversal</span>
                      </div>

                      <div className={`flex items-center gap-2 p-2 rounded-md transition-all ${product.car_emergency_braking ? 'bg-black text-white border border-black' : 'bg-gray-200 text-gray-700 border border-gray-300'}`}>
                        <span className={`text-lg ${product.car_emergency_braking ? 'opacity-100' : 'opacity-60'}`}>🛑</span>
                        <span style={{ fontFamily: 'Arial, sans-serif' }} className="text-xs font-medium">Freinage d'urgence</span>
                      </div>

                      <div className={`flex items-center gap-2 p-2 rounded-md transition-all ${product.car_360_view ? 'bg-black text-white border border-black' : 'bg-gray-200 text-gray-700 border border-gray-300'}`}>
                        <span className={`text-lg ${product.car_360_view ? 'opacity-100' : 'opacity-60'}`}>👁️</span>
                        <span style={{ fontFamily: 'Arial, sans-serif' }} className="text-xs font-medium">Vue 360°</span>
                      </div>

                      <div className={`flex items-center gap-2 p-2 rounded-md transition-all ${product.car_lane_departure ? 'bg-black text-white border border-black' : 'bg-gray-200 text-gray-700 border border-gray-300'}`}>
                        <span className={`text-lg ${product.car_lane_departure ? 'opacity-100' : 'opacity-60'}`}>🛣️</span>
                        <span style={{ fontFamily: 'Arial, sans-serif' }} className="text-xs font-medium">Avertissement voie</span>
                      </div>

                      <div className={`flex items-center gap-2 p-2 rounded-md transition-all ${product.car_sunroof ? 'bg-black text-white border border-black' : 'bg-gray-200 text-gray-700 border border-gray-300'}`}>
                        <span className={`text-lg ${product.car_sunroof ? 'opacity-100' : 'opacity-60'}`}>☀️</span>
                        <span style={{ fontFamily: 'Arial, sans-serif' }} className="text-xs font-medium">Toit ouvrant</span>
                      </div>

                      <div className={`flex items-center gap-2 p-2 rounded-md transition-all ${product.car_non_smoking ? 'bg-black text-white border border-black' : 'bg-gray-200 text-gray-700 border border-gray-300'}`}>
                        <span className={`text-lg ${product.car_non_smoking ? 'opacity-100' : 'opacity-60'}`}>🚭</span>
                        <span style={{ fontFamily: 'Arial, sans-serif' }} className="text-xs font-medium">Non fumeur</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
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
                  <div className="text-xl font-bold text-primary">{product.likes}</div>
                  <div className="text-xs text-muted-foreground" style={{ fontFamily: 'Arial, sans-serif' }}>J'aime</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-primary">-</div>
                  <div className="text-xs text-muted-foreground" style={{ fontFamily: 'Arial, sans-serif' }}>Vues</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-primary">-</div>
                  <div className="text-xs text-muted-foreground" style={{ fontFamily: 'Arial, sans-serif' }}>Note</div>
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
                    <div className="text-2xl font-bold text-primary">{product.like_count || 0}</div>
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
            <DialogTitle>Profil du vendeur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-primary/10 text-primary font-medium text-xl">
                  {sellerProfile?.display_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold">
                  {sellerProfile?.display_name || 'Utilisateur'}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  <span>4.8</span>
                  <span>•</span>
                  <Shield size={14} className="text-success" />
                  <span>Membre vérifié</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium">Email:</span>
                <span className="ml-2 text-muted-foreground">
                  {sellerProfile?.email || 'Non disponible'}
                </span>
              </div>
              
              <div>
                <span className="font-medium">Membre depuis:</span>
                <span className="ml-2 text-muted-foreground">
                  {sellerProfile?.created_at ? 
                    new Date(sellerProfile.created_at).toLocaleDateString('fr-FR') : 
                    'Date inconnue'
                  }
                </span>
              </div>
              
              {sellerProfile?.bio && (
                <div>
                  <span className="font-medium">Bio:</span>
                  <p className="mt-1 text-muted-foreground">{sellerProfile.bio}</p>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowSellerProfile(false)}
              >
                Fermer
              </Button>
              <Button 
                className="flex-1"
                onClick={() => {
                  setShowSellerProfile(false);
                  setShowChat(true);
                }}
              >
                Contacter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};