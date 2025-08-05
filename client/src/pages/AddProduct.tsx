import { useState, useEffect } from "react";
import { Camera, MapPin, Tag, DollarSign, FileText, Upload, Car, Building, Briefcase, Grid3X3, Settings, Smartphone, Dumbbell, Shirt, Plus, X } from "lucide-react";
import { ImageManager } from "@/components/Products/ImageManager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient, queryClient } from "@/lib/queryClient";
import { useLanguage } from "@/hooks/useLanguage";

// Icon mapping for categories
const iconMap: Record<string, any> = {
  'Car': Car,
  'Building': Building,
  'Briefcase': Briefcase,
  'Smartphone': Smartphone,
  'Dumbbell': Dumbbell,
  'Shirt': Shirt,
  'Grid3X3': Grid3X3,
  'Settings': Settings
};

// Available icons for floating menu
const availableIcons = [
  { name: 'Car', icon: Car, color: 'bg-blue-500' },
  { name: 'Building', icon: Building, color: 'bg-green-500' },
  { name: 'Briefcase', icon: Briefcase, color: 'bg-purple-500' },
  { name: 'Smartphone', icon: Smartphone, color: 'bg-orange-500' },
  { name: 'Dumbbell', icon: Dumbbell, color: 'bg-red-500' },
  { name: 'Shirt', icon: Shirt, color: 'bg-pink-500' },
  { name: 'Settings', icon: Settings, color: 'bg-indigo-500' },
  { name: 'Grid3X3', icon: Grid3X3, color: 'bg-gray-500' }
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

const jobTypes = [
  { value: "cdi", label: "CDI (Contrat à durée indéterminée)" },
  { value: "cdd", label: "CDD (Contrat à durée déterminée)" },
  { value: "stage", label: "Stage" },
  { value: "freelance", label: "Freelance/Indépendant" },
  { value: "part_time", label: "Temps partiel" },
  { value: "internship", label: "Alternance" }
];

const jobSectors = [
  { value: "informatique", label: "Informatique/IT" },
  { value: "commerce", label: "Commerce/Vente" },
  { value: "sante", label: "Santé/Médical" },
  { value: "education", label: "Éducation/Formation" },
  { value: "finance", label: "Finance/Banque" },
  { value: "marketing", label: "Marketing/Communication" },
  { value: "ingenierie", label: "Ingénierie" },
  { value: "rh", label: "Ressources Humaines" },
  { value: "juridique", label: "Juridique" },
  { value: "restauration", label: "Restauration/Hôtellerie" },
  { value: "construction", label: "Construction/BTP" },
  { value: "transport", label: "Transport/Logistique" },
  { value: "autre", label: "Autre secteur" }
];

const jobExperiences = [
  { value: "debutant", label: "Débutant (0-1 an)" },
  { value: "junior", label: "Junior (1-3 ans)" },
  { value: "confirme", label: "Confirmé (3-5 ans)" },
  { value: "senior", label: "Senior (5-10 ans)" },
  { value: "expert", label: "Expert (10+ ans)" }
];

const jobEducations = [
  { value: "bac", label: "Baccalauréat" },
  { value: "bac2", label: "Bac+2 (BTS/DUT)" },
  { value: "bac3", label: "Bac+3 (Licence)" },
  { value: "bac5", label: "Bac+5 (Master/Ingénieur)" },
  { value: "doctorat", label: "Doctorat/PhD" },
  { value: "aucun", label: "Aucun diplôme requis" }
];

const jobUrgencies = [
  { value: "normal", label: "Normal" },
  { value: "urgent", label: "Urgent" },
  { value: "tres_urgent", label: "Très urgent" }
];

export const AddProduct = ({ activeTab, onTabChange, selectedCategory: preSelectedCategory }: { 
  activeTab?: string; 
  onTabChange?: (tab: string) => void;
  selectedCategory?: string;
}) => {
  const [selectedCategory, setSelectedCategory] = useState(preSelectedCategory || "");
  const [showIconMenu, setShowIconMenu] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string>("");
  const [newCategoryName, setNewCategoryName] = useState("");
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
    isPaid: true,
    // Champs immobilier
    realEstateType: "",
    rooms: "",
    bathrooms: "",
    surface: "",
    floor: "",
    furnished: false,
    parking: false,
    garden: false,
    balcony: false,
    realEstateCondition: "",
    // Champs emploi
    jobType: "",
    jobSector: "",
    jobExperience: "",
    jobEducation: "",
    jobSalaryMin: "",
    jobSalaryMax: "",
    jobRemote: false,
    jobUrgency: "",
    jobCompany: "",
    jobBenefits: [] as string[],
    // Car equipment
    equipment: [] as string[]
  });
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useLanguage();

  // Load categories from database
  const { data: categoriesData = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: () => apiClient.getCategories(),
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: (categoryData: { name: string; icon: string }) => 
      apiClient.createCategory(categoryData),
    onSuccess: () => {
      toast({
        title: "Succès!",
        description: "Nouvelle catégorie créée avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setShowIconMenu(false);
      setNewCategoryName("");
      setSelectedIcon("");
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la création de la catégorie",
        variant: "destructive"
      });
    }
  });



  // React Query mutation for creating products
  const createProductMutation = useMutation({
    mutationFn: (productData: any) => apiClient.createProduct(productData),
    onSuccess: () => {
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
        isPaid: true,
        // Reset real estate fields
        realEstateType: "",
        rooms: "",
        bathrooms: "",
        surface: "",
        floor: "",
        furnished: false,
        parking: false,
        garden: false,
        balcony: false,
        realEstateCondition: "",
        // Reset job fields
        jobType: "",
        jobSector: "",
        jobExperience: "",
        jobEducation: "",
        jobSalaryMin: "",
        jobSalaryMax: "",
        jobRemote: false,
        jobUrgency: "",
        jobCompany: "",
        jobBenefits: [] as string[],
        // Car equipment
        equipment: [] as string[]
      });
      setSelectedImages([]);
      
      // Invalidate queries to refresh product lists
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      
      // Redirect to home or products list
      onTabChange?.("home");
    },
    onError: (error: any) => {
      console.error('Error creating product:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de publier l'annonce",
        variant: "destructive"
      });
    }
  });

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

    createProductMutation.mutate({
        title: formData.title,
        description: formData.description,
        price: formData.isPaid ? formData.price : "Free",
        location: formData.location,
        category: selectedCategory,
        is_free: !formData.isPaid,
        image_url: selectedImages[0] || '/src/assets/tesla-model3.jpg',
        images: JSON.stringify(selectedImages),
        // Car-specific fields
        ...(selectedCategory === "voiture" && {
          car_brand: formData.brand,
          car_model: formData.model,
          car_year: formData.year ? parseInt(formData.year) : undefined,
          car_condition: formData.condition,
          car_mileage: formData.mileage ? parseInt(formData.mileage) : undefined,
          car_transmission: formData.transmission,
          car_equipment: formData.equipment
        }),
        // Real Estate specific fields
        ...(selectedCategory === "immobilier" && {
          real_estate_type: formData.realEstateType,
          real_estate_rooms: formData.rooms ? parseInt(formData.rooms) : undefined,
          real_estate_bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : undefined,
          real_estate_surface: formData.surface ? parseInt(formData.surface) : undefined,
          real_estate_floor: formData.floor ? parseInt(formData.floor) : undefined,
          real_estate_furnished: formData.furnished,
          real_estate_parking: formData.parking,
          real_estate_garden: formData.garden,
          real_estate_balcony: formData.balcony,
          real_estate_condition: formData.realEstateCondition
        }),
        // Job specific fields
        ...(selectedCategory === "emplois" && {
          job_type: formData.jobType,
          job_sector: formData.jobSector,
          job_experience: formData.jobExperience,
          job_education: formData.jobEducation,
          job_salary_min: formData.jobSalaryMin ? parseInt(formData.jobSalaryMin) : undefined,
          job_salary_max: formData.jobSalaryMax ? parseInt(formData.jobSalaryMax) : undefined,
          job_remote: formData.jobRemote,
          job_urgency: formData.jobUrgency,
          job_company: formData.jobCompany,
          job_benefits: JSON.stringify(formData.jobBenefits)
        })
      });
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
      isPaid: true,
      // Reset real estate fields
      realEstateType: "",
      rooms: "",
      bathrooms: "",
      surface: "",
      floor: "",
      furnished: false,
      parking: false,
      garden: false,
      balcony: false,
      realEstateCondition: "",
      // Reset job fields
      jobType: "",
      jobSector: "",
      jobExperience: "",
      jobEducation: "",
      jobSalaryMin: "",
      jobSalaryMax: "",
      jobRemote: false,
      jobUrgency: "",
      jobCompany: "",
      jobBenefits: [] as string[],
      // Car equipment
      equipment: [] as string[]
    });
    setSelectedImages([]);
  };

  return (
    <div className="min-h-screen pb-20 bg-white">
      <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {/* Image Upload */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Photos du produit</h3>
            <ImageManager
              images={selectedImages}
              onImagesChange={setSelectedImages}
              maxImages={8}
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Category Selection */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 relative">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm sm:text-base font-medium">Catégorie *</label>
                <Button
                  type="button"
                  onClick={() => setShowIconMenu(true)}
                  className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  size="sm"
                  style={{ animation: 'pulse 2s infinite' }}
                >
                  <Plus size={18} />
                </Button>
              </div>
              
              {categoriesLoading ? (
                <div className="text-center py-8">Chargement des catégories...</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {categoriesData.map((category: any) => {
                    const Icon = iconMap[category.icon] || Grid3X3;
                    const isSelected = selectedCategory === category.name;
                    const colorClass = availableIcons.find(icon => icon.name === category.icon)?.color || 'bg-gray-500';
                    return (
                      <div
                        key={category.id}
                        onClick={() => setSelectedCategory(category.name)}
                        className={`
                          p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 text-center
                          ${isSelected 
                            ? 'border-red-500 bg-red-50 shadow-lg scale-105' 
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                          }
                        `}
                      >
                        <div className={`
                          w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center
                          ${isSelected ? colorClass : 'bg-gray-100'}
                        `}>
                          <Icon 
                            size={24} 
                            className={isSelected ? 'text-white' : 'text-gray-600'} 
                          />
                        </div>
                        <p className={`
                          text-sm font-medium
                          ${isSelected ? 'text-red-600' : 'text-gray-700'}
                        `}>
                          {category.name}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Floating Icon Menu */}
              {showIconMenu && (
                <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
                  <div className="relative">
                    {/* Central Add Button */}
                    <div className="relative w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                      <Plus size={24} className="text-white" />
                    </div>
                    
                    {/* Floating Icons in Circle */}
                    {availableIcons.map((iconItem, index) => {
                      const Icon = iconItem.icon;
                      const angle = (index * 360) / availableIcons.length;
                      const radius = 120;
                      const x = Math.cos((angle * Math.PI) / 180) * radius;
                      const y = Math.sin((angle * Math.PI) / 180) * radius;
                      const isSelected = selectedIcon === iconItem.name;
                      
                      return (
                        <div
                          key={iconItem.name}
                          onClick={() => {
                            setSelectedIcon(iconItem.name);
                            // Optionally open input for category name
                            const categoryName = prompt("Nom de la catégorie:");
                            if (categoryName && categoryName.trim()) {
                              createCategoryMutation.mutate({
                                name: categoryName.trim(),
                                icon: iconItem.name
                              });
                            }
                          }}
                          className={`
                            absolute w-14 h-14 rounded-full flex items-center justify-center cursor-pointer
                            transition-all duration-300 transform hover:scale-110 shadow-lg
                            ${iconItem.color}
                          `}
                          style={{
                            left: `calc(50% + ${x}px - 28px)`,
                            top: `calc(50% + ${y}px - 28px)`,
                            animation: `fadeInScale 0.3s ease-out ${index * 0.1}s both`
                          }}
                        >
                          <Icon size={20} className="text-white" />
                        </div>
                      );
                    })}
                    
                    {/* Close Button */}
                    <div
                      onClick={() => setShowIconMenu(false)}
                      className="absolute -top-4 -right-4 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors shadow-lg"
                    >
                      <X size={16} className="text-white" />
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Title */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
              <label className="block text-sm sm:text-base font-medium mb-2 sm:mb-3">Titre *</label>
              <Input
                placeholder="Titre de produit"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="h-10 sm:h-12 text-sm sm:text-base"
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

                {/* Équipements disponibles section */}
                <div className="mt-6 bg-gray-50 rounded-xl border border-gray-200 p-6">
                  <h4 className="text-lg font-medium mb-4 flex items-center gap-2" style={{ fontFamily: 'Arial, sans-serif' }}>
                    <Settings size={20} className="text-primary" />
                    Équipements disponibles
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { key: 'seats_ventilated', label: 'Sièges ventilés', icon: '🪑' },
                      { key: 'steering_heated', label: 'Volant chauffant', icon: '🔥' },
                      { key: 'navigation', label: 'Navigation', icon: '🧭' },
                      { key: 'speed_regulator', label: 'Régulateur de vitesse', icon: '⏱️' },
                      { key: 'parking_sensors', label: 'Capteurs stationnement', icon: '📡' },
                      { key: 'camera_rear', label: 'Caméra arrière', icon: '📹' },
                      { key: 'traffic_aid', label: 'Aide trafic transversal', icon: '🛡️' },
                      { key: 'emergency_brake', label: 'Freinage d\'urgence', icon: '🛑' },
                      { key: 'view_360', label: 'Vue 360°', icon: '👁️' },
                      { key: 'voice_alert', label: 'Avertissement voie', icon: '🛣️' },
                      { key: 'roof_opening', label: 'Toit ouvrant', icon: '☀️' },
                      { key: 'smoking_allowed', label: 'Fumeur autorisé', icon: '🚭' }
                    ].map((equipment) => (
                      <div key={equipment.key} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                        <input
                          type="checkbox"
                          id={equipment.key}
                          checked={formData.equipment?.includes(equipment.key) || false}
                          onChange={(e) => {
                            const currentEquipment = formData.equipment || [];
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                equipment: [...currentEquipment, equipment.key]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                equipment: currentEquipment.filter((item: string) => item !== equipment.key)
                              }));
                            }
                          }}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
                        />
                        <label 
                          htmlFor={equipment.key} 
                          className="text-sm font-medium text-gray-900 cursor-pointer flex items-center gap-2"
                          style={{ fontFamily: 'Arial, sans-serif' }}
                        >
                          <span className="text-lg">{equipment.icon}</span>
                          {equipment.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Real Estate specific fields */}
            {selectedCategory === "immobilier" && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Building size={20} className="text-primary" />
                  Détails de l'immobilier
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Type de bien */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Type de bien *</label>
                    <Select value={formData.realEstateType} onValueChange={(value) => setFormData(prev => ({ ...prev, realEstateType: value }))}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Type de bien" />
                      </SelectTrigger>
                      <SelectContent>
                        {realEstateTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Nombre de chambres */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Nombre de chambres *</label>
                    <Input
                      type="number"
                      placeholder="Ex: 3"
                      value={formData.rooms}
                      onChange={(e) => setFormData(prev => ({ ...prev, rooms: e.target.value }))}
                      className="h-12"
                      min="0"
                      max="20"
                      required
                    />
                  </div>
                  
                  {/* Nombre de salles de bains */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Salles de bains</label>
                    <Input
                      type="number"
                      placeholder="Ex: 2"
                      value={formData.bathrooms}
                      onChange={(e) => setFormData(prev => ({ ...prev, bathrooms: e.target.value }))}
                      className="h-12"
                      min="0"
                      max="10"
                    />
                  </div>
                  
                  {/* Surface */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Surface (m²) *</label>
                    <Input
                      type="number"
                      placeholder="Ex: 120"
                      value={formData.surface}
                      onChange={(e) => setFormData(prev => ({ ...prev, surface: e.target.value }))}
                      className="h-12"
                      min="1"
                      required
                    />
                  </div>
                  
                  {/* Étage */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Étage</label>
                    <Input
                      type="number"
                      placeholder="Ex: 2 (RDC = 0)"
                      value={formData.floor}
                      onChange={(e) => setFormData(prev => ({ ...prev, floor: e.target.value }))}
                      className="h-12"
                      min="0"
                      max="50"
                    />
                  </div>
                  
                  {/* État */}
                  <div>
                    <label className="block text-sm font-medium mb-2">État du bien</label>
                    <Select value={formData.realEstateCondition} onValueChange={(value) => setFormData(prev => ({ ...prev, realEstateCondition: value }))}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="État du bien" />
                      </SelectTrigger>
                      <SelectContent>
                        {realEstateConditions.map((condition) => (
                          <SelectItem key={condition.value} value={condition.value}>{condition.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Options supplémentaires */}
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-3">Options disponibles</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.furnished}
                        onChange={(e) => setFormData(prev => ({ ...prev, furnished: e.target.checked }))}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">Meublé</span>
                    </label>
                    
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.parking}
                        onChange={(e) => setFormData(prev => ({ ...prev, parking: e.target.checked }))}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">Parking</span>
                    </label>
                    
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.garden}
                        onChange={(e) => setFormData(prev => ({ ...prev, garden: e.target.checked }))}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">Jardin</span>
                    </label>
                    
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.balcony}
                        onChange={(e) => setFormData(prev => ({ ...prev, balcony: e.target.checked }))}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">Balcon</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Job specific fields */}
            {selectedCategory === "emplois" && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Briefcase size={20} className="text-primary" />
                  Détails de l'emploi
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Type de contrat */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Type de contrat *</label>
                    <Select value={formData.jobType} onValueChange={(value) => setFormData(prev => ({ ...prev, jobType: value }))}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Type de contrat" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Secteur d'activité */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Secteur d'activité *</label>
                    <Select value={formData.jobSector} onValueChange={(value) => setFormData(prev => ({ ...prev, jobSector: value }))}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Secteur d'activité" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobSectors.map((sector) => (
                          <SelectItem key={sector.value} value={sector.value}>{sector.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Expérience requise */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Expérience requise</label>
                    <Select value={formData.jobExperience} onValueChange={(value) => setFormData(prev => ({ ...prev, jobExperience: value }))}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Niveau d'expérience" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobExperiences.map((exp) => (
                          <SelectItem key={exp.value} value={exp.value}>{exp.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Niveau d'études */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Niveau d'études</label>
                    <Select value={formData.jobEducation} onValueChange={(value) => setFormData(prev => ({ ...prev, jobEducation: value }))}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Niveau d'études requis" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobEducations.map((edu) => (
                          <SelectItem key={edu.value} value={edu.value}>{edu.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Nom de l'entreprise */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Entreprise</label>
                    <Input
                      placeholder="Nom de l'entreprise"
                      value={formData.jobCompany}
                      onChange={(e) => setFormData(prev => ({ ...prev, jobCompany: e.target.value }))}
                      className="h-12"
                    />
                  </div>
                  
                  {/* Urgence */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Urgence</label>
                    <Select value={formData.jobUrgency} onValueChange={(value) => setFormData(prev => ({ ...prev, jobUrgency: value }))}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Niveau d'urgence" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobUrgencies.map((urgency) => (
                          <SelectItem key={urgency.value} value={urgency.value}>{urgency.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Fourchette de salaire */}
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-3">Fourchette de salaire (DT/mois)</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Input
                        type="number"
                        placeholder="Salaire minimum"
                        value={formData.jobSalaryMin}
                        onChange={(e) => setFormData(prev => ({ ...prev, jobSalaryMin: e.target.value }))}
                        className="h-12"
                        min="0"
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        placeholder="Salaire maximum"
                        value={formData.jobSalaryMax}
                        onChange={(e) => setFormData(prev => ({ ...prev, jobSalaryMax: e.target.value }))}
                        className="h-12"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Options supplémentaires */}
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-3">Options</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.jobRemote}
                      onChange={(e) => setFormData(prev => ({ ...prev, jobRemote: e.target.checked }))}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm">Télétravail possible</span>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
              <label className="block text-sm sm:text-base font-medium mb-2 sm:mb-3">Description *</label>
              <Textarea
                placeholder={selectedCategory === "voiture" ? "Décrivez l'état du véhicule, équipements, historique..." : "Description du produit"}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="min-h-24 sm:min-h-32 text-sm sm:text-base resize-none"
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="flex-1 h-10 sm:h-12 lg:h-14 text-sm sm:text-base lg:text-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 order-2 sm:order-1"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={createProductMutation.isPending}
                className="flex-1 h-10 sm:h-12 lg:h-14 text-sm sm:text-base lg:text-lg bg-primary hover:bg-primary/90 order-1 sm:order-2"
              >
                {createProductMutation.isPending ? "Publication..." : "Publier"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};