import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ProductMapProps {
  location?: string;
  onLocationSelect?: (location: string, coordinates: [number, number]) => void;
  readonly?: boolean;
  className?: string;
}

export const ProductMap = ({ location, onLocationSelect, readonly = false, className }: ProductMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [needsToken, setNeedsToken] = useState(false);

  useEffect(() => {
    // For now, we'll use a simple placeholder since we don't have the Mapbox token
    // In a real implementation, you would get this from Supabase Edge Function secrets
    setNeedsToken(true);
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [10.1815, 36.8065], // Tunisia coordinates
      zoom: 6,
    });

    map.current.addControl(new mapboxgl.NavigationControl());

    // Add click handler for location selection
    if (!readonly && onLocationSelect) {
      map.current.on('click', async (e) => {
        const { lng, lat } = e.lngLat;
        
        // Reverse geocoding to get address
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}&types=place,locality,neighborhood,address&country=tn`
          );
          const data = await response.json();
          
          if (data.features && data.features.length > 0) {
            const address = data.features[0].place_name;
            onLocationSelect(address, [lng, lat]);
            
            // Update marker
            if (marker.current) {
              marker.current.remove();
            }
            marker.current = new mapboxgl.Marker()
              .setLngLat([lng, lat])
              .addTo(map.current!);
          }
        } catch (error) {
          console.error('Error getting location:', error);
        }
      });
    }

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, readonly, onLocationSelect]);

  // Geocode location when provided
  useEffect(() => {
    if (!location || !map.current || !mapboxToken) return;

    const geocodeLocation = async () => {
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${mapboxToken}&country=tn&limit=1`
        );
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
          const [lng, lat] = data.features[0].center;
          
          map.current!.flyTo({
            center: [lng, lat],
            zoom: 12
          });
          
          // Add marker
          if (marker.current) {
            marker.current.remove();
          }
          marker.current = new mapboxgl.Marker()
            .setLngLat([lng, lat])
            .addTo(map.current!);
        }
      } catch (error) {
        console.error('Error geocoding location:', error);
      }
    };

    geocodeLocation();
  }, [location, mapboxToken]);

  if (needsToken) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <MapPin className="w-12 h-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="font-semibold mb-2">Configuration Mapbox requise</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Pour utiliser la carte, veuillez entrer votre token Mapbox public.
                <br />
                <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Obtenez votre token ici
                </a>
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="pk.eyJ1IjoiVm90cmVUb2tlbkljaS..."
                  value={mapboxToken}
                  onChange={(e) => setMapboxToken(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={() => setNeedsToken(false)}
                  disabled={!mapboxToken}
                >
                  Utiliser
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-0">
        <div ref={mapContainer} className="w-full h-64 rounded-lg" />
        {location && (
          <div className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{location}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};