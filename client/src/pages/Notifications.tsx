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

  return <NotificationCenter />;
};