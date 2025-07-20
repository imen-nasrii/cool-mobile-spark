import { useState } from "react";
import { Camera, MapPin, Tag, DollarSign, FileText, Upload, Car, Building, Briefcase, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";

const categories = [
  { id: "voiture", name: "Voiture", icon: Car },
  { id: "immobilier", name: "Immobilier", icon: Building },
  { id: "emplois", name: "Emplois", icon: Briefcase },
  { id: "autres", name: "Autres", icon: Grid3X3 }
];

const carBrands = [
  "Toyota", "Mercedes", "BMW", "Audi", "Volkswagen", "Peugeot", "Renault", "Ford", "Hyundai", "Kia", "Autre"
];

const conditions = [
  { value: "new", label: "Neuf" },
  { value: "used", label: "Occasion" },
  { value: "damaged", label: "Endommagé" }
];

const transmissions = [
  { value: "manual", label: "Manuelle" },
  { value: "automatic", label: "Automatique" },
  { value: "semi-automatic", label: "Semi-automatique" }
];

export const AddProduct = ({ activeTab, onTabChange }: { 
  activeTab?: string; 
  onTabChange?: (tab: string) => void;
}) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    brand: "",
    model: "",
    year: "",
    mileage: "",
    transmission: "",
    description: "",
    price: "",
    condition: "",
    location: "",
    isPaid: true
  });
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useLanguage();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (selectedImages.length + files.length > 8) {
      toast({
        title: "Limite atteinte",
        description: "Maximum 8 images autorisées",
        variant: "destructive"
      });
      return;
    }
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImages(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour publier une annonce",
        variant: "destructive"
      });
      return;
    }

    if (!formData.title || !formData.description || !formData.location || !selectedCategory) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('products')
        .insert([
          {
            title: formData.title,
            description: formData.description,
            price: formData.isPaid ? formData.price : "Free",
            location: formData.location,
            category: selectedCategory,
            is_free: !formData.isPaid,
            user_id: user.id,
            // For now, we'll use a placeholder image - later we can implement image upload
            image_url: selectedImages[0] || null
          }
        ])
        .select();

      if (error) {
        throw error;
      }

      toast({
        title: "Succès!",
        description: "Votre annonce a été publiée avec succès",
      });
      
      // Reset form
      setSelectedCategory("");
      setFormData({
        title: "",
        brand: "",
        model: "",
        year: "",
        mileage: "",
        transmission: "",
        description: "",
        price: "",
        condition: "",
        location: "",
        isPaid: true
      });
      setSelectedImages([]);
      
      // Redirect to home or products list
      onTabChange?.("home");
      
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de publier l'annonce",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedCategory("");
    setFormData({
      title: "",
      brand: "",
      model: "",
      year: "",
      mileage: "",
      transmission: "",
      description: "",
      price: "",
      condition: "",
      location: "",
      isPaid: true
    });
    setSelectedImages([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="px-4 py-6">
        <div className="space-y-6">
          {/* Image Upload */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">Aperçus de produit</p>
                <Button type="button" variant="outline" className="mb-4">
                  importer
                </Button>
              </label>
              <div className="text-sm text-gray-500 mb-4">
                {selectedImages.length}/8
              </div>
              {selectedImages.length > 0 && (
                <div className="grid grid-cols-4 gap-4 mt-4">
                  {selectedImages.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <label className="block text-base font-medium mb-3">Catégorie *</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Choisir une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Title */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <label className="block text-base font-medium mb-3">Titre *</label>
              <Input
                placeholder="Titre de produit"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="h-12 text-base"
                required
              />
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <label className="block text-base font-medium mb-3">Localisation *</label>
              <div className="relative">
                <Input
                  placeholder="Ville, région"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="h-12 text-base pr-12"
                  required
                />
                <MapPin size={20} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Price */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <label className="block text-base font-medium mb-3">Prix *</label>
              <div className="flex gap-4 mb-4">
                <Button
                  type="button"
                  variant={formData.isPaid ? "default" : "outline"}
                  onClick={() => setFormData(prev => ({ ...prev, isPaid: true }))}
                  className="px-8 py-3 rounded-full"
                >
                  Payant
                </Button>
                <Button
                  type="button"
                  variant={!formData.isPaid ? "default" : "outline"}
                  onClick={() => setFormData(prev => ({ ...prev, isPaid: false }))}
                  className="px-8 py-3 rounded-full"
                >
                  Gratuit
                </Button>
              </div>
              {formData.isPaid && (
                <Input
                  placeholder="Prix en DT"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  className="h-12 text-base"
                  required
                />
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <label className="block text-base font-medium mb-3">Description *</label>
              <Textarea
                placeholder="Description du produit"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="min-h-32 text-base resize-none"
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="flex-1 h-14 text-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                annuler
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 h-14 text-lg bg-primary hover:bg-primary/90"
              >
                {loading ? "Publication..." : "Publier"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};