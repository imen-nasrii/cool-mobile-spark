import { useState } from "react";
import { Building, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { StepsIndicator } from "@/components/UI/StepsIndicator";
import { ImageManager } from "@/components/Products/ImageManager";
import { LocationInput } from "@/components/common/LocationInput";
import { useToast } from "@/hooks/use-toast";

interface RealEstateFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const realEstateTypes = [
  { value: "apartment", label: "Appartement" },
  { value: "house", label: "Maison" },
  { value: "villa", label: "Villa" },
  { value: "office", label: "Bureau" },
  { value: "commercial", label: "Local commercial" },
  { value: "land", label: "Terrain" }
];

const realEstateConditions = [
  { value: "excellent", label: "Excellent état" },
  { value: "good", label: "Bon état" },
  { value: "to_renovate", label: "À rénover" }
];

export const RealEstateForm = ({ onSubmit, onCancel }: RealEstateFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    // Étape 1: Informations générales
    title: "",
    realEstateType: "",
    price: "",
    location: "",
    isPaid: true,
    
    // Étape 2: Caractéristiques
    rooms: "",
    bathrooms: "",
    surface: "",
    floor: "",
    condition: "",
    
    // Étape 3: Options et description
    furnished: false,
    parking: false,
    garden: false,
    balcony: false,
    description: ""
  });

  const stepTitles = ["Informations", "Caractéristiques", "Options"];

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.title || !formData.realEstateType || !formData.location) {
        toast({
          title: "Erreur",
          description: "Veuillez remplir tous les champs obligatoires",
          variant: "destructive"
        });
        return;
      }
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (!formData.description) {
      toast({
        title: "Erreur", 
        description: "Veuillez ajouter une description",
        variant: "destructive"
      });
      return;
    }

    const realEstateData = {
      title: formData.title,
      description: formData.description,
      price: formData.isPaid ? formData.price : "Free",
      location: formData.location,
      category: "immobilier",
      is_free: !formData.isPaid,
      image_url: selectedImages[0] || '',
      images: JSON.stringify(selectedImages),
      // Champs spécifiques immobilier
      real_estate_type: formData.realEstateType,
      real_estate_rooms: formData.rooms ? parseInt(formData.rooms) : undefined,
      real_estate_bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : undefined,
      real_estate_surface: formData.surface ? parseInt(formData.surface) : undefined,
      real_estate_floor: formData.floor ? parseInt(formData.floor) : undefined,
      real_estate_furnished: formData.furnished,
      real_estate_parking: formData.parking,
      real_estate_garden: formData.garden,
      real_estate_balcony: formData.balcony,
      real_estate_condition: formData.condition
    };

    onSubmit(realEstateData);
  };

  return (
    <div className="min-h-screen pb-20 bg-gray-50">
      <div className="px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Building className="text-green-500" size={24} />
              <h1 className="text-2xl font-bold text-gray-900">Publier un bien immobilier</h1>
            </div>
            <p className="text-gray-600">Complétez les 3 étapes pour publier votre annonce</p>
          </div>

          {/* Steps Indicator */}
          <StepsIndicator 
            currentStep={currentStep} 
            totalSteps={3} 
            stepTitles={stepTitles}
          />

          {/* Form Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations générales</h2>
                
                {/* Photos */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Photos du bien *</label>
                  <ImageManager
                    images={selectedImages}
                    onImagesChange={setSelectedImages}
                    maxImages={8}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Titre de l'annonce *</label>
                    <Input
                      placeholder="Ex: Appartement 3 pièces avec balcon"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="h-12"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type de bien *</label>
                    <Select value={formData.realEstateType} onValueChange={(value) => setFormData(prev => ({ ...prev, realEstateType: value }))}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Choisir le type" />
                      </SelectTrigger>
                      <SelectContent>
                        {realEstateTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Localisation *</label>
                    <LocationInput
                      value={formData.location}
                      onChange={(location, coordinates) => {
                        setFormData(prev => ({ ...prev, location }));
                        if (coordinates) {
                          console.log('Coordinates saved:', coordinates);
                        }
                      }}
                      placeholder="Ville, quartier"
                      required
                    />
                  </div>
                </div>

                {/* Prix */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">Prix</label>
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant={formData.isPaid ? "default" : "outline"}
                      onClick={() => setFormData(prev => ({ ...prev, isPaid: true }))}
                      className="px-6"
                    >
                      Vente/Location
                    </Button>
                    <Button
                      type="button"
                      variant={!formData.isPaid ? "default" : "outline"}
                      onClick={() => setFormData(prev => ({ ...prev, isPaid: false }))}
                      className="px-6"
                    >
                      Gratuit
                    </Button>
                  </div>
                  {formData.isPaid && (
                    <Input
                      placeholder="Prix en TND"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      className="h-12 max-w-xs"
                    />
                  )}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Caractéristiques du bien</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de chambres</label>
                    <Select value={formData.rooms} onValueChange={(value) => setFormData(prev => ({ ...prev, rooms: value }))}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Nombre de chambres" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 chambre</SelectItem>
                        <SelectItem value="2">2 chambres</SelectItem>
                        <SelectItem value="3">3 chambres</SelectItem>
                        <SelectItem value="4">4 chambres</SelectItem>
                        <SelectItem value="5">5+ chambres</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de salles de bain</label>
                    <Select value={formData.bathrooms} onValueChange={(value) => setFormData(prev => ({ ...prev, bathrooms: value }))}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Salles de bain" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 salle de bain</SelectItem>
                        <SelectItem value="2">2 salles de bain</SelectItem>
                        <SelectItem value="3">3+ salles de bain</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Surface (m²)</label>
                    <Input
                      type="number"
                      placeholder="120"
                      value={formData.surface}
                      onChange={(e) => setFormData(prev => ({ ...prev, surface: e.target.value }))}
                      className="h-12"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Étage</label>
                    <Input
                      type="number"
                      placeholder="2"
                      value={formData.floor}
                      onChange={(e) => setFormData(prev => ({ ...prev, floor: e.target.value }))}
                      className="h-12"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">État du bien</label>
                    <Select value={formData.condition} onValueChange={(value) => setFormData(prev => ({ ...prev, condition: value }))}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Choisir l'état" />
                      </SelectTrigger>
                      <SelectContent>
                        {realEstateConditions.map((condition) => (
                          <SelectItem key={condition.value} value={condition.value}>{condition.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Options et description</h2>
                
                {/* Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Options disponibles</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="furnished"
                        checked={formData.furnished}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, furnished: !!checked }))}
                      />
                      <label htmlFor="furnished" className="text-sm text-gray-700">
                        Meublé
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="parking"
                        checked={formData.parking}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, parking: !!checked }))}
                      />
                      <label htmlFor="parking" className="text-sm text-gray-700">
                        Place de parking
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="garden"
                        checked={formData.garden}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, garden: !!checked }))}
                      />
                      <label htmlFor="garden" className="text-sm text-gray-700">
                        Jardin
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="balcony"
                        checked={formData.balcony}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, balcony: !!checked }))}
                      />
                      <label htmlFor="balcony" className="text-sm text-gray-700">
                        Balcon/Terrasse
                      </label>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description détaillée *</label>
                  <Textarea
                    placeholder="Décrivez votre bien : localisation exacte, proximités, particularités..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={6}
                    className="resize-none"
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={currentStep === 1 ? onCancel : handlePrevious}
                className="px-6"
              >
                <ArrowLeft size={16} className="mr-2" />
                {currentStep === 1 ? "Annuler" : "Précédent"}
              </Button>
              
              <Button
                type="button"
                onClick={currentStep === 3 ? handleSubmit : handleNext}
                className="px-6 bg-green-500 hover:bg-green-600"
              >
                {currentStep === 3 ? "Publier l'annonce" : "Suivant"}
                {currentStep < 3 && <ArrowRight size={16} className="ml-2" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};