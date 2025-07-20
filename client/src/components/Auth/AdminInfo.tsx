import { Shield, Key, User, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const AdminInfo = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Espace Administrateur</h1>
          <p className="text-gray-600 mt-2">
            Accès restreint aux comptes administrateurs de Tomati Market
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-600" />
                Compte Administrateur de Test
              </CardTitle>
              <CardDescription>
                Utilisez ces identifiants pour tester l'accès administrateur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-mono text-sm">
                  <strong>Email:</strong> admin@tomati.com<br />
                  <strong>Mot de passe:</strong> admin123
                </p>
              </div>
              <div className="flex items-start gap-2 text-sm text-amber-600">
                <AlertCircle className="w-4 h-4 mt-0.5" />
                <p>
                  Ce compte est créé uniquement à des fins de démonstration
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-green-600" />
                Fonctionnalités Admin
              </CardTitle>
              <CardDescription>
                Ce que vous pouvez faire avec un compte administrateur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Créer des produits</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Modifier tous les produits</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Supprimer des produits</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Gérer les catégories</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Accès au tableau de bord</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Comment accéder au tableau de bord administrateur</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Connectez-vous avec le compte administrateur (admin@tomati.com)</li>
              <li>Une fois connecté, cliquez sur votre avatar dans l'en-tête</li>
              <li>Sélectionnez "Administration" dans le menu déroulant</li>
              <li>Vous accédez au tableau de bord avec toutes les fonctionnalités de gestion</li>
            </ol>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> Les utilisateurs normaux ne verront pas l'option "Administration" 
                dans leur menu et seront redirigés s'ils tentent d'accéder directement à l'URL /admin.
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => navigate('/auth')} className="flex-1">
                Se connecter en tant qu'admin
              </Button>
              <Button variant="outline" onClick={() => navigate('/')} className="flex-1">
                Retour à l'accueil
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};