import { useState, useEffect } from "react";
import { ArrowLeft, Share, Heart, MessageCircle, Star, MapPin, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ImageGallery } from "@/components/UI/ImageGallery";
import { ProductChat } from "@/components/Chat/ProductChat";
import { LikeButton } from "@/components/Likes/LikeButton";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient, queryClient } from "@/lib/queryClient";
import { CarEquipmentIcons } from "@/components/UI/CarEquipmentIcons";
import { ProductMap } from "@/components/Map/ProductMap";

// Default images for products
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
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [userRating, setUserRating] = useState<number>(0);
  const { user } = useAuth();
  const { toast } = useToast();

  const defaultImages = defaultImageUrls;

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}min`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}j`;
  };

  const formatPrice = (price: any) => {
    // Gérer les produits gratuits
    if (price === 'Free' || price === 'free' || price === 'Gratuit' || price === 'gratuit') {
      return 'Gratuit';
    }
    
    // Convertir en nombre et vérifier si c'est valide
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice === null || numPrice === undefined) {
      return 'Prix non spécifié';
    }
    
    return `${numPrice.toLocaleString('fr-FR')} TND`;
  };

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getProduct(productId!);
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: "Erreur", 
        description: "Impossible de charger le produit",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  const handleRating = async (rating: number) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour noter un produit",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiClient.request(`/products/${productId}/rate`, {
        method: 'POST',
        body: JSON.stringify({ rating })
      });

      setUserRating(rating);
      fetchProduct(); // Refresh to get updated rating
      toast({
        title: "Note enregistrée",
        description: `Vous avez donné ${rating} étoile${rating > 1 ? 's' : ''} à ce produit`,
      });
    } catch (error) {
      console.error('Error rating product:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer votre note",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product?.title,
          text: product?.description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Lien copié",
          description: "Le lien du produit a été copié dans le presse-papiers",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;
    
    try {
      await apiClient.deleteProduct(productId!);
      toast({
        title: "Produit supprimé",
        description: "Le produit a été supprimé avec succès",
      });
      onBack?.();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le produit",
        variant: "destructive",
      });
    }
  };

  const renderProductDetails = () => {
    if (!product) return null;

    switch (product.category) {
      case 'Auto':
      case 'Voiture':
        const carEquipment = product.car_equipment ? JSON.parse(product.car_equipment || '[]') : [];
        
        return (
          <div className="pt-4">
            <h3 className="text-lg font-bold text-black mb-3" style={{ fontFamily: 'Arial, sans-serif' }}>
              Caractéristiques véhicule
            </h3>
            <div className="space-y-2">
              {(product.car_brand || product.brand) && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Marque:</span>
                  <span className="text-black font-medium">{product.car_brand || product.brand}</span>
                </div>
              )}
              {(product.car_model || product.model) && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Modèle:</span>
                  <span className="text-black font-medium">{product.car_model || product.model}</span>
                </div>
              )}
              {(product.car_year || product.year) && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Année:</span>
                  <span className="text-black font-medium">{product.car_year || product.year}</span>
                </div>
              )}
              {(product.car_mileage || product.mileage) && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Kilométrage:</span>
                  <span className="text-black font-medium">{(product.car_mileage || product.mileage).toLocaleString()} km</span>
                </div>
              )}
              {(product.car_fuel_type || product.fuel_type) && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Carburant:</span>
                  <span className="text-black font-medium">{product.car_fuel_type || product.fuel_type}</span>
                </div>
              )}
              {(product.car_transmission || product.transmission) && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Transmission:</span>
                  <span className="text-black font-medium">{product.car_transmission || product.transmission}</span>
                </div>
              )}
              {(product.car_condition || product.condition) && (
                <div className="flex justify-between">
                  <span className="text-gray-600">État:</span>
                  <span className="text-black font-medium">{product.car_condition || product.condition}</span>
                </div>
              )}
              {product.car_engine_size && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Cylindrée:</span>
                  <span className="text-black font-medium">{product.car_engine_size}</span>
                </div>
              )}
              {product.car_doors && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Portes:</span>
                  <span className="text-black font-medium">{product.car_doors}</span>
                </div>
              )}
              {product.car_seats && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Places:</span>
                  <span className="text-black font-medium">{product.car_seats}</span>
                </div>
              )}
              {product.car_color && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Couleur:</span>
                  <span className="text-black font-medium">{product.car_color}</span>
                </div>
              )}
            </div>
            
            {/* Équipements disponibles */}
            <div className="pt-4">
              <h4 className="text-lg font-bold text-blue-600 mb-4" style={{ fontFamily: 'Arial, sans-serif' }}>
                Équipements:
              </h4>
              <CarEquipmentIcons carEquipment={carEquipment} variant="detailed" />
            </div>
            
            {/* Options spéciales */}
            <div className="pt-4">
              <h4 className="text-md font-bold text-black mb-3" style={{ fontFamily: 'Arial, sans-serif' }}>
                Options spéciales
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Navigation:</span>
                  <span className={`font-medium ${product.car_navigation ? 'text-green-600' : 'text-red-600'}`}>
                    {product.car_navigation ? 'Oui' : 'Non'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Régulateur de vitesse:</span>
                  <span className={`font-medium ${product.car_cruise_control ? 'text-green-600' : 'text-red-600'}`}>
                    {product.car_cruise_control ? 'Oui' : 'Non'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Capteurs de stationnement:</span>
                  <span className={`font-medium ${product.car_parking_sensors ? 'text-green-600' : 'text-red-600'}`}>
                    {product.car_parking_sensors ? 'Oui' : 'Non'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Caméra arrière:</span>
                  <span className={`font-medium ${product.car_rear_camera ? 'text-green-600' : 'text-red-600'}`}>
                    {product.car_rear_camera ? 'Oui' : 'Non'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Vue 360°:</span>
                  <span className={`font-medium ${product.car_360_view ? 'text-green-600' : 'text-red-600'}`}>
                    {product.car_360_view ? 'Oui' : 'Non'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Aide au maintien de voie:</span>
                  <span className={`font-medium ${product.car_lane_departure ? 'text-green-600' : 'text-red-600'}`}>
                    {product.car_lane_departure ? 'Oui' : 'Non'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Toit ouvrant:</span>
                  <span className={`font-medium ${product.car_sunroof ? 'text-green-600' : 'text-red-600'}`}>
                    {product.car_sunroof ? 'Oui' : 'Non'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sièges ventilés:</span>
                  <span className={`font-medium ${product.car_ventilated_seats ? 'text-green-600' : 'text-red-600'}`}>
                    {product.car_ventilated_seats ? 'Oui' : 'Non'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Volant chauffant:</span>
                  <span className={`font-medium ${product.car_heated_steering ? 'text-green-600' : 'text-red-600'}`}>
                    {product.car_heated_steering ? 'Oui' : 'Non'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Véhicule non fumeur:</span>
                  <span className={`font-medium ${product.car_non_smoking ? 'text-green-600' : 'text-red-600'}`}>
                    {product.car_non_smoking ? 'Oui' : 'Non'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Immobilier':
        return (
          <div className="pt-4">
            <h3 className="text-lg font-bold text-black mb-3" style={{ fontFamily: 'Arial, sans-serif' }}>
              Caractéristiques immobilier
            </h3>
            <div className="space-y-2">
              {(product.real_estate_type || product.property_type) && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Type de bien:</span>
                  <span className="text-black font-medium">{product.real_estate_type || product.property_type}</span>
                </div>
              )}
              {(product.real_estate_surface || product.surface_area) && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Surface:</span>
                  <span className="text-black font-medium">{product.real_estate_surface || product.surface_area} m²</span>
                </div>
              )}
              {(product.real_estate_rooms || product.bedrooms) && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Pièces:</span>
                  <span className="text-black font-medium">{product.real_estate_rooms || product.bedrooms}</span>
                </div>
              )}
              {(product.real_estate_bathrooms || product.bathrooms) && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Salles de bain:</span>
                  <span className="text-black font-medium">{product.real_estate_bathrooms || product.bathrooms}</span>
                </div>
              )}
              {(product.real_estate_floor || product.floor) && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Étage:</span>
                  <span className="text-black font-medium">{product.real_estate_floor || product.floor}</span>
                </div>
              )}
              {product.real_estate_condition && (
                <div className="flex justify-between">
                  <span className="text-gray-600">État:</span>
                  <span className="text-black font-medium">{product.real_estate_condition}</span>
                </div>
              )}
            </div>
            
            {/* Commodités */}
            <div className="pt-4">
              <h4 className="text-md font-bold text-black mb-3" style={{ fontFamily: 'Arial, sans-serif' }}>
                Commodités
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {product.real_estate_furnished && <span className="text-green-600">• Meublé</span>}
                {product.real_estate_parking && <span className="text-green-600">• Place de parking</span>}
                {product.real_estate_garden && <span className="text-green-600">• Jardin</span>}
                {product.real_estate_balcony && <span className="text-green-600">• Balcon</span>}
              </div>
            </div>
          </div>
        );

      case 'Emplois':
        const jobBenefits = product.job_benefits ? JSON.parse(product.job_benefits || '[]') : [];
        
        return (
          <div className="pt-4">
            <h3 className="text-lg font-bold text-black mb-3" style={{ fontFamily: 'Arial, sans-serif' }}>
              Détails de l'emploi
            </h3>
            <div className="space-y-2">
              {product.job_type && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Type de contrat:</span>
                  <span className="text-black font-medium">{product.job_type}</span>
                </div>
              )}
              {(product.job_company || product.company) && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Entreprise:</span>
                  <span className="text-black font-medium">{product.job_company || product.company}</span>
                </div>
              )}
              {product.job_sector && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Secteur:</span>
                  <span className="text-black font-medium">{product.job_sector}</span>
                </div>
              )}
              {(product.job_experience || product.experience_level) && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Expérience:</span>
                  <span className="text-black font-medium">{product.job_experience || product.experience_level}</span>
                </div>
              )}
              {product.job_education && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Formation:</span>
                  <span className="text-black font-medium">{product.job_education}</span>
                </div>
              )}
              {(product.job_salary_min || product.job_salary_max || product.salary_range) && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Salaire:</span>
                  <span className="text-black font-medium">
                    {product.salary_range || 
                     (product.job_salary_min && product.job_salary_max ? 
                      `${product.job_salary_min.toLocaleString()} - ${product.job_salary_max.toLocaleString()} TND` :
                      product.job_salary_min ? `À partir de ${product.job_salary_min.toLocaleString()} TND` :
                      product.job_salary_max ? `Jusqu'à ${product.job_salary_max.toLocaleString()} TND` : 'À négocier'
                     )}
                  </span>
                </div>
              )}
              {product.job_urgency && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Urgence:</span>
                  <span className="text-black font-medium">{product.job_urgency}</span>
                </div>
              )}
              {product.job_remote !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Télétravail:</span>
                  <span className="text-black font-medium">{product.job_remote ? 'Possible' : 'Non'}</span>
                </div>
              )}
            </div>
            
            {/* Avantages */}
            {jobBenefits.length > 0 && (
              <div className="pt-4">
                <h4 className="text-md font-bold text-black mb-3" style={{ fontFamily: 'Arial, sans-serif' }}>
                  Avantages
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {jobBenefits.map((benefit: string, index: number) => (
                    <div key={index} className="text-sm text-gray-700 bg-gray-50 px-2 py-1 rounded">
                      • {benefit}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600" style={{ fontFamily: 'Arial, sans-serif' }}>Chargement...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-black mb-2" style={{ fontFamily: 'Arial, sans-serif' }}>
            Produit non trouvé
          </h2>
          <p className="text-gray-600 mb-4" style={{ fontFamily: 'Arial, sans-serif' }}>
            Le produit que vous recherchez n'existe pas ou a été supprimé.
          </p>
          <Button onClick={onBack} className="bg-red-500 text-white">
            <ArrowLeft size={16} className="mr-2" />
            Retour
          </Button>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === product.user_id;

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header avec boutons */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="text-black"
          >
            <ArrowLeft size={18} className="mr-1" />
            Retour
          </Button>
          
          <div className="flex items-center gap-2">
            <LikeButton productId={product.id} />
            <Button
              onClick={handleShare}
              variant="ghost"
              size="sm"
              className="text-black"
            >
              <Share size={18} />
            </Button>
            {isOwner && (
              <>
                <Button
                  onClick={() => onEdit?.(product.id)}
                  variant="ghost"
                  size="sm"
                  className="text-black"
                >
                  <Edit size={18} />
                </Button>
                <Button
                  onClick={handleDelete}
                  variant="ghost"
                  size="sm"
                  className="text-red-500"
                >
                  <Trash2 size={18} />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Layout principal en 2 colonnes avec scroll */}
      <div className="flex h-[calc(100vh-80px)] max-w-7xl mx-auto">
        
        {/* COLONNE GAUCHE - FIXE : Photo + Vendeur */}
        <div className="w-1/2 p-6 space-y-6">
            {/* Galerie d'images */}
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
              className="w-full"
            />
            
            {/* Informations vendeur */}
            <div className="border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-black mb-4" style={{ fontFamily: 'Arial, sans-serif' }}>
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
                      {product.user_name || 'Utilisateur'}
                    </span>
                    <div className="w-2 h-2 bg-green-500"></div>
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
                  <div className="text-sm text-gray-600 mb-3" style={{ fontFamily: 'Arial, sans-serif' }}>
                    "Membre actif de la communauté Tomati Market."
                  </div>
                  {!isOwner && (
                    <Button 
                      onClick={() => setShowChat(true)}
                      className="w-full bg-red-500 text-white"
                      style={{ fontFamily: 'Arial, sans-serif' }}
                    >
                      <MessageCircle size={18} className="mr-2" />
                      Contacter
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

        {/* COLONNE DROITE - SCROLLABLE : Infos produit */}
        <div className="w-1/2 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Titre et Prix */}
            <div>
              <h1 className="text-3xl font-bold text-black mb-3" style={{ fontFamily: 'Arial, sans-serif' }}>
                {product.title}
              </h1>
              <div className="text-4xl font-bold text-red-500 mb-4" style={{ fontFamily: 'Arial, sans-serif' }}>
                {formatPrice(product.price)}
              </div>
              <div className="flex gap-2 mb-4">
                <span className="px-3 py-1 bg-gray-100 text-black text-sm" style={{ fontFamily: 'Arial, sans-serif' }}>
                  {product.category}
                </span>
                {product.is_reserved && (
                  <span className="px-3 py-1 bg-red-100 text-red-600 text-sm" style={{ fontFamily: 'Arial, sans-serif' }}>
                    Réservé
                  </span>
                )}
                {product.is_advertisement && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-600 text-sm" style={{ fontFamily: 'Arial, sans-serif' }}>
                    Publicité
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
                <MapPin size={14} />
                <span>{product.location}</span>
                <span>•</span>
                <span>{formatTimeAgo(product.created_at)}</span>
              </div>
            </div>

            {/* Description */}
            <div className="pt-4">
              <h3 className="text-lg font-bold text-black mb-3" style={{ fontFamily: 'Arial, sans-serif' }}>Description</h3>
              <p className="text-gray-600 leading-relaxed" style={{ fontFamily: 'Arial, sans-serif' }}>
                {product.description || "Aucune description fournie."}
              </p>
            </div>

            {/* Caractéristiques du produit */}
            {renderProductDetails()}

            {/* Localisation sur la carte */}
            <div className="pt-4">
              <h3 className="text-lg font-bold text-black mb-3 flex items-center gap-2" style={{ fontFamily: 'Arial, sans-serif' }}>
                <MapPin size={20} className="text-red-500" />
                Localisation
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-2">
                <p className="text-gray-700 mb-3" style={{ fontFamily: 'Arial, sans-serif' }}>
                  📍 {product.location}
                </p>
                <div className="h-64 w-full rounded-lg overflow-hidden">
                  <ProductMap 
                    location={product.location} 
                    readonly={true}
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>

            {/* Statistiques - Vues et J'aime */}
            <div className="pt-4">
              <div className="grid grid-cols-2 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-red-500">{product.view_count || 0}</div>
                  <div className="text-sm text-gray-600" style={{ fontFamily: 'Arial, sans-serif' }}>Vues</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-500">
                    {product.like_count || 0}
                  </div>
                  <div className="text-sm text-gray-600" style={{ fontFamily: 'Arial, sans-serif' }}>J'aime</div>
                </div>
              </div>
            </div>

            {/* Chat Mobile */}
            {showChat && !isOwner && (
              <div className="pt-4">
                <ProductChat
                  productId={product.id}
                  sellerId={product.user_id}
                  onClose={() => setShowChat(false)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};