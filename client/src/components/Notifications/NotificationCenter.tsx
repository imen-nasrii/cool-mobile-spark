import { useState, useEffect } from "react";
import { Bell, Filter, Check, Trash2, Settings, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotifications } from "@/hooks/useNotifications";
import { useToast } from "@/hooks/use-toast";
import { NotificationSettings } from "./NotificationSettings";

export const NotificationCenter = () => {
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

  const [activeTab, setActiveTab] = useState("all");
  const [showSettings, setShowSettings] = useState(false);

  const notificationTypes = {
    all: { label: "Toutes", count: notifications.length },
    message: { label: "Messages", count: notifications.filter(n => n.type === 'message').length },
    like: { label: "Favoris", count: notifications.filter(n => n.type === 'like').length },
    review: { label: "Avis", count: notifications.filter(n => n.type === 'review').length },
    system: { label: "Système", count: notifications.filter(n => n.type === 'system').length },
  };

  const getNotificationIcon = (type: string) => {
    const icons = {
      message: "💬",
      like: "❤️", 
      review: "⭐",
      follow: "👥",
      price_change: "💰",
      sale: "🎉",
      expiration: "⚠️",
      system: "🔄",
      security: "🔒"
    };
    return icons[type as keyof typeof icons] || "🔔";
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}j`;
    return date.toLocaleDateString('fr-FR');
  };

  const filteredNotifications = activeTab === "all" 
    ? notifications 
    : notifications.filter(n => n.type === activeTab);

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    toast({
      title: "✅ Notifications marquées",
      description: "Toutes les notifications ont été marquées comme lues",
    });
  };

  const handleDeleteNotification = (notificationId: string) => {
    deleteNotification(notificationId);
    toast({
      title: "🗑️ Notification supprimée",
      description: "La notification a été supprimée",
    });
  };

  if (showSettings) {
    return (
      <div>
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => setShowSettings(false)}
            className="flex items-center gap-2"
          >
            ← Retour aux notifications
          </Button>
        </div>
        <NotificationSettings />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell size={24} className="text-red-500" />
          <h1 className="text-2xl font-bold text-gray-900">Centre de notifications</h1>
          {unreadCount > 0 && (
            <Badge className="bg-red-500 text-white rounded-full">
              {unreadCount}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2"
          >
            <Settings size={16} />
            Paramètres
          </Button>
          
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAllAsRead}
              className="flex items-center gap-2"
            >
              <Check size={16} />
              Tout marquer comme lu
            </Button>
          )}
        </div>
      </div>

      {/* Tabs for filtering */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-5">
          {Object.entries(notificationTypes).map(([key, type]) => (
            <TabsTrigger key={key} value={key} className="flex items-center gap-2">
              {type.label}
              {type.count > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {type.count}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab}>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
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
              {filteredNotifications.map((notification) => (
                <Card 
                  key={notification.id}
                  className={`group transition-all duration-200 hover:shadow-md cursor-pointer ${
                    !notification.is_read 
                      ? 'border-l-4 border-l-red-500 bg-red-50/30' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Emoji icon */}
                      <div className="text-2xl">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 text-sm">
                            {notification.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              {getTimeAgo(notification.created_at.toString())}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNotification(notification.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                            >
                              <Trash2 size={14} className="text-gray-400 hover:text-red-500" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {notification.message}
                        </p>
                        
                        {/* Notification type badge */}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {notificationTypes[notification.type as keyof typeof notificationTypes]?.label || notification.type}
                          </Badge>
                        </div>
                      </div>
                      
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && filteredNotifications.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔔</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeTab === "all" ? "Aucune notification" : `Aucune notification de type "${notificationTypes[activeTab as keyof typeof notificationTypes]?.label}"`}
              </h3>
              <p className="text-gray-500 mb-4">
                {activeTab === "all" 
                  ? "Vous recevrez ici les notifications sur vos produits et messages."
                  : "Aucune notification de ce type pour le moment."
                }
              </p>
              {activeTab !== "all" && (
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("all")}
                  className="mt-2"
                >
                  Voir toutes les notifications
                </Button>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Footer info */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border">
        <div className="text-center text-sm text-gray-600">
          <p className="mb-2">
            🔄 Les notifications sont mises à jour automatiquement toutes les 30 secondes
          </p>
          <p>
            💡 Configurez vos préférences dans les paramètres pour personnaliser vos notifications
          </p>
        </div>
      </div>
    </div>
  );
};