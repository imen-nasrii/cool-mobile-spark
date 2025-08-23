import { useState } from 'react';
import { Calendar, Clock, MapPin, User, Check, X, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/apiClient';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AppointmentBookingProps {
  conversationId: string;
  productId: string;
  productTitle: string;
  productLocation: string;
  sellerId: string;
  currentUserId: string;
  onClose: () => void;
}

export const AppointmentBooking = ({
  conversationId,
  productId,
  productTitle,
  productLocation,
  sellerId,
  currentUserId,
  onClose
}: AppointmentBookingProps) => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [location, setLocation] = useState(productLocation);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Générer les dates disponibles (7 prochains jours)
  const getAvailableDates = () => {
    const dates = [];
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Créneaux horaires disponibles
  const availableTimes = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !location.trim()) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez sélectionner une date, une heure et préciser le lieu de rencontre.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const appointmentDateTime = new Date(`${selectedDate}T${selectedTime}:00.000Z`);
      
      const response = await apiClient.request('/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationId,
          product_id: productId,
          requester_id: currentUserId,
          owner_id: sellerId,
          appointment_date: appointmentDateTime.toISOString(),
          location: location.trim(),
          notes: notes.trim()
        })
      });

      // Marquer le produit comme réservé
      await apiClient.request(`/products/${productId}/reserve`, {
        method: 'PATCH'
      });

      toast({
        title: "📅 Rendez-vous demandé !",
        description: `Votre demande de rendez-vous a été envoyée au vendeur. Le produit "${productTitle}" est maintenant réservé.`,
      });

      onClose();
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: "Erreur",
        description: "Impossible de programmer le rendez-vous. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-sm sm:max-w-md mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
      <CardHeader className="text-center border-b border-gray-200 p-3">
        <CardTitle className="flex items-center justify-center gap-2 text-red-600 text-sm">
          <CalendarIcon size={18} />
          Rendez-vous
        </CardTitle>
        <div className="mt-1">
          <Badge className="bg-red-100 text-red-800 border border-red-300 text-xs">
            {productTitle.length > 25 ? `${productTitle.substring(0, 25)}...` : productTitle}
          </Badge>
          <p className="text-xs text-gray-600 mt-1 flex items-center justify-center gap-1">
            <MapPin size={12} />
            {productLocation.length > 20 ? `${productLocation.substring(0, 20)}...` : productLocation}
          </p>
        </div>
      </CardHeader>

      <CardContent className="p-3 space-y-4">
        {/* Sélection de la date */}
        <div>
          <label className="flex items-center gap-1 text-xs font-medium text-gray-900 mb-2">
            <Calendar size={14} className="text-red-500" />
            Date
          </label>
          <div className="grid grid-cols-3 gap-2">
            {getAvailableDates().slice(0, 6).map((date) => {
              const dateString = format(date, 'yyyy-MM-dd');
              const displayDate = format(date, 'dd/MM', { locale: fr });
              return (
                <Button
                  key={dateString}
                  variant={selectedDate === dateString ? "default" : "outline"}
                  size="sm"
                  className={`p-2 h-auto text-xs ${
                    selectedDate === dateString 
                      ? 'bg-red-500 hover:bg-red-600 text-white border-red-500' 
                      : 'border-gray-300 hover:border-red-300 hover:bg-red-50'
                  }`}
                  onClick={() => setSelectedDate(dateString)}
                >
                  {displayDate}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Sélection de l'heure */}
        <div>
          <label className="flex items-center gap-1 text-xs font-medium text-gray-900 mb-2">
            <Clock size={14} className="text-red-500" />
            Heure
          </label>
          <div className="grid grid-cols-4 gap-1">
            {availableTimes.slice(0, 8).map((time) => (
              <Button
                key={time}
                variant={selectedTime === time ? "default" : "outline"}
                size="sm"
                className={`text-xs p-1 h-7 ${
                  selectedTime === time 
                    ? 'bg-red-500 hover:bg-red-600 text-white border-red-500' 
                    : 'border-gray-300 hover:border-red-300 hover:bg-red-50'
                }`}
                onClick={() => setSelectedTime(time)}
              >
                {time}
              </Button>
            ))}
          </div>
        </div>

        {/* Lieu de rencontre */}
        <div>
          <label className="flex items-center gap-1 text-xs font-medium text-gray-900 mb-1">
            <MapPin size={14} className="text-red-500" />
            Lieu
          </label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Lieu de rencontre..."
            className="border-gray-300 focus:border-red-500 focus:ring-red-500 text-sm h-8"
          />
        </div>

        {/* Notes supplémentaires */}
        <div>
          <label className="flex items-center gap-1 text-xs font-medium text-gray-900 mb-1">
            <User size={14} className="text-red-500" />
            Message (optionnel)
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Message pour le vendeur..."
            rows={2}
            className="border-gray-300 focus:border-red-500 focus:ring-red-500 text-sm"
          />
        </div>

        {/* Récapitulatif compact */}
        {selectedDate && selectedTime && (
          <div className="bg-red-50 border border-red-200 rounded p-2">
            <h4 className="font-medium text-red-900 mb-1 text-xs">📋 Récapitulatif</h4>
            <div className="space-y-1 text-xs text-red-800">
              <p>{format(new Date(selectedDate), 'dd/MM', { locale: fr })} à {selectedTime}</p>
              <p>📍 {location.length > 30 ? `${location.substring(0, 30)}...` : location}</p>
            </div>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex gap-2 pt-3 border-t border-gray-200">
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
            className="flex-1 border-gray-300 hover:bg-gray-50 text-xs"
          >
            <X size={14} className="mr-1" />
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedDate || !selectedTime || !location.trim() || isSubmitting}
            size="sm"
            className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs"
          >
            <Check size={14} className="mr-1" />
            {isSubmitting ? 'Envoi...' : 'Confirmer'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};