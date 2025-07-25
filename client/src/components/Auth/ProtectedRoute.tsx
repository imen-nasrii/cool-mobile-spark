import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  redirectTo?: string;
}

export const ProtectedRoute = ({ 
  children, 
  requiredRole, 
  redirectTo = '/login' 
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = redirectTo;
      return;
    }

    if (!loading && user && requiredRole && user.role !== requiredRole) {
      // Rediriger selon le rôle de l'utilisateur
      if (user.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/';
      }
      return;
    }
  }, [user, loading, requiredRole, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-green-50">
        <div className="text-center space-y-4">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-purple-600" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirection en cours
  }

  if (requiredRole && user.role !== requiredRole) {
    return null; // Redirection en cours
  }

  return <>{children}</>;
};