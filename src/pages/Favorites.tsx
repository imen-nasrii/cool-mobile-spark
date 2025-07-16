import { Heart } from "lucide-react";

export const Favorites = ({ activeTab, onTabChange }: { 
  activeTab?: string; 
  onTabChange?: (tab: string) => void;
}) => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center px-6">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                <Heart size={40} className="text-gray-400 stroke-2" />
              </div>
              <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center absolute -top-2 -right-2">
                <Heart size={32} className="text-gray-400 stroke-2" />
              </div>
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