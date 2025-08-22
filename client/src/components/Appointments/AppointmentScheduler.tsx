import React, { useState } from "react";
import { Calendar, Clock, MapPin, FileText, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCreateAppointment, CreateAppointmentData } from "@/hooks/useAppointments";
import { useToast } from "@/hooks/use-toast";

interface AppointmentSchedulerProps {
  conversationId: string;
  productId: string;
  productTitle: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AppointmentScheduler = ({
  conversationId,
  productId,
  productTitle,
  onClose,
  onSuccess,
}: AppointmentSchedulerProps) => {
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  
  const createAppointment = useCreateAppointment();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!appointmentDate || !appointmentTime) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez sélectionner une date et une heure pour le rendez-vous.",
        variant: "destructive",
      });
      return;
    }

    // Combine date and time
    const combinedDateTime = `${appointmentDate}T${appointmentTime}:00`;
    
    const appointmentData: CreateAppointmentData = {
      conversation_id: conversationId,
      product_id: productId,
      appointment_date: combinedDateTime,
      location: location || "",
      notes: notes || "",
    };

    try {
      await createAppointment.mutateAsync(appointmentData);
      toast({
        title: "Rendez-vous programmé !",
        description: "Votre demande de rendez-vous a été envoyée au vendeur.",
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de programmer le rendez-vous. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];
  
  // Get minimum time if today is selected
  const now = new Date();
  const minTime = appointmentDate === today 
    ? `${now.getHours().toString().padStart(2, '0')}:${(now.getMinutes() + 30).toString().padStart(2, '0')}`
    : "08:00";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-black">📅 Prendre rendez-vous</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4">
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600">
            Demande de rendez-vous pour :
          </p>
          <p className="font-semibold text-red-600">{productTitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-black flex items-center gap-2">
              <Calendar size={14} className="text-red-500" />
              Date du rendez-vous *
            </Label>
            <Input
              type="date"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              min={today}
              required
              className="border-gray-300 focus:border-red-500 focus:ring-red-500"
            />
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-black flex items-center gap-2">
              <Clock size={14} className="text-red-500" />
              Heure du rendez-vous *
            </Label>
            <Input
              type="time"
              value={appointmentTime}
              onChange={(e) => setAppointmentTime(e.target.value)}
              min={minTime}
              required
              className="border-gray-300 focus:border-red-500 focus:ring-red-500"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-black flex items-center gap-2">
              <MapPin size={14} className="text-red-500" />
              Lieu de rendez-vous
            </Label>
            <Input
              type="text"
              placeholder="Ex: Café Central, Tunis ou chez le vendeur"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="border-gray-300 focus:border-red-500 focus:ring-red-500"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-black flex items-center gap-2">
              <FileText size={14} className="text-red-500" />
              Notes additionnelles
            </Label>
            <Textarea
              placeholder="Détails supplémentaires pour le rendez-vous..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="border-gray-300 focus:border-red-500 focus:ring-red-500 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-black"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={createAppointment.isPending}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {createAppointment.isPending ? (
                "Envoi..."
              ) : (
                <>
                  <Check size={16} className="mr-2" />
                  Demander le RDV
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};