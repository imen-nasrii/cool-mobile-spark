import { useState } from "react";
import { Car, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { StepsIndicator } from "@/components/UI/StepsIndicator";
import { ImageManager } from "@/components/Products/ImageManager";
import { useToast } from "@/hooks/use-toast";

interface CarFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

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

const fuelTypes = [
  { value: "gasoline", label: "Essence" },
  { value: "diesel", label: "Diesel" },
  { value: "electric", label: "Électrique" },
  { value: "hybrid", label: "Hybride" }
];

const carEquipment = [
  "Climatisation", "ABS", "Airbags", "Direction assistée", "Système audio", "Bluetooth",
  "GPS/Navigation", "Caméra de recul", "Capteurs de stationnement", "Toit ouvrant",
  "Sièges en cuir", "Sièges chauffants", "Régulateur de vitesse", "Jantes alliage"
];

export const CarForm = ({ onSubmit, onCancel }: CarFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    // Étape 1: Informations générales
    title: "",
    brand: "",
    model: "",
    year: "",
    price: "",
    location: "",
    isPaid: true,
    
    // Étape 2: Caractéristiques techniques
    mileage: "",
    condition: "",
    transmission: "",
    fuelType: "",
    engineSize: "",
    doors: "",
    seats: "",
    color: "",
    
    // Étape 3: Équipements et description
    equipment: [] as string[],
    description: "",
    nonSmoking: false
  });

  const stepTitles = ["Infos générales", "Caractéristiques", "Détails"];

  const handleNext = () => {
    // Validation de l'étape courante
    if (currentStep === 1) {
      if (!formData.title || !formData.brand || !formData.model || !formData.year || !formData.location) {
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

    const carData = {
      title: formData.title,
      description: formData.description,
      price: formData.isPaid ? formData.price : "Free",
      location: formData.location,
      category: "voiture",
      is_free: !formData.isPaid,
      image_url: selectedImages[0] || '',
      images: JSON.stringify(selectedImages),
      // Champs spécifiques voiture
      car_brand: formData.brand,
      car_model: formData.model,
      car_year: formData.year ? parseInt(formData.year) : undefined,
      car_condition: formData.condition,
      car_mileage: formData.mileage ? parseInt(formData.mileage) : undefined,
      car_transmission: formData.transmission,
      car_fuel_type: formData.fuelType,
      car_engine_size: formData.engineSize,
      car_doors: formData.doors ? parseInt(formData.doors) : undefined,
      car_seats: formData.seats ? parseInt(formData.seats) : undefined,
      car_color: formData.color,
      car_non_smoking: formData.nonSmoking,
      car_equipment: JSON.stringify(formData.equipment)
    };

    onSubmit(carData);
  };

  const toggleEquipment = (item: string) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.includes(item)
        ? prev.equipment.filter(eq => eq !== item)
        : [...prev.equipment, item]
    }));
  };

  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Car className="text-blue-500" size={24} />
            <h1 className="text-2xl font-bold text-gray-900">Vendre une voiture</h1>
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
              
              {/* Photos du véhicule */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Photos du véhicule *</label>
                <ImageManager
                  images={selectedImages}
                  onImagesChange={setSelectedImages}
                  maxImages={8}
                  className="max-w-md"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Titre de l'annonce *</label>
                  <Input
                    placeholder="Ex: Toyota Corolla 2020 en excellent état"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="h-12"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Marque *</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Modèle *</label>
                  <Input
                    placeholder="Ex: Corolla, Focus, 308"
                    value={formData.model}
                    onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                    className="h-12"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Année *</label>
                  <Input
                    type="number"
                    placeholder="2020"
                    min="1990"
                    max="2025"
                    value={formData.year}
                    onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                    className="h-12"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Localisation *</label>
                  <Input
                    placeholder="Ville, région"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="h-12"
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
                    Payant
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
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Caractéristiques techniques</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kilométrage</label>
                  <Input
                    type="number"
                    placeholder="150000"
                    value={formData.mileage}
                    onChange={(e) => setFormData(prev => ({ ...prev, mileage: e.target.value }))}
                    className="h-12"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">État</label>
                  <Select value={formData.condition} onValueChange={(value) => setFormData(prev => ({ ...prev, condition: value }))}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Choisir l'état" />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map((condition) => (
                        <SelectItem key={condition.value} value={condition.value}>{condition.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Transmission</label>
                  <Select value={formData.transmission} onValueChange={(value) => setFormData(prev => ({ ...prev, transmission: value }))}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Type de transmission" />
                    </SelectTrigger>
                    <SelectContent>
                      {transmissions.map((transmission) => (
                        <SelectItem key={transmission.value} value={transmission.value}>{transmission.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Carburant</label>
                  <Select value={formData.fuelType} onValueChange={(value) => setFormData(prev => ({ ...prev, fuelType: value }))}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Type de carburant" />
                    </SelectTrigger>
                    <SelectContent>
                      {fuelTypes.map((fuel) => (
                        <SelectItem key={fuel.value} value={fuel.value}>{fuel.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cylindrée</label>
                  <Input
                    placeholder="1.6L"
                    value={formData.engineSize}
                    onChange={(e) => setFormData(prev => ({ ...prev, engineSize: e.target.value }))}
                    className="h-12"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Couleur</label>
                  <Input
                    placeholder="Rouge, Blanc, Noir..."
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="h-12"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de portes</label>
                  <Select value={formData.doors} onValueChange={(value) => setFormData(prev => ({ ...prev, doors: value }))}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Nombre de portes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 portes</SelectItem>
                      <SelectItem value="5">5 portes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de places</label>
                  <Select value={formData.seats} onValueChange={(value) => setFormData(prev => ({ ...prev, seats: value }))}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Nombre de places" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 places</SelectItem>
                      <SelectItem value="4">4 places</SelectItem>
                      <SelectItem value="5">5 places</SelectItem>
                      <SelectItem value="7">7 places</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Équipements et description</h2>
              
              {/* Équipements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Équipements disponibles</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {carEquipment.map((item) => (
                    <div key={item} className="flex items-center space-x-2">
                      <Checkbox
                        id={item}
                        checked={formData.equipment.includes(item)}
                        onCheckedChange={() => toggleEquipment(item)}
                      />
                      <label
                        htmlFor={item}
                        className="text-sm text-gray-700 cursor-pointer"
                      >
                        {item}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Non fumeur */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="nonSmoking"
                  checked={formData.nonSmoking}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, nonSmoking: !!checked }))}
                />
                <label htmlFor="nonSmoking" className="text-sm text-gray-700">
                  Véhicule non fumeur
                </label>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description détaillée *</label>
                <Textarea
                  placeholder="Décrivez votre véhicule : historique, entretien, points forts..."
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
              className="px-6 bg-red-500 hover:bg-red-600"
            >
              {currentStep === 3 ? "Publier l'annonce" : "Suivant"}
              {currentStep < 3 && <ArrowRight size={16} className="ml-2" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};