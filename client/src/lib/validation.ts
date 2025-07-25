import { z } from 'zod';

// User validation schemas
export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères')
});

export const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string(),
  display_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
});

// Product validation schemas
export const productSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  price: z.string().optional(),
  location: z.string().min(2, 'La localisation doit contenir au moins 2 caractères'),
  category: z.string().min(1, 'Veuillez sélectionner une catégorie'),
  is_free: z.boolean().default(false),
  image_url: z.string().url('URL d\'image invalide').optional().or(z.literal(''))
});

// Profile validation schemas
export const profileSchema = z.object({
  display_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  bio: z.string().max(500, 'La bio ne peut pas dépasser 500 caractères').optional(),
  location: z.string().optional(),
  phone: z.string().regex(/^\+216[0-9]{8}$/, 'Numéro de téléphone tunisien invalide').optional(),
  website: z.string().url('URL invalide').optional().or(z.literal(''))
});

// Message validation schemas
export const messageSchema = z.object({
  content: z.string().min(1, 'Le message ne peut pas être vide').max(1000, 'Le message ne peut pas dépasser 1000 caractères'),
  recipient_id: z.string().uuid('ID destinataire invalide'),
  product_id: z.string().uuid('ID produit invalide').optional()
});

// Search validation schemas
export const searchSchema = z.object({
  query: z.string().max(100, 'La recherche ne peut pas dépasser 100 caractères'),
  category: z.string().optional(),
  location: z.string().optional(),
  price_min: z.number().min(0, 'Le prix minimum doit être positif').optional(),
  price_max: z.number().min(0, 'Le prix maximum doit être positif').optional(),
  is_free: z.boolean().optional()
});

// Review validation schemas
export const reviewSchema = z.object({
  rating: z.number().min(1, 'La note doit être entre 1 et 5').max(5, 'La note doit être entre 1 et 5'),
  comment: z.string().max(500, 'Le commentaire ne peut pas dépasser 500 caractères').optional(),
  reviewer_id: z.string().uuid('ID évaluateur invalide'),
  reviewed_id: z.string().uuid('ID évalué invalide')
});

// Form validation helpers
export const validateRequired = (value: string, fieldName: string) => {
  if (!value || value.trim() === '') {
    return `${fieldName} est requis`;
  }
  return null;
};

export const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Email invalide';
  }
  return null;
};

export const validatePassword = (password: string) => {
  if (password.length < 6) {
    return 'Le mot de passe doit contenir au moins 6 caractères';
  }
  return null;
};

export const validateTunisianPhone = (phone: string) => {
  const phoneRegex = /^\+216[0-9]{8}$/;
  if (!phoneRegex.test(phone)) {
    return 'Numéro de téléphone tunisien invalide (format: +216XXXXXXXX)';
  }
  return null;
};

export const validateUrl = (url: string) => {
  try {
    new URL(url);
    return null;
  } catch {
    return 'URL invalide';
  }
};

// Export types
export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;
export type ProductForm = z.infer<typeof productSchema>;
export type ProfileForm = z.infer<typeof profileSchema>;
export type MessageForm = z.infer<typeof messageSchema>;
export type SearchForm = z.infer<typeof searchSchema>;
export type ReviewForm = z.infer<typeof reviewSchema>;