import { CarForm } from "./CarForm";
import ad1Image from "@/assets/ad-1.jpeg";
import ad2Image from "@/assets/ad-2.jpeg";

interface CarFormWithAdsProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const CarFormWithAds = ({ onSubmit, onCancel }: CarFormWithAdsProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto flex gap-6 px-4 py-6">
        {/* Publicité gauche */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <img 
                src={ad1Image} 
                alt="Publicité" 
                className="w-full h-auto object-cover cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => window.open('#', '_blank')}
              />
              <div className="p-3 text-center">
                <span className="text-xs text-gray-500">Publicité</span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire principal */}
        <div className="flex-1 min-w-0">
          <CarForm onSubmit={onSubmit} onCancel={onCancel} />
        </div>

        {/* Publicité droite */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <img 
                src={ad2Image} 
                alt="Publicité" 
                className="w-full h-auto object-cover cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => window.open('#', '_blank')}
              />
              <div className="p-3 text-center">
                <span className="text-xs text-gray-500">Publicité</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Publicités mobiles (affichées en bas sur mobile) */}
      <div className="lg:hidden px-4 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <img 
              src={ad1Image} 
              alt="Publicité" 
              className="w-full h-auto object-cover cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => window.open('#', '_blank')}
            />
            <div className="p-3 text-center">
              <span className="text-xs text-gray-500">Publicité</span>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <img 
              src={ad2Image} 
              alt="Publicité" 
              className="w-full h-auto object-cover cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => window.open('#', '_blank')}
            />
            <div className="p-3 text-center">
              <span className="text-xs text-gray-500">Publicité</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};