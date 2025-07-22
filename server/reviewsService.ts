import { db } from './db';
import { reviews, reviewHelpful, marketingBadges, productStats, users } from '@shared/schema';
import { eq, desc, and, sql, count } from 'drizzle-orm';

export class ReviewService {
  
  // Créer un nouvel avis
  async createReview(reviewData: {
    product_id: string;
    user_id: string;
    rating: number;
    title?: string;
    comment: string;
  }) {
    try {
      const [review] = await db
        .insert(reviews)
        .values({
          ...reviewData,
          is_verified_purchase: false, // TODO: Vérifier si l'utilisateur a acheté le produit
          is_featured: false,
          helpful_count: 0
        })
        .returning();

      // Mettre à jour les statistiques du produit
      await this.updateProductStats(reviewData.product_id);
      
      // Vérifier si on doit créer des badges marketing automatiques
      await this.checkAndCreateMarketingBadges(reviewData.product_id);

      return review;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  // Récupérer les avis d'un produit
  async getProductReviews(productId: string) {
    try {
      const productReviews = await db
        .select({
          id: reviews.id,
          user_id: reviews.user_id,
          username: users.username,
          rating: reviews.rating,
          title: reviews.title,
          comment: reviews.comment,
          is_verified_purchase: reviews.is_verified_purchase,
          is_featured: reviews.is_featured,
          helpful_count: reviews.helpful_count,
          created_at: reviews.created_at,
        })
        .from(reviews)
        .innerJoin(users, eq(reviews.user_id, users.id))
        .where(eq(reviews.product_id, productId))
        .orderBy(desc(reviews.is_featured), desc(reviews.helpful_count), desc(reviews.created_at));

      return productReviews;
    } catch (error) {
      console.error('Error getting product reviews:', error);
      throw error;
    }
  }

  // Marquer un avis comme utile
  async markReviewHelpful(reviewId: string, userId: string) {
    try {
      // Vérifier si l'utilisateur a déjà marqué cet avis comme utile
      const existing = await db
        .select()
        .from(reviewHelpful)
        .where(and(
          eq(reviewHelpful.review_id, reviewId),
          eq(reviewHelpful.user_id, userId)
        ));

      if (existing.length > 0) {
        // Retirer le "utile"
        await db
          .delete(reviewHelpful)
          .where(and(
            eq(reviewHelpful.review_id, reviewId),
            eq(reviewHelpful.user_id, userId)
          ));
        
        // Décrémenter le compteur
        await db
          .update(reviews)
          .set({ 
            helpful_count: sql`${reviews.helpful_count} - 1`
          })
          .where(eq(reviews.id, reviewId));
          
        return false; // Removed helpful
      } else {
        // Ajouter le "utile"
        await db
          .insert(reviewHelpful)
          .values({ review_id: reviewId, user_id: userId });
        
        // Incrémenter le compteur
        await db
          .update(reviews)
          .set({ 
            helpful_count: sql`${reviews.helpful_count} + 1`
          })
          .where(eq(reviews.id, reviewId));
          
        return true; // Added helpful
      }
    } catch (error) {
      console.error('Error marking review helpful:', error);
      throw error;
    }
  }

  // Obtenir les statistiques d'un produit
  async getProductStats(productId: string) {
    try {
      const stats = await db
        .select({
          total_reviews: count(),
          average_rating: sql<number>`AVG(${reviews.rating})::float`,
          rating_1: sql<number>`SUM(CASE WHEN ${reviews.rating} = 1 THEN 1 ELSE 0 END)`,
          rating_2: sql<number>`SUM(CASE WHEN ${reviews.rating} = 2 THEN 1 ELSE 0 END)`,
          rating_3: sql<number>`SUM(CASE WHEN ${reviews.rating} = 3 THEN 1 ELSE 0 END)`,
          rating_4: sql<number>`SUM(CASE WHEN ${reviews.rating} = 4 THEN 1 ELSE 0 END)`,
          rating_5: sql<number>`SUM(CASE WHEN ${reviews.rating} = 5 THEN 1 ELSE 0 END)`,
        })
        .from(reviews)
        .where(eq(reviews.product_id, productId));

      const result = stats[0];
      
      return {
        total_reviews: result.total_reviews || 0,
        average_rating: result.average_rating || 0,
        rating_distribution: {
          1: Number(result.rating_1) || 0,
          2: Number(result.rating_2) || 0,
          3: Number(result.rating_3) || 0,
          4: Number(result.rating_4) || 0,
          5: Number(result.rating_5) || 0,
        }
      };
    } catch (error) {
      console.error('Error getting product stats:', error);
      throw error;
    }
  }

  // Mettre à jour les statistiques du produit dans la table productStats
  async updateProductStats(productId: string) {
    try {
      const stats = await this.getProductStats(productId);
      
      await db
        .insert(productStats)
        .values({
          product_id: productId,
          total_reviews: stats.total_reviews,
          average_rating: stats.average_rating,
          updated_at: new Date()
        })
        .onConflictDoNothing();
    } catch (error) {
      console.error('Error updating product stats:', error);
      throw error;
    }
  }

  // Obtenir les badges marketing d'un produit
  async getProductMarketingBadges(productId: string) {
    try {
      const badges = await db
        .select()
        .from(marketingBadges)
        .where(and(
          eq(marketingBadges.product_id, productId),
          eq(marketingBadges.is_active, true)
        ))
        .orderBy(desc(marketingBadges.priority));

      return badges;
    } catch (error) {
      console.error('Error getting marketing badges:', error);
      throw error;
    }
  }

  // Créer des badges marketing automatiques basés sur les performances
  async checkAndCreateMarketingBadges(productId: string) {
    try {
      const stats = await this.getProductStats(productId);
      
      // Badge "Bestseller" si plus de 10 avis avec moyenne > 4.5
      if (stats.total_reviews >= 10 && stats.average_rating >= 4.5) {
        await this.createMarketingBadge(productId, {
          badge_type: 'bestseller',
          badge_text: '⭐ Best-seller',
          badge_color: 'orange',
          priority: 5
        });
      }
      
      // Badge "Popular" si plus de 5 avis
      if (stats.total_reviews >= 5 && stats.average_rating >= 4.0) {
        await this.createMarketingBadge(productId, {
          badge_type: 'popular',
          badge_text: '🔥 Populaire',
          badge_color: 'red',
          priority: 3
        });
      }
      
      // Badge "Excellent Reviews" si moyenne très élevée
      if (stats.total_reviews >= 3 && stats.average_rating >= 4.8) {
        await this.createMarketingBadge(productId, {
          badge_type: 'verified',
          badge_text: '✅ Excellent',
          badge_color: 'green',
          priority: 4
        });
      }
      
    } catch (error) {
      console.error('Error checking marketing badges:', error);
      throw error;
    }
  }

  // Créer un badge marketing
  async createMarketingBadge(productId: string, badgeData: {
    badge_type: string;
    badge_text: string;
    badge_color: string;
    priority: number;
    expires_at?: Date;
  }) {
    try {
      // Vérifier si le badge existe déjà
      const existing = await db
        .select()
        .from(marketingBadges)
        .where(and(
          eq(marketingBadges.product_id, productId),
          eq(marketingBadges.badge_type, badgeData.badge_type)
        ));

      if (existing.length === 0) {
        await db
          .insert(marketingBadges)
          .values({
            product_id: productId,
            ...badgeData,
            is_active: true
          });
      }
    } catch (error) {
      console.error('Error creating marketing badge:', error);
      throw error;
    }
  }
}

export const reviewService = new ReviewService();