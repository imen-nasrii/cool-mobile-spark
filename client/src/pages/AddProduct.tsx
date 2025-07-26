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
import { useMutation } from "@tanstack/react-query";
import { apiClient, queryClient } from "@/lib/queryClient";
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
      await apiClient.createProduct({
        title: formData.title,
        description: formData.description,
        price: formData.isPaid ? formData.price : "Free",
        location: formData.location,
        category: selectedCategory,
        is_free: !formData.isPaid,
        image_url: selectedImages[0] || '/src/assets/tesla-model3.jpg',
        // Car-specific fields
        ...(selectedCategory === "voiture" && {
          car_brand: formData.brand,
          car_model: formData.model,
          car_year: formData.year ? parseInt(formData.year) : undefined,
          car_condition: formData.condition,
          car_mileage: formData.mileage ? parseInt(formData.mileage) : undefined,
          car_transmission: formData.transmission
        })
      });

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

            {/* Car-specific fields */}
            {selectedCategory === "voiture" && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Car size={20} className="text-primary" />
                  Détails du véhicule
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Essential car fields */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Marque *</label>
                    <Select value={formData.brand} onValueChange={(value) => setFormData(prev => ({ ...prev, brand: value }))}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Choisir une marque" />
                      </SelectTrigger>
                      <SelectContent>
                        {carBrands.map((brand) => (
                          <SelectItem key={brand} value={brand.toLowerCase()}>{brand}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Modèle *</label>
                    <Input
                      placeholder="Ex: Focus, 308, A4..."
                      value={formData.model}
                      onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                      className="h-12"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Année *</label>
                    <Input
                      type="number"
                      placeholder="Ex: 2018"
                      value={formData.year}
                      onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                      className="h-12"
                      min="1990"
                      max={new Date().getFullYear()}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">État *</label>
                    <Select value={formData.condition} onValueChange={(value) => setFormData(prev => ({ ...prev, condition: value }))}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="État du véhicule" />
                      </SelectTrigger>
                      <SelectContent>
                        {conditions.map((condition) => (
                          <SelectItem key={condition.value} value={condition.value}>{condition.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Optional car details */}
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-primary hover:text-primary/80 mb-3">
                    Détails supplémentaires (optionnels)
                  </summary>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-sm font-medium mb-2">Kilométrage</label>
                      <Input
                        type="number"
                        placeholder="Ex: 80000"
                        value={formData.mileage}
                        onChange={(e) => setFormData(prev => ({ ...prev, mileage: e.target.value }))}
                        className="h-12"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Transmission</label>
                      <Select value={formData.transmission} onValueChange={(value) => setFormData(prev => ({ ...prev, transmission: value }))}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Type de boîte" />
                        </SelectTrigger>
                        <SelectContent>
                          {transmissions.map((transmission) => (
                            <SelectItem key={transmission.value} value={transmission.value}>{transmission.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </details>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <label className="block text-base font-medium mb-3">Description *</label>
              <Textarea
                placeholder={selectedCategory === "voiture" ? "Décrivez l'état du véhicule, équipements, historique..." : "Description du produit"}
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