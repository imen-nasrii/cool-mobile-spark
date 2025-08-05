import { Heart, MapPin, Clock, MessageCircle, Car, Fuel, Calendar, Gauge, Home, Users, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { useState } from "react";

interface Product {
  id: string;
  title: string;
  price: string;
  location: string;
  timeAgo: string;
  image?: string;
  isFree?: boolean;
  isReserved?: boolean;
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
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-white border border-gray-200 flex items-center justify-center">
              <span className="text-muted-foreground text-xs" style={{ fontFamily: 'Arial, sans-serif' }}>{product.category}</span>
            </div>
          )}
          
          {/* Status badges */}
          <div className="absolute top-1 left-1 flex gap-1">
            {product.isFree && (
              <Badge className="bg-success text-success-foreground text-xs" style={{ fontFamily: 'Arial, sans-serif' }}>Free</Badge>
            )}
            {product.isReserved && (
              <Badge className="bg-info text-info-foreground text-xs" style={{ fontFamily: 'Arial, sans-serif' }}>Reserved</Badge>
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
              {product.isFree ? "Gratuit" : `${product.price} TND`}
            </div>
            
            <div className="flex items-center text-xs text-muted-foreground mb-2">
              <MapPin size={10} className="mr-1 flex-shrink-0" />
              <span className="truncate" style={{ fontFamily: 'Arial, sans-serif' }}>{product.location}</span>
            </div>
            
            {/* Complete vehicle characteristics like Tesla Model 3 example */}
            {(product.category?.toLowerCase() === 'voitures' || product.category?.toLowerCase() === 'voiture' || product.category?.toLowerCase() === 'vehicles') && (
              <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 text-xs flex items-center gap-1" style={{ fontFamily: 'Arial, sans-serif' }}>
                  <Car size={12} />
                  Caractéristiques du véhicule
                </h4>
                
                {/* Main vehicle details */}
                <div className="grid grid-cols-2 gap-1 text-xs mb-2">
                  {product.brand && (
                    <div>
                      <span className="text-gray-600">Marque</span>
                      <div className="font-medium text-blue-800 dark:text-blue-200" style={{ fontFamily: 'Arial, sans-serif' }}>{product.brand}</div>
                    </div>
                  )}
                  {product.model && (
                    <div>
                      <span className="text-gray-600">Modèle</span>
                      <div className="font-medium text-blue-800 dark:text-blue-200" style={{ fontFamily: 'Arial, sans-serif' }}>{product.model}</div>
                    </div>
                  )}
                  {product.year && (
                    <div>
                      <span className="text-gray-600">Année</span>
                      <div className="font-medium text-blue-800 dark:text-blue-200" style={{ fontFamily: 'Arial, sans-serif' }}>{product.year}</div>
                    </div>
                  )}
                  {product.mileage && (
                    <div>
                      <span className="text-gray-600">Kilométrage</span>
                      <div className="font-medium text-blue-800 dark:text-blue-200" style={{ fontFamily: 'Arial, sans-serif' }}>{Number(product.mileage).toLocaleString()} km</div>
                    </div>
                  )}
                  {product.fuel_type && (
                    <div>
                      <span className="text-gray-600">Carburant</span>
                      <div className="font-medium text-blue-800 dark:text-blue-200" style={{ fontFamily: 'Arial, sans-serif' }}>{product.fuel_type}</div>
                    </div>
                  )}
                  {product.transmission && (
                    <div>
                      <span className="text-gray-600">Transmission</span>
                      <div className="font-medium text-blue-800 dark:text-blue-200" style={{ fontFamily: 'Arial, sans-serif' }}>{product.transmission}</div>
                    </div>
                  )}
                  {product.condition && (
                    <div>
                      <span className="text-gray-600">État</span>
                      <div className="font-medium text-blue-800 dark:text-blue-200" style={{ fontFamily: 'Arial, sans-serif' }}>{product.condition}</div>
                    </div>
                  )}
                  {product.color && (
                    <div>
                      <span className="text-gray-600">Couleur</span>
                      <div className="font-medium text-blue-800 dark:text-blue-200" style={{ fontFamily: 'Arial, sans-serif' }}>{product.color}</div>
                    </div>
                  )}
                  {product.doors && (
                    <div>
                      <span className="text-gray-600">Portes</span>
                      <div className="font-medium text-blue-800 dark:text-blue-200" style={{ fontFamily: 'Arial, sans-serif' }}>{product.doors} portes</div>
                    </div>
                  )}
                  {product.power && (
                    <div>
                      <span className="text-gray-600">Puissance</span>
                      <div className="font-medium text-blue-800 dark:text-blue-200" style={{ fontFamily: 'Arial, sans-serif' }}>{product.power}</div>
                    </div>
                  )}
                </div>


              </div>
            )}
            
            {/* Real estate details */}
            {product.category?.toLowerCase() === 'immobilier' && (
              <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs text-muted-foreground mb-1">
                {product.rooms && (
                  <div className="flex items-center gap-1">
                    <Home size={8} />
                    <span className="truncate" style={{ fontFamily: 'Arial, sans-serif' }}>{product.rooms} pièces</span>
                  </div>
                )}
                {product.surface && (
                  <div className="flex items-center gap-1">
                    <Users size={8} />
                    <span className="truncate" style={{ fontFamily: 'Arial, sans-serif' }}>{product.surface} m²</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Job details */}
            {product.category?.toLowerCase() === 'emploi' && (
              <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs text-muted-foreground mb-1">
                {product.contract_type && (
                  <div className="flex items-center gap-1">
                    <Briefcase size={8} />
                    <span className="truncate" style={{ fontFamily: 'Arial, sans-serif' }}>{product.contract_type}</span>
                  </div>
                )}
                {product.salary_range && (
                  <div className="flex items-center gap-1">
                    <span className="truncate" style={{ fontFamily: 'Arial, sans-serif' }}>{product.salary_range}</span>
                  </div>
                )}
              </div>
            )}
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