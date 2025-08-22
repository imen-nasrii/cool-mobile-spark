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
    <Card className="w-full max-w-2xl mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
      <CardHeader className="text-center border-b border-gray-200">
        <CardTitle className="flex items-center justify-center gap-2 text-red-600">
          <CalendarIcon size={24} />
          Prendre rendez-vous
        </CardTitle>
        <div className="mt-2">
          <Badge className="bg-red-100 text-red-800 border border-red-300">
            {productTitle}
          </Badge>
          <p className="text-sm text-gray-600 mt-1 flex items-center justify-center gap-1">
            <MapPin size={16} />
            {productLocation}
          </p>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Sélection de la date */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-3">
            <Calendar size={16} className="text-red-500" />
            Choisir une date
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {getAvailableDates().map((date) => {
              const dateString = format(date, 'yyyy-MM-dd');
              const displayDate = format(date, 'EEE dd MMM', { locale: fr });
              return (
                <Button
                  key={dateString}
                  variant={selectedDate === dateString ? "default" : "outline"}
                  className={`p-3 h-auto flex flex-col items-center text-xs ${
                    selectedDate === dateString 
                      ? 'bg-red-500 hover:bg-red-600 text-white border-red-500' 
                      : 'border-gray-300 hover:border-red-300 hover:bg-red-50'
                  }`}
                  onClick={() => setSelectedDate(dateString)}
                >
                  <span className="font-medium">{displayDate}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Sélection de l'heure */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-3">
            <Clock size={16} className="text-red-500" />
            Choisir un horaire
          </label>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
            {availableTimes.map((time) => (
              <Button
                key={time}
                variant={selectedTime === time ? "default" : "outline"}
                size="sm"
                className={`text-xs ${
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
          <label className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
            <MapPin size={16} className="text-red-500" />
            Lieu de rencontre
          </label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Précisez le lieu exact de rencontre..."
            className="border-gray-300 focus:border-red-500 focus:ring-red-500"
          />
        </div>

        {/* Notes supplémentaires */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
            <User size={16} className="text-red-500" />
            Message pour le vendeur (optionnel)
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ajoutez des informations supplémentaires..."
            rows={3}
            className="border-gray-300 focus:border-red-500 focus:ring-red-500"
          />
        </div>

        {/* Récapitulatif */}
        {selectedDate && selectedTime && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-900 mb-2">📋 Récapitulatif du rendez-vous</h4>
            <div className="space-y-1 text-sm text-red-800">
              <p><strong>Date :</strong> {format(new Date(selectedDate), 'EEEE dd MMMM yyyy', { locale: fr })}</p>
              <p><strong>Heure :</strong> {selectedTime}</p>
              <p><strong>Lieu :</strong> {location}</p>
              <p><strong>Produit :</strong> {productTitle}</p>
            </div>
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
              ⚠️ Le produit sera marqué comme "Réservé" après confirmation
            </div>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-gray-300 hover:bg-gray-50"
          >
            <X size={16} className="mr-2" />
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedDate || !selectedTime || !location.trim() || isSubmitting}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white"
          >
            <Check size={16} className="mr-2" />
            {isSubmitting ? 'Envoi...' : 'Confirmer le RDV'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};