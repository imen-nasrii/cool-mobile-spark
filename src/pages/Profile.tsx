import { useState } from "react";
import { User, MessageSquare, FileText, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export const Profile = ({ activeTab, onTabChange }: { 
  activeTab?: string; 
  onTabChange?: (tab: string) => void;
}) => {
  const { user, signOut } = useAuth();
  const [userInfo] = useState({
    name: "Imen",
    username: "@Nasri",
  });
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await signOut();
    if (!error) {
      toast({
        title: "Déconnexion",
        description: "Vous avez été déconnecté avec succès",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="px-4 py-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Profile</h1>
        
        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-8">
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

        {/* Main Section */}
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-4">Principale</h3>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start h-12 text-base font-normal bg-white hover:bg-gray-50">
                <FileText size={20} className="mr-4 text-gray-600" />
                Mes publications
              </Button>
              
              <Button variant="ghost" className="w-full justify-start h-12 text-base font-normal bg-white hover:bg-gray-50">
                <MessageSquare size={20} className="mr-4 text-gray-600" />
                Avis
              </Button>
            </div>
          </div>

          {/* Account Settings */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-4">Paramètres de compte</h3>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start h-12 text-base font-normal bg-white hover:bg-gray-50">
                <User size={20} className="mr-4 text-gray-600" />
                Informations personnelles
              </Button>
            </div>
          </div>

          {/* Other */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-4">Autre</h3>
            <div className="space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start h-12 text-base font-normal bg-white hover:bg-gray-50"
                onClick={handleLogout}
              >
                <LogOut size={20} className="mr-4 text-gray-600" />
                Se déconnecter
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};