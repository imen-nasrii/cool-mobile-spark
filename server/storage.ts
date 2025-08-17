import { db } from "./db";
import { eq, desc, or, sql, and, isNull } from "drizzle-orm";
import NodeCache from "node-cache";

// Initialize local cache for storage operations
const storageCache = new NodeCache({
  stdTTL: 180, // 3 minutes for frequent data
  checkperiod: 30,
});
import { 
  users, profiles, categories, products, advertisements, product_likes, product_ratings, user_preferences,
  type User, type InsertUser,
  type Profile, type InsertProfile,
  type Category, type InsertCategory,
  type Product, type InsertProduct,
  type Advertisement, type InsertAdvertisement,
  type ProductRating, type InsertProductRating,
  type UserPreferences, type InsertUserPreferences
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
  
  // User Preferences
  getUserPreferences(userId: string): Promise<UserPreferences | undefined>;
  createUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences>;
  updateUserPreferences(userId: string, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences | undefined>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Products
  getProducts(category?: string, search?: string, limit?: number, offset?: number): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getUserProducts(userId: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  incrementProductViews(id: string): Promise<void>;
  
  // Product ratings
  rateProduct(productId: string, userId: string, rating: number): Promise<void>;
  getUserRatingForProduct(productId: string, userId: string): Promise<number | null>;
  updateProductRatingStats(productId: string): Promise<void>;
  
  // Advertisements
  getAdvertisements(position?: string, category?: string): Promise<Advertisement[]>;
  createAdvertisement(advertisement: InsertAdvertisement): Promise<Advertisement>;
  trackAdImpression(adId: string): Promise<void>;
  trackAdClick(adId: string): Promise<void>;
  deleteAdvertisement(adId: string): Promise<boolean>;
  deactivateAdvertisement(adId: string): Promise<boolean>;
  
  // Likes
  getUserProductLike(userId: string, productId: string): Promise<any>;
  addProductLike(userId: string, productId: string): Promise<void>;
  updateProductLikes(productId: string): Promise<Product | undefined>;
  
  // Advertisement methods
  getAllAdvertisements(): Promise<Advertisement[]>;
  
  // Admin statistics methods
  getAdminStats(): Promise<{
    totalProducts: number;
    totalUsers: number;
    totalCategories: number;
    totalAdvertisements: number;
    activeUsers: number;
    recentProducts: number;
    totalLikes: number;
    promotedProducts: number;
  }>;
  
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
    
    // If no profile exists, create one with default values
    if (!result[0]) {
      try {
        const newProfile = await db.insert(profiles).values({
          user_id: userId
        }).returning();
        return newProfile[0];
      } catch (error) {
        console.error('Error creating default profile:', error);
        return undefined;
      }
    }
    
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

  // User Preferences
  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    const result = await db.select().from(user_preferences).where(eq(user_preferences.user_id, userId)).limit(1);
    
    // If no preferences exist, create default ones
    if (!result[0]) {
      try {
        const defaultPreferences = await db.insert(user_preferences).values({
          user_id: userId
        }).returning();
        return defaultPreferences[0];
      } catch (error) {
        console.error('Error creating default preferences:', error);
        return undefined;
      }
    }
    
    return result[0];
  }

  async createUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences> {
    const result = await db.insert(user_preferences).values(preferences).returning();
    return result[0];
  }

  async updateUserPreferences(userId: string, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences | undefined> {
    const result = await db.update(user_preferences)
      .set({ ...preferences, updated_at: new Date() })
      .where(eq(user_preferences.user_id, userId))
      .returning();
    return result[0];
  }

  // Categories with caching
  async getCategories(): Promise<Category[]> {
    const cacheKey = 'categories_all';
    const cached = storageCache.get(cacheKey);
    if (cached) {
      return cached as Category[];
    }
    
    const categories_data = await db.select().from(categories).orderBy(categories.name);
    storageCache.set(cacheKey, categories_data, 600); // Cache for 10 minutes
    return categories_data;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(category).returning();
    return result[0];
  }

  // Products
  async getProducts(category?: string, search?: string, limit: number = 20, offset: number = 0): Promise<Product[]> {
    console.log('Storage.getProducts called with category:', category, 'search:', search, 'limit:', limit, 'offset:', offset);
    let rawProducts: any[] = [];
    
    const baseSelect = {
      id: products.id,
      title: products.title,
      description: products.description,
      price: products.price,
      location: products.location,
      category: products.category,
      image_url: products.image_url,
      images: products.images,
      is_promoted: products.is_promoted,
      is_reserved: products.is_reserved,
      is_free: products.is_free,
      is_advertisement: products.is_advertisement,
      like_count: products.like_count,
      view_count: products.view_count,
      rating: products.rating,
      created_at: products.created_at,
      updated_at: products.updated_at,
      user_id: products.user_id,
      // Car fields
      car_year: products.car_year,
      car_mileage: products.car_mileage,
      car_fuel_type: products.car_fuel_type,
      car_transmission: products.car_transmission,
      car_condition: products.car_condition,
      car_color: products.car_color,
      car_doors: products.car_doors,
      car_engine_size: products.car_engine_size,
      // Real estate fields
      real_estate_rooms: products.real_estate_rooms,
      real_estate_surface: products.real_estate_surface,
      real_estate_type: products.real_estate_type,
      // Job fields
      job_type: products.job_type,
      job_sector: products.job_sector,
      job_experience: products.job_experience,
      job_salary_min: products.job_salary_min,
      job_salary_max: products.job_salary_max
    };

    if (category && search) {
      const searchTerm = `%${search.toLowerCase()}%`;
      rawProducts = await db.select(baseSelect).from(products)
        .where(
          sql`${products.category} = ${category} AND (
            LOWER(${products.title}) LIKE ${searchTerm} OR
            LOWER(${products.description}) LIKE ${searchTerm} OR
            LOWER(${products.category}) LIKE ${searchTerm} OR
            LOWER(${products.location}) LIKE ${searchTerm}
          )`
        )
        .orderBy(desc(products.created_at))
        .limit(limit)
        .offset(offset);
    } else if (category) {
      rawProducts = await db.select(baseSelect).from(products)
        .where(eq(products.category, category))
        .orderBy(desc(products.created_at))
        .limit(limit)
        .offset(offset);
    } else if (search) {
      const searchTerm = `%${search.toLowerCase()}%`;
      rawProducts = await db.select(baseSelect).from(products)
        .where(
          or(
            sql`LOWER(${products.title}) LIKE ${searchTerm}`,
            sql`LOWER(${products.description}) LIKE ${searchTerm}`,
            sql`LOWER(${products.category}) LIKE ${searchTerm}`,
            sql`LOWER(${products.location}) LIKE ${searchTerm}`
          )
        )
        .orderBy(desc(products.created_at))
        .limit(limit)
        .offset(offset);
    } else {
      rawProducts = await db.select(baseSelect).from(products)
        .orderBy(desc(products.created_at))
        .limit(limit)
        .offset(offset);
    }
    
    // Map the fields to frontend format and cache the results
    const results = rawProducts.map(product => ({
      ...product,
      // Map car database fields to frontend properties
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
      job_type: product.job_type,
      job_sector: product.job_sector,
      job_experience: product.job_experience,
      job_salary_min: product.job_salary_min,
      job_salary_max: product.job_salary_max
    })) as Product[];
    
    const cacheKey = `products_${category || 'all'}_${search || 'none'}_${limit}_${offset}`;
    storageCache.set(cacheKey, results, 120); // Cache for 2 minutes
    
    return results;
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

  async incrementProductViews(id: string): Promise<void> {
    try {
      await db.update(products)
        .set({ 
          view_count: sql`${products.view_count} + 1`,
          updated_at: new Date()
        })
        .where(eq(products.id, id));
    } catch (error) {
      console.error('Error incrementing product views:', error);
    }
  }

  async rateProduct(productId: string, userId: string, rating: number): Promise<void> {
    try {
      // Check if user already rated this product
      const existingRating = await db.select().from(product_ratings)
        .where(and(eq(product_ratings.product_id, productId), eq(product_ratings.user_id, userId)))
        .limit(1);

      if (existingRating.length > 0) {
        // Update existing rating
        await db.update(product_ratings)
          .set({ rating })
          .where(and(eq(product_ratings.product_id, productId), eq(product_ratings.user_id, userId)));
      } else {
        // Create new rating
        await db.insert(product_ratings).values({
          product_id: productId,
          user_id: userId,
          rating
        });
      }

      // Update product rating stats
      await this.updateProductRatingStats(productId);
    } catch (error) {
      console.error('Error rating product:', error);
      throw error;
    }
  }

  async getUserRatingForProduct(productId: string, userId: string): Promise<number | null> {
    try {
      const result = await db.select().from(product_ratings)
        .where(and(eq(product_ratings.product_id, productId), eq(product_ratings.user_id, userId)))
        .limit(1);
      
      return result.length > 0 ? result[0].rating : null;
    } catch (error) {
      console.error('Error getting user rating:', error);
      return null;
    }
  }

  async updateProductRatingStats(productId: string): Promise<void> {
    try {
      // Calculate average rating and count
      const result = await db.select({
        avg_rating: sql<number>`AVG(${product_ratings.rating})`,
        count: sql<number>`COUNT(*)::integer`
      }).from(product_ratings).where(eq(product_ratings.product_id, productId));

      const stats = result[0];
      const avgRating = stats?.avg_rating ? Number(stats.avg_rating) : 0;
      const ratingCount = stats?.count || 0;

      // Update product table
      await db.update(products)
        .set({ 
          rating: avgRating,
          rating_count: ratingCount,
          updated_at: new Date()
        })
        .where(eq(products.id, productId));
    } catch (error) {
      console.error('Error updating product rating stats:', error);
    }
  }
  
  // Advertisements
  async getAdvertisements(position?: string, category?: string): Promise<Advertisement[]> {
    let conditions = [eq(advertisements.is_active, true)];
    
    if (position) {
      conditions.push(eq(advertisements.position, position));
    }
    if (category && category !== 'all') {
      const categoryCondition = or(eq(advertisements.category, category), isNull(advertisements.category));
      if (categoryCondition) {
        conditions.push(categoryCondition);
      }
    }
    
    // Build the where clause properly
    const query = db.select().from(advertisements);
    
    if (conditions.length === 1) {
      return query.where(conditions[0]).orderBy(desc(advertisements.created_at));
    } else if (conditions.length > 1) {
      return query.where(and(...conditions)).orderBy(desc(advertisements.created_at));
    } else {
      return query.orderBy(desc(advertisements.created_at));
    }
  }

  async getAllAdvertisements(): Promise<Advertisement[]> {
    return await db.select().from(advertisements)
      .orderBy(desc(advertisements.created_at));
  }

  async getAdminStats() {
    try {
      const [productsCount] = await db.select({ count: sql`count(*)` }).from(products);
      const [usersCount] = await db.select({ count: sql`count(*)` }).from(users);
      const [categoriesCount] = await db.select({ count: sql`count(*)` }).from(categories);
      const [advertisementsCount] = await db.select({ count: sql`count(*)` }).from(advertisements);
      const [likesCount] = await db.select({ count: sql`count(*)` }).from(product_likes);
      const [promotedCount] = await db.select({ count: sql`count(*)` }).from(products).where(eq(products.is_promoted, true));
      
      // Recent products (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const [recentCount] = await db.select({ count: sql`count(*)` }).from(products)
        .where(sql`${products.created_at} >= ${thirtyDaysAgo}`);
      
      // Active users (users who created products in last 30 days)
      const [activeUsersCount] = await db.select({ count: sql`count(distinct ${products.user_id})` }).from(products)
        .where(sql`${products.created_at} >= ${thirtyDaysAgo}`);

      return {
        totalProducts: Number(productsCount.count),
        totalUsers: Number(usersCount.count),
        totalCategories: Number(categoriesCount.count),
        totalAdvertisements: Number(advertisementsCount.count),
        totalLikes: Number(likesCount.count),
        promotedProducts: Number(promotedCount.count),
        recentProducts: Number(recentCount.count),
        activeUsers: Number(activeUsersCount.count),
      };
    } catch (error) {
      console.error('Error getting admin stats:', error);
      return {
        totalProducts: 0,
        totalUsers: 0,
        totalCategories: 0,
        totalAdvertisements: 0,
        totalLikes: 0,
        promotedProducts: 0,
        recentProducts: 0,
        activeUsers: 0,
      };
    }
  }

  async trackAdImpression(adId: string): Promise<void> {
    await db.update(advertisements)
      .set({ impression_count: sql`${advertisements.impression_count} + 1` })
      .where(eq(advertisements.id, adId));
  }

  async createAdvertisement(advertisement: InsertAdvertisement): Promise<Advertisement> {
    const result = await db.insert(advertisements).values(advertisement).returning();
    return result[0];
  }

  async trackAdClick(adId: string): Promise<void> {
    await db.update(advertisements)
      .set({ 
        click_count: sql`${advertisements.click_count} + 1`,
        impression_count: sql`${advertisements.impression_count} + 1`
      })
      .where(eq(advertisements.id, adId));
  }

  async deleteAdvertisement(adId: string): Promise<boolean> {
    try {
      const result = await db.delete(advertisements).where(eq(advertisements.id, adId));
      return Array.isArray(result) ? result.length > 0 : true;
    } catch (error) {
      console.error('Error deleting advertisement:', error);
      return false;
    }
  }

  async deactivateAdvertisement(adId: string): Promise<boolean> {
    try {
      const result = await db.update(advertisements)
        .set({ is_active: false })
        .where(eq(advertisements.id, adId));
      return Array.isArray(result) ? result.length > 0 : true;
    } catch (error) {
      console.error('Error deactivating advertisement:', error);
      return false;
    }
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
