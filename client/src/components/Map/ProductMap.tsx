import { useState, useEffect } from 'react';
import { MapPin, Navigation, Loader2, RefreshCw, Locate, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { formatPrice } from '@/utils/currency';
import { useLanguage } from '@/hooks/useLanguage';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  city?: string;
}

interface ProductWithDistance {
  id: string;
  title: string;
  price: number;
  location: string;
  latitude: number;
  longitude: number;
  is_free: boolean;
  is_promoted: boolean;
  category: string;
  image_url?: string;
  created_at: string;
  distance?: number;
}

// Coordonnées des principales villes tunisiennes
const tunisianCities: { [key: string]: [number, number] } = {
  'Tunis': [36.8065, 10.1815],
  'Sfax': [34.7406, 10.7603],
  'Sousse': [35.8256, 10.6369],
  'Kairouan': [35.6781, 10.0963],
  'Bizerte': [37.2744, 9.8739],
  'Gabès': [33.8815, 10.0982],
  'Ariana': [36.8625, 10.1956],
  'Gafsa': [34.4250, 8.7842],
  'Monastir': [35.7643, 10.8113],
  'Ben Arous': [36.7542, 10.2277],
  'Kasserine': [35.1676, 8.8308],
  'Médenine': [33.3545, 10.5055],
  'Nabeul': [36.4560, 10.7376],
  'Béja': [36.7256, 9.1817],
  'Jendouba': [36.5014, 8.7800],
  'Mahdia': [35.5047, 11.0622],
  'Siliana': [36.0837, 9.3710],
  'Kébili': [33.7047, 8.9692],
  'Le Kef': [36.1693, 8.7041],
  'Tozeur': [33.9197, 8.1335],
  'Zaghouan': [36.4029, 10.1425],
  'Manouba': [36.8097, 10.0969]
};

// Fonction pour déterminer la ville la plus proche
const findNearestCity = (lat: number, lng: number): string => {
  let nearestCity = 'Tunis';
  let minDistance = Infinity;

  Object.entries(tunisianCities).forEach(([city, [cityLat, cityLng]]) => {
    const distance = calculateDistance(lat, lng, cityLat, cityLng);
    if (distance < minDistance) {
      minDistance = distance;
      nearestCity = city;
    }
  });

  return nearestCity;
};

// Calcul de la distance entre deux points
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Rayon de la Terre en kilomètres
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export function ProductMap() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [selectedRadius, setSelectedRadius] = useState(10); // km
  const { t } = useLanguage();

  // Récupération des produits avec données de localisation
  const { data: productsData = [], refetch, isLoading } = useQuery({
    queryKey: ['products-with-location'],
    queryFn: async () => {
      const products = await apiClient.getProducts();
      
      return products.map((product: any) => {
        const cityName = product.location;
        let coordinates = tunisianCities[cityName];
        
        // Recherche partielle si pas de correspondance exacte
        if (!coordinates) {
          const matchedCity = Object.keys(tunisianCities).find(city => 
            cityName.toLowerCase().includes(city.toLowerCase()) || 
            city.toLowerCase().includes(cityName.toLowerCase())
          );
          if (matchedCity) {
            coordinates = tunisianCities[matchedCity];
          }
        }

        // Par défaut Tunis si aucune correspondance
        if (!coordinates) {
          coordinates = [36.8065, 10.1815];
        }

        return {
          ...product,
          latitude: coordinates[0] + (Math.random() - 0.5) * 0.02,
          longitude: coordinates[1] + (Math.random() - 0.5) * 0.02
        };
      });
    },
    staleTime: 5 * 60 * 1000,
  });

  const getUserLocation = () => {
    setIsLoadingLocation(true);
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('La géolocalisation n\'est pas supportée par ce navigateur');
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const nearestCity = findNearestCity(latitude, longitude);
        
        setUserLocation({
          latitude,
          longitude,
          accuracy,
          city: nearestCity
        });
        setIsLoadingLocation(false);
      },
      (error) => {
        let errorMessage = 'Erreur de géolocalisation';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permission de géolocalisation refusée';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Position indisponible';
            break;
          case error.TIMEOUT:
            errorMessage = 'Timeout de géolocalisation';
            break;
        }
        setLocationError(errorMessage);
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  // Obtenir la position au chargement
  useEffect(() => {
    getUserLocation();
  }, []);

  // Filtrer et trier les produits par distance
  const nearbyProducts: ProductWithDistance[] = userLocation 
    ? productsData
        .map((product: any) => ({
          ...product,
          distance: calculateDistance(
            userLocation.latitude, 
            userLocation.longitude, 
            product.latitude, 
            product.longitude
          )
        }))
        .filter((product: ProductWithDistance) => product.distance! <= selectedRadius)
        .sort((a: ProductWithDistance, b: ProductWithDistance) => a.distance! - b.distance!)
    : productsData.slice(0, 20); // Limite à 20 produits si pas de géolocalisation

  const radiusOptions = [5, 10, 25, 50, 100];

  return (
    <div className="h-full w-full bg-gray-50">
      {/* Header avec contrôles */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Articles près de vous</h2>
            {userLocation && (
              <p className="text-sm text-gray-600">
                <Locate className="inline w-4 h-4 mr-1" />
                {userLocation.city} • {nearbyProducts.length} articles trouvés
              </p>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={getUserLocation}
              disabled={isLoadingLocation}
              variant="outline"
              size="sm"
            >
              {isLoadingLocation ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Navigation className="h-4 w-4 mr-1" />
              )}
              Ma position
            </Button>
            
            <Button
              onClick={() => refetch()}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-1" />
              )}
              Actualiser
            </Button>
          </div>
        </div>

        {/* Sélecteur de rayon */}
        {userLocation && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Rayon:</span>
            {radiusOptions.map((radius) => (
              <Button
                key={radius}
                variant={selectedRadius === radius ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRadius(radius)}
                className="text-xs"
              >
                {radius} km
              </Button>
            ))}
          </div>
        )}

        {/* Erreur de géolocalisation */}
        {locationError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{locationError}</p>
          </div>
        )}
      </div>

      {/* Liste des produits */}
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="p-4 space-y-4">
          {nearbyProducts.map((product: ProductWithDistance) => (
            <Card key={product.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Image du produit */}
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/10 flex items-center justify-center">
                        <span className="text-xs text-gray-500">{product.category}</span>
                      </div>
                    )}
                  </div>

                  {/* Informations du produit */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-sm line-clamp-2 text-gray-900">
                        {product.title}
                      </h3>
                      
                      <div className="flex gap-1 ml-2">
                        {product.is_promoted && (
                          <Badge className="bg-orange-500 text-white text-xs">
                            <Star className="w-3 h-3 mr-1" />
                            PUB
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-tomati-red">
                        {product.is_free ? 'Gratuit' : formatPrice(product.price)}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {product.category}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{product.location}</span>
                      </div>
                      
                      {product.distance && (
                        <div className="flex items-center gap-1">
                          <Navigation className="w-3 h-3" />
                          <span className="font-medium">
                            {product.distance < 1 
                              ? `${Math.round(product.distance * 1000)}m` 
                              : `${product.distance.toFixed(1)}km`
                            }
                          </span>
                        </div>
                      )}
                    </div>

                    <Button 
                      size="sm" 
                      className="w-full mt-3"
                      onClick={() => window.open(`/product/${product.id}`, '_blank')}
                    >
                      Voir l'article
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {nearbyProducts.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun article trouvé
              </h3>
              <p className="text-gray-600 mb-4">
                {userLocation 
                  ? `Aucun article dans un rayon de ${selectedRadius}km` 
                  : 'Activez la géolocalisation pour voir les articles près de vous'
                }
              </p>
              {!userLocation && (
                <Button onClick={getUserLocation} disabled={isLoadingLocation}>
                  <Navigation className="w-4 h-4 mr-2" />
                  Activer la géolocalisation
                </Button>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}