import { apiClient } from '@/lib/apiClient';

export const createNotificationService = () => {
  // Create notification when user likes a product
  const notifyProductLiked = async (productId: string, productTitle: string) => {
    try {
      // This would be called when a user adds a product to favorites
      // The backend would identify the product owner and send notification
      await apiClient.request(`/products/${productId}/like`, { method: 'POST' });
    } catch (error) {
      console.error('Error creating like notification:', error);
    }
  };

  // Create notification when product is updated
  const notifyProductUpdated = async (productId: string, productTitle: string) => {
    try {
      await apiClient.request(`/products/${productId}/update-notification`, { method: 'POST' });
    } catch (error) {
      console.error('Error creating update notification:', error);
    }
  };

  return {
    notifyProductLiked,
    notifyProductUpdated,
  };
};

export const notificationService = createNotificationService();