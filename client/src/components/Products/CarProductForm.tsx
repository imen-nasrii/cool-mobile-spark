import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface CarProductFormProps {
  initialData?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
  isEdit?: boolean;
}

export function CarProductForm({ initialData, onSuccess, onCancel, isEdit = false }: CarProductFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    price: initialData?.price || '',
    location: initialData?.location || '',
    category: 'vehicles',
    is_free: initialData?.is_free || false,
    image_url: initialData?.image_url || '',
    // Champs spécifiques aux voitures
    car_fuel_type: initialData?.car_fuel_type || '',
    car_transmission: initialData?.car_transmission || '',
    car_year: initialData?.car_year || '',
    car_mileage: initialData?.car_mileage || '',
    car_engine_size: initialData?.car_engine_size || '',
    car_doors: initialData?.car_doors || '',
    car_seats: initialData?.car_seats || '',
    car_color: initialData?.car_color || '',
    car_brand: initialData?.car_brand || '',
    car_model: initialData?.car_model || '',
    car_condition: initialData?.car_condition || '',
    // Caractéristiques avancées
    car_ventilated_seats: initialData?.car_ventilated_seats || false,
    car_heated_steering: initialData?.car_heated_steering || false,
    car_navigation: initialData?.car_navigation || false,
    car_cruise_control: initialData?.car_cruise_control || false,
    car_parking_sensors: initialData?.car_parking_sensors || false,
    car_rear_camera: initialData?.car_rear_camera || false,
    car_traffic_assist: initialData?.car_traffic_assist || false,
    car_emergency_braking: initialData?.car_emergency_braking || false,
    car_360_view: initialData?.car_360_view || false,
    car_lane_departure: initialData?.car_lane_departure || false,
    car_sunroof: initialData?.car_sunroof || false,
    car_non_smoking: initialData?.car_non_smoking || false,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const url = isEdit ? `/api/products/${initialData.id}` : '/api/products';
      const method = isEdit ? 'PUT' : 'POST';
      return apiRequest(url, { method, body: JSON.stringify(data) });
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: isEdit ? "Voiture mise à jour avec succès" : "Voiture ajoutée avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la voiture",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {isEdit ? 'Modifier la voiture' : 'Ajouter une voiture'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre de l'annonce *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
                placeholder="Ex: Peugeot 208 GTI"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Prix *</Label>
              <Input
                id="price"
                value={formData.price}
                onChange={(e) => updateFormData('price', e.target.value)}
                placeholder="Ex: 15000 TND"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value)}
              placeholder="Décrivez votre véhicule..."
              rows={3}
            />
          </div>

          {/* Informations spécifiques à la voiture */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Détails du véhicule</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="car_brand">Marque *</Label>
                <Select value={formData.car_brand} onValueChange={(value) => updateFormData('car_brand', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une marque" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="peugeot">Peugeot</SelectItem>
                    <SelectItem value="renault">Renault</SelectItem>
                    <SelectItem value="citroen">Citroën</SelectItem>
                    <SelectItem value="volkswagen">Volkswagen</SelectItem>
                    <SelectItem value="toyota">Toyota</SelectItem>
                    <SelectItem value="bmw">BMW</SelectItem>
                    <SelectItem value="mercedes">Mercedes</SelectItem>
                    <SelectItem value="audi">Audi</SelectItem>
                    <SelectItem value="hyundai">Hyundai</SelectItem>
                    <SelectItem value="kia">Kia</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="car_model">Modèle *</Label>
                <Input
                  id="car_model"
                  value={formData.car_model}
                  onChange={(e) => updateFormData('car_model', e.target.value)}
                  placeholder="Ex: 208 GTI"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="car_year">Année *</Label>
                <Input
                  id="car_year"
                  type="number"
                  value={formData.car_year}
                  onChange={(e) => updateFormData('car_year', e.target.value)}
                  placeholder="Ex: 2020"
                  min="1990"
                  max={new Date().getFullYear()}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="car_fuel_type">Type de carburant *</Label>
                <Select value={formData.car_fuel_type} onValueChange={(value) => updateFormData('car_fuel_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type de carburant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="essence">Essence</SelectItem>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="hybride">Hybride</SelectItem>
                    <SelectItem value="electrique">Électrique</SelectItem>
                    <SelectItem value="gpl">GPL</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="car_transmission">Transmission *</Label>
                <Select value={formData.car_transmission} onValueChange={(value) => updateFormData('car_transmission', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type de transmission" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manuelle">Manuelle</SelectItem>
                    <SelectItem value="automatique">Automatique</SelectItem>
                    <SelectItem value="semi-automatique">Semi-automatique</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="car_mileage">Kilométrage</Label>
                <Input
                  id="car_mileage"
                  type="number"
                  value={formData.car_mileage}
                  onChange={(e) => updateFormData('car_mileage', e.target.value)}
                  placeholder="Ex: 50000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="car_engine_size">Cylindrée</Label>
                <Input
                  id="car_engine_size"
                  value={formData.car_engine_size}
                  onChange={(e) => updateFormData('car_engine_size', e.target.value)}
                  placeholder="Ex: 1.6L"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="car_doors">Nombre de portes</Label>
                <Select value={formData.car_doors} onValueChange={(value) => updateFormData('car_doors', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Nombre de portes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 portes</SelectItem>
                    <SelectItem value="3">3 portes</SelectItem>
                    <SelectItem value="4">4 portes</SelectItem>
                    <SelectItem value="5">5 portes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="car_seats">Nombre de places</Label>
                <Select value={formData.car_seats} onValueChange={(value) => updateFormData('car_seats', value)}>
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

              <div className="space-y-2">
                <Label htmlFor="car_color">Couleur</Label>
                <Select value={formData.car_color} onValueChange={(value) => updateFormData('car_color', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Couleur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blanc">Blanc</SelectItem>
                    <SelectItem value="noir">Noir</SelectItem>
                    <SelectItem value="gris">Gris</SelectItem>
                    <SelectItem value="rouge">Rouge</SelectItem>
                    <SelectItem value="bleu">Bleu</SelectItem>
                    <SelectItem value="vert">Vert</SelectItem>
                    <SelectItem value="jaune">Jaune</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                    <SelectItem value="marron">Marron</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="car_condition">État du véhicule *</Label>
                <Select value={formData.car_condition} onValueChange={(value) => updateFormData('car_condition', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="État" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="neuf">Neuf</SelectItem>
                    <SelectItem value="tres-bon">Très bon état</SelectItem>
                    <SelectItem value="bon">Bon état</SelectItem>
                    <SelectItem value="correct">État correct</SelectItem>
                    <SelectItem value="a-renover">À rénover</SelectItem>
                    <SelectItem value="accidente">Accidenté</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Localisation *</Label>
                <Select value={formData.location} onValueChange={(value) => updateFormData('location', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ville" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tunis">Tunis</SelectItem>
                    <SelectItem value="Sfax">Sfax</SelectItem>
                    <SelectItem value="Sousse">Sousse</SelectItem>
                    <SelectItem value="Monastir">Monastir</SelectItem>
                    <SelectItem value="Bizerte">Bizerte</SelectItem>
                    <SelectItem value="Gabès">Gabès</SelectItem>
                    <SelectItem value="Kairouan">Kairouan</SelectItem>
                    <SelectItem value="Nabeul">Nabeul</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Caractéristiques avancées */}
          <Card className="bg-blue-50 dark:bg-blue-900/20">
            <CardHeader>
              <CardTitle className="text-lg text-blue-800 dark:text-blue-200">Équipements disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {/* Sièges ventilés */}
                <div 
                  className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${formData.car_ventilated_seats ? 'bg-black text-white' : 'bg-gray-300 text-gray-600'}`}
                  onClick={() => updateFormData('car_ventilated_seats', !formData.car_ventilated_seats)}
                >
                  <div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center">
                    <span className={`text-xs ${formData.car_ventilated_seats ? 'text-black' : 'text-gray-400'}`}>🪑</span>
                  </div>
                  <span className="text-xs">Sièges ventilés</span>
                </div>

                {/* Volant chauffant */}
                <div 
                  className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${formData.car_heated_steering ? 'bg-black text-white' : 'bg-gray-300 text-gray-600'}`}
                  onClick={() => updateFormData('car_heated_steering', !formData.car_heated_steering)}
                >
                  <div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center">
                    <span className={`text-xs ${formData.car_heated_steering ? 'text-black' : 'text-gray-400'}`}>🔥</span>
                  </div>
                  <span className="text-xs">Volant chauffant</span>
                </div>

                {/* Navigation */}
                <div 
                  className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${formData.car_navigation ? 'bg-black text-white' : 'bg-gray-300 text-gray-600'}`}
                  onClick={() => updateFormData('car_navigation', !formData.car_navigation)}
                >
                  <div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center">
                    <span className={`text-xs ${formData.car_navigation ? 'text-black' : 'text-gray-400'}`}>🧭</span>
                  </div>
                  <span className="text-xs">Navigation</span>
                </div>

                {/* Régulateur de vitesse */}
                <div 
                  className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${formData.car_cruise_control ? 'bg-black text-white' : 'bg-gray-300 text-gray-600'}`}
                  onClick={() => updateFormData('car_cruise_control', !formData.car_cruise_control)}
                >
                  <div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center">
                    <span className={`text-xs ${formData.car_cruise_control ? 'text-black' : 'text-gray-400'}`}>⏱️</span>
                  </div>
                  <span className="text-xs">Régulateur de vitesse</span>
                </div>

                {/* Capteurs de stationnement */}
                <div 
                  className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${formData.car_parking_sensors ? 'bg-black text-white' : 'bg-gray-300 text-gray-600'}`}
                  onClick={() => updateFormData('car_parking_sensors', !formData.car_parking_sensors)}
                >
                  <div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center">
                    <span className={`text-xs ${formData.car_parking_sensors ? 'text-black' : 'text-gray-400'}`}>📡</span>
                  </div>
                  <span className="text-xs">Capteurs stationnement</span>
                </div>

                {/* Caméra arrière */}
                <div 
                  className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${formData.car_rear_camera ? 'bg-black text-white' : 'bg-gray-300 text-gray-600'}`}
                  onClick={() => updateFormData('car_rear_camera', !formData.car_rear_camera)}
                >
                  <div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center">
                    <span className={`text-xs ${formData.car_rear_camera ? 'text-black' : 'text-gray-400'}`}>📹</span>
                  </div>
                  <span className="text-xs">Caméra arrière</span>
                </div>

                {/* Aide au trafic transversal */}
                <div 
                  className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${formData.car_traffic_assist ? 'bg-black text-white' : 'bg-gray-300 text-gray-600'}`}
                  onClick={() => updateFormData('car_traffic_assist', !formData.car_traffic_assist)}
                >
                  <div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center">
                    <span className={`text-xs ${formData.car_traffic_assist ? 'text-black' : 'text-gray-400'}`}>🛡️</span>
                  </div>
                  <span className="text-xs">Aide trafic transversal</span>
                </div>

                {/* Freinage d'urgence */}
                <div 
                  className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${formData.car_emergency_braking ? 'bg-black text-white' : 'bg-gray-300 text-gray-600'}`}
                  onClick={() => updateFormData('car_emergency_braking', !formData.car_emergency_braking)}
                >
                  <div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center">
                    <span className={`text-xs ${formData.car_emergency_braking ? 'text-black' : 'text-gray-400'}`}>🛑</span>
                  </div>
                  <span className="text-xs">Freinage d'urgence</span>
                </div>

                {/* Vue à 360 degrés */}
                <div 
                  className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${formData.car_360_view ? 'bg-black text-white' : 'bg-gray-300 text-gray-600'}`}
                  onClick={() => updateFormData('car_360_view', !formData.car_360_view)}
                >
                  <div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center">
                    <span className={`text-xs ${formData.car_360_view ? 'text-black' : 'text-gray-400'}`}>👁️</span>
                  </div>
                  <span className="text-xs">Vue 360°</span>
                </div>

                {/* Avertissement sortie de voie */}
                <div 
                  className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${formData.car_lane_departure ? 'bg-black text-white' : 'bg-gray-300 text-gray-600'}`}
                  onClick={() => updateFormData('car_lane_departure', !formData.car_lane_departure)}
                >
                  <div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center">
                    <span className={`text-xs ${formData.car_lane_departure ? 'text-black' : 'text-gray-400'}`}>🛣️</span>
                  </div>
                  <span className="text-xs">Avertissement voie</span>
                </div>

                {/* Toit ouvrant */}
                <div 
                  className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${formData.car_sunroof ? 'bg-black text-white' : 'bg-gray-300 text-gray-600'}`}
                  onClick={() => updateFormData('car_sunroof', !formData.car_sunroof)}
                >
                  <div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center">
                    <span className={`text-xs ${formData.car_sunroof ? 'text-black' : 'text-gray-400'}`}>☀️</span>
                  </div>
                  <span className="text-xs">Toit ouvrant</span>
                </div>

                {/* Non fumeur */}
                <div 
                  className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${formData.car_non_smoking ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-600'}`}
                  onClick={() => updateFormData('car_non_smoking', !formData.car_non_smoking)}
                >
                  <div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center">
                    <span className={`text-xs ${formData.car_non_smoking ? 'text-red-600' : 'text-gray-400'}`}>🚭</span>
                  </div>
                  <span className="text-xs">Non fumeur</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* URL Image */}
          <div className="space-y-2">
            <Label htmlFor="image_url">URL de l'image (optionnel)</Label>
            <Input
              id="image_url"
              value={formData.image_url}
              onChange={(e) => updateFormData('image_url', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6">
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? 'Sauvegarde...' : (isEdit ? 'Modifier' : 'Ajouter')}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="flex-1"
            >
              Annuler
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}