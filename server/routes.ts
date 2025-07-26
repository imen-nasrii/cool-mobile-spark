import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertProfileSchema, insertProductSchema, 
  insertCategorySchema, insertMessageSchema, insertNotificationSchema 
} from "@shared/schema";
import { messagingService } from "./messaging";
import { notificationService } from "./notifications";
import { promotionService } from "./promotionService";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Middleware to authenticate JWT tokens
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
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

  // Categories routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/categories", authenticateToken, requireAdmin, async (req, res) => {
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

  // Products routes
  app.get("/api/products", async (req, res) => {
    try {
      const { category, search } = req.query;
      const products = await storage.getProducts(category as string, search as string);
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Check if user liked a product - must be before generic :id route
  app.get("/api/products/:id/liked", authenticateToken, async (req, res) => {
    try {
      const hasLiked = await promotionService.hasUserLikedProduct(req.params.id, (req as any).user.id);
      res.json({ liked: hasLiked });
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
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/products", authenticateToken, async (req, res) => {
    try {
      const productData = insertProductSchema.parse({
        ...req.body,
        user_id: (req as any).user.id
      });
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error: any) {
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

  app.delete("/api/products/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteProduct(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Legacy messages routes - deprecated, use conversations instead

  // Profile routes
  app.get("/api/profile", authenticateToken, async (req, res) => {
    try {
      const profile = await storage.getProfile((req as any).user.id);
      res.json(profile);
    } catch (error: any) {
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
  app.get("/api/conversations", authenticateToken, async (req: any, res) => {
    try {
      const conversations = await messagingService.getConversations(req.user.id);
      res.json(conversations);
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

  // Like a product and auto-promote at 3 likes
  app.post("/api/products/:id/like", authenticateToken, async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Prevent liking own product
      if (product.user_id === (req as any).user.id) {
        return res.status(400).json({ error: "Vous ne pouvez pas aimer votre propre produit" });
      }

      // Add like and check for automatic promotion
      await promotionService.addLikeAndCheckPromotion(req.params.id, (req as any).user.id);

      // Update the product with new like count to get fresh data
      const updatedProduct = await storage.getProduct(req.params.id);

      // Create notification for product owner if user_id exists
      if (product.user_id) {
        await notificationService.notifyProductLiked(
          product.user_id,
          product.title,
          product.id
        );
      }

      res.json({ 
        success: true, 
        message: "Produit ajouté aux favoris",
        newLikeCount: updatedProduct?.like_count || 0
      });
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

  // Check if user liked a product
  app.get("/api/products/:id/liked", authenticateToken, async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const like = await storage.getUserProductLike(userId, id);
      res.json({ liked: !!like });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  
  // WebSocket server for real-time messaging  
  const ws = await import('ws');
  const wss = new ws.WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: any, req: any) => {
    const userId = req.url?.split('userId=')[1];
    if (userId) {
      messagingService.addClient(userId, ws);
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


