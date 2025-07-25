import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export const RoleRedirect = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Pas connecté, rediriger vers login
        window.location.href = '/login';
      } else if (user.role === 'admin') {
        // Admin, rediriger vers dashboard admin
        window.location.href = '/admin';
      } else {
        // Utilisateur normal, rediriger vers app principale
        window.location.href = '/';
      }
    }
  }, [user, loading]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-green-50">
      <div className="text-center space-y-4">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-purple-600" />
        <p className="text-gray-600">Redirection en cours...</p>
      </div>
    </div>
  );
};