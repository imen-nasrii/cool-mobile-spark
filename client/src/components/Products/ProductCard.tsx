import { Heart, MapPin, Clock, MessageCircle, Calendar, Gauge, Fuel, Home, Users, Building, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import React, { useState } from "react";
// Import default images  
import teslaImage from '@/assets/tesla-model3.jpg';
import sofaImage from '@/assets/modern-sofa.jpg';
import iphoneImage from '@/assets/iphone-15-pro.jpg';
import motherboardImage from '@/assets/motherboard-i5.jpg';
import bikeImage from '@/assets/mountain-bike.jpg';

// Get correct image based on category and path
const getCorrectImage = (imagePath: string, category: string) => {
  // If it's already a base64 or starts with data:, return it
  if (imagePath && imagePath.startsWith('data:image')) {
    return imagePath;
  }
  
  // If it's a valid HTTP URL, return it
  if (imagePath && imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If no valid image path, use default based on category
  switch (category?.toLowerCase()) {
    case 'voiture':
    case 'auto':
      return teslaImage;
    case 'immobilier':
    case 'meubles':
      return sofaImage;
    case 'emplois':
      return iphoneImage;
    case 'électronique':
      return motherboardImage;
    case 'sport':
      return bikeImage;
    default:
      return teslaImage;
  }
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
  
  // Process product category details
  
  switch (product.category?.toLowerCase()) {
    case 'auto':
    case 'voiture':
      // Try both database fields and mapped fields
      if (product.car_year || product.year) details.push({ icon: Calendar, text: (product.car_year || product.year).toString() });
      if (product.car_mileage || product.mileage) details.push({ icon: Gauge, text: `${Number(product.car_mileage || product.mileage).toLocaleString()} km` });
      if (product.car_fuel_type || product.fuel_type) details.push({ icon: Fuel, text: product.car_fuel_type || product.fuel_type });
      break;
      
    case 'immobilier':
      if (product.real_estate_surface || product.surface) details.push({ icon: Home, text: `${product.real_estate_surface || product.surface} m²` });
      if (product.real_estate_rooms || product.rooms) details.push({ icon: Users, text: `${product.real_estate_rooms || product.rooms} pièces` });
      if (product.real_estate_type || product.property_type) details.push({ icon: Building, text: product.real_estate_type || product.property_type });
      break;
      
    case 'emplois':
    case 'emploi':
      if (product.job_type) details.push({ icon: Briefcase, text: product.job_type });
      if (product.job_sector) details.push({ icon: Building, text: product.job_sector });
      if (product.job_experience) details.push({ icon: Calendar, text: product.job_experience });
      break;
      
    default:
      // For "autres" category, show basic info if available
      if (product.condition) details.push({ icon: Clock, text: product.condition });
      break;
  }
  
  return details.slice(0, 3); // Limit to 3 details max
};

interface Product {
  id: string;
  title: string;
  price: string;
  location: string;
  timeAgo: string;
  image?: string;
  isFree?: boolean;
  isReserved?: boolean;
  isAdvertisement?: boolean;
  likes: number;
  category: string;
  isLiked?: boolean;
  // Car details
  year?: string;
  mileage?: string;
  fuel_type?: string;
  // Real estate details
  surface?: string;
  rooms?: string;
  property_type?: string;
  // Job details
  job_type?: string;
  job_sector?: string;
  job_experience?: string;
  // General
  condition?: string;
}

interface ProductCardProps {
  product: Product;
  onLike?: () => void;
  onMessage?: () => void;
  onClick?: () => void;
  className?: string;
}

const ProductCardComponent = ({ 
  product, 
  onLike, 
  onMessage, 
  onClick,
  className 
}: ProductCardProps) => {
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
        "overflow-hidden glass-card card-3d border-0 modern-shadow hover:modern-shadow-lg transition-all duration-300 cursor-pointer w-full group", 
        className
      )}
      onClick={onClick}
    >
      <div className="relative aspect-square bg-gradient-to-br from-white to-gray-50 overflow-hidden">
        {/* Product image */}
        {(() => {
          let mainImage = null;
          
          // Try to get image from images array first
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
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  console.error('Image load error for:', correctImage);
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            );
          } else {
            return (
              <div className="w-full h-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                <div className="text-center p-4">
                  <span className="text-gray-400 text-xs sm:text-sm block">{product.category}</span>
                  <span className="text-gray-300 text-xs block mt-1">Pas d'image</span>
                </div>
              </div>
            );
          }
        })()}
        
        {/* Status badges */}
        <div className="absolute top-2 left-2 flex gap-2">
          {product.isFree && (
            <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs modern-shadow">
              Gratuit
            </Badge>
          )}
          {product.isReserved && (
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs modern-shadow">
              Réservé
            </Badge>
          )}
          {product.isAdvertisement && (
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs modern-shadow">
              Publicité
            </Badge>
          )}

        </div>
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      <CardContent className="p-3 sm:p-4 flex-1 flex flex-col justify-between min-h-[120px] sm:min-h-[140px] relative bg-gradient-to-b from-white to-gray-50/50">
        <div>
          <h3 className="font-medium text-foreground text-xs sm:text-sm leading-tight mb-1 sm:mb-2 line-clamp-2">
            {product.title}
          </h3>
          
          <div className="text-sm sm:text-lg font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1 sm:mb-2">
            {product.isFree ? "Gratuit" : formatPrice(product.price)}
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
                      <div key={index} className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        <Icon size={12} />
                        <span className="truncate max-w-16">{detail.text}</span>
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
            <span className="truncate">{product.location}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-auto pt-1 sm:pt-2">
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock size={10} className="mr-1" />
            <span className="truncate">{product.timeAgo}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 glass-card border-0 modern-shadow hover:modern-shadow-lg hover:scale-110 transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation();
                handleLike();
              }}
            >
              <Heart 
                size={14} 
                className={`transition-all duration-300 ${
                  isLiked 
                    ? 'text-red-500 fill-red-500 scale-125 drop-shadow-sm' 
                    : 'text-muted-foreground hover:text-red-500'
                }`} 
              />
            </Button>
            <span className="text-xs text-muted-foreground">{likesCount}</span>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 glass-card border-0 modern-shadow hover:modern-shadow-lg hover:scale-110 transition-all duration-300 ml-2"
              onClick={(e) => {
                e.stopPropagation();
                onMessage?.();
              }}
            >
              <MessageCircle size={14} className="text-muted-foreground hover:text-blue-500 transition-colors duration-300" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const ProductCard = React.memo(ProductCardComponent);