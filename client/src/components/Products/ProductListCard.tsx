import { Heart, MapPin, Clock, MessageCircle, Car, Fuel, Calendar, Gauge, Home, Users, Briefcase, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { useState } from "react";
// Get correct image based on category and path using static URLs
const getCorrectImage = (imagePath: string, category: string) => {
  if (!imagePath || imagePath.startsWith('data:image')) {
    return null;
  }
  
  // Use static asset URLs instead of dynamic imports
  const baseUrl = window.location.origin;
  
  if (imagePath.includes('/src/assets/') || !imagePath.startsWith('http')) {
    switch (category?.toLowerCase()) {
      case 'voiture':
      case 'auto':
        return `${baseUrl}/src/assets/tesla-model3.jpg`;
      case 'immobilier':
      case 'meubles':
        return `${baseUrl}/src/assets/modern-sofa.jpg`;
      case 'emplois':
        return `${baseUrl}/src/assets/iphone-15-pro.jpg`;
      case 'électronique':
        return `${baseUrl}/src/assets/motherboard-i5.jpg`;
      case 'sport':
        return `${baseUrl}/src/assets/mountain-bike.jpg`;
      default:
        return `${baseUrl}/src/assets/tesla-model3.jpg`;
    }
  }
  
  return imagePath;
};

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

// Get category-specific details to display
const getCategoryDetails = (product: any) => {
  const details: Array<{ icon: any; text: string }> = [];
  
  switch (product.category?.toLowerCase()) {
    case 'auto':
    case 'voiture':
      // Voiture: marque, année, kilométrage, carburant
      if (product.car_brand || product.brand) details.push({ icon: Car, text: product.car_brand || product.brand });
      if (product.car_year || product.year) details.push({ icon: Calendar, text: (product.car_year || product.year).toString() });
      if (product.car_mileage || product.mileage) details.push({ icon: Gauge, text: `${Number(product.car_mileage || product.mileage).toLocaleString()} km` });
      if (product.car_fuel_type || product.fuel_type) details.push({ icon: Fuel, text: product.car_fuel_type || product.fuel_type });
      break;
      
    case 'immobilier':
      // Immobilier: type (villa/appartement), surface, pièces
      if (product.real_estate_type || product.property_type) details.push({ icon: Building, text: product.real_estate_type || product.property_type });
      if (product.real_estate_surface || product.surface) details.push({ icon: Home, text: `${product.real_estate_surface || product.surface} m²` });
      if (product.real_estate_rooms || product.rooms) details.push({ icon: Users, text: `${product.real_estate_rooms || product.rooms} pièces` });
      break;
      
    case 'emplois':
    case 'emploi':
      // Emploi: type contrat, secteur, expérience
      if (product.job_type) details.push({ icon: Briefcase, text: product.job_type });
      if (product.job_sector) details.push({ icon: Building, text: product.job_sector });
      if (product.job_experience) details.push({ icon: Calendar, text: product.job_experience });
      break;
      
    default:
      // Autres: état seulement (pas de champs supplémentaires)
      if (product.condition) details.push({ icon: Clock, text: product.condition });
      break;
  }
  
  return details.slice(0, 4); // Augmenté à 4 détails max
};

interface Product {
  id: string;
  title: string;
  price: string;
  location: string;
  timeAgo: string;
  image?: string;
  isFree?: boolean;
  is_reserved?: boolean;
  is_advertisement?: boolean;
  likes: number;
  category: string;
  isLiked?: boolean;
  // Car details
  brand?: string;
  model?: string;
  year?: string;
  mileage?: string;
  fuel_type?: string;
  transmission?: string;
  condition?: string;
  color?: string;
  doors?: string;
  power?: string;
  // Car equipment
  car_ventilated_seats?: boolean;
  car_heated_steering?: boolean;
  car_navigation?: boolean;
  car_cruise_control?: boolean;
  car_parking_sensors?: boolean;
  car_rear_camera?: boolean;
  car_traffic_assist?: boolean;
  car_emergency_braking?: boolean;
  car_360_view?: boolean;
  car_lane_departure?: boolean;
  car_sunroof?: boolean;
  car_non_smoking?: boolean;
  // Real estate details
  rooms?: string;
  surface?: string;
  property_type?: string;
  // Job details
  contract_type?: string;
  salary_range?: string;
}

interface ProductListCardProps {
  product: Product;
  onLike?: () => void;
  onMessage?: () => void;
  onClick?: () => void;
  className?: string;
}

export const ProductListCard = ({ 
  product, 
  onLike, 
  onMessage, 
  onClick,
  className 
}: ProductListCardProps) => {
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
        "overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer w-full", 
        className
      )}
      onClick={onClick}
      style={{ fontFamily: 'Arial, sans-serif' }}
    >
      <CardContent className="p-3 flex gap-3 sm:gap-4">
        {/* Product image - Responsive size */}
        <div className="relative w-16 h-16 sm:w-24 sm:h-24 bg-white overflow-hidden rounded-lg flex-shrink-0">
          {(() => {
            let mainImage = null;
            
            // Try multiple sources for the image
            if ((product as any).images && (product as any).images !== '[]' && (product as any).images !== '') {
              try {
                const images = JSON.parse((product as any).images);
                if (Array.isArray(images) && images.length > 0) {
                  mainImage = images[0];
                }
              } catch (e) {
                console.error('Error parsing images JSON:', e);
              }
            }
            
            // Fallback to other image fields
            if (!mainImage) {
              mainImage = (product as any).image_url || (product as any).image;
            }
            
            // Get the correct image source
            const correctImage = getCorrectImage(mainImage, product.category);
            
            if (correctImage) {
              return (
                <img 
                  src={correctImage} 
                  alt={product.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    console.error('Image load error for:', correctImage);
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              );
            } else {
              return (
                <div className="w-full h-full bg-white border border-gray-200 flex items-center justify-center">
                  <span className="text-muted-foreground text-xs" style={{ fontFamily: 'Arial, sans-serif' }}>{product.category}</span>
                </div>
              );
            }
          })()}
          
          {/* Status badges */}
          <div className="absolute top-1 left-1 flex gap-1">
            {product.is_reserved && (
              <Badge className="bg-info text-info-foreground text-xs" style={{ fontFamily: 'Arial, sans-serif' }}>Reserved</Badge>
            )}
            {product.is_advertisement && (
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs" style={{ fontFamily: 'Arial, sans-serif' }}>Publicité</Badge>
            )}
          </div>
        </div>
        
        {/* Product details - Takes remaining space */}
        <div className="flex-1 flex flex-col justify-between min-h-[60px] sm:min-h-[90px]">
          <div>
            <h3 className="font-medium text-foreground text-sm leading-tight mb-1 line-clamp-2" style={{ fontFamily: 'Arial, sans-serif' }}>
              {product.title}
            </h3>
            
            <div className="text-lg font-bold text-primary mb-2" style={{ fontFamily: 'Arial, sans-serif' }}>
              {formatPrice(product.price)}
            </div>
            
            {/* Category-specific details */}
            {(() => {
              const details = getCategoryDetails(product);
              if (details.length > 0) {
                return (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {details.map((detail, index) => {
                      const Icon = detail.icon;
                      return (
                        <div key={index} className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded" style={{ fontFamily: 'Arial, sans-serif' }}>
                          <Icon size={10} />
                          <span className="truncate">{detail.text}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              }
              return null;
            })()}
            
            <div className="flex items-center text-xs text-muted-foreground mb-2">
              <MapPin size={10} className="mr-1 flex-shrink-0" />
              <span className="truncate" style={{ fontFamily: 'Arial, sans-serif' }}>{product.location}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock size={10} className="mr-1" />
              <span className="truncate" style={{ fontFamily: 'Arial, sans-serif' }}>{product.timeAgo}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-destructive/10 transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLike();
                }}
              >
                <Heart 
                  size={12} 
                  className={`transition-all duration-200 ${
                    isLiked 
                      ? 'text-red-500 fill-red-500 scale-110' 
                      : 'text-muted-foreground hover:text-red-500'
                  }`} 
                />
              </Button>
              <span className="text-xs text-muted-foreground" style={{ fontFamily: 'Arial, sans-serif' }}>{likesCount}</span>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-primary/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onMessage?.();
                }}
              >
                <MessageCircle size={12} className="text-muted-foreground hover:text-primary" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};