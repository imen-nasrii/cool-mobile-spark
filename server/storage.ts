import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, desc, and, count, ilike, or, sql } from "drizzle-orm";
import { 
  users, profiles, categories, products, messages, notifications, favorites, product_views, search_logs,
  type User, type InsertUser,
  type Profile, type InsertProfile,
  type Category, type InsertCategory,
  type Product, type InsertProduct,
  type Message, type InsertMessage,
  type Notification, type InsertNotification,
  type Favorite, type InsertFavorite,
  type ProductView, type InsertProductView,
  type SearchLog, type InsertSearchLog
} from "@shared/schema";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client);

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Profiles
  getProfile(userId: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(userId: string, profile: Partial<InsertProfile>): Promise<Profile | undefined>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Products - Enhanced
  getProducts(filters?: { category?: string; search?: string; sortBy?: string }): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getUserProducts(userId: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  searchProducts(query: string): Promise<Product[]>;
  
  // Messages
  getProductMessages(productId: string, userId: string): Promise<Message[]>;
  getUserMessages(userId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: string): Promise<boolean>;
  
  // Dashboard
  getDashboardStats(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  // Profiles
  async getProfile(userId: string): Promise<Profile | undefined> {
    const result = await db.select().from(profiles).where(eq(profiles.user_id, userId)).limit(1);
    return result[0];
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const result = await db.insert(profiles).values(profile).returning();
    return result[0];
  }

  async updateProfile(userId: string, profile: Partial<InsertProfile>): Promise<Profile | undefined> {
    const result = await db.update(profiles)
      .set({ ...profile, updated_at: new Date() })
      .where(eq(profiles.user_id, userId))
      .returning();
    return result[0];
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(category).returning();
    return result[0];
  }

  // Products - Enhanced with filtering
  async getProducts(filters?: {
    category?: string;
    search?: string;
    sortBy?: string;
  }): Promise<Product[]> {
    let query = db.select().from(products);
    
    const conditions = [];
    
    if (filters?.category && filters.category.trim() !== '') {
      conditions.push(eq(products.category, filters.category));
    }
    
    if (filters?.search && filters.search.trim() !== '') {
      const searchTerm = `%${filters.search.toLowerCase()}%`;
      conditions.push(
        or(
          ilike(products.title, searchTerm),
          ilike(products.description, searchTerm),
          ilike(products.location, searchTerm),
          ilike(products.category, searchTerm)
        )
      );
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(products.created_at));
  }

  async searchProducts(query: string): Promise<Product[]> {
    const searchTerm = `%${query.toLowerCase()}%`;
    return await db.select().from(products)
      .where(
        or(
          ilike(products.title, searchTerm),
          ilike(products.description, searchTerm),
          ilike(products.location, searchTerm),
          ilike(products.category, searchTerm)
        )
      )
      .orderBy(desc(products.created_at))
      .limit(20);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  }

  async getUserProducts(userId: string): Promise<Product[]> {
    return await db.select().from(products)
      .where(eq(products.user_id, userId))
      .orderBy(desc(products.created_at));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(product).returning();
    return result[0];
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const result = await db.update(products)
      .set({ ...product, updated_at: new Date() })
      .where(eq(products.id, id))
      .returning();
    return result[0];
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return result.length > 0;
  }

  // Messages
  async getProductMessages(productId: string, userId: string): Promise<Message[]> {
    return await db.select().from(messages)
      .where(eq(messages.product_id, productId))
      .orderBy(messages.created_at);
  }

  async getUserMessages(userId: string): Promise<Message[]> {
    return await db.select().from(messages)
      .where(eq(messages.recipient_id, userId))
      .orderBy(desc(messages.created_at));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const result = await db.insert(messages).values(message).returning();
    
    // Vérifier le nombre de messages pour ce produit
    const messageCount = await db
      .select()
      .from(messages)
      .where(eq(messages.product_id, message.product_id));
    
    // Si le produit a maintenant 5 messages ou plus, le promouvoir automatiquement
    if (messageCount.length >= 5) {
      await db
        .update(products)
        .set({ is_promoted: true })
        .where(eq(products.id, message.product_id));
      
      console.log(`Produit ${message.product_id} promu automatiquement après ${messageCount.length} messages`);
    }
    
    return result[0];
  }

  async markMessageAsRead(id: string): Promise<boolean> {
    const result = await db.update(messages)
      .set({ is_read: true })
      .where(eq(messages.id, id));
    return result.length > 0;
  }

  // Dashboard
  async getDashboardStats(): Promise<any> {
    try {
      // Get total counts
      const totalProducts = await db.select().from(products);
      const totalUsers = await db.select().from(users);
      const totalCategories = await db.select().from(categories);

      // Get category distribution
      const categoryStats: Record<string, number> = {};
      totalProducts.forEach(product => {
        const category = product.category || 'Autre';
        categoryStats[category] = (categoryStats[category] || 0) + 1;
      });

      // Calculate revenue (calculation for paid products in TND)
      const totalRevenue = totalProducts.reduce((sum, product) => {
        const price = parseFloat(product.price?.replace(/[TND,\s]/g, '') || '0');
        return sum + price;
      }, 0);

      // Pas de données de ventes fictives

      return {
        totalProducts: totalProducts.length,
        totalUsers: totalUsers.length,
        totalCategories: totalCategories.length,
        monthlyGrowthProducts: 0,
        monthlySales: 0,
        monthlyGrowthSales: 0,
        revenue: totalRevenue,
        monthlyGrowthRevenue: 0,
        activeUsers: totalUsers.length,
        monthlyGrowthUsers: 0,
        categoryDistribution: categoryStats,
        salesTrends: [],
        topCategories: Object.entries(categoryStats)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([name, count]) => ({ 
            name, 
            count, 
            percentage: Math.round((count / totalProducts.length) * 100) 
          })),
        trafficData: []
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
