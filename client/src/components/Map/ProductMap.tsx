import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface ProductMapProps {
  location?: string;
  onLocationSelect?: (location: string, coordinates: [number, number]) => void;
  readonly?: boolean;
  className?: string;
}

export const ProductMap = ({ location, onLocationSelect, readonly = false, className }: ProductMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState(location || '');

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map centered on Tunisia
    map.current = L.map(mapContainer.current).setView([36.8065, 10.1815], 7);

    // Add OpenStreetMap tiles (free!)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current);

    // Add click handler for location selection
    if (!readonly && onLocationSelect) {
      map.current.on('click', (e) => {
        const { lat, lng } = e.latlng;
        
        // Simple reverse geocoding approximation for Tunisia
        const approximateLocation = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        onLocationSelect(approximateLocation, [lng, lat]);
        
        // Update marker
        if (marker.current) {
          marker.current.remove();
        }
        marker.current = L.marker([lat, lng]).addTo(map.current!);
      });
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [readonly, onLocationSelect]);

  // Handle search functionality
  const handleSearch = async () => {
    if (!searchQuery.trim() || !map.current) return;

    try {
      // Use Nominatim (free OpenStreetMap geocoding service)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=tn&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        
        // Center map on found location
        map.current.setView([parseFloat(lat), parseFloat(lon)], 12);
        
        // Add/update marker
        if (marker.current) {
          marker.current.remove();
        }
        marker.current = L.marker([parseFloat(lat), parseFloat(lon)]).addTo(map.current);
        
        // Update location if callback provided
        if (onLocationSelect) {
          onLocationSelect(display_name, [parseFloat(lon), parseFloat(lat)]);
        }
      }
    } catch (error) {
      console.error('Error searching location:', error);
    }
  };

  // Auto-search when location prop changes
  useEffect(() => {
    if (location && location !== searchQuery) {
      setSearchQuery(location);
    }
  }, [location]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-0">
        {/* Search bar for location */}
        {!readonly && (
          <div className="p-4 border-b">
            <div className="flex gap-2">
              <Input
                placeholder="Rechercher une ville en Tunisie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={handleSearch} size="sm">
                <Navigation className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Map container */}
        <div ref={mapContainer} className="w-full h-64 rounded-lg" />
        
        {/* Location display */}
        {location && (
          <div className="p-4 border-t">
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