import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { MapPin, Filter, Navigation, Heart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import "leaflet/dist/leaflet.css";

// Fix for default markers in React Leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different categories
const createCustomIcon = (color: string) => new Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const categoryIcons: { [key: string]: Icon } = {
  "Électronique": createCustomIcon("blue"),
  "Sport": createCustomIcon("green"),
  "Voiture": createCustomIcon("red"),
  "Bureautique": createCustomIcon("orange"),
  "Jeux vidéo": createCustomIcon("violet"),
  "Mobilier": createCustomIcon("yellow"),
};

const categories = ["Électronique", "Sport", "Voiture", "Bureautique", "Jeux vidéo", "Mobilier"];

interface ProductLocation {
  id: string;
  title: string;
  description: string;
  price: string;
  category: string;
  location: string;
  is_free: boolean;
  is_reserved: boolean;
  image_url?: string;
  lat: number;
  lng: number;
  distance?: number;
  likes: number;
  created_at: string;
}

// Mock coordinates for Tunisian cities
const locationCoordinates: { [key: string]: [number, number] } = {
  "Tunis": [36.8065, 10.1815],
  "Sfax": [34.7406, 10.7603],
  "Sousse": [35.8256, 10.6369],
  "Monastir": [35.7777, 10.8263],
  "Bizerte": [37.2746, 9.8739],
  "Gabès": [33.8815, 10.0982],
  "Kairouan": [35.6781, 10.0963],
  "Nabeul": [36.4561, 10.7376]
};

export default function MapView() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [maxDistance, setMaxDistance] = useState<number>(50);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
          toast({
            title: "Position trouvée",
            description: "Votre position actuelle a été détectée.",
          });
        },
        (error) => {
          // Silent fallback to Tunis - no console error needed
          setUserLocation([36.8065, 10.1815]);
          toast({
            title: "Position par défaut",
            description: "Utilisation de Tunis comme position par défaut.",
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      setUserLocation([36.8065, 10.1815]);
      toast({
        title: "Géolocalisation non supportée",
        description: "Utilisation de Tunis comme position par défaut.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Fetch products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['/api/products'],
    queryFn: () => apiClient.getProducts(),
  });

  // Convert products to map markers with coordinates
  const productsWithLocations: ProductLocation[] = products.map((product: any) => {
    const coords = locationCoordinates[product.location] || [36.8065, 10.1815];
    // Add small random offset to avoid overlapping markers
    const randomOffset = () => (Math.random() - 0.5) * 0.01;
    
    const lat = coords[0] + randomOffset();
    const lng = coords[1] + randomOffset();
    
    let distance = 0;
    if (userLocation) {
      // Calculate distance using Haversine formula (simplified)
      const R = 6371; // Earth's radius in km
      const dLat = (lat - userLocation[0]) * Math.PI / 180;
      const dLng = (lng - userLocation[1]) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(userLocation[0] * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
        Math.sin(dLng/2) * Math.sin(dLng/2);
      distance = 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    }
    
    return {
      ...product,
      lat,
      lng,
      distance: Math.round(distance * 10) / 10
    };
  });

  // Filter products based on criteria
  const filteredProducts = productsWithLocations.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    
    const productPrice = product.is_free ? 0 : parseFloat(product.price.replace(/[^0-9.]/g, '')) || 0;
    const matchesPrice = productPrice >= priceRange[0] && productPrice <= priceRange[1];
    
    const matchesDistance = !product.distance || product.distance <= maxDistance;
    
    return matchesSearch && matchesCategory && matchesPrice && matchesDistance;
  });





  if (!userLocation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Détection de votre position...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      {/* Map Header with Filters */}
      <div className="bg-white border-b p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <MapPin className="text-primary" />
                Carte Interactive
              </h1>
              <Badge variant="outline" className="flex items-center gap-1">
                <Navigation size={12} />
                {filteredProducts.length} produits trouvés
              </Badge>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter size={16} />
              Filtres
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="w-80 bg-white border-r p-6 h-screen overflow-y-auto">
            <h3 className="font-semibold mb-4">Filtres de recherche</h3>
            
            <div className="space-y-6">
              {/* Search */}
              <div>
                <label className="text-sm font-medium mb-2 block">Recherche</label>
                <Input
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-medium mb-2 block">Catégorie</label>
                <Select value={selectedCategory || "all"} onValueChange={(value) => setSelectedCategory(value === "all" ? "" : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes catégories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes catégories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Prix: {priceRange[0]}TND - {priceRange[1]}TND
                </label>
                <Slider
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  max={2000}
                  min={0}
                  step={50}
                  className="mt-2"
                />
              </div>

              {/* Distance */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Distance max: {maxDistance} km
                </label>
                <Slider
                  value={[maxDistance]}
                  onValueChange={([value]) => setMaxDistance(value)}
                  max={100}
                  min={1}
                  step={5}
                  className="mt-2"
                />
              </div>

              {/* Reset Filters */}
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCategory("");
                  setPriceRange([0, 2000]);
                  setMaxDistance(50);
                  setSearchTerm("");
                }}
                className="w-full"
              >
                Réinitialiser les filtres
              </Button>
            </div>
          </div>
        )}

        {/* Map */}
        <div className="flex-1 relative">
          {isLoading ? (
            <div className="flex items-center justify-center h-[calc(100vh-140px)]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <MapContainer
              center={userLocation}
              zoom={13}
              className="h-[calc(100vh-160px)] w-full z-10"
              style={{ zIndex: 10 }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* User location marker */}
              <Marker position={userLocation}>
                <Popup>
                  <div className="text-center">
                    <strong>Votre position</strong>
                    <br />
                    <small>Position actuelle détectée</small>
                  </div>
                </Popup>
              </Marker>

              {/* Product markers */}
              {filteredProducts.map((product) => (
                <Marker
                  key={product.id}
                  position={[product.lat, product.lng]}
                  icon={categoryIcons[product.category] || categoryIcons["Électronique"]}
                >
                  <Popup maxWidth={320} className="custom-popup">
                    <Card className="border-0 shadow-none">
                      <CardHeader className="p-3 pb-2">
                        <CardTitle className="text-base">{product.title}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline">{product.category}</Badge>
                          {product.distance && (
                            <span className="flex items-center gap-1">
                              <MapPin size={12} />
                              {product.distance} km
                            </span>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        {product.image_url && (
                          <div className="mb-3">
                            <img 
                              src={product.image_url} 
                              alt={product.title}
                              className="w-full h-32 object-cover rounded-lg border"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="text-lg font-bold text-primary">
                              {product.is_free ? (
                                <Badge variant="secondary">Gratuit</Badge>
                              ) : (
                                product.price
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Heart size={12} />
                              {product.likes || 0}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => {
                                // Open messaging
                                console.log('Contact seller for product:', product.id);
                              }}
                              className="flex-1 bg-primary hover:bg-primary/90"
                            >
                              Contacter
                            </Button>
                          </div>

                          {product.is_reserved && (
                            <Badge variant="destructive" className="w-full text-xs">
                              Réservé
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>
      </div>
    </div>
  );
}