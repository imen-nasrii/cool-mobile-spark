import { db } from "./db";
import { products, notifications } from "@shared/schema";
import { eq } from "drizzle-orm";
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

      // Notify product owner
      await notificationService.createNotification({
        user_id: currentProduct.user_id,
        title: "🎉 Produit promu !",
        message: `Félicitations ! Votre produit "${currentProduct.title}" a été automatiquement promu après avoir reçu 3 j'aimes !`,
        type: "product_update",
        related_id: productId,
        is_read: false
      });

      console.log(`Product ${productId} automatically promoted after reaching 3 likes`);
      return true;
    }

    return false;
  }

  async incrementLikeAndCheckPromotion(productId: string): Promise<void> {
    // Get current like count and increment it
    const currentProduct = await db
      .select({ like_count: products.like_count })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (currentProduct.length === 0) {
      throw new Error("Product not found");
    }

    const newLikeCount = currentProduct[0].like_count + 1;

    // Update like count
    await db
      .update(products)
      .set({ 
        like_count: newLikeCount 
      })
      .where(eq(products.id, productId));

    // Check for automatic promotion
    await this.checkAndPromoteProduct(productId);
  }

  async getPromotedProducts(): Promise<any[]> {
    return db
      .select()
      .from(products)
      .where(eq(products.is_promoted, true))
      .orderBy(products.promoted_at);
  }
}

export const promotionService = new PromotionService();