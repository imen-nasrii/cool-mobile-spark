import { Bell, Check, X, Heart, MessageCircle, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface NotificationProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const Notifications = ({ activeTab, onTabChange }: NotificationProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isMarkingAllAsRead
  } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return Heart;
      case 'message':
        return MessageCircle;
      case 'review':
        return Star;
      default:
        return Bell;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}j`;
  };

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    toast({
      title: "Succès",
      description: "Toutes les notifications ont été marquées comme lues",
    });
  };

  const handleDeleteNotification = (notificationId: string) => {
    deleteNotification(notificationId);
    toast({
      title: "Supprimé",
      description: "Notification supprimée",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 flex items-center justify-center">
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
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAllAsRead}
            >
              <Check size={16} className="mr-2" />
              Tout marquer comme lu
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              return (
                <Card 
                  key={notification.id}
                  className={`transition-all duration-200 hover:shadow-md cursor-pointer ${
                    !notification.is_read ? 'border-l-4 border-l-blue-500 bg-blue-50/50' : ''
                  }`}
                  onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
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
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              {getTimeAgo(notification.created_at)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNotification(notification.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {notification.message}
                        </p>
                      </div>
                      
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!isLoading && notifications.length === 0 && (
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