import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Map, X } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  place_id: string;
}

interface LocationInputProps {
  value: string;
  onChange: (location: string, coordinates?: { lat: number; lon: number }) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export function LocationInput({ 
  value, 
  onChange, 
  placeholder = "Ex: Tunis, Sfax, Sousse...",
  className = "h-12 pl-10",
  required = false 
}: LocationInputProps) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const { toast } = useToast();
  const debounceRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);

  // Fonction pour rechercher des suggestions de localisation
  const searchLocations = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      // Utiliser l'API Nominatim d'OpenStreetMap (gratuite)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&countrycodes=tn&q=${encodeURIComponent(query)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Erreur de géolocalisation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce pour éviter trop de requêtes API
  const handleInputChange = (inputValue: string) => {
    onChange(inputValue);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      searchLocations(inputValue);
    }, 300);
  };

  // Sélectionner une suggestion
  const selectSuggestion = (suggestion: LocationSuggestion) => {
    const location = suggestion.display_name;
    const coordinates = {
      lat: parseFloat(suggestion.lat),
      lon: parseFloat(suggestion.lon)
    };
    
    onChange(location, coordinates);
    setSuggestions([]);
    setShowSuggestions(false);
    
    toast({
      title: "Localisation sélectionnée",
      description: location,
    });
  };

  // Obtenir la géolocalisation actuelle
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Géolocalisation non supportée",
        description: "Votre navigateur ne supporte pas la géolocalisation",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Utiliser les coordonnées directement comme fallback
          const simpleLocation = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          
          try {
            // Tentative de géocodage inverse
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
              { signal: controller.signal }
            );
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
              const data = await response.json();
              const location = data.display_name || simpleLocation;
              onChange(location, { lat: latitude, lon: longitude });
              
              toast({
                title: "Position actuelle détectée",
                description: location,
              });
              return;
            }
          } catch (apiError) {
            // Fallback silencieux aux coordonnées
          }
          
          // Utiliser les coordonnées comme fallback
          onChange(simpleLocation, { lat: latitude, lon: longitude });
          toast({
            title: "Position détectée",
            description: simpleLocation,
          });
          
        } catch (error) {
          toast({
            title: "Erreur de géolocalisation",
            description: "Impossible d'obtenir votre position",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        setIsLoading(false);
        toast({
          title: "Erreur de géolocalisation",
          description: "Veuillez autoriser l'accès à votre position",
          variant: "destructive"
        });
      }
    );
  };

  // Fermer les suggestions si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          className={className}
          required={required}
        />
        
        {/* Boutons d'action */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={getCurrentLocation}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <Map size={16} className="text-gray-500" />
          </Button>
          
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange('')}
              className="h-8 w-8 p-0"
            >
              <X size={16} className="text-gray-500" />
            </Button>
          )}
        </div>
      </div>

      {/* Liste des suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.place_id}
              onClick={() => selectSuggestion(suggestion)}
              className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-gray-400 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {suggestion.display_name}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Indicateur de chargement */}
      {isLoading && (
        <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
        </div>
      )}
    </div>
  );
}