import { Heart } from "lucide-react";

export const Favorites = ({ activeTab, onTabChange }: { 
  activeTab?: string; 
  onTabChange?: (tab: string) => void;
}) => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-6 flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Heart size={80} className="text-gray-300 stroke-2" />
              <Heart size={60} className="text-gray-300 absolute top-2 left-2.5 stroke-2" />
              <Heart size={40} className="text-gray-300 absolute top-5 left-5 stroke-2" />
            </div>
          </div>
          <p className="text-gray-600 text-lg leading-relaxed max-w-md">
            votre liste de favoris est encore vide. Commencez à explorer et ajoutez à vos favoris
          </p>
        </div>
      </div>
    </div>
  );
};