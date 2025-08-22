import React from "react";
import { Calendar, Clock, MapPin, User, CheckCircle, XCircle, AlertCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useUpdateAppointmentStatus, useCancelAppointment, Appointment } from "@/hooks/useAppointments";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AppointmentCardProps {
  appointment: Appointment;
  className?: string;
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'pending':
      return {
        label: 'En attente',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: AlertCircle,
        textColor: 'text-yellow-600'
      };
    case 'confirmed':
      return {
        label: 'Confirmé',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
        textColor: 'text-green-600'
      };
    case 'cancelled':
      return {
        label: 'Annulé',
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle,
        textColor: 'text-red-600'
      };
    case 'completed':
      return {
        label: 'Terminé',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: CheckCircle,
        textColor: 'text-blue-600'
      };
    default:
      return {
        label: 'Inconnu',
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: AlertCircle,
        textColor: 'text-gray-600'
      };
  }
};

export const AppointmentCard = ({ appointment, className }: AppointmentCardProps) => {
  const { user } = useAuth();
  const updateStatus = useUpdateAppointmentStatus();
  const cancelAppointment = useCancelAppointment();
  const { toast } = useToast();

  const statusConfig = getStatusConfig(appointment.status);
  const StatusIcon = statusConfig.icon;
  
  // Check if current user is the owner (seller)
  const isOwner = user?.id === appointment.owner_id;
  const isRequester = user?.id === appointment.requester_id;

  // Format date and time
  const appointmentDateTime = new Date(appointment.appointment_date);
  const isToday = appointmentDateTime.toDateString() === new Date().toDateString();
  const isPast = appointmentDateTime < new Date();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleConfirm = async () => {
    try {
      await updateStatus.mutateAsync({
        appointmentId: appointment.id,
        status: 'confirmed'
      });
      toast({
        title: "Rendez-vous confirmé",
        description: "Le rendez-vous a été confirmé et le produit est maintenant réservé.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de confirmer le rendez-vous.",
        variant: "destructive",
      });
    }
  };

  const handleComplete = async () => {
    try {
      await updateStatus.mutateAsync({
        appointmentId: appointment.id,
        status: 'completed'
      });
      toast({
        title: "Rendez-vous terminé",
        description: "Le rendez-vous a été marqué comme terminé.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de marquer le rendez-vous comme terminé.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = async () => {
    try {
      await cancelAppointment.mutateAsync(appointment.id);
      toast({
        title: "Rendez-vous annulé",
        description: "Le rendez-vous a été annulé avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'annuler le rendez-vous.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className={cn("border border-red-100 bg-white", className)}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header with status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-red-500" />
              <h3 className="font-medium text-black">
                Rendez-vous pour {appointment.product_title}
              </h3>
            </div>
            <Badge className={cn("border", statusConfig.color)}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusConfig.label}
            </Badge>
          </div>

          {/* Date and Time */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className={cn("font-medium", isToday ? "text-red-600" : "text-gray-900")}>
                {isToday ? "Aujourd'hui" : formatDate(appointmentDateTime)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-gray-900">{formatTime(appointmentDateTime)}</span>
              {isPast && appointment.status !== 'completed' && (
                <span className="text-red-500 text-xs">(Passé)</span>
              )}
            </div>
          </div>

          {/* Location */}
          {appointment.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">{appointment.location}</span>
            </div>
          )}

          {/* Participants */}
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700">
              {isOwner ? 
                `Demandé par ${appointment.requester_name}` : 
                `Avec ${appointment.owner_name}`
              }
            </span>
          </div>

          {/* Notes */}
          {appointment.notes && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Notes:</span>
              </div>
              <p className="text-sm text-gray-600 pl-6">{appointment.notes}</p>
            </div>
          )}

          {/* Action buttons */}
          {appointment.status === 'pending' && (
            <div className="flex gap-2 pt-2">
              {isOwner && (
                <Button
                  size="sm"
                  onClick={handleConfirm}
                  disabled={updateStatus.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle size={14} className="mr-1" />
                  Confirmer
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                disabled={cancelAppointment.isPending}
                className="border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800"
              >
                <XCircle size={14} className="mr-1" />
                Annuler
              </Button>
            </div>
          )}

          {appointment.status === 'confirmed' && isOwner && !isPast && (
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                onClick={handleComplete}
                disabled={updateStatus.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <CheckCircle size={14} className="mr-1" />
                Marquer terminé
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                disabled={cancelAppointment.isPending}
                className="border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800"
              >
                <XCircle size={14} className="mr-1" />
                Annuler
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};