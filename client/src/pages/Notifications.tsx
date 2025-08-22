import { NotificationCenter } from "@/components/Notifications/NotificationCenter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

interface NotificationProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const Notifications = ({ activeTab, onTabChange }: NotificationProps) => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen pb-20 flex items-center justify-center">
        <div className="text-center">
          <Bell size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Connexion requise</h3>
          <p className="text-gray-500 mb-4">
            Vous devez être connecté pour voir vos notifications.
          </p>
          <Button onClick={() => onTabChange?.('auth')}>
            Se connecter
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 flex items-center justify-center">
      <div className="text-center p-8">
        <div className="text-6xl mb-4">🔔</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Centre de notifications</h2>
        <p className="text-gray-600 mb-6">
          Le système de notifications est en cours de développement.<br/>
          Cette fonctionnalité sera bientôt disponible !
        </p>
        <div className="space-y-3 max-w-md mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">💬</div>
              <div>
                <h3 className="font-semibold text-red-900">Messages</h3>
                <p className="text-sm text-red-700">Notifications de nouveaux messages</p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">❤️</div>
              <div>
                <h3 className="font-semibold text-red-900">Favoris</h3>
                <p className="text-sm text-red-700">Quand vos produits sont aimés</p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">⭐</div>
              <div>
                <h3 className="font-semibold text-red-900">Évaluations</h3>
                <p className="text-sm text-red-700">Nouvelles notes sur vos produits</p>
              </div>
            </div>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={() => onTabChange?.('home')}
          className="mt-6"
        >
          Retour à l'accueil
        </Button>
      </div>
    </div>
  );
};