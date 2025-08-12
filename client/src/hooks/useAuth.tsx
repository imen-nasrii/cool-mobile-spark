import { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '@/lib/apiClient';

interface User {
  id: string;
  email: string;
  display_name?: string;
  role?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token
    const token = localStorage.getItem('authToken');
    if (token) {
      apiClient.setToken(token);
      // Verify token by fetching user profile
      apiClient.getProfile()
        .then((profile) => {
          if (profile) {
            setUser({
              id: profile.user_id,
              email: profile.email || '',
              display_name: profile.display_name,
              avatar_url: profile.avatar_url,
              role: profile.role || 'user' // Include role from profile
            });
          }
          setLoading(false);
        })
        .catch(() => {
          // Token invalid, clear it
          apiClient.clearToken();
          setUser(null);
          setLoading(false);
        });
    } else {
      // Auto-login for testing - connect as admin user
      const autoLogin = async () => {
        try {
          console.log('Attempting auto-login...');
          const response = await apiClient.signIn('admin@tomati.com', 'admin123');
          console.log('Auto-login response:', response);
          if (response.user && response.token) {
            // Make sure we get the complete user data including role
            const userWithRole = {
              ...response.user,
              role: response.user.role || 'admin' // Ensure admin role is set
            };
            setUser(userWithRole);
            // Ensure token is saved
            apiClient.setToken(response.token);
            localStorage.setItem('authToken', response.token);
            console.log('Auto-login successful, token saved, user role:', userWithRole.role);
          }
        } catch (error) {
          console.log('Auto-login failed:', error);
        } finally {
          setLoading(false);
        }
      };
      autoLogin();
    }
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const response = await apiClient.signUp(email, password, displayName);
      setUser(response.user);
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await apiClient.signIn(email, password);
      setUser(response.user);
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  };

  const signOut = async () => {
    try {
      await apiClient.signOut();
      setUser(null);
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};