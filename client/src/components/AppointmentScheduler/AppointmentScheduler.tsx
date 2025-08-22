import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { DayPicker } from 'react-day-picker';
import { CalendarIcon, Clock, MapPin, MessageSquare, X, Check } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';

interface AppointmentSchedulerProps {
  productId: string;
  conversationId: string;
  ownerId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

interface AppointmentStatusProps {
  appointment: any;
  isOwner: boolean;
  onAccept: () => void;
  onReject: () => void;
  onCancel: () => void;
}

const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

export function AppointmentScheduler({ 
  productId, 
  conversationId, 
  ownerId, 
  onClose, 
  onSuccess 
}: AppointmentSchedulerProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !user) return;

    const appointmentDateTime = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':').map(Number);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    setIsSubmitting(true);
    try {
      await apiRequest('/api/appointments', {
        method: 'POST',
        body: JSON.stringify({
          product_id: productId,
          conversation_id: conversationId,
          requester_id: user.id,
          owner_id: ownerId,
          appointment_date: appointmentDateTime.toISOString(),
          location: location.trim() || null,
          notes: notes.trim() || null,
        }),
      });

      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la création du rendez-vous:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = selectedDate && selectedTime && !isSubmitting;

  // Disable past dates
  const disabledDays = { before: new Date() };

  return (
    <Card className="w-full max-w-md mx-auto bg-white border border-gray-300">
      <CardHeader className="bg-red-500 text-white">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Planifier un rendez-vous
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-red-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Date Selection */}
        <div className="space-y-2">
          <Label className="text-black font-bold">Date du rendez-vous</Label>
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={disabledDays}
            locale={fr}
            className="rounded border border-gray-300"
          />
        </div>

        {/* Time Selection */}
        <div className="space-y-2">
          <Label className="text-black font-bold">Heure</Label>
          <div className="grid grid-cols-3 gap-2">
            {timeSlots.map((time) => (
              <Button
                key={time}
                variant={selectedTime === time ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTime(time)}
                className={`text-xs ${
                  selectedTime === time 
                    ? 'bg-red-500 text-white border-red-500' 
                    : 'border-gray-300 text-black hover:bg-gray-50'
                }`}
              >
                <Clock className="h-3 w-3 mr-1" />
                {time}
              </Button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location" className="text-black font-bold">
            <MapPin className="h-4 w-4 inline mr-1" />
            Lieu (optionnel)
          </Label>
          <Input
            id="location"
            placeholder="Adresse du rendez-vous..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="border-gray-300"
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-black font-bold">
            <MessageSquare className="h-4 w-4 inline mr-1" />
            Notes (optionnel)
          </Label>
          <Textarea
            id="notes"
            placeholder="Message ou instructions..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="border-gray-300"
          />
        </div>

        {/* Summary */}
        {selectedDate && selectedTime && (
          <div className="p-4 bg-red-50 border border-red-200 rounded">
            <h4 className="font-bold text-red-700 mb-2">Résumé du rendez-vous</h4>
            <p className="text-sm text-red-600">
              📅 {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
            </p>
            <p className="text-sm text-red-600">⏰ {selectedTime}</p>
            {location && <p className="text-sm text-red-600">📍 {location}</p>}
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!isFormValid}
          className="w-full bg-red-500 hover:bg-red-600 text-white"
        >
          {isSubmitting ? 'Envoi...' : 'Envoyer la demande'}
        </Button>
      </CardContent>
    </Card>
  );
}

export function AppointmentStatus({ 
  appointment, 
  isOwner, 
  onAccept, 
  onReject, 
  onCancel 
}: AppointmentStatusProps) {
  const appointmentDate = new Date(appointment.appointment_date);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'accepted': return 'text-green-600 bg-green-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      case 'cancelled': return 'text-gray-600 bg-gray-50';
      case 'completed': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'accepted': return 'Accepté';
      case 'rejected': return 'Refusé';
      case 'cancelled': return 'Annulé';
      case 'completed': return 'Terminé';
      default: return status;
    }
  };

  return (
    <Card className="w-full bg-white border border-gray-300">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-black">
          <CalendarIcon className="h-5 w-5" />
          Rendez-vous planifié
          <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(appointment.status)}`}>
            {getStatusText(appointment.status)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-black">
            📅 <strong>{format(appointmentDate, 'EEEE d MMMM yyyy', { locale: fr })}</strong>
          </p>
          <p className="text-sm text-black">
            ⏰ <strong>{format(appointmentDate, 'HH:mm')}</strong>
          </p>
          {appointment.location && (
            <p className="text-sm text-black">
              📍 <strong>{appointment.location}</strong>
            </p>
          )}
          {appointment.notes && (
            <p className="text-sm text-gray-600">
              💬 {appointment.notes}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        {appointment.status === 'pending' && (
          <div className="flex gap-2">
            {isOwner ? (
              <>
                <Button
                  onClick={onAccept}
                  size="sm"
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Accepter
                </Button>
                <Button
                  onClick={onReject}
                  size="sm"
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-1" />
                  Refuser
                </Button>
              </>
            ) : (
              <Button
                onClick={onCancel}
                size="sm"
                variant="outline"
                className="w-full border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                <X className="h-4 w-4 mr-1" />
                Annuler la demande
              </Button>
            )}
          </div>
        )}

        {appointment.status === 'accepted' && (
          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-sm text-green-700 font-bold">
              ✅ Rendez-vous confirmé ! N'oubliez pas le rendez-vous.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}