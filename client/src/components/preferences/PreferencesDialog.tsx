import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { usePreferences } from '@/contexts/PreferencesContext';
import { Settings } from 'lucide-react';

interface PreferencesDialogProps {
  trigger?: React.ReactNode;
}

export function PreferencesDialog({ trigger }: PreferencesDialogProps) {
  const { preferences, updatePreferences, isLoading } = usePreferences();
  const [open, setOpen] = useState(false);

  if (!preferences) {
    return null;
  }

  const handlePreferenceChange = async (key: string, value: any) => {
    await updatePreferences({ [key]: value });
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Settings className="h-4 w-4 mr-2" />
      Préférences
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white border border-black">
        <DialogHeader>
          <DialogTitle className="text-black">Préférences utilisateur</DialogTitle>
          <DialogDescription className="text-black">
            Personnalisez votre expérience Tomati selon vos préférences.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* Theme */}
          <div className="grid gap-2">
            <Label htmlFor="theme" className="text-black font-medium">
              Thème
            </Label>
            <Select
              value={preferences.theme}
              onValueChange={(value) => handlePreferenceChange('theme', value)}
            >
              <SelectTrigger className="border-black bg-white text-black">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border border-black">
                <SelectItem value="light" className="text-black">Clair</SelectItem>
                <SelectItem value="dark" className="text-black">Sombre</SelectItem>
                <SelectItem value="auto" className="text-black">Automatique</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Language */}
          <div className="grid gap-2">
            <Label htmlFor="language" className="text-black font-medium">
              Langue
            </Label>
            <Select
              value={preferences.language}
              onValueChange={(value) => handlePreferenceChange('language', value)}
            >
              <SelectTrigger className="border-black bg-white text-black">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border border-black">
                <SelectItem value="fr" className="text-black">Français</SelectItem>
                <SelectItem value="ar" className="text-black">العربية</SelectItem>
                <SelectItem value="en" className="text-black">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Currency */}
          <div className="grid gap-2">
            <Label htmlFor="currency" className="text-black font-medium">
              Devise
            </Label>
            <Select
              value={preferences.currency}
              onValueChange={(value) => handlePreferenceChange('currency', value)}
            >
              <SelectTrigger className="border-black bg-white text-black">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border border-black">
                <SelectItem value="TND" className="text-black">TND (Dinar tunisien)</SelectItem>
                <SelectItem value="EUR" className="text-black">EUR (Euro)</SelectItem>
                <SelectItem value="USD" className="text-black">USD (Dollar US)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Mode */}
          <div className="grid gap-2">
            <Label htmlFor="view_mode" className="text-black font-medium">
              Mode d'affichage des produits
            </Label>
            <Select
              value={preferences.view_mode}
              onValueChange={(value) => handlePreferenceChange('view_mode', value)}
            >
              <SelectTrigger className="border-black bg-white text-black">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border border-black">
                <SelectItem value="grid" className="text-black">Grille</SelectItem>
                <SelectItem value="list" className="text-black">Liste</SelectItem>
                <SelectItem value="compact" className="text-black">Compact</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Items per page */}
          <div className="grid gap-2">
            <Label htmlFor="items_per_page" className="text-black font-medium">
              Produits par page: {preferences.items_per_page}
            </Label>
            <Slider
              value={[preferences.items_per_page]}
              onValueChange={([value]) => handlePreferenceChange('items_per_page', value)}
              max={50}
              min={5}
              step={5}
              className="w-full"
            />
          </div>

          {/* Font Size */}
          <div className="grid gap-2">
            <Label htmlFor="font_size" className="text-black font-medium">
              Taille de police
            </Label>
            <Select
              value={preferences.font_size}
              onValueChange={(value) => handlePreferenceChange('font_size', value)}
            >
              <SelectTrigger className="border-black bg-white text-black">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border border-black">
                <SelectItem value="small" className="text-black">Petite</SelectItem>
                <SelectItem value="medium" className="text-black">Moyenne</SelectItem>
                <SelectItem value="large" className="text-black">Grande</SelectItem>
                <SelectItem value="extra-large" className="text-black">Très grande</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Switches for boolean preferences */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="show_price_in_list" className="text-black font-medium">
                Afficher les prix dans les listes
              </Label>
              <Switch
                id="show_price_in_list"
                checked={preferences.show_price_in_list}
                onCheckedChange={(checked) => handlePreferenceChange('show_price_in_list', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="auto_refresh" className="text-black font-medium">
                Actualisation automatique
              </Label>
              <Switch
                id="auto_refresh"
                checked={preferences.auto_refresh}
                onCheckedChange={(checked) => handlePreferenceChange('auto_refresh', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="high_contrast" className="text-black font-medium">
                Contraste élevé
              </Label>
              <Switch
                id="high_contrast"
                checked={preferences.high_contrast}
                onCheckedChange={(checked) => handlePreferenceChange('high_contrast', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="large_clickable_areas" className="text-black font-medium">
                Zones cliquables étendues
              </Label>
              <Switch
                id="large_clickable_areas"
                checked={preferences.large_clickable_areas}
                onCheckedChange={(checked) => handlePreferenceChange('large_clickable_areas', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="reduced_motion" className="text-black font-medium">
                Mouvement réduit
              </Label>
              <Switch
                id="reduced_motion"
                checked={preferences.reduced_motion}
                onCheckedChange={(checked) => handlePreferenceChange('reduced_motion', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="email_notifications" className="text-black font-medium">
                Notifications par email
              </Label>
              <Switch
                id="email_notifications"
                checked={preferences.email_notifications}
                onCheckedChange={(checked) => handlePreferenceChange('email_notifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="push_notifications" className="text-black font-medium">
                Notifications push
              </Label>
              <Switch
                id="push_notifications"
                checked={preferences.push_notifications}
                onCheckedChange={(checked) => handlePreferenceChange('push_notifications', checked)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={() => setOpen(false)}
            className="bg-red-600 hover:bg-red-700 text-white border-none"
          >
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}