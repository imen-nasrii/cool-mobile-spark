import { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '@/lib/apiClient';

interface User {
  id: string;
  email: string;
  display_name?: string;
  role?: string;
}

interface LoginResult {
  success: boolean;
  user?: User;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  login: (email: string, password: string) => Promise<LoginResult>;
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
              role: profile.role || 'user'
            });
          }
          setLoading(false);
        })
        .catch(() => {
          // Token invalid, clear it
          apiClient.clearToken();
          setLoading(false);
        });
    } else {
      setLoading(false);
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

  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      const response = await apiClient.signIn(email, password);
      setUser(response.user);
      return { 
        success: true, 
        user: response.user 
      };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Erreur de connexion' 
      };
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
    login,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};