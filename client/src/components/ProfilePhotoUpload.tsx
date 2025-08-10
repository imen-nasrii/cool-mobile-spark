import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Camera, Upload, X, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/queryClient';

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
      // Get upload URL using fetch with proper authentication
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      console.log('Upload attempt - Token:', token ? 'present' : 'missing');
      
      const uploadResponse = await fetch('/api/objects/upload', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Erreur lors de la récupération de l\'URL');
      }
      
      const { uploadURL } = await uploadResponse.json();
      
      // Upload file to the presigned URL
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
        throw new Error(errorData.error || 'Erreur lors de la mise à jour');
      }
      
      return await updateResponse.json();
    },
    onSuccess: () => {
      // Force refresh the profile data and clear any caches
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      queryClient.refetchQueries({ queryKey: ['/api/profile'] });
      
      setIsOpen(false);
      setSelectedFile(null);
      setImagePreview(null);
      onSuccess?.();
      toast({
        title: "🎉 C'est parfait !",
        description: "Votre nouvelle photo de profil est magnifique ✨",
      });
      
      // Force immediate refresh of the avatar
      setTimeout(() => {
        // Force refresh the cache and reload page
        queryClient.clear();
        window.location.reload();
      }, 500);
    },
    onError: (error: any) => {
      toast({
        title: "😔 Oups, quelque chose s'est mal passé",
        description: "Essayons encore une fois ? Votre photo est importante pour nous ! 💖",
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
          title: "🖼️ Hmm, ce n'est pas une image",
          description: "Choisissez une belle photo JPG, PNG ou GIF ! 📸",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 200MB)
      if (file.size > 200 * 1024 * 1024) {
        toast({
          title: "📏 Cette image est un peu trop grande",
          description: "Essayez avec une image plus petite (moins de 200MB) 🤏",
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
          className="absolute bottom-0 right-0 h-8 w-8 rounded-full p-0 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
        >
          <Camera className="h-4 w-4 text-white" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-blue-500" />
            Changer la photo de profil
          </DialogTitle>
          <DialogDescription className="text-center">
            <span className="text-base">Ajoutez une touche personnelle à votre profil ! ✨</span>
            <br />
            <span className="text-sm text-purple-600 font-medium">Montrez votre plus beau sourire 😊</span>
            <br />
            <span className="text-xs text-gray-500">JPG, PNG, GIF (max 200MB)</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Current Avatar Preview */}
          {currentAvatarUrl && !imagePreview && (
            <div className="flex justify-center">
              <div className="relative group">
                <img 
                  src={currentAvatarUrl} 
                  alt="Photo actuelle"
                  className="w-24 h-24 rounded-full object-cover border-3 border-blue-200 shadow-lg group-hover:shadow-xl transition-all duration-300"
                />
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-blue-100 px-2 py-1 rounded-full">
                  <span className="text-xs text-blue-600 font-medium">
                    💫 Actuelle
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {/* New Image Preview */}
          {imagePreview && (
            <div className="flex justify-center">
              <div className="relative group animate-pulse">
                <img 
                  src={imagePreview} 
                  alt="Nouvelle photo"
                  className="w-24 h-24 rounded-full object-cover border-3 border-green-300 shadow-lg animate-bounce"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 bg-red-100 hover:bg-red-200 border-red-300"
                  onClick={() => {
                    setSelectedFile(null);
                    setImagePreview(null);
                  }}
                >
                  <X className="h-3 w-3 text-red-500" />
                </Button>
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-100 to-blue-100 px-3 py-1 rounded-full">
                  <span className="text-xs text-green-600 font-bold">
                    🌟 Nouvelle
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {/* File Input */}
          <div className="flex justify-center">
            <label className="cursor-pointer group">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="flex items-center gap-2 px-6 py-3 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group-hover:scale-105">
                <Upload className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium text-blue-600">
                  {selectedFile ? 'Changer l\'image' : '📸 Choisir une photo'}
                </span>
              </div>
            </label>
          </div>

          {selectedFile && (
            <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700 font-medium">
                📎 {selectedFile.name}
              </p>
              <p className="text-xs text-purple-600">
                📏 {Math.round(selectedFile.size / 1024)} KB - Parfait ! ✨
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
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {uploadPhotoMutation.isPending ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Téléchargement...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Sauvegarder
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}