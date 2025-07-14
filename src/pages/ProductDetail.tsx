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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Desktop Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-40 px-6 py-4">
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
            <Button variant="outline" size="sm" className="gap-2">
              <Share size={16} />
              Share
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className={`gap-2 ${isLiked ? "bg-red-50 border-red-200 text-red-600" : ""}`}
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart size={16} className={isLiked ? "fill-current" : ""} />
              {isLiked ? "Liked" : "Like"}
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Layout - 2 Column Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Images */}
          <div className="space-y-6">
            <ImageGallery 
              images={product.images} 
              title={product.title}
              className="rounded-2xl shadow-xl w-full"
            />
            
            {/* Quick Stats Card */}
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{product.likes}</div>
                    <div className="text-sm text-muted-foreground">Likes</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{product.views}</div>
                    <div className="text-sm text-muted-foreground">Views</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">4.8</div>
                    <div className="text-sm text-muted-foreground">Rating</div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                  </div>
                  
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-primary">{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-xl text-muted-foreground line-through">{product.originalPrice}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin size={16} />
                    <span className="text-base">{product.location}</span>
                    <span>•</span>
                    <span>{product.timeAgo}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="glass-card">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-4">Description</h3>
                <p className="text-muted-foreground leading-relaxed text-base mb-6">{product.description}</p>
                
                {product.features.length > 0 && (
                  <div>
                    <h4 className="text-lg font-medium text-foreground mb-3">Features</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {product.features.map((feature) => (
                        <Badge key={feature} variant="outline" className="justify-start p-3 text-sm">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Seller Info */}
            <Card className="glass-card">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-4">Seller Information</h3>
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium text-xl">
                      {product.seller.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-lg font-semibold text-foreground">{product.seller.name}</h4>
                      {product.seller.verified && (
                        <Shield size={18} className="text-success" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Star size={14} className="text-yellow-500 fill-yellow-500" />
                      <span>{product.seller.rating}</span>
                      <span>•</span>
                      <span>{product.seller.totalSales} sales</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{product.seller.joinDate}</p>
                  </div>
                  
                  <Button variant="outline" className="border-primary/20 text-primary hover:bg-primary/10">
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                size="lg" 
                className="flex-1 border-primary/20 text-primary hover:bg-primary/10 h-14 text-lg"
              >
                <Phone size={20} className="mr-2" />
                Call Seller
              </Button>
              <Button 
                size="lg" 
                className="flex-1 bg-primary hover:bg-primary/90 text-white h-14 text-lg"
              >
                <MessageCircle size={20} className="mr-2" />
                Send Message
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};