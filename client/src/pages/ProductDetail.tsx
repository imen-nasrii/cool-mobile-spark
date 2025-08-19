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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 3
    }).format(price);
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
        return (
          <div className="pt-4">
            <h3 className="text-lg font-bold text-black mb-3" style={{ fontFamily: 'Arial, sans-serif' }}>
              Caractéristiques véhicule
            </h3>
            <div className="space-y-2">
              {product.brand && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Marque:</span>
                  <span className="text-black font-medium">{product.brand}</span>
                </div>
              )}
              {product.model && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Modèle:</span>
                  <span className="text-black font-medium">{product.model}</span>
                </div>
              )}
              {product.year && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Année:</span>
                  <span className="text-black font-medium">{product.year}</span>
                </div>
              )}
              {product.mileage && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Kilométrage:</span>
                  <span className="text-black font-medium">{product.mileage} km</span>
                </div>
              )}
              {product.fuel_type && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Carburant:</span>
                  <span className="text-black font-medium">{product.fuel_type}</span>
                </div>
              )}
              {product.transmission && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Transmission:</span>
                  <span className="text-black font-medium">{product.transmission}</span>
                </div>
              )}
              {product.condition && (
                <div className="flex justify-between">
                  <span className="text-gray-600">État:</span>
                  <span className="text-black font-medium">{product.condition}</span>
                </div>
              )}
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
              {product.property_type && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="text-black font-medium">{product.property_type}</span>
                </div>
              )}
              {product.surface_area && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Surface:</span>
                  <span className="text-black font-medium">{product.surface_area} m²</span>
                </div>
              )}
              {product.bedrooms && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Chambres:</span>
                  <span className="text-black font-medium">{product.bedrooms}</span>
                </div>
              )}
              {product.bathrooms && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Salles de bain:</span>
                  <span className="text-black font-medium">{product.bathrooms}</span>
                </div>
              )}
              {product.floor && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Étage:</span>
                  <span className="text-black font-medium">{product.floor}</span>
                </div>
              )}
            </div>
          </div>
        );

      case 'Emplois':
        return (
          <div className="pt-4">
            <h3 className="text-lg font-bold text-black mb-3" style={{ fontFamily: 'Arial, sans-serif' }}>
              Détails de l'emploi
            </h3>
            <div className="space-y-2">
              {product.job_type && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="text-black font-medium">{product.job_type}</span>
                </div>
              )}
              {product.company && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Entreprise:</span>
                  <span className="text-black font-medium">{product.company}</span>
                </div>
              )}
              {product.experience_level && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Expérience:</span>
                  <span className="text-black font-medium">{product.experience_level}</span>
                </div>
              )}
              {product.salary_range && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Salaire:</span>
                  <span className="text-black font-medium">{product.salary_range}</span>
                </div>
              )}
            </div>
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

      {/* Layout principal en 2 colonnes */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* COLONNE GAUCHE - FIXE : Photo + Vendeur */}
          <div className="space-y-6">
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

          {/* COLONNE DROITE - DYNAMIQUE : Infos produit */}
          <div className="space-y-6">
            {/* Titre et Prix */}
            <div>
              <h1 className="text-3xl font-bold text-black mb-3" style={{ fontFamily: 'Arial, sans-serif' }}>
                {product.title}
              </h1>
              <div className="text-4xl font-bold text-red-500 mb-4" style={{ fontFamily: 'Arial, sans-serif' }}>
                {product.is_free ? 'Gratuit' : formatPrice(product.price)}
              </div>
              <div className="flex gap-2 mb-4">
                <span className="px-3 py-1 bg-gray-100 text-black text-sm" style={{ fontFamily: 'Arial, sans-serif' }}>
                  {product.category}
                </span>
                {product.is_free && (
                  <span className="px-3 py-1 bg-green-100 text-green-600 text-sm" style={{ fontFamily: 'Arial, sans-serif' }}>
                    Gratuit
                  </span>
                )}
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

            {/* Statistiques */}
            <div className="pt-4">
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