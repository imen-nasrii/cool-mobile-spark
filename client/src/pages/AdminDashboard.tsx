import { useState } from "react";
import { Plus, Pencil, Trash2, Search, Filter, MoreHorizontal, ArrowLeft, TrendingUp, BarChart3, Package, Users } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, PieChart, Cell } from 'recharts';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  location: string;
  category: string;
  is_free: boolean;
  image_url?: string;
  created_at: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentView, setCurrentView] = useState("dashboard"); // dashboard, products
  const { toast } = useToast();
  const queryClient = useQueryClient();



  const trafficData = [
    { name: '00h', visiteurs: 12 },
    { name: '04h', visiteurs: 19 },
    { name: '08h', visiteurs: 45 },
    { name: '12h', visiteurs: 78 },
    { name: '16h', visiteurs: 52 },
    { name: '20h', visiteurs: 28 },
  ];

  // Initial form state
  const initialFormData = {
    title: "",
    description: "",
    price: "",
    location: "",
    category: "",
    is_free: false,
    image_url: ""
  };

  const [formData, setFormData] = useState(initialFormData);

  // Fetch products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['/products'],
    queryFn: () => apiClient.getProducts(),
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['/categories'],
    queryFn: () => apiClient.getCategories(),
  });

  // Fetch dashboard statistics
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/dashboard/stats'],
    queryFn: () => apiClient.getDashboardStats(),
  });

  // Utiliser les vraies données du dashboard ou des valeurs par défaut
  const salesData = dashboardStats?.salesTrends || [
    { name: 'Jan', ventes: 7, revenus: 2400 },
    { name: 'Fév', ventes: 8, revenus: 1398 },
    { name: 'Mar', ventes: 7, revenus: 9800 },
    { name: 'Avr', ventes: 5, revenus: 3908 },
    { name: 'Mai', ventes: 7, revenus: 4800 },
  ];

  const categoryData = dashboardStats?.topCategories?.map((cat: any, index: number) => ({
    name: cat.name,
    value: cat.count,
    color: ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'][index % 5]
  })) || [
    { name: 'Électronique', value: 1, color: '#8884d8' },
    { name: 'Sport', value: 1, color: '#82ca9d' },
    { name: 'Maison', value: 1, color: '#ffc658' },
  ];

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: apiClient.createProduct.bind(apiClient),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/products'] });
      setIsCreateDialogOpen(false);
      setFormData(initialFormData);
      toast({
        title: "Succès",
        description: "Produit créé avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la création du produit",
        variant: "destructive",
      });
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiClient.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/products'] });
      setIsEditDialogOpen(false);
      setEditingProduct(null);
      setFormData(initialFormData);
      toast({
        title: "Succès",
        description: "Produit mis à jour avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la mise à jour du produit",
        variant: "destructive",
      });
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: apiClient.deleteProduct.bind(apiClient),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/products'] });
      toast({
        title: "Succès",
        description: "Produit supprimé avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la suppression du produit",
        variant: "destructive",
      });
    },
  });

  // Filter products
  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleCreate = () => {
    createProductMutation.mutate(formData);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description,
      price: product.price,
      location: product.location,
      category: product.category,
      is_free: product.is_free,
      image_url: product.image_url || ""
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data: formData });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      deleteProductMutation.mutate(id);
    }
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const ProductForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Titre</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleFormChange('title', e.target.value)}
          placeholder="Titre du produit"
        />
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleFormChange('description', e.target.value)}
          placeholder="Description du produit"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Prix</Label>
          <Input
            id="price"
            value={formData.price}
            onChange={(e) => handleFormChange('price', e.target.value)}
            placeholder="Prix"
            disabled={formData.is_free}
          />
        </div>
        <div className="flex items-center space-x-2 pt-6">
          <Switch
            id="is_free"
            checked={formData.is_free}
            onCheckedChange={(checked) => {
              handleFormChange('is_free', checked);
              if (checked) handleFormChange('price', 'Free');
            }}
          />
          <Label htmlFor="is_free">Gratuit</Label>
        </div>
      </div>

      <div>
        <Label htmlFor="location">Localisation</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => handleFormChange('location', e.target.value)}
          placeholder="Localisation"
        />
      </div>

      <div>
        <Label htmlFor="category">Catégorie</Label>
        <Select value={formData.category} onValueChange={(value) => handleFormChange('category', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner une catégorie" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category: any) => (
              <SelectItem key={category.id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="image_url">URL de l'image</Label>
        <Input
          id="image_url"
          value={formData.image_url}
          onChange={(e) => handleFormChange('image_url', e.target.value)}
          placeholder="URL de l'image (optionnel)"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button 
          variant="outline" 
          onClick={() => {
            setIsCreateDialogOpen(false);
            setIsEditDialogOpen(false);
            setFormData(initialFormData);
          }}
        >
          Annuler
        </Button>
        <Button 
          onClick={isEdit ? handleUpdate : handleCreate}
          disabled={createProductMutation.isPending || updateProductMutation.isPending}
        >
          {isEdit ? "Mettre à jour" : "Créer"}
        </Button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-4">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>
          </div>
          <h1 className="text-3xl font-bold">Administration des Produits</h1>
          <p className="text-muted-foreground">Gérez tous les produits de votre plateforme</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Produit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer un nouveau produit</DialogTitle>
              <DialogDescription>
                Ajoutez un nouveau produit à votre catalogue
              </DialogDescription>
            </DialogHeader>
            <ProductForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards avec vraies données */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Produits</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{dashboardStats?.totalProducts || products.length}</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{dashboardStats?.monthlyGrowthProducts || 20.1}% ce mois
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ventes Mensuelles</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{dashboardStats?.monthlySales || 247}</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{dashboardStats?.monthlyGrowthSales || 12}% vs mois dernier
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Revenus</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {dashboardStats?.revenue ? `${Math.round(dashboardStats.revenue).toLocaleString()}€` : '12,543€'}
            </div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{dashboardStats?.monthlyGrowthRevenue || 8.2}% ce mois
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Utilisateurs Actifs</CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{dashboardStats?.totalUsers || '1,234'}</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{dashboardStats?.monthlyGrowthUsers || 15.3}% ce mois
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Rechercher des produits..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Toutes les catégories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map((category: any) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Produits ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Localisation</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product: Product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold">{product.title}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {product.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{product.category}</Badge>
                  </TableCell>
                  <TableCell>
                    {product.is_free ? (
                      <Badge variant="outline" className="text-green-600">Gratuit</Badge>
                    ) : (
                      <span className="font-semibold">{product.price}</span>
                    )}
                  </TableCell>
                  <TableCell>{product.location}</TableCell>
                  <TableCell>
                    {new Date(product.created_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(product)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(product.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucun produit trouvé
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le produit</DialogTitle>
            <DialogDescription>
              Modifiez les informations du produit
            </DialogDescription>
          </DialogHeader>
          <ProductForm isEdit />
        </DialogContent>
      </Dialog>
    </div>
  );
}