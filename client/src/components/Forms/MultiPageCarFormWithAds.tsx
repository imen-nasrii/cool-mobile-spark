import { useState, useEffect } from "react";
import { MultiPageCarForm } from "./MultiPageCarForm";
import ad1Image from "@/assets/ad-1.jpeg";
import ad2Image from "@/assets/ad-2.jpeg";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface MultiPageCarFormWithAdsProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const MultiPageCarFormWithAds = ({ onSubmit, onCancel }: MultiPageCarFormWithAdsProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showAdPopup, setShowAdPopup] = useState(false);
  const [currentAdImage, setCurrentAdImage] = useState("");

  // Afficher les popups automatiquement selon l'étape
  useEffect(() => {
    if (currentStep === 1) {
      // Popup de la première image à l'étape 1
      setCurrentAdImage(ad1Image);
      setShowAdPopup(true);
    } else if (currentStep === 2) {
      // Popup de la deuxième image à l'étape 2
      setCurrentAdImage(ad2Image);
      setShowAdPopup(true);
    }
  }, [currentStep]);

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Formulaire principal sans publicités */}
        <div className="w-full">
          <MultiPageCarForm 
            onSubmit={onSubmit} 
            onCancel={onCancel}
            onStepChange={handleStepChange}
            currentStep={currentStep}
          />
        </div>
      </div>

      {/* Popup pour les publicités */}
      <Dialog open={showAdPopup} onOpenChange={setShowAdPopup}>
        <DialogContent className="max-w-md mx-auto bg-white border-2 border-red-500">
          <div className="relative">
            <Button
              onClick={() => setShowAdPopup(false)}
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 bg-white hover:bg-red-50 border border-gray-300"
            >
              <X size={16} className="text-black" />
            </Button>
            
            <div className="p-3">
              <div className="text-center mb-3">
                <h3 className="text-base font-bold text-black">
                  {currentStep === 1 ? "Étape 1 - Offre !" : "Étape 2 - Promo !"}
                </h3>
              </div>
              
              <img 
                src={currentAdImage} 
                alt="Publicité" 
                className="w-full h-auto max-h-48 object-cover rounded border border-gray-200"
              />
              
              <div className="mt-3 text-center">
                <Button
                  onClick={() => setShowAdPopup(false)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 text-sm"
                >
                  Continuer
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};