import { useState, useEffect } from "react";
import { Bell, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/hooks/useAuth";

export const NotificationBanner = () => {
  const { user } = useAuth();
  const { unreadCount, notifications } = useNotifications();
  const [isVisible, setIsVisible] = useState(false);
  const [latestNotification, setLatestNotification] = useState<any>(null);

  useEffect(() => {
    if (user && notifications.length > 0) {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      if (unreadNotifications.length > 0) {
        const latest = unreadNotifications[0];
        setLatestNotification(latest);
        setIsVisible(true);
        
        // Auto-hide after 5 seconds
        const timer = setTimeout(() => {
          setIsVisible(false);
        }, 5000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [notifications, user]);

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

  if (!user || !isVisible || !latestNotification) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm animate-in slide-in-from-right">
      <div className="bg-white border-l-4 border-l-red-500 rounded-lg shadow-lg p-4 border border-gray-200">
        <div className="flex items-start gap-3">
          <div className="text-2xl">
            {getNotificationIcon(latestNotification.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold text-gray-900 text-sm">
                {latestNotification.title}
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="h-6 w-6 p-0"
              >
                <X size={14} />
              </Button>
            </div>
            <p className="text-gray-600 text-sm mb-2">
              {latestNotification.message}
            </p>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Nouvelle
              </Badge>
              {unreadCount > 1 && (
                <span className="text-xs text-gray-500">
                  +{unreadCount - 1} autres
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};