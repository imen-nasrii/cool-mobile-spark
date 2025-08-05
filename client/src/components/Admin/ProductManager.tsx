import { useState } from "react";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

const productSchema = z.object({
  title: z.string().min(5, "Le titre doit contenir au moins 5 caractères"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  price: z.string().min(1, "Le prix est requis"),
  location: z.string().min(2, "La localisation est requise"),
  category: z.string().min(1, "La catégorie est requise"),
  is_free: z.boolean().default(false),
  image_url: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  location: string;
  category: string;
  is_free: boolean;
  is_reserved: boolean;
  image_url?: string;
  likes: number;
  created_at: string;
}

const categories = [
  "Électronique", 
  "Sport", 
  "Voiture", 
  "Bureautique", 
  "Jeux vidéo", 
  "Mobilier"
];

const locations = [
  "Tunis", 
  "Sfax", 
  "Sousse", 
  "Monastir", 
  "Bizerte", 
  "Gabès",
  "Kairouan",
  "Nabeul"
];

export const ProductManager = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createForm = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "",
      location: "",
      category: "",
      is_free: false,
      image_url: "",
    },
  });

  const editForm = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "",
      location: "",
      category: "",
      is_free: false,
      image_url: "",
    },
  });

  // Fetch products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['/api/products'],
    queryFn: () => apiClient.getProducts(),
  });

  // Filter products
  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Create product mutation
  const createMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      // Mock API call - in real implementation would call backend
      console.log('Creating product:', data);
      return { 
        id: Date.now().toString(), 
        ...data, 
        likes: 0, 
        is_reserved: false,
        created_at: new Date().toISOString() 
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsCreateOpen(false);
      createForm.reset();
      toast({
        title: "Produit créé",
        description: "Le nouveau produit a été ajouté avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le produit.",
        variant: "destructive",
      });
    },
  });

  // Update product mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProductFormData }) => {
      // Mock API call - in real implementation would call backend
      console.log('Updating product:', id, data);
      return { id, ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsEditOpen(false);
      setEditingProduct(null);
      editForm.reset();
      toast({
        title: "Produit modifié",
        description: "Le produit a été mis à jour avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le produit.",
        variant: "destructive",
      });
    },
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Mock API call - in real implementation would call backend
      console.log('Deleting product:', id);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Produit supprimé",
        description: "Le produit a été supprimé avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le produit.",
        variant: "destructive",
      });
    },
  });

  const handleCreate = (data: ProductFormData) => {
    createMutation.mutate(data);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    editForm.reset({
      title: product.title,
      description: product.description,
      price: product.price,
      location: product.location,
      category: product.category,
      is_free: product.is_free,
      image_url: product.image_url || "",
    });
    setIsEditOpen(true);
  };

  const handleUpdate = (data: ProductFormData) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Package size={24} />
          Gestion des Produits
        </h2>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={16} />
              Nouveau Produit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer un nouveau produit</DialogTitle>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titre du produit *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: iPhone 15 Pro..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prix *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 1200TND" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={createForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Description détaillée du produit..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catégorie *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez une catégorie" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Localisation *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez une ville" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {locations.map((location) => (
                              <SelectItem key={location} value={location}>
                                {location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={createForm.control}
                  name="image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL de l'image (optionnel)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="is_free"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Produit gratuit</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Ce produit est-il offert gratuitement ?
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Création..." : "Créer"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Rechercher par titre ou description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Toutes les catégories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Produits ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Localisation</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Likes</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product: Product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.title}</TableCell>
                  <TableCell>
                    {product.is_free ? (
                      <Badge variant="secondary">Gratuit</Badge>
                    ) : (
                      product.price
                    )}
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.location}</TableCell>
                  <TableCell>
                    {product.is_reserved ? (
                      <Badge variant="destructive">Réservé</Badge>
                    ) : (
                      <Badge variant="default">Disponible</Badge>
                    )}
                  </TableCell>
                  <TableCell>{product.likes}</TableCell>
                  <TableCell>
                    {new Date(product.created_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le produit</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleUpdate)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre du produit *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: iPhone 15 Pro..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prix *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 1200TND" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Description détaillée du produit..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catégorie *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez une catégorie" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Localisation *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez une ville" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de l'image (optionnel)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="is_free"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Produit gratuit</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Ce produit est-il offert gratuitement ?
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Modification..." : "Modifier"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};