import { useState } from "react";
import { ArrowLeft, Share, Heart, MessageCircle, Phone, Shield, Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ImageGallery } from "@/components/UI/ImageGallery";

// Mock product data with multiple images
import teslaImage from "@/assets/tesla-model3.jpg";
import motherboardImage from "@/assets/motherboard-i5.jpg";

interface ProductDetailProps {
  productId?: string;
  onBack?: () => void;
}

export const ProductDetail = ({ productId = "5", onBack }: ProductDetailProps) => {
  const [isLiked, setIsLiked] = useState(false);

  // Mock product data - in real app this would come from API
  const product = {
    id: "5",
    title: "Tesla Model 3 - Electric Car",
    price: "120,000 DT",
    originalPrice: "135,000 DT",
    location: "Gabes, Tunisia",
    timeAgo: "6 days ago",
    images: [teslaImage, motherboardImage, teslaImage], // Multiple images for gallery
    category: "Cars",
    likes: 45,
    views: 234,
    isReserved: false,
    isFree: false,
    description: "Tesla Model 3 2020 in excellent condition. All maintenance records available. Battery health at 95%. Autopilot feature included. Perfect for eco-friendly transportation in Tunisia.",
    features: ["Autopilot", "Premium Interior", "Supercharger Network", "Mobile App Control"],
    seller: {
      name: "Sayros",
      username: "@sayros",
      rating: 4.8,
      totalSales: 23,
      verified: true,
      joinDate: "Member since 2019"
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-gradient-tomati backdrop-blur-sm z-40 px-4 py-3">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2 text-white hover:bg-white/20"
            onClick={onBack}
          >
            <ArrowLeft size={20} />
          </Button>
          
          <h1 className="text-lg font-semibold text-white truncate mx-4">
            {product.title}
          </h1>
          
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="p-2 text-white hover:bg-white/20">
              <Share size={20} />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 text-white hover:bg-white/20"
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart size={20} className={isLiked ? "fill-white" : ""} />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        {/* Image Gallery */}
        <div className="px-4 py-4">
          <ImageGallery 
            images={product.images} 
            title={product.title}
            className="rounded-2xl shadow-lg"
          />
        </div>

        {/* Product Info */}
        <div className="px-4 space-y-4">
          {/* Price & Title */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-1">{product.title}</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-tomati-red">{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">{product.originalPrice}</span>
                    )}
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <div className="flex items-center gap-1 mb-1">
                    <Heart size={12} />
                    <span>{product.likes}</span>
                  </div>
                  <div>{product.views} views</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin size={14} />
                <span>{product.location}</span>
                <span>•</span>
                <span>{product.timeAgo}</span>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              
              {product.features.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-foreground mb-2">Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.features.map((feature) => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Seller Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {product.seller.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{product.seller.name}</h3>
                    {product.seller.verified && (
                      <Shield size={16} className="text-success" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                    <span>{product.seller.rating}</span>
                    <span>•</span>
                    <span>{product.seller.totalSales} sales</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{product.seller.joinDate}</p>
                </div>
                
                <Button variant="outline" size="sm" className="border-tomati-red/20 text-tomati-red hover:bg-tomati-red/10">
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 z-50">
        <div className="flex gap-3 max-w-md mx-auto">
          <Button 
            variant="outline" 
            size="lg" 
            className="flex-1 border-tomati-red/20 text-tomati-red hover:bg-tomati-red/10"
          >
            <Phone size={18} className="mr-2" />
            Call
          </Button>
          <Button 
            size="lg" 
            className="flex-1 bg-tomati-red hover:bg-tomati-red/90 text-white"
          >
            <MessageCircle size={18} className="mr-2" />
            Message
          </Button>
        </div>
      </div>
    </div>
  );
};