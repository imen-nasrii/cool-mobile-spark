import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImageManager } from "@/components/Products/ImageManager";
import { ArrowLeft, Save } from "lucide-react";
import type { Product } from "@shared/schema";
import { apiClient } from "@/lib/apiClient";

interface EditProductProps {
  productId: string;
  onBack: () => void;
  onSave: () => void;
}

export const EditProduct = ({ productId, onBack, onSave }: EditProductProps) => {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    category: "",
    is_free: false,
  });

  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  // Load product data
  const { data: product, isLoading } = useQuery({
    queryKey: ['/api/products', productId],
    queryFn: () => apiClient.getProduct(productId),
  });

  // Load categories
  const { data: categoriesData = [] } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: () => apiClient.getCategories(),
  });

  // Update form when product loads
  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || "",
        description: product.description || "",
        price: product.price || "",
        location: product.location || "",
        category: product.category || "",
        is_free: product.is_free || false,
      });

      // Load existing images
      const images = product.images ? JSON.parse(product.images) : [];
      if (images.length > 0) {
        setSelectedImages(images);
      } else if (product.image_url) {
        setSelectedImages([product.image_url]);
      }
    }
  }, [product]);

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: (updateData: any) => apiClient.updateProduct(productId, updateData),
    onSuccess: () => {
      toast({
        title: "Succès!",
        description: "Produit mis à jour avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products', productId] });
      onSave();
    },
    onError: (error: any) => {
      console.error('Error updating product:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le produit",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour modifier un produit",
        variant: "destructive"
      });
      return;
    }

    if (!formData.title || !formData.description || !formData.location) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    updateProductMutation.mutate({
      title: formData.title,
      description: formData.description,
      price: formData.is_free ? "Free" : formData.price,
      location: formData.location,
      category: formData.category,
      is_free: formData.is_free,
      image_url: selectedImages[0] || product?.image_url,
      images: JSON.stringify(selectedImages),
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">Chargement...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-red-600">Produit non trouvé</div>
          <Button onClick={onBack} className="mt-4">
            Retour
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 z-40 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 hover:bg-gray-100 rounded-full"
              onClick={onBack}
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-lg font-semibold">Modifier le produit</h1>
          </div>
          
          <Button
            onClick={handleSubmit}
            disabled={updateProductMutation.isPending}
            className="bg-red-500 hover:bg-red-600 text-white gap-2"
          >
            <Save size={16} />
            {updateProductMutation.isPending ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </div>
      </div>

      <div className="px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Image Management */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Photos du produit</h3>
            <ImageManager
              images={selectedImages}
              onImagesChange={setSelectedImages}
              maxImages={8}
            />
          </Card>

          {/* Product Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informations de base</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Titre *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Titre de votre annonce"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Décrivez votre produit..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Prix</label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.is_free}
                          onChange={(e) => setFormData({ ...formData, is_free: e.target.checked })}
                        />
                        <span className="text-sm">Gratuit</span>
                      </label>
                      {!formData.is_free && (
                        <Input
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          placeholder="Prix en TND"
                          className="flex-1"
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Localisation *</label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Ville, région..."
                      required
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Category */}
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Catégorie</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {categoriesData.map((category: any) => (
                  <div
                    key={category.id}
                    onClick={() => setFormData({ ...formData, category: category.name })}
                    className={`
                      p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 text-center
                      ${formData.category === category.name
                        ? 'border-red-500 bg-red-50 shadow-lg' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }
                    `}
                  >
                    <div className={`
                      w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center
                      ${formData.category === category.name ? 'bg-red-500' : 'bg-gray-100'}
                    `}>
                      <span className="text-white text-lg">{category.icon || "📦"}</span>
                    </div>
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                ))}
              </div>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
};