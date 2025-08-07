import { useState } from "react";
import { Car, Building, Briefcase, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { apiClient, queryClient } from "@/lib/queryClient";
import { CarForm } from "@/components/Forms/CarForm";
import { RealEstateForm } from "@/components/Forms/RealEstateForm";
import { JobForm } from "@/components/Forms/JobForm";

// Category definitions
const categoryMap = {
  "voiture": { name: "Voiture", icon: Car, color: "bg-blue-500" },
  "immobilier": { name: "Immobilier", icon: Building, color: "bg-green-500" },
  "emplois": { name: "Emploi", icon: Briefcase, color: "bg-purple-500" },
  "autres": { name: "Autres", icon: Grid3X3, color: "bg-gray-500" }
};

export const AddProduct = ({ activeTab, onTabChange, selectedCategory: preSelectedCategory }: { 
  activeTab?: string; 
  onTabChange?: (tab: string) => void;
  selectedCategory?: string;
}) => {
  const [selectedCategory, setSelectedCategory] = useState(preSelectedCategory || "");
  const { toast } = useToast();
  const { user } = useAuth();

  // React Query mutation for creating products
  const createProductMutation = useMutation({
    mutationFn: (productData: any) => apiClient.createProduct(productData),
    onSuccess: () => {
      toast({
        title: "Succès!",
        description: "Votre annonce a été publiée avec succès",
      });
      
      // Reset and redirect
      setSelectedCategory("");
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
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

  const handleSubmit = (productData: any) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour publier une annonce",
        variant: "destructive"
      });
      return;
    }

    createProductMutation.mutate(productData);
  };

  const handleCancel = () => {
    setSelectedCategory("");
    onTabChange?.("home");
  };

  // If no category selected, show category selection
  if (!selectedCategory) {
    return (
      <div className="min-h-screen pb-20 bg-gray-50">
        <div className="px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Publier une annonce</h1>
              <p className="text-gray-600">Choisissez une catégorie pour commencer</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(categoryMap).map(([key, category]) => {
                const Icon = category.icon;
                return (
                  <Card
                    key={key}
                    className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 hover:border-red-500"
                    onClick={() => setSelectedCategory(key)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${category.color}`}>
                        <Icon size={32} className="text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
                      <p className="text-sm text-gray-600">
                        {key === "voiture" && "Vendez votre véhicule rapidement"}
                        {key === "immobilier" && "Publiez votre bien immobilier"}
                        {key === "emplois" && "Diffusez une offre d'emploi"}
                        {key === "autres" && "Autres produits et services"}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render specialized forms based on category
  return (
    <div>
      {selectedCategory === "voiture" && (
        <CarForm onSubmit={handleSubmit} onCancel={handleCancel} />
      )}
      {selectedCategory === "immobilier" && (
        <RealEstateForm onSubmit={handleSubmit} onCancel={handleCancel} />
      )}
      {selectedCategory === "emplois" && (
        <JobForm onSubmit={handleSubmit} onCancel={handleCancel} />
      )}
      {selectedCategory === "autres" && (
        <div className="min-h-screen pb-20 bg-gray-50 flex items-center justify-center">
          <div className="text-center p-8">
            <Grid3X3 size={48} className="mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">Catégorie "Autres" en cours de développement</h2>
            <p className="text-gray-600 mb-4">Cette catégorie sera bientôt disponible</p>
            <Button onClick={handleCancel}>Retour</Button>
          </div>
        </div>
      )}
    </div>
  );
};