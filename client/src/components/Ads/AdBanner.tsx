import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, ExternalLink } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient, queryClient } from "@/lib/queryClient";

interface Advertisement {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  target_url?: string;
  advertiser_name: string;
  category?: string;
  position: string;
  is_active: boolean;
  click_count: number;
  impression_count: number;
}

interface AdBannerProps {
  position: 'header' | 'sidebar' | 'between_products' | 'footer';
  category?: string;
  className?: string;
  showCloseButton?: boolean;
}

export const AdBanner = ({ position, category, className = "", showCloseButton = true }: AdBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [hasTrackedImpression, setHasTrackedImpression] = useState(false);

  // Fetch advertisements for this position
  const { data: ads = [] } = useQuery({
    queryKey: ['/advertisements', position, category],
    queryFn: () => apiClient.request(`/advertisements?position=${position}&category=${category || ''}`),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: isVisible,
  });

  // Track ad impression
  const impressionMutation = useMutation({
    mutationFn: (adId: string) => apiClient.request(`/advertisements/${adId}/impression`, { method: 'POST' }),
  });

  // Track ad click
  const clickMutation = useMutation({
    mutationFn: (adId: string) => apiClient.request(`/advertisements/${adId}/click`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/advertisements'] });
    }
  });

  const selectedAd = ads.length > 0 ? ads[Math.floor(Math.random() * ads.length)] : null;

  // Track impression when ad is shown
  useEffect(() => {
    if (selectedAd && !hasTrackedImpression && isVisible) {
      impressionMutation.mutate(selectedAd.id);
      setHasTrackedImpression(true);
    }
  }, [selectedAd, hasTrackedImpression, isVisible]);

  const handleAdClick = () => {
    if (selectedAd) {
      clickMutation.mutate(selectedAd.id);
      if (selectedAd.target_url) {
        window.open(selectedAd.target_url, '_blank');
      }
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible || !selectedAd) {
    return null;
  }

  const getPositionStyles = () => {
    switch (position) {
      case 'header':
        return "w-full bg-gradient-to-r from-blue-50 to-purple-50";
      case 'sidebar':
        return "w-full max-w-sm";
      case 'between_products':
        return "w-full col-span-full";
      case 'footer':
        return "w-full bg-gray-50";
      default:
        return "w-full";
    }
  };

  return (
    <Card className={`${getPositionStyles()} ${className} relative group hover:shadow-lg transition-shadow border-dashed border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50`}>
      {showCloseButton && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
          onClick={handleClose}
        >
          <X size={14} />
        </Button>
      )}
      
      <CardContent className="p-4">
        <div className="flex items-start gap-4 cursor-pointer" onClick={handleAdClick}>
          {selectedAd.image_url && (
            <div className="flex-shrink-0">
              <img
                src={selectedAd.image_url}
                alt={selectedAd.title}
                className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg"
              />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                Publicité
              </Badge>
              <span className="text-xs text-gray-500">{selectedAd.advertiser_name}</span>
            </div>
            
            <h3 className="font-semibold text-sm md:text-base mb-1 line-clamp-1">
              {selectedAd.title}
            </h3>
            
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {selectedAd.description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>{selectedAd.impression_count.toLocaleString()} vues</span>
                <span>{selectedAd.click_count.toLocaleString()} clics</span>
              </div>
              
              {selectedAd.target_url && (
                <Button size="sm" variant="outline" className="h-7 px-3 text-xs">
                  <ExternalLink size={12} className="mr-1" />
                  Voir plus
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};