import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertProfileSchema, insertProductSchema, 
  insertCategorySchema, insertMessageSchema 
} from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { healthCheck, readinessCheck } from "./health";

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
  // Health check routes for production monitoring
  app.get("/api/health", healthCheck);
  app.get("/api/ready", readinessCheck);
  
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

  // Products routes - Enhanced filtering
  app.get("/api/products", async (req, res) => {
    try {
      const { category, search, sortBy } = req.query;
      
      const filters = {
        category: category as string,
        search: search as string,
        sortBy: sortBy as string
      };
      
      const products = await storage.getProducts(filters);
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

  // Messages routes
  app.get("/api/messages", authenticateToken, async (req, res) => {
    try {
      const messages = await storage.getUserMessages((req as any).user.id);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/products/:productId/messages", authenticateToken, async (req, res) => {
    try {
      const messages = await storage.getProductMessages(req.params.productId, (req as any).user.id);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/messages", authenticateToken, async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse({
        ...req.body,
        sender_id: (req as any).user.id
      });
      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Profile routes
  app.get("/api/profile", authenticateToken, async (req, res) => {
    try {
      const profile = await storage.getProfile((req as any).user.id);
      // Include user role in profile response
      const userWithRole = {
        ...profile,
        role: (req as any).user.role,
        email: (req as any).user.email
      };
      res.json(userWithRole);
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

  // Dashboard statistics endpoint
  app.get("/api/dashboard/stats", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ error: "Failed to fetch dashboard statistics" });
    }
  });

  // Reviews Routes  
  app.post("/api/reviews", authenticateToken, async (req, res) => {
    try {
      const { reviewService } = await import('./reviewsService');
      const reviewData = {
        product_id: req.body.product_id,
        user_id: req.user.id,
        rating: req.body.rating,
        title: req.body.title,
        comment: req.body.comment
      };

      const review = await reviewService.createReview(reviewData);
      res.json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ error: "Failed to create review" });
    }
  });

  app.get("/api/products/:id/reviews", async (req, res) => {
    try {
      const { reviewService } = await import('./reviewsService');
      const productId = req.params.id;
      const reviews = await reviewService.getProductReviews(productId);
      res.json(reviews);
    } catch (error) {
      console.error("Error getting reviews:", error);
      res.status(500).json({ error: "Failed to get reviews" });
    }
  });

  app.get("/api/products/:id/stats", async (req, res) => {
    try {
      const { reviewService } = await import('./reviewsService');
      const productId = req.params.id;
      const stats = await reviewService.getProductStats(productId);
      res.json(stats);
    } catch (error) {
      console.error("Error getting product stats:", error);
      res.status(500).json({ error: "Failed to get product stats" });
    }
  });

  app.get("/api/products/:id/badges", async (req, res) => {
    try {
      const { reviewService } = await import('./reviewsService');
      const productId = req.params.id;
      const badges = await reviewService.getProductMarketingBadges(productId);
      res.json(badges);
    } catch (error) {
      console.error("Error getting marketing badges:", error);
      res.status(500).json({ error: "Failed to get marketing badges" });
    }
  });

  app.post("/api/reviews/:id/helpful", authenticateToken, async (req, res) => {
    try {
      const { reviewService } = await import('./reviewsService');
      const reviewId = req.params.id;
      const userId = req.user.id;
      const isHelpful = await reviewService.markReviewHelpful(reviewId, userId);
      res.json({ isHelpful });
    } catch (error) {
      console.error("Error marking review helpful:", error);
      res.status(500).json({ error: "Failed to mark review helpful" });
    }
  });

  // Like/Unlike product endpoint
  app.post("/api/products/:id/like", authenticateToken, async (req, res) => {
    try {
      const { id: productId } = req.params;
      const userId = req.user.id;

      // Check if already liked
      const existingLike = await db
        .select()
        .from(favorites)
        .where(eq(favorites.product_id, productId))
        .where(eq(favorites.user_id, userId));

      let isLiked = false;
      let currentLikes = 0;

      if (existingLike.length > 0) {
        // Unlike - remove from favorites and decrement likes
        await db
          .delete(favorites)
          .where(eq(favorites.product_id, productId))
          .where(eq(favorites.user_id, userId));

        await db
          .update(products)
          .set({ 
            likes: sql`${products.likes} - 1`,
            updated_at: new Date()
          })
          .where(eq(products.id, productId));

        isLiked = false;
      } else {
        // Like - add to favorites and increment likes
        await db
          .insert(favorites)
          .values({
            user_id: userId,
            product_id: productId,
          });

        await db
          .update(products)
          .set({ 
            likes: sql`${products.likes} + 1`,
            updated_at: new Date()
          })
          .where(eq(products.id, productId));

        isLiked = true;
      }

      // Get updated like count
      const updatedProduct = await db
        .select({ likes: products.likes })
        .from(products)
        .where(eq(products.id, productId));

      currentLikes = updatedProduct[0]?.likes || 0;

      res.json({ 
        success: true, 
        isLiked, 
        likes: currentLikes 
      });

    } catch (error) {
      console.error("Error toggling like:", error);
      res.status(500).json({ error: "Failed to toggle like" });
    }
  });

  // Get product like status for current user
  app.get("/api/products/:id/like-status", async (req, res) => {
    try {
      const { id: productId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.json({ isLiked: false });
      }

      const existingLike = await db
        .select()
        .from(favorites)
        .where(eq(favorites.product_id, productId))
        .where(eq(favorites.user_id, userId));

      res.json({ isLiked: existingLike.length > 0 });

    } catch (error) {
      console.error("Error getting like status:", error);
      res.status(500).json({ error: "Failed to get like status" });
    }
  });

  // Messages/Conversations API
  app.get("/api/conversations", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Get conversations for the current user
      const userMessages = await db
        .select({
          id: messages.id,
          product_id: messages.product_id,
          sender_id: messages.sender_id,
          recipient_id: messages.recipient_id,
          content: messages.content,
          created_at: messages.created_at,
          is_read: messages.is_read,
          product_title: products.title,
          sender_name: users.display_name,
          sender_email: users.email,
          recipient_name: sql<string>`CASE WHEN ${messages.sender_id} = ${userId} THEN ${users.display_name} ELSE sender.display_name END`,
          other_user_id: sql<string>`CASE WHEN ${messages.sender_id} = ${userId} THEN ${messages.recipient_id} ELSE ${messages.sender_id} END`
        })
        .from(messages)
        .leftJoin(products, eq(products.id, messages.product_id))
        .leftJoin(users, eq(users.id, messages.recipient_id))
        .leftJoin(sql`users sender`, sql`sender.id = ${messages.sender_id}`)
        .where(or(eq(messages.sender_id, userId), eq(messages.recipient_id, userId)))
        .orderBy(desc(messages.created_at));

      // Group by conversation (product + other user)
      const conversations = new Map();
      
      for (const msg of userMessages) {
        const conversationKey = `${msg.product_id}-${msg.other_user_id}`;
        if (!conversations.has(conversationKey)) {
          conversations.set(conversationKey, {
            id: conversationKey,
            product_id: msg.product_id,
            product_title: msg.product_title,
            other_user_id: msg.other_user_id,
            other_user_name: msg.other_user_id === userId ? msg.sender_name : msg.recipient_name,
            last_message: msg.content,
            last_message_at: msg.created_at,
            unread_count: 0,
            messages: []
          });
        }
        
        const conv = conversations.get(conversationKey);
        conv.messages.push(msg);
        
        if (!msg.is_read && msg.recipient_id === userId) {
          conv.unread_count++;
        }
      }

      res.json(Array.from(conversations.values()));
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.get("/api/conversations/:conversationId/messages", authenticateToken, async (req, res) => {
    try {
      const { conversationId } = req.params;
      const userId = req.user.id;
      const [productId, otherUserId] = conversationId.split('-');
      
      const conversationMessages = await db
        .select({
          id: messages.id,
          content: messages.content,
          sender_id: messages.sender_id,
          recipient_id: messages.recipient_id,
          created_at: messages.created_at,
          is_read: messages.is_read,
          sender_name: users.display_name,
          sender_email: users.email
        })
        .from(messages)
        .leftJoin(users, eq(users.id, messages.sender_id))
        .where(
          and(
            eq(messages.product_id, productId),
            or(
              and(eq(messages.sender_id, userId), eq(messages.recipient_id, otherUserId)),
              and(eq(messages.sender_id, otherUserId), eq(messages.recipient_id, userId))
            )
          )
        )
        .orderBy(messages.created_at);

      res.json(conversationMessages);
    } catch (error) {
      console.error("Error fetching conversation messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/conversations/:conversationId/messages", authenticateToken, async (req, res) => {
    try {
      const { conversationId } = req.params;
      const { content } = req.body;
      const userId = req.user.id;
      const [productId, recipientId] = conversationId.split('-');

      if (!content || !productId || !recipientId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const newMessage = await db
        .insert(messages)
        .values({
          product_id: productId,
          sender_id: userId,
          recipient_id: recipientId,
          content: content,
          message_type: "text"
        })
        .returning();

      // Broadcast via WebSocket if available
      const { broadcastToUser } = await import('./websocket');
      broadcastToUser(recipientId, {
        type: 'new_message',
        conversationId,
        message: {
          ...newMessage[0],
          sender_name: req.user.display_name || req.user.email
        }
      });

      res.json(newMessage[0]);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // User reviews API
  app.post("/api/users/:userId/reviews", authenticateToken, async (req, res) => {
    try {
      const { userId: reviewedUserId } = req.params;
      const { rating, comment, transaction_context } = req.body;
      const reviewerId = req.user.id;

      if (reviewerId === reviewedUserId) {
        return res.status(400).json({ error: "Cannot review yourself" });
      }

      // Check if review already exists
      const existingReview = await db
        .select()
        .from(sql`user_reviews`)
        .where(sql`reviewer_id = ${reviewerId} AND reviewed_user_id = ${reviewedUserId}`)
        .limit(1);

      if (existingReview.length > 0) {
        return res.status(400).json({ error: "You have already reviewed this user" });
      }

      // Create the review
      await db.execute(sql`
        INSERT INTO user_reviews (reviewer_id, reviewed_user_id, rating, comment, transaction_context)
        VALUES (${reviewerId}, ${reviewedUserId}, ${rating}, ${comment}, ${transaction_context})
      `);

      // Update user's average rating
      const avgResult = await db.execute(sql`
        SELECT AVG(rating)::REAL as avg_rating, COUNT(*)::INTEGER as total_reviews 
        FROM user_reviews 
        WHERE reviewed_user_id = ${reviewedUserId}
      `);

      if (avgResult.rows[0]) {
        await db.execute(sql`
          UPDATE profiles 
          SET user_rating = ${avgResult.rows[0].avg_rating}, 
              total_user_reviews = ${avgResult.rows[0].total_reviews}
          WHERE user_id = ${reviewedUserId}
        `);
      }

      res.json({ success: true, message: "Review submitted successfully" });
    } catch (error) {
      console.error("Error submitting user review:", error);
      res.status(500).json({ error: "Failed to submit review" });
    }
  });

  app.get("/api/users/:userId/reviews", async (req, res) => {
    try {
      const { userId } = req.params;
      
      const userReviews = await db.execute(sql`
        SELECT 
          ur.*,
          u.display_name as reviewer_name,
          u.email as reviewer_email
        FROM user_reviews ur
        LEFT JOIN users u ON u.id = ur.reviewer_id
        WHERE ur.reviewed_user_id = ${userId}
        ORDER BY ur.created_at DESC
      `);

      res.json(userReviews.rows);
    } catch (error) {
      console.error("Error fetching user reviews:", error);
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  const httpServer = createServer(app);
  
  // Setup WebSocket for real-time messaging
  try {
    const { setupWebSocket } = await import('./websocket');
    setupWebSocket(httpServer);
  } catch (error) {
    console.error('WebSocket setup failed:', error);
  }

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
