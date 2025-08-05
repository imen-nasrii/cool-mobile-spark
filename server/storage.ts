import { db } from "./db";
import { eq, desc, or, sql, and, isNull } from "drizzle-orm";
import { 
  users, profiles, categories, products, advertisements, product_likes,
  type User, type InsertUser,
  type Profile, type InsertProfile,
  type Category, type InsertCategory,
  type Product, type InsertProduct,
  type Advertisement, type InsertAdvertisement
} from "@shared/schema";

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
  
  // Products
  getProducts(category?: string, search?: string): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getUserProducts(userId: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  
  // Advertisements
  getAdvertisements(position?: string, category?: string): Promise<Advertisement[]>;
  trackAdImpression(adId: string): Promise<void>;
  trackAdClick(adId: string): Promise<void>;
  
  // Likes
  getUserProductLike(userId: string, productId: string): Promise<any>;
  addProductLike(userId: string, productId: string): Promise<void>;
  updateProductLikes(productId: string): Promise<Product | undefined>;
  
  // Legacy message methods removed - use MessagingService instead
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

  // Products
  async getProducts(category?: string, search?: string): Promise<Product[]> {
    console.log('Storage.getProducts called with category:', category, 'search:', search);
    let rawProducts: Product[] = [];
    
    if (category && search) {
      const searchTerm = `%${search.toLowerCase()}%`;
      rawProducts = await db.select().from(products)
        .where(
          sql`${products.category} = ${category} AND (
            LOWER(${products.title}) LIKE ${searchTerm} OR
            LOWER(${products.description}) LIKE ${searchTerm} OR
            LOWER(${products.category}) LIKE ${searchTerm} OR
            LOWER(${products.location}) LIKE ${searchTerm}
          )`
        )
        .orderBy(desc(products.created_at));
    } else if (category) {
      rawProducts = await db.select().from(products)
        .where(eq(products.category, category))
        .orderBy(desc(products.created_at));
    } else if (search) {
      const searchTerm = `%${search.toLowerCase()}%`;
      rawProducts = await db.select().from(products)
        .where(
          or(
            sql`LOWER(${products.title}) LIKE ${searchTerm}`,
            sql`LOWER(${products.description}) LIKE ${searchTerm}`,
            sql`LOWER(${products.category}) LIKE ${searchTerm}`,
            sql`LOWER(${products.location}) LIKE ${searchTerm}`
          )
        )
        .orderBy(desc(products.created_at));
    } else {
      rawProducts = await db.select().from(products).orderBy(desc(products.created_at));
    }
    
    // Map database fields to frontend properties for all products
    return rawProducts.map(product => ({
      ...product,
      year: product.car_year,
      mileage: product.car_mileage,
      fuel_type: product.car_fuel_type,
      transmission: product.car_transmission,
      condition: product.car_condition,
      color: product.car_color,
      doors: product.car_doors,
      power: product.car_engine_size,
      // Real estate mappings
      rooms: product.real_estate_rooms,
      surface: product.real_estate_surface,
      property_type: product.real_estate_type,
      // Job mappings
      contract_type: product.job_type,
      salary_range: product.job_salary_min && product.job_salary_max ? 
        `${product.job_salary_min}-${product.job_salary_max}€` : null
    }));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    const product = result[0];
    
    if (!product) return undefined;
    
    // Map car database fields to frontend properties (explicitly typed as any for flexibility)
    return {
      ...product,
      year: product.car_year,
      fuel_type: product.car_fuel_type,
      transmission: product.car_transmission,
      condition: product.car_condition,
      color: product.car_color,
      doors: product.car_doors,
      power: product.car_engine_size,
      // Real estate mappings
      rooms: product.real_estate_rooms,
      surface: product.real_estate_surface,
      property_type: product.real_estate_type,
      // Job mappings
      contract_type: product.job_type,
      salary_range: product.job_salary_min && product.job_salary_max ? 
        `${product.job_salary_min}-${product.job_salary_max}€` : null
    } as any;
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
    try {
      const result = await db.delete(products).where(eq(products.id, id));
      return Array.isArray(result) ? result.length > 0 : true;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  }
  
  // Advertisements
  async getAdvertisements(position?: string, category?: string): Promise<Advertisement[]> {
    let conditions = [eq(advertisements.is_active, true)];
    
    if (position) {
      conditions.push(eq(advertisements.position, position));
    }
    if (category && category !== 'all') {
      conditions.push(or(eq(advertisements.category, category), isNull(advertisements.category)));
    }
    
    // Build the where clause properly
    const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);
    
    return await db.select().from(advertisements)
      .where(whereClause)
      .orderBy(desc(advertisements.created_at));
  }

  async trackAdImpression(adId: string): Promise<void> {
    await db.update(advertisements)
      .set({ impression_count: sql`${advertisements.impression_count} + 1` })
      .where(eq(advertisements.id, adId));
  }

  async trackAdClick(adId: string): Promise<void> {
    await db.update(advertisements)
      .set({ 
        click_count: sql`${advertisements.click_count} + 1`,
        impression_count: sql`${advertisements.impression_count} + 1`
      })
      .where(eq(advertisements.id, adId));
  }
  
  // Likes
  async getUserProductLike(userId: string, productId: string): Promise<any> {
    const result = await db.select().from(product_likes)
      .where(sql`${product_likes.user_id} = ${userId} AND ${product_likes.product_id} = ${productId}`)
      .limit(1);
    return result[0];
  }

  async addProductLike(userId: string, productId: string): Promise<void> {
    await db.insert(product_likes).values({
      user_id: userId,
      product_id: productId
    });
  }

  async updateProductLikes(productId: string): Promise<Product | undefined> {
    // Count total likes for this product
    const likesResult = await db.select({
      count: sql<number>`count(*)`
    }).from(product_likes).where(eq(product_likes.product_id, productId));
    
    const likeCount = likesResult[0]?.count || 0;
    
    // Update product like count
    const result = await db.update(products)
      .set({ 
        like_count: likeCount,
        updated_at: new Date()
      })
      .where(eq(products.id, productId))
      .returning();
    
    return result[0];
  }

  // Legacy message methods removed - use MessagingService instead
}

export const storage = new DatabaseStorage();
