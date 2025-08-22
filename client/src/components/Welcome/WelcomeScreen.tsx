import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Heart, Sparkles, ShoppingBag } from 'lucide-react';

interface WelcomeScreenProps {
  onClose: () => void;
}

export function WelcomeScreen({ onClose }: WelcomeScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "مرحبا بك في توماتي! 🍅",
      subtitle: "Marhaba bik fi Tomati App!",
      description: "Bienvenue dans votre marketplace préférée en Tunisie",
      emoji: "🎉",
      content: "Découvrez des milliers de produits et vendez facilement vos articles"
    },
    {
      title: "Achetez & Vendez 🛒",
      subtitle: "Tout ce dont vous avez besoin",
      description: "Voitures, immobilier, emplois, électronique et bien plus",
      emoji: "🚗",
      content: "Négociez directement avec les vendeurs via notre système de messagerie"
    },
    {
      title: "Sécurisé & Local 🛡️",
      subtitle: "100% Tunisien",
      description: "Transactions sécurisées avec des vendeurs vérifiés",
      emoji: "🇹🇳",
      content: "Rencontrez les vendeurs près de chez vous en toute sécurité"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white border border-gray-200 overflow-hidden">
        <div className="relative bg-gradient-to-br from-red-500 to-red-600 p-6 text-white">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="absolute top-2 right-2 text-white hover:bg-white hover:bg-opacity-20"
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="text-center">
            <div className="text-6xl mb-4">{steps[currentStep].emoji}</div>
            <h1 className="text-2xl font-bold mb-2">{steps[currentStep].title}</h1>
            <p className="text-red-100 text-sm">{steps[currentStep].subtitle}</p>
          </div>
        </div>

        <CardContent className="p-6 text-center">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-black mb-2">{steps[currentStep].description}</h2>
            <p className="text-gray-600 text-sm">{steps[currentStep].content}</p>
          </div>

          {/* Step indicators */}
          <div className="flex justify-center space-x-2 mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentStep ? 'bg-red-500 w-6' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1 border-gray-300 text-gray-600"
              >
                Précédent
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Commencer
                </>
              ) : (
                <>
                  Suivant
                  <Sparkles className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          {/* Skip button */}
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="w-full mt-3 text-gray-500 hover:bg-gray-50"
            size="sm"
          >
            Passer l'introduction
          </Button>
        </CardContent>

        {/* Cute decorative elements */}
        <div className="absolute top-4 left-4 text-red-300 opacity-50">
          <Heart className="h-4 w-4" />
        </div>
        <div className="absolute bottom-4 right-4 text-red-300 opacity-50">
          <Sparkles className="h-4 w-4" />
        </div>
      </Card>
    </div>
  );
}