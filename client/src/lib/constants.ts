// Application Constants
export const APP_CONFIG = {
  name: 'Tomati',
  version: '1.0.0',
  description: 'Marketplace électronique pour la Tunisie',
  author: 'Tomati Team',
  contact: 'admin@tomati.com'
} as const;

// API Configuration
export const API_CONFIG = {
  baseUrl: '/api',
  timeout: 10000,
  retryAttempts: 3
} as const;

// Authentication
export const AUTH_CONFIG = {
  tokenKey: 'authToken',
  refreshTokenKey: 'refreshToken',
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  adminEmail: 'admin@tomati.com'
} as const;

// UI Constants
export const UI_CONFIG = {
  debounceDelay: 300,
  animationDuration: 300,
  toastDuration: 5000,
  maxImageSize: 5 * 1024 * 1024, // 5MB
  itemsPerPage: 20
} as const;

// Tunisia Specific
export const TUNISIA_CONFIG = {
  currency: 'TND',
  locale: 'fr-TN',
  phonePrefix: '+216',
  coordinates: {
    lat: 33.8869,
    lng: 9.5375
  }
} as const;

// Product Categories
export const PRODUCT_CATEGORIES = [
  { id: 'voiture', name: 'Voitures', icon: '🚗' },
  { id: 'electronics', name: 'Électronique', icon: '📱' },
  { id: 'furniture', name: 'Mobilier', icon: '🪑' },
  { id: 'sports', name: 'Sports', icon: '⚽' },
  { id: 'fashion', name: 'Mode', icon: '👕' },
  { id: 'books', name: 'Livres', icon: '📚' },
  { id: 'tools', name: 'Outils', icon: '🔧' },
  { id: 'other', name: 'Autre', icon: '📦' }
] as const;

// User Roles
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  MODERATOR: 'moderator'
} as const;

// Message Types
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  SYSTEM: 'system'
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  NEW_MESSAGE: 'new_message',
  PRODUCT_LIKED: 'product_liked',
  PRODUCT_SOLD: 'product_sold',
  SYSTEM_ALERT: 'system_alert'
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erreur de connexion réseau',
  AUTHENTICATION_FAILED: 'Échec de l\'authentification',
  UNAUTHORIZED: 'Accès non autorisé',
  NOT_FOUND: 'Ressource non trouvée',
  VALIDATION_ERROR: 'Erreur de validation',
  SERVER_ERROR: 'Erreur du serveur'
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  PRODUCT_CREATED: 'Produit créé avec succès',
  PRODUCT_UPDATED: 'Produit mis à jour avec succès',
  PRODUCT_DELETED: 'Produit supprimé avec succès',
  MESSAGE_SENT: 'Message envoyé avec succès',
  PROFILE_UPDATED: 'Profil mis à jour avec succès'
} as const;