import { useState, useEffect } from 'react';

const WELCOME_SHOWN_KEY = 'tomati-welcome-shown';

// Safe localStorage access
const safeLocalStorageGet = (key: string): string | null => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch (error) {
    console.warn('LocalStorage access failed:', error);
  }
  return null;
};

const safeLocalStorageSet = (key: string, value: string): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch (error) {
    console.warn('LocalStorage set failed:', error);
  }
};

const safeLocalStorageRemove = (key: string): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch (error) {
    console.warn('LocalStorage remove failed:', error);
  }
};

export function useWelcome() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Ensure we're in browser environment
    if (typeof window === 'undefined') return;

    try {
      // Small delay to ensure DOM is ready
      const initTimer = setTimeout(() => {
        setIsLoaded(true);
        
        // Check if welcome screen has been shown before
        const hasSeenWelcome = safeLocalStorageGet(WELCOME_SHOWN_KEY);
        
        if (!hasSeenWelcome) {
          // Show welcome screen after a delay for smooth loading
          const showTimer = setTimeout(() => {
            setShowWelcome(true);
          }, 1500);
          
          return () => clearTimeout(showTimer);
        }
      }, 100);
      
      return () => clearTimeout(initTimer);
    } catch (error) {
      console.error('Welcome hook error:', error);
      setIsLoaded(true);
    }
  }, []);

  const hideWelcome = () => {
    try {
      setShowWelcome(false);
      safeLocalStorageSet(WELCOME_SHOWN_KEY, 'true');
    } catch (error) {
      console.error('Hide welcome error:', error);
      setShowWelcome(false);
    }
  };

  const resetWelcome = () => {
    try {
      safeLocalStorageRemove(WELCOME_SHOWN_KEY);
      setShowWelcome(true);
    } catch (error) {
      console.error('Reset welcome error:', error);
    }
  };

  return {
    showWelcome: isLoaded && showWelcome,
    hideWelcome,
    resetWelcome,
    isLoaded
  };
}