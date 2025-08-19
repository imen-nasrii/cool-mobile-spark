import { useState } from "react";
import { Car, ArrowRight, ArrowLeft, Camera, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StepsIndicator } from "@/components/UI/StepsIndicator";
import { ImageManager } from "@/components/Products/ImageManager";
import { useToast } from "@/hooks/use-toast";

interface MultiPageCarFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  onStepChange?: (step: number) => void;
  currentStep?: number;
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

export const MultiPageCarForm = ({ onSubmit, onCancel, onStepChange, currentStep: externalCurrentStep }: MultiPageCarFormProps) => {
  const [currentStep, setCurrentStep] = useState(externalCurrentStep || 1);
  const [mainImage, setMainImage] = useState<string>("");
  const [exteriorImages, setExteriorImages] = useState<string[]>([]);
  const [additionalImage, setAdditionalImage] = useState<string>(""); 
  const [interiorImages, setInteriorImages] = useState<string[]>([]);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    // Page 1: Model + Series + KM + Year + Main Image
    title: "",
    brand: "",
    model: "",
    series: "", // Additional field for car series
    year: "",
    mileage: "",
    price: "",
    location: "",
    isPaid: true,
    
    // Page 4: Details
    condition: "",
    transmission: "",
    fuelType: "",
    engineSize: "",
    doors: "",
    seats: "",
    color: "",
    equipment: [] as string[],
    description: "",
    nonSmoking: false
  });

  const stepTitles = ["Modèle & Infos", "Photos extérieures", "Photos intérieures", "Détails"];

  const handleNext = () => {
    // Validation for each step
    if (currentStep === 1) {
      if (!formData.title || !formData.brand || !formData.model || !formData.year || !formData.mileage || !formData.location) {
        toast({
          title: "Erreur",
          description: "Veuillez remplir tous les champs obligatoires",
          variant: "destructive"
        });
        return;
      }
      if (!mainImage) {
        toast({
          title: "Erreur",
          description: "Veuillez ajouter au moins une photo principale",
          variant: "destructive"
        });
        return;
      }
    }
    
    if (currentStep === 2) {
      if (exteriorImages.length === 0) {
        toast({
          title: "Erreur",
          description: "Veuillez ajouter au moins une photo extérieure",
          variant: "destructive"
        });
        return;
      }
    }
    
    if (currentStep < 4) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      onStepChange?.(nextStep);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      onStepChange?.(prevStep);
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

    // Combine all images
    const allImages = [mainImage, ...exteriorImages, additionalImage, ...interiorImages].filter(Boolean);

    const carData = {
      title: formData.title,
      description: formData.description,
      price: formData.isPaid ? formData.price : "Free",
      location: formData.location,
      category: "voiture",
      is_free: !formData.isPaid,
      image_url: mainImage,
      images: JSON.stringify(allImages),
      // Car-specific fields
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

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Car className="text-blue-500" size={24} />
            <h1 className="text-2xl font-bold text-gray-900">Vendre une voiture</h1>
          </div>
          <p className="text-gray-600">Complétez les 4 étapes pour publier votre annonce</p>
        </div>

        {/* Steps Indicator */}
        <StepsIndicator 
          currentStep={currentStep} 
          totalSteps={4} 
          stepTitles={stepTitles}
        />

        {/* Form Content */}
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-6">
            {/* Page 1: Model + Series + KM + Year + Main Image */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    Modèle et informations principales
                  </CardTitle>
                </CardHeader>
                
                {/* Main Image */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Photo principale *
                  </label>
                  <ImageManager
                    images={mainImage ? [mainImage] : []}
                    onImagesChange={(images) => setMainImage(images[0] || "")}
                    maxImages={1}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Titre de l'annonce *
                    </label>
                    <Input
                      value={formData.title}
                      onChange={(e) => updateFormData('title', e.target.value)}
                      placeholder="ex: Peugeot 208 GTI"
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Marque *
                    </label>
                    <Select value={formData.brand} onValueChange={(value) => updateFormData('brand', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez la marque" />
                      </SelectTrigger>
                      <SelectContent>
                        {carBrands.map((brand) => (
                          <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Modèle *
                    </label>
                    <Input
                      value={formData.model}
                      onChange={(e) => updateFormData('model', e.target.value)}
                      placeholder="ex: 208"
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Série
                    </label>
                    <Input
                      value={formData.series}
                      onChange={(e) => updateFormData('series', e.target.value)}
                      placeholder="ex: GTI, Sport, Premium"
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Année *
                    </label>
                    <Input
                      type="number"
                      value={formData.year}
                      onChange={(e) => updateFormData('year', e.target.value)}
                      placeholder="ex: 2020"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Kilométrage (km) *
                    </label>
                    <Input
                      type="number"
                      value={formData.mileage}
                      onChange={(e) => updateFormData('mileage', e.target.value)}
                      placeholder="ex: 50000"
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Prix (TND) *
                    </label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => updateFormData('price', e.target.value)}
                      placeholder="ex: 25000"
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Localisation *
                    </label>
                    <Input
                      value={formData.location}
                      onChange={(e) => updateFormData('location', e.target.value)}
                      placeholder="ex: Tunis, Ariana"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Page 2: Exterior Photos (8 photos) + Additional Image */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    Photos extérieures
                  </CardTitle>
                </CardHeader>
                
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Photos extérieures du véhicule (jusqu'à 8 photos) *
                    </label>
                    <ImageManager
                      images={exteriorImages}
                      onImagesChange={setExteriorImages}
                      maxImages={8}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6"
                    />
                    <p className="text-sm text-gray-500">
                      Ajoutez des photos de face, arrière, côtés, et détails extérieurs
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Photo supplémentaire
                    </label>
                    <ImageManager
                      images={additionalImage ? [additionalImage] : []}
                      onImagesChange={(images) => setAdditionalImage(images[0] || "")}
                      maxImages={1}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6"
                    />
                    <p className="text-sm text-gray-500">
                      Photo optionnelle pour mettre en valeur un détail particulier
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Page 3: Interior Photos */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    Photos intérieures
                  </CardTitle>
                </CardHeader>
                
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Photos de l'intérieur du véhicule
                  </label>
                  <ImageManager
                    images={interiorImages}
                    onImagesChange={setInteriorImages}
                    maxImages={6}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6"
                  />
                  <p className="text-sm text-gray-500">
                    Ajoutez des photos des sièges, tableau de bord, volant, espace arrière, etc.
                  </p>
                </div>
              </div>
            )}

            {/* Page 4: Details */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    Détails et caractéristiques
                  </CardTitle>
                </CardHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      État *
                    </label>
                    <Select value={formData.condition} onValueChange={(value) => updateFormData('condition', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez l'état" />
                      </SelectTrigger>
                      <SelectContent>
                        {conditions.map((condition) => (
                          <SelectItem key={condition.value} value={condition.value}>
                            {condition.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Transmission *
                    </label>
                    <Select value={formData.transmission} onValueChange={(value) => updateFormData('transmission', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez la transmission" />
                      </SelectTrigger>
                      <SelectContent>
                        {transmissions.map((transmission) => (
                          <SelectItem key={transmission.value} value={transmission.value}>
                            {transmission.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Carburant *
                    </label>
                    <Select value={formData.fuelType} onValueChange={(value) => updateFormData('fuelType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez le carburant" />
                      </SelectTrigger>
                      <SelectContent>
                        {fuelTypes.map((fuel) => (
                          <SelectItem key={fuel.value} value={fuel.value}>
                            {fuel.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Cylindrée
                    </label>
                    <Input
                      value={formData.engineSize}
                      onChange={(e) => updateFormData('engineSize', e.target.value)}
                      placeholder="ex: 1.6L"
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Nombre de portes
                    </label>
                    <Select value={formData.doors} onValueChange={(value) => updateFormData('doors', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Nombre de portes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 portes</SelectItem>
                        <SelectItem value="5">5 portes</SelectItem>
                        <SelectItem value="4">4 portes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Nombre de places
                    </label>
                    <Select value={formData.seats} onValueChange={(value) => updateFormData('seats', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Nombre de places" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 places</SelectItem>
                        <SelectItem value="4">4 places</SelectItem>
                        <SelectItem value="5">5 places</SelectItem>
                        <SelectItem value="7">7 places</SelectItem>
                        <SelectItem value="9">9 places</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Couleur
                    </label>
                    <Input
                      value={formData.color}
                      onChange={(e) => updateFormData('color', e.target.value)}
                      placeholder="ex: Rouge, Blanc, Noir"
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Equipment */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Équipements disponibles
                  </label>
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

                {/* Non-smoking option */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="nonSmoking"
                    checked={formData.nonSmoking}
                    onCheckedChange={(checked) => updateFormData('nonSmoking', !!checked)}
                  />
                  <label htmlFor="nonSmoking" className="text-sm text-gray-700 cursor-pointer">
                    Véhicule non fumeur
                  </label>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Description *
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => updateFormData('description', e.target.value)}
                    placeholder="Décrivez votre véhicule en détail..."
                    rows={4}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <div className="flex gap-2">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft size={16} />
                    Précédent
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                >
                  Annuler
                </Button>
              </div>

              <div>
                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
                  >
                    Suivant
                    <ArrowRight size={16} />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Publier l'annonce
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};