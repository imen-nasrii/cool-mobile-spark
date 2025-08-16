import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Package, Search, Star, Heart, TrendingUp, Plus, Edit2, Trash2, Eye } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  description?: string;
  price: string;
  location: string;
  category: string;
  like_count: number;
  is_promoted: boolean;
  is_reserved: boolean;
  is_free: boolean;
  is_advertisement: boolean;
  created_at: string;
  image_url?: string;
  seller_id: string;
}

interface ProductForm {
  title: string;
  description: string;
  price: string;
  location: string;
  category: string;
  is_promoted: boolean;
  is_reserved: boolean;
  is_free: boolean;
  is_advertisement: boolean;
}

export function ProductManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<ProductForm>({
    title: '',
    description: '',
    price: '0',
    location: '',
    category: '',
    is_promoted: false,
    is_reserved: false,
    is_free: false,
    is_advertisement: false
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch products for admin
  const { data: products = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/products'],
    queryFn: () => apiClient.request('/admin/products'),
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: () => apiClient.request('/categories'),
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (productData: ProductForm) => {
      return apiClient.request('/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Produit créé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      resetForm();
      setIsCreateDialogOpen(false);
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le produit",
        variant: "destructive"
      });
    }
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: ProductForm }) => {
      return apiClient.request(`/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Produit modifié avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      setEditingProduct(null);
      resetForm();
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier le produit",
        variant: "destructive"
      });
    }
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      return apiClient.request(`/admin/products/${productId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Produit supprimé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      setDeletingProduct(null);
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le produit",
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setProductForm({
      title: '',
      description: '',
      price: '0',
      location: '',
      category: '',
      is_promoted: false,
      is_reserved: false,
      is_free: false,
      is_advertisement: false
    });
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      title: product.title,
      description: product.description || '',
      price: product.price,
      location: product.location,
      category: product.category,
      is_promoted: product.is_promoted,
      is_reserved: product.is_reserved,
      is_free: product.is_free,
      is_advertisement: product.is_advertisement
    });
  };

  const handleCreateProduct = () => {
    if (!productForm.title.trim()) {
      toast({
        title: "Erreur",
        description: "Le titre du produit est requis",
        variant: "destructive"
      });
      return;
    }
    if (!productForm.category) {
      toast({
        title: "Erreur",
        description: "La catégorie est requise",
        variant: "destructive"
      });
      return;
    }
    createProductMutation.mutate(productForm);
  };

  const handleUpdateProduct = () => {
    if (!editingProduct) return;
    if (!productForm.title.trim()) {
      toast({
        title: "Erreur",
        description: "Le titre du produit est requis",
        variant: "destructive"
      });
      return;
    }
    updateProductMutation.mutate({ id: editingProduct.id, data: productForm });
  };

  const handleDeleteProduct = () => {
    if (!deletingProduct) return;
    deleteProductMutation.mutate(deletingProduct.id);
  };

  // Filter products based on search
  const filteredProducts = products.filter((product: Product) =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProductBadges = (product: Product) => {
    const badges = [];
    
    if (product.is_promoted) {
      badges.push(
        <Badge key="promoted" className="bg-yellow-100 text-yellow-700">
          <Star className="w-3 h-3 mr-1" />
          Promu
        </Badge>
      );
    }
    
    if (product.is_reserved) {
      badges.push(
        <Badge key="reserved" variant="secondary">
          Réservé
        </Badge>
      );
    }
    
    if (product.is_free) {
      badges.push(
        <Badge key="free" className="bg-green-100 text-green-700">
          Gratuit
        </Badge>
      );
    }
    
    return badges;
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4 mx-auto"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Product form component
  const ProductForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Titre *</Label>
          <Input
            id="title"
            placeholder="Titre du produit"
            value={productForm.title}
            onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Catégorie *</Label>
          <Select value={productForm.category} onValueChange={(value) => setProductForm({ ...productForm, category: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une catégorie" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat: any) => (
                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Description du produit"
          value={productForm.description}
          onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Prix (TND)</Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={productForm.price}
            onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
            disabled={productForm.is_free}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Localisation</Label>
          <Input
            id="location"
            placeholder="Ville, région"
            value={productForm.location}
            onChange={(e) => setProductForm({ ...productForm, location: e.target.value })}
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="is_free"
            checked={productForm.is_free}
            onCheckedChange={(checked) => setProductForm({ ...productForm, is_free: checked, price: checked ? '0' : productForm.price })}
          />
          <Label htmlFor="is_free">Gratuit</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="is_promoted"
            checked={productForm.is_promoted}
            onCheckedChange={(checked) => setProductForm({ ...productForm, is_promoted: checked })}
          />
          <Label htmlFor="is_promoted">Promouvoir ce produit</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="is_reserved"
            checked={productForm.is_reserved}
            onCheckedChange={(checked) => setProductForm({ ...productForm, is_reserved: checked })}
          />
          <Label htmlFor="is_reserved">Marqué comme réservé</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="is_advertisement"
            checked={productForm.is_advertisement}
            onCheckedChange={(checked) => setProductForm({ ...productForm, is_advertisement: checked })}
          />
          <Label htmlFor="is_advertisement">Marquer comme publicité</Label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Produits</h2>
          <p className="text-gray-600">Créer, modifier et supprimer les produits de la marketplace Tomati</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700" onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Produit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer un nouveau produit</DialogTitle>
            </DialogHeader>
            <ProductForm />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Annuler</Button>
              <Button 
                onClick={handleCreateProduct}
                disabled={createProductMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {createProductMutation.isPending ? 'Création...' : 'Créer'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Rechercher par titre, catégorie ou localisation..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Produits</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Promus</p>
                <p className="text-2xl font-bold">
                  {products.filter((product: Product) => product.is_promoted).length}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Réservés</p>
                <p className="text-2xl font-bold">
                  {products.filter((product: Product) => product.is_reserved).length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gratuits</p>
                <p className="text-2xl font-bold">
                  {products.filter((product: Product) => product.is_free).length}
                </p>
              </div>
              <Heart className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Résultats</p>
                <p className="text-2xl font-bold">{filteredProducts.length}</p>
              </div>
              <Search className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products List */}
      <div className="grid gap-4">
        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">Aucun produit trouvé</h3>
              <p className="text-gray-600">Aucun produit ne correspond à votre recherche</p>
            </CardContent>
          </Card>
        ) : (
          filteredProducts.map((product: Product) => (
            <Card key={product.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{product.title}</h3>
                        {getProductBadges(product)}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{product.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="font-semibold text-green-600">
                          {product.is_free ? 'Gratuit' : `${product.price} TND`}
                        </span>
                        <span>📍 {product.location}</span>
                        <Badge variant="outline">{product.category}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {product.like_count} likes
                        </span>
                        <span>Créé le {new Date(product.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(`/products/${product.id}`, '_blank')}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Voir
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditProduct(product)}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setDeletingProduct(product)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Product Dialog */}
      <Dialog open={editingProduct !== null} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le produit</DialogTitle>
          </DialogHeader>
          <ProductForm />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setEditingProduct(null)}>Annuler</Button>
            <Button 
              onClick={handleUpdateProduct}
              disabled={updateProductMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {updateProductMutation.isPending ? 'Modification...' : 'Modifier'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deletingProduct !== null} onOpenChange={(open) => !open && setDeletingProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le produit</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer "{deletingProduct?.title}" ? 
              Cette action est irréversible et supprimera également tous les messages et likes associés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingProduct(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteProduct}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteProductMutation.isPending}
            >
              {deleteProductMutation.isPending ? 'Suppression...' : 'Supprimer définitivement'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}