import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Login } from '@/pages/Login';
import { Loader2 } from 'lucide-react';

export const AuthLanding = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      // Utilisateur connecté, rediriger selon le rôle
      if (user.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/';
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-green-50">
        <div className="text-center space-y-4">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-purple-600" />
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  if (user) {
    // Redirection en cours
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-green-50">
        <div className="text-center space-y-4">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-purple-600" />
          <p className="text-gray-600">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  // Pas connecté, afficher la page de connexion
  return <Login />;
};