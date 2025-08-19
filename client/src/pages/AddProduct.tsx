import { useState } from "react";
import { Car, Building, Briefcase, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { apiClient, queryClient } from "@/lib/queryClient";
import { CarFormWithAds } from "@/components/Forms/CarFormWithAds";
import { MultiPageCarFormWithAds } from "@/components/Forms/MultiPageCarFormWithAds";
import { RealEstateForm } from "@/components/Forms/RealEstateForm";
import { JobForm } from "@/components/Forms/JobForm";
import { BasicForm } from "@/components/Forms/BasicForm";

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
      
      // Clear all caches completely
      queryClient.clear();
      
      // Reset and redirect
      setSelectedCategory("");
      onTabChange?.("home");
      
      // Force a full page reload to ensure fresh data
      setTimeout(() => {
        window.location.reload();
      }, 100);
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
      <div className="min-h-screen pb-20 bg-white" style={{ fontFamily: 'Arial, sans-serif' }}>
        <div className="px-4 py-8">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-black mb-4">Publier une annonce</h1>
            </div>
            
            <div className="space-y-3">
              {Object.entries(categoryMap).map(([key, category]) => {
                const Icon = category.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className="w-full flex items-center gap-3 p-4 text-left border border-gray-200 hover:border-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Icon size={20} className="text-black" />
                    <span className="text-black font-medium">{category.name}</span>
                  </button>
                );
              })}
            </div>
            
            <div className="mt-6">
              <button
                onClick={handleCancel}
                className="w-full p-3 text-gray-600 hover:text-black transition-colors"
              >
                Annuler
              </button>
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
        <MultiPageCarFormWithAds onSubmit={handleSubmit} onCancel={handleCancel} />
      )}
      {selectedCategory === "immobilier" && (
        <RealEstateForm onSubmit={handleSubmit} onCancel={handleCancel} />
      )}
      {selectedCategory === "emplois" && (
        <JobForm onSubmit={handleSubmit} onCancel={handleCancel} />
      )}
      {selectedCategory === "autres" && (
        <BasicForm onSubmit={handleSubmit} onCancel={handleCancel} />
      )}
    </div>
  );
};