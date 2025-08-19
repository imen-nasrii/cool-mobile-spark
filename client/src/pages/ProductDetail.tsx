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

// Default images for products (using static URLs)
const defaultImageUrls = [
  '/src/assets/tesla-model3.jpg',
  '/src/assets/motherboard-i5.jpg', 
  '/src/assets/modern-sofa.jpg',
  '/src/assets/iphone-15-pro.jpg',
  '/src/assets/mountain-bike.jpg',
  '/src/assets/tractor-holland.jpg'
];

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
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  const defaultImages = defaultImageUrls;

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
    
    // Car details with complete information
    if (category === 'auto' || category === 'voiture' || category === 'voitures' || category === 'véhicules') {
      const carDetails = [
        { icon: Car, label: 'Marque', value: product.car_brand, color: 'text-blue-600' },
        { icon: Car, label: 'Modèle', value: product.car_model, color: 'text-blue-600' },
        { icon: Calendar, label: 'Année', value: product.car_year, color: 'text-green-600' },
        { icon: Gauge, label: 'Kilométrage', value: product.car_mileage ? `${Number(product.car_mileage).toLocaleString()} km` : null, color: 'text-orange-600' },
        { icon: Fuel, label: 'Carburant', value: product.car_fuel_type, color: 'text-red-600' },
        { icon: Settings, label: 'Transmission', value: product.car_transmission, color: 'text-red-600' },
        { icon: Settings, label: 'État', value: product.car_condition, color: 'text-gray-600' },
        { icon: Settings, label: 'Couleur', value: product.car_color, color: 'text-pink-600' },
        { icon: Settings, label: 'Portes', value: product.car_doors ? `${product.car_doors} portes` : null, color: 'text-yellow-600' },
        { icon: Settings, label: 'Puissance moteur', value: product.car_engine_size, color: 'text-red-600' }
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
      
      const equipmentList = [
        { key: 'abs', icon: '🛡️', label: 'ABS', available: selectedEquipment.includes('abs') || true },
        { key: 'direction_assistee', icon: '🔄', label: 'Direction assistée', available: selectedEquipment.includes('direction_assistee') || true },
        { key: 'climatisation', icon: '❄️', label: 'Climatisation', available: selectedEquipment.includes('climatisation') || true },
        { key: 'esp', icon: '⚡', label: 'ESP', available: selectedEquipment.includes('esp') || true },
        { key: 'vitres_electriques', icon: '🪟', label: 'Vitres électriques', available: selectedEquipment.includes('vitres_electriques') || true },
        { key: 'fermeture_centrale', icon: '🔒', label: 'Fermeture centrale', available: selectedEquipment.includes('fermeture_centrale') || true },
        { key: 'airbags', icon: '💨', label: 'Airbags', available: selectedEquipment.includes('airbags') || true },
        { key: 'mp3_bluetooth', icon: '🎵', label: 'MP3 Bluetooth', available: selectedEquipment.includes('mp3_bluetooth') || true },
        { key: 'antipatinage', icon: '⚙️', label: 'Antipatinage', available: selectedEquipment.includes('antipatinage') || true },
        { key: 'limiteur_vitesse', icon: '⏱️', label: 'Limiteur De Vitesse', available: selectedEquipment.includes('limiteur_vitesse') || true },
        { key: 'regulateur_vitesse', icon: '🎯', label: 'Régulateur de vitesse', available: selectedEquipment.includes('regulateur_vitesse') || true },
        { key: 'sieges_ventiles', icon: '🪑', label: 'Sièges ventilés', available: selectedEquipment.includes('sieges_ventiles') || false }
      ];


      return (
        <div className=" pt-4">
          {/* Toutes les infos dans un seul conteneur - Design plat */}
          <div>
            <h3 className="text-lg font-bold text-black mb-4" style={{ fontFamily: 'Arial, sans-serif' }}>
              Caractéristiques du véhicule
            </h3>
            
            {/* Détails du véhicule */}
            <div className="grid grid-cols-1 gap-2 mb-6">
              {carDetails.map((detail, index) => (
                <div key={index} className="flex items-center gap-3 py-2 ">
                  <detail.icon size={18} className="text-black flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-sm text-gray-600" style={{ fontFamily: 'Arial, sans-serif' }}>
                      {detail.label}
                    </span>
                    <div className="text-sm font-medium text-black" style={{ fontFamily: 'Arial, sans-serif' }}>
                      {detail.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="text-lg font-bold text-black mb-4" style={{ fontFamily: 'Arial, sans-serif' }}>
              Équipements disponibles
            </h3>
            
            {/* Équipements dans le même conteneur */}
            <div className="grid grid-cols-2 gap-2">
              {equipmentList.map((equipment) => (
                <div 
                  key={equipment.key} 
                  className="flex items-center gap-2 py-3 px-3 "
                  style={{
                    backgroundColor: '#fff',
                    color: equipment.available ? '#000' : '#666'
                  }}
                >
                  <span 
                    className="text-base"
                    style={{ 
                      color: equipment.available ? '#000' : '#999'
                    }}
                  >
                    {equipment.icon}
                  </span>
                  <span className="text-sm font-medium" style={{ fontFamily: 'Arial, sans-serif' }}>
                    {equipment.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Real Estate details
    if (category === 'immobilier' || category === 'logement') {
      const realEstateDetails = [
        { icon: Home, label: 'Type de propriété', value: product.real_estate_type || product.property_type },
        { icon: Users, label: 'Nombre de pièces', value: product.real_estate_rooms || product.rooms ? `${product.real_estate_rooms || product.rooms} pièces` : null },
        { icon: Home, label: 'Salles de bain', value: product.real_estate_bathrooms || product.bathrooms },
        { icon: Layers, label: 'Surface habitable', value: product.real_estate_surface || product.surface ? `${product.real_estate_surface || product.surface} m²` : null },
        { icon: Layers, label: 'Étage', value: product.real_estate_floor || product.floor },
        { icon: Car, label: 'Parking', value: product.real_estate_parking || product.parking ? 'Oui' : 'Non' },
        { icon: Layers, label: 'Jardin', value: product.real_estate_garden || product.garden ? 'Oui' : 'Non' },
        { icon: Home, label: 'Balcon', value: product.real_estate_balcony || product.balcony ? 'Oui' : 'Non' },
        { icon: Home, label: 'Meublé', value: product.real_estate_furnished ? 'Oui' : 'Non' },
        { icon: Settings, label: 'État', value: product.real_estate_condition }
      ].filter(detail => detail.value);

      if (realEstateDetails.length === 0) return null;

      return (
        <div className=" pt-4">
          <h3 className="text-lg font-bold text-black mb-4" style={{ fontFamily: 'Arial, sans-serif' }}>
            Caractéristiques du bien
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {realEstateDetails.map((detail, index) => (
              <div key={index} className="flex items-center gap-3 py-2 ">
                <detail.icon size={18} className="text-black flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-sm text-gray-600" style={{ fontFamily: 'Arial, sans-serif' }}>
                    {detail.label}
                  </span>
                  <div className="text-sm font-medium text-black" style={{ fontFamily: 'Arial, sans-serif' }}>
                    {detail.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Job details
    if (category === 'emplois' || category === 'emploi' || category === 'travail' || category === 'job') {
      const jobDetails = [
        { icon: Briefcase, label: 'Type de contrat', value: product.job_type || product.contract_type },
        { icon: Layers, label: 'Secteur d\'activité', value: product.job_sector || product.sector },
        { icon: Star, label: 'Niveau d\'expérience', value: product.job_experience || product.experience_level },
        { icon: GraduationCap, label: 'Formation requise', value: product.job_education || product.education_level },
        { icon: DollarSign, label: 'Salaire', value: product.job_salary_min && product.job_salary_max ? `${product.job_salary_min} - ${product.job_salary_max} TND` : (product.salary_range || null) },
        { icon: Home, label: 'Télétravail', value: product.job_remote_work || product.remote_work ? 'Possible' : 'Non' },
        { icon: Briefcase, label: 'Entreprise', value: product.job_company || product.company },
        { icon: MapPinIcon, label: 'Lieu de travail', value: product.job_location }
      ].filter(detail => detail.value);

      if (jobDetails.length === 0) return null;

      return (
        <div className=" pt-4">
          <h3 className="text-lg font-bold text-black mb-4" style={{ fontFamily: 'Arial, sans-serif' }}>
            Détails de l'offre d'emploi
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {jobDetails.map((detail, index) => (
              <div key={index} className="flex items-center gap-3 py-2 ">
                <detail.icon size={18} className="text-black flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-sm text-gray-600" style={{ fontFamily: 'Arial, sans-serif' }}>
                    {detail.label}
                  </span>
                  <div className="text-sm font-medium text-black" style={{ fontFamily: 'Arial, sans-serif' }}>
                    {detail.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="tomati-brand mb-4">Tomati</div>
          <div className="h-8 w-8  mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-4">Chargement du produit...</p>
        </div>
      </div>
    );
  }


  if (!product) {
    console.log('Product is falsy, showing not found page');
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
    <div className="min-h-screen bg-white pb-20 md:pb-0" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 bg-white  z-40 px-4 py-3">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2 -ml-2"
            onClick={onBack}
          >
            <ArrowLeft size={20} />
          </Button>
          
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 text-black"
              onClick={handleShare}
            >
              <Share size={18} />
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block sticky top-0 bg-white  z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2"
              onClick={onBack}
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-2xl font-semibold text-black">
              Détails du produit
            </h1>
          </div>
          
          <div className="flex gap-3">
            {isOwner && (
              <>
                <Button  size="sm" onClick={() => onEdit?.(product.id)} className=" text-black">
                  <Edit size={16} />
                </Button>
                <Button 
                   
                  size="sm" 
                  onClick={handleDelete}
                  disabled={deleteProductMutation.isPending}
                  className=" text-red-500"
                >
                  <Trash2 size={16} />
                </Button>
              </>
            )}
            <Button 
               
              size="sm" 
              className="gap-2  text-black"
              onClick={handleShare}
            >
              <Share size={16} />
              Partager
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        {/* Mobile Images */}
        <div className="w-full">
          <ImageGallery 
            images={(() => {
              try {
                const images = (product as any).images ? JSON.parse((product as any).images) : [];
                return images.length > 0 ? images : (product.image_url ? [product.image_url] : defaultImages.slice(0, 3));
              } catch (e) {
                console.error('Error parsing product images:', e);
                return product.image_url ? [product.image_url] : defaultImages.slice(0, 3);
              }
            })()} 
            title={product.title}
            className="w-full aspect-square"
          />
        </div>

        {/* Mobile Content - Sans conteneurs */}
        <div className="px-4 py-4 space-y-6">
          {/* Titre et Prix */}
          <div>
            <h2 className="text-2xl font-bold text-black mb-2" style={{ fontFamily: 'Arial, sans-serif' }}>{product.title}</h2>
            <div className="text-3xl font-bold text-red-500 mb-3" style={{ fontFamily: 'Arial, sans-serif' }}>
              {product.is_free ? 'Gratuit' : formatPrice(product.price)}
            </div>
            <div className="flex gap-2 mb-3">
              <span className="px-2 py-1 bg-gray-100 text-black text-sm" style={{ fontFamily: 'Arial, sans-serif' }}>{product.category}</span>
              {product.is_free && (
                <span className="px-2 py-1 bg-green-100 text-green-600 text-sm" style={{ fontFamily: 'Arial, sans-serif' }}>Gratuit</span>
              )}
              {product.is_reserved && (
                <span className="px-2 py-1 bg-red-100 text-red-600 text-sm" style={{ fontFamily: 'Arial, sans-serif' }}>Réservé</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
              <MapPin size={14} />
              <span>{product.location}</span>
              <span>•</span>
              <span>{formatTimeAgo(product.created_at)}</span>
            </div>
          </div>

          {/* Informations du Vendeur */}
          <div className=" pt-4">
            <h3 className="text-lg font-bold text-black mb-3" style={{ fontFamily: 'Arial, sans-serif' }}>Vendeur</h3>
            <div className="text-center mb-4">
              <Avatar className="h-16 w-16 mx-auto mb-3">
                <AvatarFallback className="bg-gray-100 text-black font-semibold">
                  {product.user_name ? product.user_name.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="font-semibold text-black mb-1" style={{ fontFamily: 'Arial, sans-serif' }}>
                {product.user_name || 'Utilisateur'}
              </div>
              <div className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Arial, sans-serif' }}>
                4.8 • Membre vérifié
              </div>
              <div className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Arial, sans-serif' }}>
                Membre depuis {new Date(product.user_created_at || product.created_at).getFullYear()}
              </div>
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Arial, sans-serif' }}>
                "Membre actif de la communauté Tomati Market."
              </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowChat(true)}
                className="flex-1 bg-red-500 text-white "
                style={{ fontFamily: 'Arial, sans-serif' }}
              >
                <MessageCircle size={18} className="mr-2" />
                Contacter
              </Button>
              <Button 
                 
                className="px-4  text-black"
                onClick={handleShare}
              >
                <Share size={18} />
              </Button>
            </div>
          </div>

          {/* Description */}
          <div className=" pt-4">
            <h3 className="text-lg font-bold text-black mb-3" style={{ fontFamily: 'Arial, sans-serif' }}>Description</h3>
            <p className="text-gray-600 leading-relaxed" style={{ fontFamily: 'Arial, sans-serif' }}>
              {product.description || "Aucune description fournie."}
            </p>
          </div>

          {/* Caractéristiques du produit - Sans conteneurs */}
          {renderProductDetails()}

          {/* Statistiques */}
          <div className=" pt-4">
            <div className="grid grid-cols-2 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-red-500">{product.view_count || 0}</div>
                <div className="text-sm text-gray-600" style={{ fontFamily: 'Arial, sans-serif' }}>Vues</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-500">
                  {product.rating && product.rating > 0 ? product.rating.toFixed(1) : "0.0"}
                </div>
                <div className="text-sm text-gray-600" style={{ fontFamily: 'Arial, sans-serif' }}>Note</div>
                {/* Interactive Rating Stars */}
                <div className="flex gap-1 mt-2 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "w-4 h-4 cursor-pointer",
                        userRating >= star
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      )}
                      onClick={() => handleRating(star)}
                    />
                  ))}
                </div>
            </div>
          </div>

          {/* Chat Mobile */}
          {showChat && !isOwner && (
            <div className=" pt-4">
              <ProductChat
                productId={product.id}
                sellerId={product.user_id}
                onClose={() => setShowChat(false)}
              />
            </div>
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
                try {
                  const images = (product as any).images ? JSON.parse((product as any).images) : [];
                  return images.length > 0 ? images : (product.image_url ? [product.image_url] : defaultImages.slice(0, 3));
                } catch (e) {
                  console.error('Error parsing product images:', e);
                  return product.image_url ? [product.image_url] : defaultImages.slice(0, 3);
                }
              })()} 
              title={product.title}
              className=" w-full"
            />
            
            {/* Informations vendeur div */}
            <div className="p-6">
                <h3 className="text-lg font-semibold text-black mb-4" style={{ fontFamily: 'Arial, sans-serif' }}>
                  Informations vendeur
                </h3>
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12 bg-red-100">
                    <AvatarFallback className="bg-red-100 text-red-600 font-bold text-lg">
                      {product.user_name ? product.user_name.charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-black" style={{ fontFamily: 'Arial, sans-serif' }}>
                        {product.user_name || 'Utilisateur user'}
                      </span>
                      <div className="w-2 h-2 bg-green-500 "></div>
                    </div>
                    <div className="flex items-center gap-1 mb-1 text-sm" style={{ fontFamily: 'Arial, sans-serif' }}>
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-black">4.8</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-600">Membre vérifié</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Arial, sans-serif' }}>
                      Membre depuis {new Date(product.user_created_at || product.created_at).getFullYear()}
                    </div>
                    <div className="text-sm text-gray-600 italic" style={{ fontFamily: 'Arial, sans-serif' }}>
                      "Membre actif de la communauté Tomati Market."
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <Button 
                      size="sm"
                      className="w-8 h-8 p-0 bg-red-500 text-white "
                      onClick={() => {}}
                      style={{ fontFamily: 'Arial, sans-serif' }}
                    >
                      <Phone size={14} />
                    </Button>
                    <Button 
                      size="sm"
                      className="w-8 h-8 p-0 bg-red-500 text-white "
                      onClick={() => setShowChat(true)}
                      style={{ fontFamily: 'Arial, sans-serif' }}
                    >
                      <MessageCircle size={14} />
                    </Button>
                  </div>
                </div>
                
                {/* Boutons d'action en bas */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <Button 
                    className="bg-red-500 text-white py-3 "
                    onClick={() => {}}
                    style={{ fontFamily: 'Arial, sans-serif' }}
                  >
                    <Phone size={18} className="mr-2" />
                    Appeler
                  </Button>
                  <Button 
                    className="bg-red-500 text-white py-3 "
                    onClick={() => setShowChat(true)}
                    style={{ fontFamily: 'Arial, sans-serif' }}
                  >
                    <MessageCircle size={18} className="mr-2" />
                    Envoyer message
                  </Button>
                </div>
            </div>
          </div>

          {/* Right Column - Scrollable Product Details */}
          <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-12rem)] pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {/* Price & Title */}
            <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-2">{product.title}</h2>
                    <Badge variant="secondary" className="mb-4">{product.category}</Badge>
                    {product.is_free && (
                      <Badge  className="mb-4 ml-2 text-green-600 ">
                        Gratuit
                      </Badge>
                    )}
                    {product.is_reserved && (
                      <Badge  className="mb-4 ml-2 text-red-600 ">
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
            </div>

            {/* Product Details with Icons */}
            {renderProductDetails()}

            {/* Description */}
            <div className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-4">Description</h3>
                <p className="text-muted-foreground leading-relaxed text-base mb-6">
                  {product.description || "Aucune description fournie."}
                </p>
            </div>

            {/* Seller Info */}
            <div className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-4">Informations vendeur</h3>
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16 ">
                    {sellerProfile?.avatar_url ? (
                      <img 
                        src={sellerProfile.avatar_url} 
                        alt={sellerProfile?.display_name || "Vendeur"} 
                        className="w-full h-full object-cover"
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
                     
                    className=" text-primary"
                    onClick={() => setShowSellerProfile(true)}
                  >
                    Voir profil
                  </Button>
                </div>
            </div>

            {/* Sidebar Ad */}
            <AdBanner position="sidebar" category={product.category} />

            {/* Action Buttons */}
            {!isOwner && (
              <div className="flex gap-4">
                <Button 
                   
                  size="lg" 
                  className="flex-1  text-primary h-14 text-lg"
                >
                  <Phone size={20} className="mr-2" />
                  Appeler
                </Button>
                <Button 
                  size="lg" 
                  className="flex-1 bg-primary text-white h-14 text-lg"
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
                   
                  size="lg" 
                  className="flex-1  text-blue-600 h-14 text-lg"
                  onClick={() => onEdit?.(product.id)}
                >
                  <Edit size={20} className="mr-2" />
                  Modifier
                </Button>
                <Button 
                   
                  size="lg" 
                  className="flex-1 /20 text-red-600 h-14 text-lg"
                  onClick={handleDelete}
                  disabled={deleteProductMutation.isPending}
                >
                  <Trash2 size={20} className="mr-2" />
                  {deleteProductMutation.isPending ? "Suppression..." : "Supprimer"}
                </Button>
              </div>
            )}

            {/* Map Section */}
            <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">Localisation</h3>
                <ProductMap location={product.location} readonly className="w-full" />
            </div>

            {/* Chat Section */}
            {showChat && !isOwner && (
              <div className="">
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Discussion avec le vendeur</h3>
                  <ProductChat
                    productId={product.id}
                    sellerId={product.user_id}
                    onClose={() => setShowChat(false)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Fixed Bottom Bar */}
      {!isOwner && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white  p-4 z-50">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-2xl font-bold text-primary">{product.price}</div>
              <div className="text-xs text-muted-foreground">Prix</div>
            </div>
            <Button 
               
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
              <Avatar className="w-24 h-24 mx-auto  mb-4">
                {sellerProfile?.avatar_url ? (
                  <img 
                    src={sellerProfile.avatar_url} 
                    alt={sellerProfile?.display_name || "Vendeur"} 
                    className="w-full h-full object-cover"
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
              <div className="bg-gray-50 p-4 ">
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
                 
                className="flex-1"
                onClick={() => setShowSellerProfile(false)}
              >
                <Phone size={16} className="mr-2" />
                Appeler
              </Button>
              <Button 
                className="flex-1 bg-primary"
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
      </div>
    </div>
  );
};