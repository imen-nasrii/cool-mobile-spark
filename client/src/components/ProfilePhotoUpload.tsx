import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Camera, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ProfilePhotoUploadProps {
  currentAvatarUrl?: string;
  onSuccess?: () => void;
}

export function ProfilePhotoUpload({ currentAvatarUrl, onSuccess }: ProfilePhotoUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Upload photo mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      const token = localStorage.getItem('token');
      
      // Get upload URL
      const uploadResponse = await fetch('/api/objects/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Erreur lors de la récupération de l\'URL de téléchargement');
      }
      
      const { uploadURL } = await uploadResponse.json();
      
      // Upload file
      const fileUploadResponse = await fetch(uploadURL, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      });
      
      if (!fileUploadResponse.ok) {
        throw new Error('Erreur lors du téléchargement du fichier');
      }
      
      // Update profile with new avatar URL
      const updateResponse = await fetch('/api/profile/avatar', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ avatarURL: uploadURL })
      });
      
      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour de l\'avatar');
      }
      
      return updateResponse.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      setIsOpen(false);
      setSelectedFile(null);
      setImagePreview(null);
      onSuccess?.();
      toast({
        title: "Succès",
        description: "Photo de profil mise à jour avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors du téléchargement de l'image",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Erreur",
          description: "Veuillez sélectionner un fichier image",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erreur",
          description: "La taille du fichier ne doit pas dépasser 5MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadPhotoMutation.mutate(selectedFile);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="absolute bottom-0 right-0 h-8 w-8 rounded-full p-0 bg-white shadow-lg"
        >
          <Camera className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Changer la photo de profil</DialogTitle>
          <DialogDescription>
            Sélectionnez une nouvelle image pour votre photo de profil. Formats acceptés : JPG, PNG, GIF (max 5MB)
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Current Avatar Preview */}
          {currentAvatarUrl && !imagePreview && (
            <div className="flex justify-center">
              <div className="relative">
                <img 
                  src={currentAvatarUrl} 
                  alt="Photo actuelle"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                />
                <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">
                  Photo actuelle
                </span>
              </div>
            </div>
          )}
          
          {/* New Image Preview */}
          {imagePreview && (
            <div className="flex justify-center">
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Nouvelle photo"
                  className="w-24 h-24 rounded-full object-cover border-2 border-blue-200"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={() => {
                    setSelectedFile(null);
                    setImagePreview(null);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
                <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-green-600">
                  Nouvelle photo
                </span>
              </div>
            </div>
          )}
          
          {/* File Input */}
          <div className="flex justify-center">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                <Upload className="h-4 w-4" />
                <span className="text-sm">
                  {selectedFile ? 'Changer l\'image' : 'Sélectionner une image'}
                </span>
              </div>
            </label>
          </div>

          {selectedFile && (
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Fichier sélectionné: {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                Taille: {Math.round(selectedFile.size / 1024)} KB
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Annuler
          </Button>
          <Button 
            onClick={handleUpload}
            disabled={!selectedFile || uploadPhotoMutation.isPending}
          >
            {uploadPhotoMutation.isPending ? 'Téléchargement...' : 'Sauvegarder'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}