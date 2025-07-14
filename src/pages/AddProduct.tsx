import { useState } from "react";
import { Camera, MapPin, Tag, DollarSign, FileText, Upload, Car, Building, Briefcase, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <Card className="shadow-lg">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-semibold text-center">
              Publier une annonce
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Image Upload */}
            <div>
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
              {/* Title */}
              <div>
                <label className="block text-base font-medium mb-3">Titre *</label>
                <Input
                  placeholder="Titre de produit"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="h-12 text-base"
                />
              </div>

              {/* Brand */}
              <div>
                <label className="block text-base font-medium mb-3">Marque *</label>
                <Select value={formData.brand} onValueChange={(value) => setFormData(prev => ({ ...prev, brand: value }))}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Choisire une option" />
                  </SelectTrigger>
                  <SelectContent>
                    {carBrands.map((brand) => (
                      <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Model */}
              <div>
                <label className="block text-base font-medium mb-3">Modèle *</label>
                <Select value={formData.model} onValueChange={(value) => setFormData(prev => ({ ...prev, model: value }))}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Choisire une option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="model1">Modèle 1</SelectItem>
                    <SelectItem value="model2">Modèle 2</SelectItem>
                    <SelectItem value="model3">Modèle 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Year */}
              <div>
                <label className="block text-base font-medium mb-3">Année *</label>
                <Select value={formData.year} onValueChange={(value) => setFormData(prev => ({ ...prev, year: value }))}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Choisire une option" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 30 }, (_, i) => 2024 - i).map((year) => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Mileage */}
              <div>
                <label className="block text-base font-medium mb-3">Kilométrage *</label>
                <Input
                  placeholder="Titre de produit"
                  value={formData.mileage}
                  onChange={(e) => setFormData(prev => ({ ...prev, mileage: e.target.value }))}
                  className="h-12 text-base"
                />
              </div>

              {/* Transmission */}
              <div>
                <label className="block text-base font-medium mb-3">Transmission *</label>
                <Select value={formData.transmission} onValueChange={(value) => setFormData(prev => ({ ...prev, transmission: value }))}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Choisire une option" />
                  </SelectTrigger>
                  <SelectContent>
                    {transmissions.map((trans) => (
                      <SelectItem key={trans.value} value={trans.value}>{trans.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Condition */}
              <div>
                <label className="block text-base font-medium mb-3">État *</label>
                <Select value={formData.condition} onValueChange={(value) => setFormData(prev => ({ ...prev, condition: value }))}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Choisire une option" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map((condition) => (
                      <SelectItem key={condition.value} value={condition.value}>{condition.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-base font-medium mb-3">Localisation *</label>
                <div className="relative">
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="h-12 text-base pr-12"
                  />
                  <MapPin size={20} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Price */}
              <div>
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
                    placeholder="prix de produit"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="h-12 text-base"
                  />
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-base font-medium mb-3">Description *</label>
                <Textarea
                  placeholder="Déscription du produit"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="min-h-32 text-base resize-none"
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
                  className="flex-1 h-14 text-lg bg-primary hover:bg-primary/90"
                >
                  publier
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};