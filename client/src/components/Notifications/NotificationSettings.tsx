import { useState, useEffect } from "react";
import { Bell, Mail, Smartphone, Volume2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/apiClient";

interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  sound_notifications: boolean;
  message_notifications: boolean;
  like_notifications: boolean;
  review_notifications: boolean;
  follow_notifications: boolean;
  price_notifications: boolean;
  system_notifications: boolean;
  security_notifications: boolean;
}

export const NotificationSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSettings>({
    email_notifications: true,
    push_notifications: true,
    sound_notifications: true,
    message_notifications: true,
    like_notifications: true,
    review_notifications: true,
    follow_notifications: true,
    price_notifications: true,
    system_notifications: true,
    security_notifications: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await apiClient.request('/user/notification-settings');
      if (response) {
        setSettings(response);
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: NotificationSettings) => {
    setIsSaving(true);
    try {
      await apiClient.request('/user/notification-settings', {
        method: 'PATCH',
        body: JSON.stringify(newSettings),
        headers: { 'Content-Type': 'application/json' }
      });
      
      toast({
        title: "Paramètres sauvegardés",
        description: "Vos préférences de notification ont été mises à jour",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (key: keyof NotificationSettings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  interface SettingItem {
    key: keyof NotificationSettings;
    label: string;
    description: string;
    icon?: any;
    badge?: string;
  }

  const settingsSections = [
    {
      title: "Canaux de notification",
      icon: Bell,
      settings: [
        { key: 'email_notifications' as keyof NotificationSettings, label: 'Notifications par email', description: 'Recevoir les notifications importantes par email', icon: Mail },
        { key: 'push_notifications' as keyof NotificationSettings, label: 'Notifications push', description: 'Recevoir des notifications sur votre appareil', icon: Smartphone },
        { key: 'sound_notifications' as keyof NotificationSettings, label: 'Sons de notification', description: 'Jouer un son lors de nouvelles notifications', icon: Volume2 },
      ] as SettingItem[]
    },
    {
      title: "Types de notifications",
      icon: Settings,
      settings: [
        { key: 'message_notifications' as keyof NotificationSettings, label: 'Messages', description: 'Nouveaux messages reçus', badge: 'Populaire' },
        { key: 'like_notifications' as keyof NotificationSettings, label: 'Favoris', description: 'Quand quelqu\'un aime vos produits', badge: 'Fréquent' },
        { key: 'review_notifications' as keyof NotificationSettings, label: 'Évaluations', description: 'Nouvelles notes et avis sur vos produits' },
        { key: 'follow_notifications' as keyof NotificationSettings, label: 'Followers', description: 'Nouveaux followers' },
        { key: 'price_notifications' as keyof NotificationSettings, label: 'Changements de prix', description: 'Alertes de prix sur vos produits favoris' },
        { key: 'system_notifications' as keyof NotificationSettings, label: 'Mises à jour système', description: 'Nouvelles fonctionnalités et maintenances' },
        { key: 'security_notifications' as keyof NotificationSettings, label: 'Sécurité', description: 'Alertes de sécurité importantes', badge: 'Recommandé' },
      ] as SettingItem[]
    }
  ];

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Paramètres des notifications</h1>
        <p className="text-gray-600">Personnalisez vos préférences de notification</p>
      </div>

      <div className="space-y-6">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon size={20} className="text-red-500" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {section.settings.map((setting: SettingItem) => {
                    const SettingIcon = setting.icon;
                    return (
                      <div key={setting.key} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-3 flex-1">
                          {SettingIcon && <SettingIcon size={20} className="text-gray-500 mt-0.5" />}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900">{setting.label}</span>
                              {setting.badge && (
                                <Badge 
                                  variant={setting.badge === 'Recommandé' ? 'destructive' : 'secondary'} 
                                  className="text-xs"
                                >
                                  {setting.badge}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{setting.description}</p>
                          </div>
                        </div>
                        <Switch
                          checked={settings[setting.key]}
                          onCheckedChange={() => handleToggle(setting.key)}
                          disabled={isSaving}
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <Bell size={20} className="text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 mb-1">💡 Conseils</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Les notifications de sécurité sont importantes pour protéger votre compte</li>
              <li>• Activez les notifications par email pour ne rien manquer</li>
              <li>• Vous pouvez toujours modifier ces paramètres plus tard</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};