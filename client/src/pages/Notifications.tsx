import { Bell, Check, X, Heart, MessageCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface NotificationProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const Notifications = ({ activeTab, onTabChange }: NotificationProps) => {
  // Mock notifications for demo
  const notifications = [
    {
      id: 1,
      type: 'like',
      title: 'Nouveau favori',
      message: 'Quelqu\'un a ajouté votre iPhone 14 Pro aux favoris',
      time: '2 min',
      read: false,
      icon: Heart
    },
    {
      id: 2,
      type: 'message',
      title: 'Nouveau message',
      message: 'Ahmed: "Est-ce que le vélo est toujours disponible ?"',
      time: '15 min',
      read: false,
      icon: MessageCircle
    },
    {
      id: 3,
      type: 'review',
      title: 'Nouvel avis',
      message: 'Vous avez reçu une évaluation 5 étoiles de Sarah',
      time: '1h',
      read: true,
      icon: Star
    },
    {
      id: 4,
      type: 'like',
      title: 'Produit populaire',
      message: 'Votre Tesla Model 3 a reçu 10 nouveaux favoris aujourd\'hui',
      time: '3h',
      read: true,
      icon: Heart
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell size={24} className="text-gray-700" />
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="rounded-full">
                {unreadCount}
              </Badge>
            )}
          </div>
          
          {unreadCount > 0 && (
            <Button variant="outline" size="sm">
              <Check size={16} className="mr-2" />
              Tout marquer comme lu
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {notifications.map((notification) => {
            const Icon = notification.icon;
            return (
              <Card 
                key={notification.id}
                className={`transition-all duration-200 hover:shadow-md cursor-pointer ${
                  !notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50/50' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${
                      notification.type === 'like' ? 'bg-red-100 text-red-600' :
                      notification.type === 'message' ? 'bg-blue-100 text-blue-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      <Icon size={16} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {notification.title}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {notification.time}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {notification.message}
                      </p>
                    </div>
                    
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {notifications.length === 0 && (
          <div className="text-center py-12">
            <Bell size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune notification</h3>
            <p className="text-gray-500">
              Vous recevrez ici les notifications sur vos produits et messages.
            </p>
          </div>
        )}

        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => onTabChange?.('home')}>
            Retour à l'accueil
          </Button>
        </div>
      </div>
    </div>
  );
};