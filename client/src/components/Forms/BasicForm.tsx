import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Grid3X3, Upload, X, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ImageManager } from "../Products/ImageManager";

interface BasicFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function BasicForm({ onSubmit, onCancel }: BasicFormProps) {
  const { toast } = useToast();
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    condition: "",
    isPaid: true,
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.description || !formData.location) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    if (formData.isPaid && !formData.price) {
      toast({
        title: "Erreur",
        description: "Veuillez indiquer le prix",
        variant: "destructive"
      });
      return;
    }

    const basicData = {
      title: formData.title,
      description: formData.description,
      price: formData.isPaid ? formData.price : "Free",
      location: formData.location,
      category: "autres",
      is_free: !formData.isPaid,
      image_url: selectedImages[0] || '',
      images: JSON.stringify(selectedImages),
      condition: formData.condition,
    };

    onSubmit(basicData);
  };

  return (
    <div className="min-h-screen pb-20 bg-gray-50">
      <div className="px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Grid3X3 className="text-gray-500" size={24} />
              <h1 className="text-2xl font-bold text-gray-900">Publier une annonce</h1>
            </div>
            <p className="text-gray-600">Ajoutez votre produit dans la catégorie "Autres"</p>
          </div>

          {/* Form Content */}
          <div className="bg-white border border-gray-200 p-6">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations du produit</h2>
              
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre de l'annonce *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Ex: Ordinateur portable, Livre de cuisine, etc."
                  className="h-12"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Localisation *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Ex: Tunis, Sfax, Sousse..."
                    className="h-12 pl-10"
                  />
                </div>
              </div>

              {/* Condition */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  État du produit
                </label>
                <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Sélectionnez l'état" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="neuf">Neuf</SelectItem>
                    <SelectItem value="tres-bon-etat">Très bon état</SelectItem>
                    <SelectItem value="bon-etat">Bon état</SelectItem>
                    <SelectItem value="etat-correct">État correct</SelectItem>
                    <SelectItem value="pour-pieces">Pour pièces</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix
                </label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isPaid"
                      checked={formData.isPaid}
                      onCheckedChange={(checked) => handleInputChange('isPaid', checked)}
                    />
                    <label htmlFor="isPaid" className="text-sm font-medium">
                      Article payant
                    </label>
                  </div>
                  
                  {formData.isPaid && (
                    <div className="relative">
                      <Input
                        type="number"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        placeholder="Ex: 150"
                        className="h-12 pr-12"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                        TND
                      </span>
                    </div>
                  )}
                  
                  {!formData.isPaid && (
                    <p className="text-sm text-green-600 font-medium">Article gratuit</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Décrivez votre produit en détail..."
                  className="min-h-32"
                />
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photos (optionnel)
                </label>
                <ImageManager
                  images={selectedImages}
                  onImagesChange={setSelectedImages}
                  maxImages={5}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1 h-12"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1 h-12 bg-red-600 hover:bg-red-700"
                >
                  Publier l'annonce
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}