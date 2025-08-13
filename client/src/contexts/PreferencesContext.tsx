import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { UserPreferences, InsertUserPreferences } from '@shared/schema';

interface PreferencesContextType {
  preferences: UserPreferences | null;
  updatePreferences: (updates: Partial<InsertUserPreferences>) => Promise<void>;
  isLoading: boolean;
  applyTheme: (theme: string) => void;
  applyFontSize: (fontSize: string) => void;
  applyHighContrast: (enabled: boolean) => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);

  const { data: preferences, isLoading } = useQuery<UserPreferences>({
    queryKey: ['/api/user/preferences'],
    retry: false,
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<InsertUserPreferences>) => {
      return await apiRequest('/api/user/preferences', 'PATCH', updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/preferences'] });
    },
  });

  // Apply theme to document
  const applyTheme = (theme: string) => {
    const root = document.documentElement;
    root.className = root.className.replace(/theme-\w+/g, '');
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      }
    }
  };

  // Apply font size
  const applyFontSize = (fontSize: string) => {
    const root = document.documentElement;
    root.className = root.className.replace(/font-size-\w+/g, '');
    root.classList.add(`font-size-${fontSize}`);
  };

  // Apply high contrast
  const applyHighContrast = (enabled: boolean) => {
    const root = document.documentElement;
    if (enabled) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  };

  // Apply preferences when they change
  useEffect(() => {
    if (preferences && !isInitialized) {
      applyTheme(preferences.theme || 'light');
      applyFontSize(preferences.font_size || 'medium');
      applyHighContrast(preferences.high_contrast || false);
      
      // Apply language to document
      document.documentElement.lang = preferences.language || 'fr';
      
      setIsInitialized(true);
    }
  }, [preferences, isInitialized]);

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    if (preferences?.theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('auto');
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [preferences?.theme]);

  const updatePreferences = async (updates: Partial<InsertUserPreferences>) => {
    // Apply changes immediately for better UX
    if (updates.theme !== undefined) applyTheme(updates.theme);
    if (updates.font_size !== undefined) applyFontSize(updates.font_size);
    if (updates.high_contrast !== undefined) applyHighContrast(updates.high_contrast);
    if (updates.language !== undefined) document.documentElement.lang = updates.language;

    await updateMutation.mutateAsync(updates);
  };

  return (
    <PreferencesContext.Provider value={{
      preferences: preferences || null,
      updatePreferences,
      isLoading,
      applyTheme,
      applyFontSize,
      applyHighContrast,
    }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}