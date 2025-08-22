import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertProfileSchema, insertProductSchema, 
  insertCategorySchema, insertMessageSchema, insertNotificationSchema,
  insertAdvertisementSchema, insertProductRatingSchema, insertUserPreferencesSchema,
  insertAppointmentSchema, appointments,
  users, products, profiles 
} from "@shared/schema";
import { messagingService } from "./messaging";
import { notificationService } from "./notifications";
import { promotionService } from "./promotionService";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { randomBytes } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || (() => {
  console.warn('WARNING: JWT_SECRET not set in environment variables. Using random secret.');
  return randomBytes(64).toString('hex');
})();

// Middleware to authenticate JWT tokens
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // Test token bypass removed for security

  if (!token || token === 'null' || token === 'undefined') {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Middleware to check if user is admin
const requireAdmin = async (req: any, res: any, next: any) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, display_name } = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        display_name
      });

      // Create profile
      await storage.createProfile({
        user_id: user.id,
        display_name
      });

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

      res.json({ 
        user: { id: user.id, email: user.email, display_name: user.display_name, role: user.role },
        token 
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/signin", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

      res.json({ 
        user: { id: user.id, email: user.email, display_name: user.display_name, role: user.role },
        token 
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Categories routes with caching
  app.get("/api/categories", async (req, res) => {
    try {
      // Set long cache for categories (rarely change)
      res.set({
        'Cache-Control': 'public, max-age=600', // 10 minutes
        'ETag': '"categories-v1"',
        'Vary': 'Accept-Encoding'
      });
      
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/categories", authenticateToken, async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.json(category);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get promoted products FIRST - before any other product routes
  app.get("/api/products/promoted", async (req, res) => {
    try {
      const promotedProducts = await promotionService.getPromotedProducts();
      res.json(promotedProducts || []);
    } catch (error: any) {
      console.error('Error getting promoted products:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Products routes with caching headers
  app.get("/api/products", async (req, res) => {
    try {
      const { category, search, page = '1', limit = '20' } = req.query;
      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 20;
      const offset = (pageNum - 1) * limitNum;
      
      // Set cache headers for better performance
      res.set({
        'Cache-Control': 'public, max-age=120', // 2 minutes
        'ETag': `"products-${category}-${search}-${pageNum}"`,
        'Vary': 'Accept-Encoding'
      });
      
      console.log('GET /api/products - category:', category, 'search:', search, 'page:', pageNum, 'limit:', limitNum);
      const products = await storage.getProducts(category as string, search as string, limitNum, offset);
      console.log('Returning', products.length, 'products for category:', category);
      res.json(products);
    } catch (error: any) {
      console.error('Error in GET /api/products:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Check if user liked a product - must be before generic :id route
  app.get("/api/products/:id/liked", async (req, res) => {
    try {
      // If no auth token, return not liked
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      
      if (!token) {
        return res.json({ liked: false });
      }
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const user = await storage.getUser(decoded.userId);
        if (!user) {
          return res.json({ liked: false });
        }
        
        const hasLiked = await promotionService.hasUserLikedProduct(req.params.id, user.id);
        res.json({ liked: hasLiked });
      } catch (authError) {
        res.json({ liked: false });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      // Increment view count (non-blocking)
      storage.incrementProductViews(req.params.id).catch(err => 
        console.error('Failed to increment views:', err)
      );
      
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/products", authenticateToken, async (req, res) => {
    try {
      console.log('POST /api/products - Request body:', JSON.stringify(req.body, null, 2));
      console.log('POST /api/products - User:', (req as any).user);
      
      // Convert car_equipment array to JSON string if it exists
      const requestData = { ...req.body };
      if (requestData.car_equipment && Array.isArray(requestData.car_equipment)) {
        requestData.car_equipment = JSON.stringify(requestData.car_equipment);
      }
      if (requestData.job_benefits && Array.isArray(requestData.job_benefits)) {
        requestData.job_benefits = JSON.stringify(requestData.job_benefits);
      }
      
      const productData = insertProductSchema.parse({
        ...requestData,
        user_id: (req as any).user.id
      });
      
      console.log('POST /api/products - Parsed product data:', JSON.stringify(productData, null, 2));
      
      const product = await storage.createProduct(productData);
      
      console.log('POST /api/products - Created product:', JSON.stringify(product, null, 2));
      
      res.json(product);
    } catch (error: any) {
      console.error('POST /api/products - Error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/products/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const product = await storage.updateProduct(req.params.id, req.body);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/products/:id", authenticateToken, async (req, res) => {
    try {
      const productId = req.params.id;
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;
      
      // Get product to check ownership
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      // Check if user is owner or admin
      if (product.user_id !== userId && userRole !== 'admin') {
        return res.status(403).json({ error: "You can only delete your own products" });
      }
      
      const success = await storage.deleteProduct(productId);
      if (!success) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Rate a product
  app.post("/api/products/:id/rate", authenticateToken, async (req, res) => {
    try {
      const { rating } = req.body;
      
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
      }
      
      await storage.rateProduct(req.params.id, (req as any).user.id, rating);
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get user's rating for a product
  app.get("/api/products/:id/rating", authenticateToken, async (req, res) => {
    try {
      const rating = await storage.getUserRatingForProduct(req.params.id, (req as any).user.id);
      res.json({ rating });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Legacy messages routes - deprecated, use conversations instead

  // Profile routes
  app.get("/api/profile", authenticateToken, async (req, res) => {
    try {
      const user = (req as any).user;
      const profile = await storage.getProfile(user.id);
      
      // Include user role from the authenticated user data
      const profileWithRole = {
        ...profile,
        role: user.role,
        email: user.email
      };
      
      res.json(profileWithRole);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get user profile by ID (for viewing seller profiles)
  app.get("/api/users/:id/profile", async (req, res) => {
    try {
      const userId = req.params.id;
      console.log('Fetching profile for user ID:', userId);
      
      const user = await storage.getUser(userId);
      const profile = await storage.getProfile(userId);
      
      console.log('User found:', user);
      console.log('Profile found:', profile);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Return comprehensive profile information
      const sellerProfile = {
        id: user.id,
        display_name: profile?.display_name || user.display_name || user.email?.split('@')[0] || 'Vendeur',
        email: user.email,
        created_at: user.created_at,
        bio: profile?.bio || null,
        avatar_url: profile?.avatar_url || null,

      };
      
      console.log('Sending seller profile:', sellerProfile);
      res.json(sellerProfile);
    } catch (error: any) {
      console.error('Error fetching seller profile:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/profile", authenticateToken, async (req, res) => {
    try {
      const profile = await storage.updateProfile((req as any).user.id, req.body);
      res.json(profile);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // User Preferences routes
  app.get("/api/user/preferences", authenticateToken, async (req, res) => {
    try {
      const preferences = await storage.getUserPreferences((req as any).user.id);
      res.json(preferences);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/user/preferences", authenticateToken, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const preferencesData = insertUserPreferencesSchema.partial().parse(req.body);
      const preferences = await storage.updateUserPreferences(userId, preferencesData);
      res.json(preferences);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Chatbot endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, userContext } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Simple rule-based chatbot responses
      const responses = getChatbotResponse(message.toLowerCase(), userContext);
      
      res.json(responses);
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Messaging routes
  app.get("/api/conversations", async (req: any, res) => {
    try {
      // If no auth token, return empty array
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      
      if (!token) {
        return res.json([]);
      }
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const user = await storage.getUser(decoded.userId);
        if (!user) {
          return res.json([]);
        }
        
        const conversations = await messagingService.getConversations(user.id);
        res.json(conversations);
      } catch (authError) {
        res.json([]);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.post("/api/conversations", authenticateToken, async (req: any, res) => {
    try {
      const { product_id, seller_id } = req.body;
      const conversation = await messagingService.createConversation(
        req.user.id,
        seller_id,
        product_id
      );
      res.json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  app.get("/api/conversations/:id/messages", authenticateToken, async (req: any, res) => {
    try {
      const messages = await messagingService.getMessages(req.params.id, req.user.id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/conversations/:id/messages", authenticateToken, async (req: any, res) => {
    try {
      const { content } = req.body;
      const message = await messagingService.sendMessage(
        req.params.id,
        req.user.id,
        content
      );
      res.json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // Notifications routes
  app.get("/api/notifications", authenticateToken, async (req, res) => {
    try {
      const notifications = await notificationService.getUserNotifications((req as any).user.id);
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/notifications/unread-count", authenticateToken, async (req, res) => {
    try {
      const count = await notificationService.getUnreadCount((req as any).user.id);
      res.json({ count });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/notifications/:id/read", authenticateToken, async (req, res) => {
    try {
      const success = await notificationService.markAsRead(req.params.id, (req as any).user.id);
      if (!success) {
        return res.status(404).json({ error: "Notification not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/notifications/mark-all-read", authenticateToken, async (req, res) => {
    try {
      const count = await notificationService.markAllAsRead((req as any).user.id);
      res.json({ markedCount: count });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Additional notification routes for complete system
  app.get("/api/notifications/stats", authenticateToken, async (req, res) => {
    try {
      const stats = await notificationService.getNotificationStats((req as any).user.id);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/notifications/type/:type", authenticateToken, async (req, res) => {
    try {
      const notifications = await notificationService.getNotificationsByType((req as any).user.id, req.params.type);
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/notifications/mark-all-read/:type", authenticateToken, async (req, res) => {
    try {
      const count = await notificationService.markAllAsReadByType((req as any).user.id, req.params.type);
      res.json({ markedCount: count });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/notifications/type/:type", authenticateToken, async (req, res) => {
    try {
      const count = await notificationService.deleteAllByType((req as any).user.id, req.params.type);
      res.json({ deletedCount: count });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Test notification creation for demo
  app.post("/api/notifications/demo", authenticateToken, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      
      // Create sample notifications
      const sampleNotifications = [
        {
          user_id: userId,
          title: "💬 Nouveau message reçu",
          message: "Ahmed vous a envoyé un message concernant votre annonce de voiture.",
          type: "message",
          is_read: false
        },
        {
          user_id: userId,
          title: "❤️ Votre produit a été aimé",
          message: "Quelqu'un a ajouté \"iPhone 15 Pro\" aux favoris.",
          type: "like",
          is_read: false
        },
        {
          user_id: userId,
          title: "⭐ Nouvelle évaluation",
          message: "Votre produit \"Appartement à Tunis\" a reçu ⭐⭐⭐⭐⭐ (5/5)",
          type: "review",
          is_read: true
        },
        {
          user_id: userId,
          title: "🎉 Produit vendu !",
          message: "Félicitations ! Votre produit \"MacBook Pro\" a trouvé un acheteur",
          type: "sale",
          is_read: false
        },
        {
          user_id: userId,
          title: "🔄 Mise à jour système",
          message: "Nouvelles fonctionnalités disponibles : centre de notifications amélioré !",
          type: "system",
          is_read: false
        }
      ];
      
      const createdNotifications = [];
      for (const notifData of sampleNotifications) {
        const notification = await notificationService.createNotification(notifData);
        createdNotifications.push(notification);
      }
      
      res.json({ 
        success: true, 
        message: `${createdNotifications.length} notifications de démonstration créées`,
        notifications: createdNotifications 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/notifications/:id", authenticateToken, async (req, res) => {
    try {
      const success = await notificationService.deleteNotification(req.params.id, (req as any).user.id);
      if (!success) {
        return res.status(404).json({ error: "Notification not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });



  // Stats endpoint
  app.get("/api/stats", async (req, res) => {
    try {
      const products = await storage.getProducts();
      const totalProducts = products.length;
      const totalUsers = 100; // Placeholder - could be fetched from users table
      
      res.json({
        totalProducts,
        totalUsers,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Promoted products endpoint
  app.get("/api/products/promoted", async (req, res) => {
    try {
      const products = await storage.getProducts();
      const promotedProducts = products.filter(p => p.is_promoted);
      res.json(promotedProducts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Advertisements endpoints
  app.get("/api/advertisements", async (req, res) => {
    try {
      const { position, category } = req.query;
      const ads = await storage.getAdvertisements(position as string, category as string);
      res.json(ads);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/advertisements/:id/impression", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.trackAdImpression(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/advertisements/:id/click", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.trackAdClick(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/advertisements/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteAdvertisement(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Advertisement not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create advertisement (admin only)
  app.post("/api/advertisements", authenticateToken, requireAdmin, async (req: any, res: any) => {
    try {
      const adData = insertAdvertisementSchema.parse(req.body);
      const newAd = await storage.createAdvertisement(adData);
      res.status(201).json(newAd);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Enhanced like endpoint with promotion tracking
  app.post("/api/products/:id/like", authenticateToken, async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check if user already liked this product
      const existingLike = await storage.getUserProductLike(userId, id);
      if (existingLike) {
        return res.status(400).json({ error: "Vous avez déjà aimé ce produit" });
      }

      // Add like
      await storage.addProductLike(userId, id);
      
      // Get updated product and check for promotion
      const updatedProduct = await storage.updateProductLikes(id);
      const wasPromoted = await promotionService.checkAndPromoteProduct(id);

      // Send notification to product owner
      if (updatedProduct && updatedProduct.user_id) {
        await notificationService.notifyProductLiked(
          updatedProduct.user_id,
          updatedProduct.title,
          updatedProduct.id
        );
      }

      res.json({ 
        success: true, 
        message: "Produit ajouté aux favoris",
        newLikeCount: updatedProduct?.like_count || 0,
        wasPromoted,
        isPromoted: updatedProduct?.is_promoted || false
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin routes for product management
  app.delete("/api/admin/products/:id", authenticateToken, requireAdmin, async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteProduct(id);
      
      if (success) {
        res.json({ 
          success: true, 
          message: "Produit supprimé avec succès" 
        });
      } else {
        res.status(404).json({ error: "Produit non trouvé" });
      }
    } catch (error: any) {
      console.error('Error deleting product:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Admin routes for advertisement management
  app.get("/api/advertisements/all", authenticateToken, requireAdmin, async (req: any, res: any) => {
    try {
      const advertisements = await storage.getAllAdvertisements();
      res.json(advertisements);
    } catch (error: any) {
      console.error('Error fetching advertisements:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/advertisements/:id", authenticateToken, requireAdmin, async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteAdvertisement(id);
      
      if (success) {
        res.json({ 
          success: true, 
          message: "Publicité supprimée avec succès" 
        });
      } else {
        res.status(404).json({ error: "Publicité non trouvée" });
      }
    } catch (error: any) {
      console.error('Error deleting advertisement:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Admin statistics endpoint
  app.get("/api/admin/stats", authenticateToken, requireAdmin, async (req: any, res: any) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error: any) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Admin categories management
  app.get("/api/admin/categories", authenticateToken, requireAdmin, async (req: any, res: any) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/categories", authenticateToken, requireAdmin, async (req: any, res: any) => {
    try {
      const { name, icon } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: "Le nom de la catégorie est requis" });
      }

      const category = await storage.createCategory({ name, icon });
      res.json(category);
    } catch (error: any) {
      console.error('Error creating category:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Admin users management
  app.get("/api/admin/users", authenticateToken, requireAdmin, async (req: any, res: any) => {
    try {
      const allUsers = await db.select({
        id: users.id,
        email: users.email,
        display_name: users.display_name,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at
      }).from(users).orderBy(desc(users.created_at));
      
      res.json(allUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/products", authenticateToken, requireAdmin, async (req: any, res: any) => {
    try {
      const allProducts = await db.select().from(products).orderBy(desc(products.created_at));
      res.json(allProducts);
    } catch (error: any) {
      console.error('Error fetching products for admin:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create product (admin only)
  app.post("/api/admin/products", authenticateToken, requireAdmin, async (req: any, res: any) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      
      const newProduct = await storage.createProduct({
        ...productData,
        user_id: req.user.id, // Admin creates products
        view_count: 0,
        rating: 0
      });
      
      res.json(newProduct);
    } catch (error: any) {
      console.error('Error creating product:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Update product (admin only)
  app.put("/api/admin/products/:id", authenticateToken, requireAdmin, async (req: any, res: any) => {
    try {
      const productId = req.params.id;
      const updateData = req.body;
      
      // Check if product exists
      const existingProduct = await storage.getProduct(productId);
      if (!existingProduct) {
        return res.status(404).json({ error: "Produit non trouvé" });
      }

      const updatedProduct = await storage.updateProduct(productId, updateData);
      res.json(updatedProduct);
    } catch (error: any) {
      console.error('Error updating product:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Delete product (admin only)
  app.delete("/api/admin/products/:id", authenticateToken, requireAdmin, async (req: any, res: any) => {
    try {
      const productId = req.params.id;
      
      // Check if product exists
      const existingProduct = await storage.getProduct(productId);
      if (!existingProduct) {
        return res.status(404).json({ error: "Produit non trouvé" });
      }

      await storage.deleteProduct(productId);
      res.json({ success: true, message: "Produit supprimé avec succès" });
    } catch (error: any) {
      console.error('Error deleting product:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // DISABLED: Object storage routes for profile photos
  // app.post("/api/objects/upload", authenticateToken, async (req: any, res: any) => {
  //   // Temporarily disabled to prevent MIME conflicts
  // });

  // DISABLED: Direct file upload route with multer for VPS  
  // app.post("/api/objects/upload/:objectId", authenticateToken, upload.single('file'), async (req: any, res: any) => {
  //   // Temporarily disabled to prevent MIME conflicts
  // });

  // DISABLED: Serve static assets from client/src/assets - Let Vite handle this
  // app.get("/src/assets/:assetPath", (req: any, res: any) => {
  //   // Temporarily disabled to prevent MIME type conflicts with Vite
  // });

  // DISABLED: Serve object storage files - preventing MIME conflicts
  // app.get("/objects/:objectPath(*)", async (req: any, res: any) => {
  //   // Temporarily disabled to prevent MIME type conflicts with Vite
  // });

  // Get user profile
  app.get("/api/profile", authenticateToken, async (req: any, res: any) => {
    try {
      const userId = req.user.id;
      const [profile] = await db.select().from(profiles).where(eq(profiles.user_id, userId));
      
      if (!profile) {
        // Create default profile if none exists
        const [newProfile] = await db.insert(profiles)
          .values({
            user_id: userId,
            display_name: req.user.display_name || req.user.email?.split('@')[0] || 'Utilisateur',
            bio: ''
          })
          .returning();
        return res.json(newProfile);
      }
      
      res.json(profile);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Update user profile
  app.put("/api/profile", authenticateToken, async (req: any, res: any) => {
    try {
      const userId = req.user.id;
      const { display_name, bio } = req.body;
      
      // Update or create profile
      const [updatedProfile] = await db.insert(profiles)
        .values({
          user_id: userId,
          display_name,
          bio,
          updated_at: new Date()
        })
        .onConflictDoUpdate({
          target: profiles.user_id,
          set: {
            display_name,
            bio,
            updated_at: new Date()
          }
        })
        .returning();
      
      res.json(updatedProfile);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Update profile avatar
  app.put("/api/profile/avatar", authenticateToken, async (req: any, res: any) => {
    try {
      const { avatarURL } = req.body;
      const userId = req.user.id;
      
      if (!avatarURL) {
        return res.status(400).json({ error: "L'URL de l'avatar est requise" });
      }

      // Convert Google Storage URL to our object storage path
      const { ObjectStorageService } = await import('./objectStorage');
      const objectStorageService = new ObjectStorageService();
      const normalizedPath = objectStorageService.normalizeObjectEntityPath(avatarURL);
      
      console.log('Updating avatar - Original URL:', avatarURL);
      console.log('Updating avatar - Normalized path:', normalizedPath);

      // Update user avatar in profiles table
      await db.update(profiles)
        .set({ avatar_url: normalizedPath, updated_at: new Date() })
        .where(eq(profiles.user_id, userId));

      res.json({ success: true, message: "Avatar mis à jour avec succès", avatarPath: normalizedPath });
    } catch (error: any) {
      console.error('Error updating avatar:', error);
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  
  // WebSocket server for real-time messaging  
  const ws = await import('ws');
  const wss = new ws.WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', async (ws: any, req: any) => {
    try {
      // Extract userId from URL query parameter
      const urlParams = new URLSearchParams(req.url?.split('?')[1] || '');
      const userId = urlParams.get('userId');
      
      if (!userId) {
        console.log('WebSocket connection denied: No userId provided');
        ws.close(1008, 'User ID required');
        return;
      }

      // Verify user exists in database
      const user = await storage.getUser(userId);
      if (!user) {
        console.log('WebSocket connection denied: Invalid userId:', userId);
        ws.close(1008, 'Invalid user ID');
        return;
      }

      console.log('WebSocket client connected for user:', user.email);
      messagingService.addClient(userId, ws);

      // Send connection confirmation
      ws.send(JSON.stringify({
        type: 'connected',
        message: 'WebSocket connection established'
      }));

    } catch (error) {
      console.error('WebSocket connection error:', error);
      ws.close(1011, 'Server error');
    }
  });

  // Appointment routes
  app.post("/api/appointments", authenticateToken, async (req, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      
      // Validate that the requester is different from the owner
      if (appointmentData.requester_id === appointmentData.owner_id) {
        return res.status(400).json({ error: "Cannot schedule appointment with yourself" });
      }

      const appointment = await storage.createAppointment(appointmentData);
      
      // Send notification to product owner
      await notificationService.createNotification({
        user_id: appointmentData.owner_id,
        title: "Nouvelle demande de rendez-vous",
        message: `Quelqu'un souhaite planifier un rendez-vous pour voir votre produit`,
        type: "appointment_request",
        related_id: appointment.id
      });

      res.json(appointment);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/appointments/conversation/:conversationId", authenticateToken, async (req, res) => {
    try {
      const { conversationId } = req.params;
      const appointments = await storage.getAppointmentsByConversation(conversationId);
      res.json(appointments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/appointments/user", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const appointments = await storage.getAppointmentsByUser(userId);
      res.json(appointments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/appointments/:id/status", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!['accepted', 'rejected', 'cancelled', 'completed'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const appointment = await storage.updateAppointmentStatus(id, status, req.user.id);
      
      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found or access denied" });
      }

      // If appointment is accepted, mark product as reserved
      if (status === 'accepted') {
        await storage.updateProductReservation(appointment.product_id, true);
        
        // Notify requester about acceptance
        await notificationService.createNotification({
          user_id: appointment.requester_id,
          title: "Rendez-vous accepté !",
          message: `Votre demande de rendez-vous a été acceptée`,
          type: "appointment_accepted",
          related_id: appointment.id
        });
      } else if (status === 'rejected' || status === 'cancelled') {
        // If appointment is rejected/cancelled, unreserve product
        await storage.updateProductReservation(appointment.product_id, false);
      }

      res.json(appointment);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  return httpServer;
}

// Simple rule-based chatbot function
function getChatbotResponse(message: string, userContext: any = {}) {
  const responses = {
    greetings: [
      "🍅 Ravi de vous rencontrer ! Je suis l'assistant Tomati, votre guide personnel sur notre marketplace. Comment puis-je vous aider à réussir votre expérience ?",
      "🌟 Salut ! Bienvenue dans la famille Tomati Market. Je suis là pour répondre à toutes vos questions et vous accompagner pas à pas !",
      "👋 Bonjour ! Je suis votre assistant dédié sur Tomati. Que vous soyez acheteur ou vendeur, je vais vous simplifier la vie !"
    ],
    products: [
      "🛍️ Excellente question ! Sur Tomati Market, nous avons des milliers de produits dans toutes les catégories. Utilisez notre recherche intelligente ou parcourez par catégorie. Besoin d'aide pour trouver quelque chose de spécifique ?",
      "📱 Pour vendre : connectez-vous, cliquez sur 'Vendre' et suivez nos étapes simples. Pour acheter : parcourez, contactez le vendeur et négociez ! C'est aussi simple que ça.",
      "✅ Tous nos produits passent par notre système de vérification. Photos authentiques, descriptions détaillées, vendeurs certifiés - votre sécurité est notre priorité !"
    ],
    selling: [
      "💰 Vendre sur Tomati est gratuit et simple ! 1) Créez votre annonce avec de belles photos 2) Fixez un prix attractif 3) Répondez aux messages rapidement. Nos vendeurs gagnent en moyenne 300€/mois !",
      "📸 Pour réussir votre vente : prenez des photos sous tous les angles, rédigez une description honnête, fixez un prix juste. Pro tip : les annonces avec 5+ photos se vendent 3x plus vite !",
      "🚀 Secrets des vendeurs pro : répondez dans l'heure, proposez plusieurs moyens de paiement, soyez flexible sur les horaires de rencontre. Vous voulez que je vous donne plus de conseils ?"
    ],
    buying: [
      "🛒 Acheter malin sur Tomati : 1) Vérifiez les photos et description 2) Posez vos questions au vendeur 3) Négociez le prix 4) Rencontrez dans un lieu public. Sécurité avant tout !",
      "💡 Conseils d'achat : vérifiez le profil du vendeur, demandez des photos supplémentaires si besoin, testez l'article avant paiement. Notre système de notation vous aide à choisir !",
      "🔍 Recherche avancée : utilisez les filtres par prix, localisation, état. Activez les alertes pour être notifié des nouvelles annonces qui vous intéressent !"
    ],
    help: [
      "🆘 Je suis votre assistant tout-terrain ! Je peux vous aider avec : navigation, vente/achat, problèmes techniques, conseils sécurité, optimisation d'annonces. Dites-moi tout !",
      "🎯 Mes spécialités : expliquer les fonctionnalités, résoudre les problèmes, donner des conseils de vente, vous guider pas à pas. Quelle est votre préoccupation principale ?",
      "💬 Pas de stress ! Je suis là 24h/24 pour vous accompagner sur Tomati. Questions techniques, conseils pratiques, aide à la navigation - je gère tout !"
    ],
    account: [
      "🔐 Créer un compte Tomati : cliquez sur 'Se connecter' → 'S'inscrire' → remplissez vos infos → vérifiez votre email. C'est gratuit à vie et prend moins de 2 minutes !",
      "⚙️ Gestion de profil : allez dans votre profil pour modifier vos infos, ajouter une photo, mettre à jour vos préférences. Un profil complet inspire plus confiance !",
      "🔒 Problème de connexion ? Vérifiez votre email/mot de passe, regardez vos spams, essayez la récupération de mot de passe. Toujours bloqué ? Je peux vous aider autrement !"
    ],
    security: [
      "🛡️ Votre sécurité, notre obsession ! Règles d'or : rencontrez dans un lieu public animé, vérifiez l'identité, payez à la remise. Nos 50 000+ utilisateurs nous font confiance !",
      "⚠️ Alertes sécurité : jamais d'infos bancaires par message, méfiez-vous des 'super affaires', signaler = protéger la communauté. Vous êtes notre priorité absolue !",
      "🔒 Protection 360° : comptes vérifiés, surveillance IA des fraudes, équipe de modération 24h/24. Sur Tomati, achetez et vendez l'esprit tranquille !"
    ],
    payment: [
      "💳 Paiements sécurisés : privilégiez espèces à la remise, virement pour gros achats, évitez les avances. PayPal et cartes acceptés selon les vendeurs. Sécurité maximale !",
      "💰 Conseils financiers : négociez toujours le prix, vérifiez l'article avant paiement, gardez les preuves de transaction. Smart shopping = économies garanties !",
      "🏦 Options de paiement : la plupart des vendeurs acceptent espèces, virement, PayPal. Pour les gros montants, préférez les virements sécurisés."
    ],
    technical: [
      "🔧 Problème technique ? Je suis votre SAV personnel ! Décrivez-moi le souci : navigation, upload photos, messages qui ne partent pas... Je trouve la solution !",
      "💻 Aide technique express : rechargez la page, videz le cache, essayez un autre navigateur. 90% des problèmes se résolvent ainsi. Sinon, décrivez-moi tout !",
      "📱 Optimisation mobile : utilisez l'app ou le site mobile, bonne connexion recommandée. Problème persistant ? Donnez-moi plus de détails !"
    ],
    promotion: [
      "🚀 Booster vos ventes : photos HD multiples, titre accrocheur, prix juste, réponse rapide. Nos vendeurs stars suivent ces règles et vendent 5x plus !",
      "⭐ Devenir vendeur premium : complétez votre profil à 100%, maintenez 5 étoiles, répondez en moins d'1h. Résultat : visibilité x10 et ventes garanties !",
      "📈 Stats de réussite : annonces avec 5+ photos = +300% vues, prix négociable = +50% contacts, mise à jour hebdomadaire = top classement !"
    ],
    default: [
      "🤔 Hmm, je n'ai pas tout à fait saisi ! Reformulez votre question ou choisissez un sujet : vendre, acheter, sécurité, technique, mon compte. Je suis là pour ça !",
      "💭 Pas de souci, on reprend ! Dites-moi clairement ce que vous cherchez : aide vente/achat, problème technique, question sécurité, ou navigation. Je m'occupe de tout !",
      "🎯 Recadrons ensemble ! Je maîtrise tout sur Tomati Market : ventes, achats, sécurité, techniques, promotions. Quel est votre besoin prioritaire aujourd'hui ?"
    ]
  };

  const suggestions = {
    greetings: ["Comment vendre ?", "Comment acheter ?", "Sécurité et paiements", "Créer un compte"],
    selling: ["Conseils photos", "Fixer le prix", "Booster mes ventes", "Répondre aux acheteurs"],
    buying: ["Négocier le prix", "Vérifier le vendeur", "Moyens de paiement", "Éviter les arnaques"],
    products: ["Recherche avancée", "Catégories disponibles", "Alertes nouvelles annonces"],
    security: ["Règles de sécurité", "Signaler un vendeur", "Lieux de rencontre", "Éviter les fraudes"],
    payment: ["Moyens sécurisés", "PayPal ou espèces ?", "Virement pour gros achat"],
    technical: ["Problème photos", "Site lent", "Messages bloqués", "App mobile"],
    promotion: ["Devenir premium", "Photos parfaites", "Titre accrocheur", "Stats de vente"],
    help: ["Navigation du site", "Gestion de compte", "Contacter support", "FAQ complète"],
    account: ["Modifier profil", "Mot de passe oublié", "Vérification email", "Supprimer compte"],
    default: ["Comment vendre ?", "Comment acheter ?", "Sécurité", "Créer un compte"]
  };

  // Enhanced intent detection with better context understanding
  let intent = 'default';
  const lowerMessage = message.toLowerCase();
  
  if (/bonjour|salut|hello|hi|bonsoir|ça va/.test(lowerMessage)) {
    intent = 'greetings';
  } else if (/vendre|vente|vendeur|annonce|publier|prix|gagner/.test(lowerMessage)) {
    intent = 'selling';
  } else if (/acheter|achat|acheteuse|commander|payer|négocier/.test(lowerMessage)) {
    intent = 'buying';
  } else if (/produit|article|catalogue|recherche|trouver|cherche/.test(lowerMessage)) {
    intent = 'products';
  } else if (/sécurité|sécurisé|arnaque|danger|risque|protection|vol/.test(lowerMessage)) {
    intent = 'security';
  } else if (/paiement|payer|argent|paypal|carte|virement|espèces/.test(lowerMessage)) {
    intent = 'payment';
  } else if (/problème|bug|erreur|marche pas|fonctionne pas|lent/.test(lowerMessage)) {
    intent = 'technical';
  } else if (/promotion|booster|visibilité|top|premium|réussir/.test(lowerMessage)) {
    intent = 'promotion';
  } else if (/aide|help|comment|question/.test(lowerMessage)) {
    intent = 'help';
  } else if (/compte|profil|connexion|inscription|mot de passe/.test(lowerMessage)) {
    intent = 'account';
  }

  const responseList = responses[intent as keyof typeof responses] || responses.default;
  const suggestionList = suggestions[intent as keyof typeof suggestions] || suggestions.default;
  
  return {
    response: responseList[Math.floor(Math.random() * responseList.length)],
    intent,
    suggestions: suggestionList,
    timestamp: new Date().toISOString()
  };
}


