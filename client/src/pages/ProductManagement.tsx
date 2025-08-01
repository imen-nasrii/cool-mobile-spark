import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Trash2, Edit, Eye, Search, Filter, Plus } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  category: string;
  price: number;
  is_free: boolean;
  location: string;
  created_at: string;
  promoted: boolean;
  user_id: string;
}

export function ProductManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ['/api/categories'],
  });

  const deleteMutation = useMutation({
    mutationFn: (productId: string) => apiRequest(`/api/products/${productId}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast({ title: "Succès", description: "Produit supprimé avec succès" });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de supprimer le produit", variant: "destructive" });
    }
  });

  const promoteMutation = useMutation({
    mutationFn: (productId: string) => apiRequest(`/api/products/${productId}/promote`, { method: 'POST' }),
    onSuccess: () => {
      toast({ title: "Succès", description: "Produit promu avec succès" });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de promouvoir le produit", variant: "destructive" });
    }
  });

  // Filtrage des produits
  const filteredProducts = (products as Product[]).filter((product: Product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'promoted' && product.promoted) ||
                         (selectedStatus === 'regular' && !product.promoted) ||
                         (selectedStatus === 'free' && product.is_free) ||
                         (selectedStatus === 'paid' && !product.is_free);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Statistiques
  const stats = {
    total: (products as Product[]).length,
    promoted: (products as Product[]).filter((p: Product) => p.promoted).length,
    free: (products as Product[]).filter((p: Product) => p.is_free).length,
    categories: (categories as any[]).length
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Produits</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un produit
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Produits</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.promoted}</div>
            <div className="text-sm text-gray-600">Produits Promus</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.free}</div>
            <div className="text-sm text-gray-600">Produits Gratuits</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.categories}</div>
            <div className="text-sm text-gray-600">Catégories</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtres et Recherche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher par titre ou localisation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes les catégories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                <SelectItem value="vehicles">Véhicules</SelectItem>
                <SelectItem value="real_estate">Immobilier</SelectItem>
                <SelectItem value="jobs">Emplois</SelectItem>
                <SelectItem value="electronics">Électronique</SelectItem>
                <SelectItem value="other">Autres</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="promoted">Promus</SelectItem>
                <SelectItem value="regular">Réguliers</SelectItem>
                <SelectItem value="free">Gratuits</SelectItem>
                <SelectItem value="paid">Payants</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedStatus('all');
            }}>
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des produits */}
      <Card>
        <CardHeader>
          <CardTitle>Produits ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Chargement des produits...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Aucun produit trouvé</div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((product: Product) => (
                <div key={product.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{product.title}</h3>
                        {product.promoted && (
                          <Badge className="bg-yellow-500 text-white">Promu</Badge>
                        )}
                        {product.is_free && (
                          <Badge variant="secondary">Gratuit</Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Catégorie:</span> {product.category}
                        </div>
                        <div>
                          <span className="font-medium">Prix:</span> {product.is_free ? 'Gratuit' : `${product.price} DT`}
                        </div>
                        <div>
                          <span className="font-medium">Localisation:</span> {product.location}
                        </div>
                        <div>
                          <span className="font-medium">Créé:</span> {new Date(product.created_at).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      {!product.promoted && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => promoteMutation.mutate(product.id)}
                          disabled={promoteMutation.isPending}
                        >
                          Promouvoir
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => deleteMutation.mutate(product.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}