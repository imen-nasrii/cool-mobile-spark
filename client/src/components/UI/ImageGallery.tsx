import { useState } from "react";
import { ChevronLeft, ChevronRight, X, Expand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  images: string[];
  title?: string;
  className?: string;
}

export const ImageGallery = ({ images, title, className }: ImageGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const openFullscreen = () => {
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
  };

  if (images.length === 0) return null;

  return (
    <>
      {/* Main Gallery */}
      <div className={cn("relative overflow-hidden rounded-xl max-w-xs mx-auto", className)}>
        <div className="relative aspect-[3/2] bg-muted">
          <img
            src={images[currentIndex]}
            alt={title || `Image ${currentIndex + 1}`}
            className="w-full h-full object-cover cursor-zoom-in"
            onClick={openFullscreen}
          />
          
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white hover:bg-black/70"
                onClick={prevImage}
              >
                <ChevronLeft size={16} />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white hover:bg-black/70"
                onClick={nextImage}
              >
                <ChevronRight size={16} />
              </Button>
            </>
          )}
          
          {/* Fullscreen Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white hover:bg-black/70"
            onClick={openFullscreen}
            title="Plein écran"
          >
            <Expand size={16} />
          </Button>
          
          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>
        
        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                className={cn(
                  "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                  index === currentIndex
                    ? "border-tomati-red shadow-lg"
                    : "border-transparent opacity-60 hover:opacity-100"
                )}
                onClick={() => setCurrentIndex(index)}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 text-white hover:bg-white/30"
            onClick={closeFullscreen}
          >
            <X size={20} />
          </Button>
          
          <div className="relative max-w-4xl max-h-full">
            <img
              src={images[currentIndex]}
              alt={title || `Image ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
            
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 text-white hover:bg-white/30"
                  onClick={prevImage}
                >
                  <ChevronLeft size={24} />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 text-white hover:bg-white/30"
                  onClick={nextImage}
                >
                  <ChevronRight size={24} />
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};