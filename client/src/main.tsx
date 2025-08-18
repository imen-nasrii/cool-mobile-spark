import React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('🚀 Tomati Market - Starting application...');

const rootElement = document.getElementById("root");
if (rootElement) {
  console.log('✅ Root element found, mounting React app');
  try {
    createRoot(rootElement).render(<App />);
    console.log('✅ React application mounted successfully');
  } catch (error) {
    console.error('❌ Error mounting React:', error);
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif; text-align: center;">
        <h1 style="color: #ef4444; margin-bottom: 20px;">🍅 Tomati Market</h1>
        <p style="color: #333; font-size: 18px;">Application en cours de chargement...</p>
        <p style="color: #666; margin-top: 20px;">Si cette page ne se charge pas, actualisez avec Ctrl+F5</p>
      </div>
    `;
  }
} else {
  console.error('❌ Root element not found');
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: Arial, sans-serif; text-align: center;">
      <h1 style="color: #ef4444;">❌ Erreur de chargement</h1>
      <p>L'élément root n'a pas été trouvé</p>
    </div>
  `;
}
