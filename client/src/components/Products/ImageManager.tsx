import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Upload, Move, Edit2, RotateCcw, Expand, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageManagerProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  className?: string;
}

export const ImageManager = ({ 
  images, 
  onImagesChange, 
  maxImages = 8,
  className = "" 
}: ImageManagerProps) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const { toast } = useToast();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    if (images.length + files.length > maxImages) {
      toast({
        title: "Limite d'images atteinte",
        description: `Vous ne pouvez ajouter que ${maxImages - images.length} image(s) supplémentaire(s)`,
        variant: "destructive"
      });
      return;
    }

    const newImages: string[] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          // Upload to object storage instead of converting to base64
          const objectId = `product-${Date.now()}-${i}`;
          const formData = new FormData();
          formData.append('file', file);
          
          const response = await fetch(`/api/objects/upload/${objectId}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
          });
          
          if (response.ok) {
            const result = await response.json();
            newImages.push(result.url || result.path);
          } else {
            console.error('Failed to upload image:', response.statusText);
            toast({
              title: "Erreur d'upload",
              description: `Impossible d'uploader ${file.name}`,
              variant: "destructive"
            });
          }
        }
      }
      
      if (newImages.length > 0) {
        onImagesChange([...images, ...newImages]);
        toast({
          title: "Images ajoutées",
          description: `${newImages.length} image(s) ajoutée(s) avec succès`,
        });
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'upload des images",
        variant: "destructive"
      });
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onImagesChange(newImages);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      moveImage(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  };

  const setAsMainImage = (index: number) => {
    if (index === 0) return;
    moveImage(index, 0);
    toast({
      title: "Image principale mise à jour",
      description: "Cette image est maintenant l'image principale",
    });
  };

  const openFullscreen = (index: number) => {
    setFullscreenIndex(index);
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
  };

  const nextImage = () => {
    setFullscreenIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setFullscreenIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          id="image-upload-manager"
        />
        <label htmlFor="image-upload-manager" className="cursor-pointer">
          <Upload size={32} className="mx-auto text-gray-400 mb-3" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            Ajouter des photos
          </p>
          <Button type="button" variant="outline" className="mb-4">
            Sélectionner des images
          </Button>
          <div className="text-sm text-gray-500">
            {images.length}/{maxImages} images • PNG, JPG jusqu'à 10MB
          </div>
        </label>
      </div>

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              className={`relative group aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                index === 0 
                  ? 'border-red-500 ring-2 ring-red-200' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
            >
              <img
                src={image}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Main Image Badge */}
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  Principale
                </div>
              )}

              {/* Image Controls */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => openFullscreen(index)}
                    className="w-8 h-8 p-0 bg-white/20 hover:bg-white/30 text-white"
                    title="Voir en plein écran"
                  >
                    <Expand size={14} />
                  </Button>
                  {index !== 0 && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setAsMainImage(index)}
                      className="w-8 h-8 p-0"
                      title="Définir comme image principale"
                    >
                      <RotateCcw size={14} />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeImage(index)}
                    className="w-8 h-8 p-0"
                    title="Supprimer l'image"
                  >
                    <X size={14} />
                  </Button>
                </div>
              </div>

              {/* Drag Handle */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-6 h-6 bg-white bg-opacity-80 rounded-full flex items-center justify-center cursor-move">
                  <Move size={12} className="text-gray-600" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 text-white hover:bg-white/30"
            onClick={closeFullscreen}
          >
            <X size={20} />
          </Button>
          
          <div className="relative max-w-5xl max-h-full">
            <img
              src={images[fullscreenIndex]}
              alt={`Image ${fullscreenIndex + 1}`}
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
                
                {/* Image Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
                  {fullscreenIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Helper Text */}
      {images.length > 0 && (
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <p className="font-medium mb-1">💡 Conseils :</p>
          <ul className="space-y-1 text-xs">
            <li>• La première image sera l'image principale</li>
            <li>• Glissez-déposez pour réorganiser</li>
            <li>• Cliquez sur ⤢ pour voir en plein écran</li>
            <li>• Cliquez sur l'icône ↻ pour définir comme principale</li>
            <li>• Utilisez des images de haute qualité (au moins 800x800px)</li>
          </ul>
        </div>
      )}
    </div>
  );
};