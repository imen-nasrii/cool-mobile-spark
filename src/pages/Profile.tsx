import { useState } from "react";
import { User, Settings, Heart, MessageSquare, Package, Star, Edit, Phone, MapPin, Mail, FileText, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export const Profile = ({ activeTab, onTabChange }: { 
  activeTab?: string; 
  onTabChange?: (tab: string) => void;
}) => {
  const [userInfo] = useState({
    name: "Imen",
    username: "@Nasri",
  });
  const { toast } = useToast();

  const handleLogout = () => {
    toast({
      title: "Déconnexion",
      description: "Vous avez été déconnecté avec succès",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-6">
        <Card className="shadow-lg">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-semibold">
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Profile Header */}
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-gray-800 text-white text-xl font-medium">
                  {userInfo.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{userInfo.name}</h2>
                <p className="text-gray-600">{userInfo.username}</p>
              </div>
            </div>

            <Separator />

            {/* Main Section */}
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Principale</h3>
              
              <Button variant="ghost" className="w-full justify-start h-12 text-base font-normal">
                <FileText size={20} className="mr-4 text-gray-600" />
                Mes publications
              </Button>
              
              <Button variant="ghost" className="w-full justify-start h-12 text-base font-normal">
                <MessageSquare size={20} className="mr-4 text-gray-600" />
                Avis
              </Button>
            </div>

            <Separator />

            {/* Account Settings */}
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Paramètres de compte</h3>
              
              <Button variant="ghost" className="w-full justify-start h-12 text-base font-normal">
                <User size={20} className="mr-4 text-gray-600" />
                Informations personnelles
              </Button>
            </div>

            <Separator />

            {/* Other */}
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Autre</h3>
              
              <Button 
                variant="ghost" 
                className="w-full justify-start h-12 text-base font-normal"
                onClick={handleLogout}
              >
                <LogOut size={20} className="mr-4 text-gray-600" />
                Se déconnecter
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};