import { db } from "./db";
import { notifications, users, products } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import type { Notification, InsertNotification } from "@shared/schema";

export class NotificationService {
  
  async createNotification(data: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(data)
      .returning();
    
    return notification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.user_id, userId))
      .orderBy(desc(notifications.created_at));
  }

  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ is_read: true })
      .where(and(
        eq(notifications.id, notificationId),
        eq(notifications.user_id, userId)
      ));
    
    return (result.rowCount || 0) > 0;
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await db
      .update(notifications)
      .set({ is_read: true })
      .where(and(
        eq(notifications.user_id, userId),
        eq(notifications.is_read, false)
      ));
    
    return result.rowCount || 0;
  }

  async getUnreadCount(userId: string): Promise<number> {
    const result = await db
      .select()
      .from(notifications)
      .where(and(
        eq(notifications.user_id, userId),
        eq(notifications.is_read, false)
      ));
    
    return result.length;
  }

  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(notifications)
      .where(and(
        eq(notifications.id, notificationId),
        eq(notifications.user_id, userId)
      ));
    
    return (result.rowCount || 0) > 0;
  }

  // Helper methods to create specific types of notifications
  async notifyNewMessage(receiverId: string, senderName: string, conversationId: string): Promise<void> {
    await this.createNotification({
      user_id: receiverId,
      title: "💬 Nouveau message",
      message: `${senderName} vous a envoyé un message`,
      type: "message",
      related_id: conversationId,
      is_read: false
    });
  }

  async notifyProductLiked(ownerId: string, productTitle: string, productId: string): Promise<void> {
    await this.createNotification({
      user_id: ownerId,
      title: "❤️ Nouveau favori",
      message: `Quelqu'un a ajouté "${productTitle}" aux favoris`,
      type: "like",
      related_id: productId,
      is_read: false
    });
  }

  async notifyProductRated(ownerId: string, productTitle: string, rating: number, productId: string): Promise<void> {
    const stars = '⭐'.repeat(rating);
    await this.createNotification({
      user_id: ownerId,
      title: "⭐ Nouvelle évaluation",
      message: `Votre produit "${productTitle}" a reçu ${stars} (${rating}/5)`,
      type: "review",
      related_id: productId,
      is_read: false
    });
  }

  async notifyProductSold(ownerId: string, productTitle: string, productId: string): Promise<void> {
    await this.createNotification({
      user_id: ownerId,
      title: "🎉 Produit vendu !",
      message: `Félicitations ! Votre produit "${productTitle}" a trouvé un acheteur`,
      type: "sale",
      related_id: productId,
      is_read: false
    });
  }

  async notifyNewFollower(userId: string, followerName: string): Promise<void> {
    await this.createNotification({
      user_id: userId,
      title: "👥 Nouveau follower",
      message: `${followerName} vous suit maintenant`,
      type: "follow",
      is_read: false
    });
  }

  async notifyPriceChange(interestedUserId: string, productTitle: string, oldPrice: number, newPrice: number, productId: string): Promise<void> {
    const trend = newPrice < oldPrice ? "📉 Baisse de prix" : "📈 Augmentation de prix";
    await this.createNotification({
      user_id: interestedUserId,
      title: trend,
      message: `Le prix de "${productTitle}" est passé de ${oldPrice} TND à ${newPrice} TND`,
      type: "price_change",
      related_id: productId,
      is_read: false
    });
  }

  async notifyProductExpiration(ownerId: string, productTitle: string, daysLeft: number, productId: string): Promise<void> {
    await this.createNotification({
      user_id: ownerId,
      title: "⚠️ Annonce expire bientôt",
      message: `Votre annonce "${productTitle}" expire dans ${daysLeft} jours`,
      type: "expiration",
      related_id: productId,
      is_read: false
    });
  }

  async notifySystemUpdate(userId: string, updateMessage: string): Promise<void> {
    await this.createNotification({
      user_id: userId,
      title: "🔄 Mise à jour système",
      message: updateMessage,
      type: "system",
      is_read: false
    });
  }

  async notifySecurityAlert(userId: string, alertMessage: string): Promise<void> {
    await this.createNotification({
      user_id: userId,
      title: "🔒 Alerte sécurité",
      message: alertMessage,
      type: "security",
      is_read: false
    });
  }

  // Batch operations
  async markAllAsReadByType(userId: string, type: string): Promise<number> {
    const result = await db
      .update(notifications)
      .set({ is_read: true })
      .where(and(
        eq(notifications.user_id, userId),
        eq(notifications.type, type),
        eq(notifications.is_read, false)
      ));
    
    return result.rowCount || 0;
  }

  async deleteAllByType(userId: string, type: string): Promise<number> {
    const result = await db
      .delete(notifications)
      .where(and(
        eq(notifications.user_id, userId),
        eq(notifications.type, type)
      ));
    
    return result.rowCount || 0;
  }

  async getNotificationsByType(userId: string, type: string): Promise<Notification[]> {
    return db
      .select()
      .from(notifications)
      .where(and(
        eq(notifications.user_id, userId),
        eq(notifications.type, type)
      ))
      .orderBy(desc(notifications.created_at));
  }

  async getNotificationStats(userId: string): Promise<any> {
    const allNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.user_id, userId));
    
    const stats = {
      total: allNotifications.length,
      unread: allNotifications.filter(n => !n.is_read).length,
      byType: {} as Record<string, { total: number; unread: number }>
    };
    
    allNotifications.forEach(notification => {
      if (!stats.byType[notification.type]) {
        stats.byType[notification.type] = { total: 0, unread: 0 };
      }
      stats.byType[notification.type].total++;
      if (!notification.is_read) {
        stats.byType[notification.type].unread++;
      }
    });
    
    return stats;
  }
}

export const notificationService = new NotificationService();