import { useState, useEffect } from 'react';

const WELCOME_SHOWN_KEY = 'tomati-welcome-shown';

export function useWelcome() {
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Check if welcome screen has been shown before
    const hasSeenWelcome = localStorage.getItem(WELCOME_SHOWN_KEY);
    
    if (!hasSeenWelcome) {
      // Show welcome screen after a short delay for smooth loading
      const timer = setTimeout(() => {
        setShowWelcome(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const hideWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem(WELCOME_SHOWN_KEY, 'true');
  };

  const resetWelcome = () => {
    localStorage.removeItem(WELCOME_SHOWN_KEY);
    setShowWelcome(true);
  };

  return {
    showWelcome,
    hideWelcome,
    resetWelcome
  };
}