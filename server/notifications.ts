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
    
    return result.rowCount > 0;
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await db
      .update(notifications)
      .set({ is_read: true })
      .where(and(
        eq(notifications.user_id, userId),
        eq(notifications.is_read, false)
      ));
    
    return result.rowCount;
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
    
    return result.rowCount > 0;
  }

  // Helper methods to create specific types of notifications
  async notifyNewMessage(receiverId: string, senderName: string, conversationId: string): Promise<void> {
    await this.createNotification({
      user_id: receiverId,
      title: "Nouveau message",
      message: `${senderName} vous a envoyé un message`,
      type: "message",
      related_id: conversationId,
      is_read: false
    });
  }

  async notifyProductLiked(ownerId: string, productTitle: string, productId: string): Promise<void> {
    await this.createNotification({
      user_id: ownerId,
      title: "Nouveau favori",
      message: `Quelqu'un a ajouté "${productTitle}" aux favoris`,
      type: "like",
      related_id: productId,
      is_read: false
    });
  }

  async notifyProductUpdated(userId: string, productTitle: string, productId: string): Promise<void> {
    await this.createNotification({
      user_id: userId,
      title: "Produit mis à jour",
      message: `Votre produit "${productTitle}" a été mis à jour`,
      type: "product_update",
      related_id: productId,
      is_read: false
    });
  }
}

export const notificationService = new NotificationService();