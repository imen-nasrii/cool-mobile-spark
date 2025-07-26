import { useState } from "react";
import { ArrowLeft, Heart, Star, Trophy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient, queryClient } from "@/lib/queryClient";
import { useNavigate } from "react-router-dom";

export const TestPromotion = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  // Get all products
  const { data: products, refetch: refetchProducts } = useQuery({
    queryKey: ['/products'],
    queryFn: () => apiClient.getProducts(),
  });

  // Like product mutation
  const likeMutation = useMutation({
    mutationFn: (productId: string) => apiClient.request(`/products/${productId}/like`, { method: 'POST' }),
    onSuccess: (data: any, productId: string) => {
      toast({
        title: "✅ Produit aimé !",
        description: data.message || "Produit ajouté aux favoris",
      });
      // Refetch products to see updated like counts
      refetchProducts();
      queryClient.invalidateQueries({ queryKey: ['/products', productId] });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Erreur",
        description: error.message || "Impossible d'aimer ce produit",
        variant: "destructive"
      });
    }
  });

  // Get promoted products
  const { data: promotedProducts, refetch: refetchPromoted } = useQuery({
    queryKey: ['/products/promoted'],
    queryFn: () => apiClient.request('/products/promoted'),
  });

  const handleLikeProduct = (productId: string) => {
    setSelectedProduct(productId);
    likeMutation.mutate(productId);
  };

  const handleRefresh = () => {
    refetchProducts();
    refetchPromoted();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-border sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={20} />
                Retour
              </Button>
              <h1 className="text-2xl font-bold text-foreground">Test Promotion Automatique</h1>
            </div>
            <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2">
              <RefreshCw size={16} />
              Actualiser
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Instructions */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Star size={20} />
              Comment tester la promotion automatique
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-blue-600 dark:text-blue-300">
              <p>• Sélectionnez un produit qui n'est pas le vôtre</p>
              <p>• Cliquez sur le bouton "❤️ J'aime" 3 fois (ou demandez à 3 utilisateurs différents)</p>
              <p>• Le produit sera automatiquement promu après 3 j'aimes</p>
              <p>• Une notification sera envoyée au propriétaire du produit</p>
              <p>• Le produit apparaîtra dans la section "Produits Promus"</p>
            </div>
          </CardContent>
        </Card>

        {/* Promoted Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy size={20} className="text-yellow-500" />
              Produits Promus (3+ j'aimes)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {promotedProducts && promotedProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {promotedProducts.map((product: any) => (
                  <Card key={product.id} className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="default" className="bg-yellow-500 text-white">
                          🎉 PROMU
                        </Badge>
                        <Badge variant="outline">
                          ❤️ {product.like_count || 0}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">{product.title}</h3>
                      <p className="text-2xl font-bold text-green-600 mb-2">{product.price}</p>
                      <p className="text-sm text-muted-foreground">{product.location}</p>
                      {product.promoted_at && (
                        <p className="text-xs text-yellow-600 mt-2">
                          Promu le: {new Date(product.promoted_at).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Aucun produit promu pour le moment. Likez des produits pour les voir apparaître ici !
              </p>
            )}
          </CardContent>
        </Card>

        {/* All Products for Testing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart size={20} />
              Tous les produits - Test des j'aimes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products?.map((product: any) => (
                <Card key={product.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">{product.category}</Badge>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                          ❤️ {product.like_count || 0}
                        </Badge>
                        {product.is_promoted && (
                          <Badge variant="default" className="bg-yellow-500 text-white">
                            PROMU
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-foreground mb-1">{product.title}</h3>
                    <p className="text-lg font-bold text-green-600 mb-2">{product.price}</p>
                    <p className="text-sm text-muted-foreground mb-3">{product.location}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        {product.user_id === user?.id ? "Votre produit" : "Autre utilisateur"}
                      </div>
                      
                      <Button
                        size="sm"
                        variant={product.user_id === user?.id ? "secondary" : "outline"}
                        disabled={product.user_id === user?.id || likeMutation.isPending}
                        onClick={() => handleLikeProduct(product.id)}
                        className="flex items-center gap-1"
                      >
                        <Heart size={14} />
                        {product.user_id === user?.id ? "Votre produit" : 
                         likeMutation.isPending && selectedProduct === product.id ? "En cours..." : "J'aime"}
                      </Button>
                    </div>
                    
                    {/* Progress towards promotion */}
                    {!product.is_promoted && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>Progression vers promotion</span>
                          <span>{Math.min(product.like_count || 0, 3)}/3</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min((product.like_count || 0) / 3 * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Testing Info */}
        <Card className="border-gray-200 bg-gray-50 dark:bg-gray-900">
          <CardHeader>
            <CardTitle>Informations de test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Système de promotion</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Auto-promotion à 3 j'aimes</li>
                  <li>• Notification automatique au vendeur</li>
                  <li>• Badge "PROMU" visible</li>
                  <li>• Horodatage de promotion</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Règles</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Impossible d'aimer son propre produit</li>
                  <li>• Compteur de j'aimes en temps réel</li>
                  <li>• Barre de progression vers promotion</li>
                  <li>• Actualisation automatique des données</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};