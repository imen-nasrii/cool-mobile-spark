import { db } from "./db";
import { products, notifications, product_likes } from "@shared/schema";
import { eq, and, count } from "drizzle-orm";
import { notificationService } from "./notifications";

export class PromotionService {
  
  async checkAndPromoteProduct(productId: string): Promise<boolean> {
    // Get product details
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (product.length === 0) {
      return false;
    }

    const currentProduct = product[0];
    
    // Check if product has 3 or more likes and is not already promoted
    if (currentProduct.like_count >= 3 && !currentProduct.is_promoted) {
      // Promote the product
      await db
        .update(products)
        .set({ 
          is_promoted: true,
          promoted_at: new Date()
        })
        .where(eq(products.id, productId));

      // Notify product owner if user_id exists
      if (currentProduct.user_id) {
        await notificationService.createNotification({
          user_id: currentProduct.user_id,
          title: "🎉 Produit promu !",
          message: `Félicitations ! Votre produit "${currentProduct.title}" a été automatiquement promu après avoir reçu 3 j'aimes !`,
          type: "product_update",
          related_id: productId,
          is_read: false
        });
      }

      console.log(`Product ${productId} automatically promoted after reaching 3 likes`);
      return true;
    }

    return false;
  }

  async addLikeAndCheckPromotion(productId: string, userId: string): Promise<void> {
    // Check if user already liked this product
    const existingLike = await db
      .select()
      .from(product_likes)
      .where(and(
        eq(product_likes.product_id, productId),
        eq(product_likes.user_id, userId)
      ))
      .limit(1);

    if (existingLike.length > 0) {
      throw new Error("Vous avez déjà aimé ce produit");
    }

    // Add the like
    await db.insert(product_likes).values({
      product_id: productId,
      user_id: userId
    });

    // Count total likes for this product
    const likeCountResult = await db
      .select({ count: count() })
      .from(product_likes)
      .where(eq(product_likes.product_id, productId));

    const newLikeCount = likeCountResult[0]?.count || 0;

    // Update like count in products table
    await db
      .update(products)
      .set({ 
        like_count: newLikeCount 
      })
      .where(eq(products.id, productId));

    // Check for automatic promotion
    await this.checkAndPromoteProduct(productId);
  }

  async hasUserLikedProduct(productId: string, userId: string): Promise<boolean> {
    const like = await db
      .select()
      .from(product_likes)
      .where(and(
        eq(product_likes.product_id, productId),
        eq(product_likes.user_id, userId)
      ))
      .limit(1);

    return like.length > 0;
  }

  async getPromotedProducts(): Promise<any[]> {
    return db
      .select()
      .from(products)
      .where(eq(products.is_promoted, true))
      .orderBy(products.created_at);
  }
}

export const promotionService = new PromotionService();