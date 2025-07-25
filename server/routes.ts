import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertProfileSchema, insertProductSchema, 
  insertCategorySchema, insertMessageSchema 
} from "@shared/schema";
import { messagingService } from "./messaging";
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

  app.post("/api/products", authenticateToken, requireAdmin, async (req, res) => {
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
      "Bonjour ! Je suis votre assistant Tomati. Comment puis-je vous aider aujourd'hui ?",
      "Salut ! Bienvenue sur Tomati Market. Que puis-je faire pour vous ?",
      "Bonjour ! Je suis là pour répondre à vos questions sur notre marketplace."
    ],
    products: [
      "Nous avons une large gamme de produits sur Tomati Market. Vous pouvez parcourir nos catégories ou utiliser la recherche pour trouver ce que vous cherchez.",
      "Pour vendre un produit, connectez-vous à votre compte et accédez au tableau de bord admin. Pour acheter, parcourez nos offres.",
      "Tous nos produits sont vérifiés par notre équipe. Vous pouvez voir les détails, photos et contacter le vendeur pour plus d'informations."
    ],
    help: [
      "Je peux vous aider avec les produits, les comptes, les achats et ventes. Que voulez-vous savoir ?",
      "Voici ce que je peux faire : vous aider à naviguer sur le site, expliquer comment vendre ou acheter, répondre aux questions sur les comptes.",
      "N'hésitez pas à me poser vos questions sur Tomati Market !"
    ],
    account: [
      "Pour créer un compte, cliquez sur 'Se connecter' puis 'S'inscrire'. C'est gratuit et rapide !",
      "Vous pouvez modifier vos informations de profil en vous connectant et en allant dans votre profil.",
      "Si vous avez des problèmes de connexion, vérifiez votre email et mot de passe."
    ],
    default: [
      "Je ne suis pas sûr de comprendre votre question. Pouvez-vous la reformuler ?",
      "Pouvez-vous être plus précis ? Je peux vous aider avec les produits, les comptes ou la navigation.",
      "Je suis là pour vous aider ! Posez-moi des questions sur Tomati Market."
    ]
  };

  const suggestions = {
    greetings: ["Comment vendre ?", "Comment acheter ?", "Créer un compte"],
    products: ["Types de produits", "Comment publier", "Rechercher un article"],
    help: ["Navigation du site", "Gestion de compte", "Contacter support"],
    account: ["Modifier profil", "Mot de passe oublié", "Supprimer compte"],
    default: ["Aide générale", "Vendre un produit", "Créer un compte"]
  };

  // Detect intent based on keywords
  let intent = 'default';
  
  if (/bonjour|salut|hello|hi|bonsoir/.test(message)) {
    intent = 'greetings';
  } else if (/produit|article|vendre|acheter|vente|achat/.test(message)) {
    intent = 'products';
  } else if (/aide|help|comment|question|problème/.test(message)) {
    intent = 'help';
  } else if (/compte|profil|connexion|inscription|mot de passe/.test(message)) {
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


