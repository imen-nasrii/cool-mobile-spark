import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Share,
  Heart,
  MessageCircle,
  Star,
  MapPin,
  Edit,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ImageGallery } from "@/components/UI/ImageGallery";
import { ProductChat } from "@/components/Chat/ProductChat";
import { LikeButton } from "@/components/Likes/LikeButton";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/queryClient";
import { ProductMap } from "@/components/Map/ProductMap";
import { CarEquipmentIcons } from "@/components/UI/CarEquipmentIcons";

// Default images for products
const defaultImageUrls = [
  "/src/assets/tesla-model3.jpg",
  "/src/assets/motherboard-i5.jpg",
  "/src/assets/modern-sofa.jpg",
  "/src/assets/iphone-15-pro.jpg",
  "/src/assets/mountain-bike.jpg",
  "/src/assets/tractor-holland.jpg",
];

interface ProductDetailProps {
  productId?: string | null;
  onBack?: () => void;
  onEdit?: (productId: string) => void;
}

export const ProductDetail = ({
  productId,
  onBack,
  onEdit,
}: ProductDetailProps) => {
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
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 60) return `${diffInMinutes}min`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}j`;
  };

  const formatPrice = (price: any) => {
    if (
      price === "Free" ||
      price === "free" ||
      price === "Gratuit" ||
      price === "gratuit"
    ) {
      return "Gratuit";
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice === null || numPrice === undefined) {
      return "Prix non spécifié";
    }
    return `${numPrice.toLocaleString("fr-FR")} TND`;
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
      console.error("Error fetching product:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le produit",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share && typeof navigator.share === "function") {
        await navigator.share({
          title: product?.title || "Produit Tomati Market",
          text: product?.description || "Découvrez ce produit",
          url: window.location.href,
        });
        return;
      }
      if (
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === "function"
      ) {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Lien copié",
          description: "Le lien du produit a été copié dans le presse-papiers",
        });
        return;
      }
      const dummy = document.createElement("input");
      dummy.value = window.location.href;
      document.body.appendChild(dummy);
      dummy.select();
      document.execCommand("copy");
      document.body.removeChild(dummy);
      toast({
        title: "Lien copié",
        description: "Le lien a été copié dans le presse-papiers",
      });
    } catch (error) {
      console.error("Error sharing:", error);
      toast({
        title: "Erreur de partage",
        description: "Impossible de partager le lien.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?"))
      return;
    try {
      await apiClient.deleteProduct(productId!);
      toast({
        title: "Produit supprimé",
        description: "Le produit a été supprimé avec succès",
      });
      onBack?.();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le produit",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-black mb-2">
            Produit non trouvé
          </h2>
          <p className="text-gray-600 mb-4">
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="text-black"
          >
            <ArrowLeft size={18} className="mr-1" /> Retour
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

      {/* Layout */}
      <div className="flex h-[calc(100vh-80px)] max-w-7xl mx-auto">
        {/* Colonne gauche */}
        <div className="w-1/2 p-6 space-y-6">
          <ImageGallery
            images={(() => {
              try {
                const images = (product as any).images
                  ? JSON.parse((product as any).images)
                  : [];
                return images.length > 0
                  ? images
                  : product.image_url
                    ? [product.image_url]
                    : defaultImages.slice(0, 3);
              } catch (e) {
                return product.image_url
                  ? [product.image_url]
                  : defaultImages.slice(0, 3);
              }
            })()}
            title={product.title}
            className="w-full"
          />

          {/* Vendeur */}
          <div className="border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-black mb-4">
              Informations vendeur
            </h3>
            <div className="flex items-start gap-4">
              <Avatar className="w-12 h-12 bg-red-100">
                <AvatarFallback className="bg-red-100 text-red-600 font-bold text-lg">
                  {product.user_name
                    ? product.user_name.charAt(0).toUpperCase()
                    : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-black">
                    {product.user_name || "Utilisateur"}
                  </span>
                  <div className="w-2 h-2 bg-green-500"></div>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  Membre depuis{" "}
                  {new Date(
                    product.user_created_at || product.created_at,
                  ).getFullYear()}
                </div>
                {!isOwner && (
                  <Button
                    onClick={() => setShowChat(true)}
                    className="w-full bg-red-500 text-white"
                  >
                    <MessageCircle size={18} className="mr-2" /> Contacter
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Colonne droite */}
        <div className="w-1/2 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Titre & prix */}
            <div>
              <h1 className="text-3xl font-bold text-black mb-3">
                {product.title}
              </h1>
              <div className="text-4xl font-bold text-red-500 mb-4">
                {formatPrice(product.price)}
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
                <MapPin size={14} />
                <span>{product.location}</span>
                <span>•</span>
                <span>{formatTimeAgo(product.created_at)}</span>
              </div>
            </div>

            {/* Équipements de voiture */}
            {(() => {
              const category = product.category?.toLowerCase();
              const hasCarCategory = category === 'auto' || category === 'voiture';
              const carEquipment = (product as any).car_equipment;
              
              if (hasCarCategory && carEquipment) {
                try {
                  const parsedEquipment = JSON.parse(carEquipment || '[]');
                  
                  if (Array.isArray(parsedEquipment) && parsedEquipment.length > 0) {
                    return (
                      <div className="pt-4 border-t border-gray-200">
                        <h3 className="text-lg font-bold text-blue-500 mb-4">Équipements:</h3>
                        <div className="bg-white">
                          <CarEquipmentIcons carEquipment={parsedEquipment} variant="detailed" />
                        </div>
                      </div>
                    );
                  }
                } catch (e) {
                  console.error('ProductDetail - Error parsing car_equipment:', e, carEquipment);
                }
              }
              return null;
            })()}

            {/* Description */}
            <div className="pt-4">
              <h3 className="text-lg font-bold text-black mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description || "Aucune description fournie."}
              </p>
            </div>

            {/* Localisation */}
            <div className="pt-4">
              <h3 className="text-lg font-bold text-black mb-3 flex items-center gap-2">
                <MapPin size={20} className="text-red-500" /> Localisation
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-2">
                <p className="text-gray-700 mb-3">📍 {product.location}</p>
                <div className="h-64 w-full rounded-lg overflow-hidden">
                  <ProductMap
                    location={product.location}
                    readonly={true}
                    className="w-full h-full"
                  />
                </div>
              </div>

              {/* ✅ Nouvelle section en dessous de la Map */}
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <h4 className="text-md font-bold text-black mb-3">
                  Infos supplémentaires
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                  <div>
                    📞 Contact:{" "}
                    <span className="font-medium">
                      {product.user_phone || "Non spécifié"}
                    </span>
                  </div>
                  <div>
                    📧 Email:{" "}
                    <span className="font-medium">
                      {product.user_email || "Non spécifié"}
                    </span>
                  </div>
                  <div>
                    📦 Livraison:{" "}
                    <span className="font-medium">
                      {product.delivery_available
                        ? "Disponible"
                        : "Non disponible"}
                    </span>
                  </div>
                  <div>
                    ✅ Garantie:{" "}
                    <span className="font-medium">
                      {product.warranty || "Non spécifié"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat mobile */}
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
