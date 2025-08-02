import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductOrganizer } from '@/components/Products/ProductOrganizer';
import { useToast } from '@/hooks/use-toast';

export const OrganizedProducts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const handleProductLike = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        toast({
          title: "Produit aimé !",
          description: "Vous avez aimé ce produit"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'aimer ce produit",
        variant: "destructive"
      });
    }
  };

  const handleProductMessage = (productId: string) => {
    navigate(`/messages?product=${productId}`);
    toast({
      title: "Redirection vers les messages",
      description: "Ouverture de la conversation avec le vendeur"
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Tous les Produits
          </h1>
          <p className="text-gray-600">
            Explorez et filtrez tous les produits disponibles sur la plateforme
          </p>
        </div>
        
        <ProductOrganizer
          onProductClick={handleProductClick}
          onProductLike={handleProductLike}
          onProductMessage={handleProductMessage}
        />
      </div>
    </div>
  );
};