import { useState, useEffect } from "react";
// Admin functionality disabled for now - TODO: Implement with new API
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  location: string;
  category: string;
  is_free: boolean;
  is_reserved: boolean;
  user_id: string;
  created_at: string;
  image_url?: string;
}

interface ProductsAdminProps {
  onStatsUpdate: () => void;
}

export function ProductsAdmin({ onStatsUpdate }: ProductsAdminProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    category: '',
    is_free: false,
    is_reserved: false,
    image_url: '',
    // Champs voiture
    car_fuel_type: '',
    car_transmission: '',
    car_year: '',
    car_mileage: '',
    car_engine_size: '',
    car_doors: '',
    car_seats: '',
    car_color: '',
    car_brand: '',
    car_model: '',
    car_condition: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les produits",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save product');

      toast({
        title: "Succès",
        description: editingProduct ? "Produit mis à jour avec succès" : "Produit créé avec succès",
      });

      setIsDialogOpen(false);
      resetForm();
      fetchProducts();
      onStatsUpdate();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le produit",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete product');
      
      toast({
        title: "Succès",
        description: "Produit supprimé avec succès",
      });
      
      fetchProducts();
      onStatsUpdate();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le produit",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      location: '',
      category: '',
      is_free: false,
      is_reserved: false,
      image_url: '',
      // Champs voiture
      car_fuel_type: '',
      car_transmission: '',
      car_year: '',
      car_mileage: '',
      car_engine_size: '',
      car_doors: '',
      car_seats: '',
      car_color: '',
      car_brand: '',
      car_model: '',
      car_condition: '',
    });
    setEditingProduct(null);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description || '',
      price: product.price,
      location: product.location,
      category: product.category,
      is_free: product.is_free,
      is_reserved: product.is_reserved,
      image_url: product.image_url || '',
      // Champs voiture
      car_fuel_type: (product as any).car_fuel_type || '',
      car_transmission: (product as any).car_transmission || '',
      car_year: (product as any).car_year || '',
      car_mileage: (product as any).car_mileage || '',
      car_engine_size: (product as any).car_engine_size || '',
      car_doors: (product as any).car_doors || '',
      car_seats: (product as any).car_seats || '',
      car_color: (product as any).car_color || '',
      car_brand: (product as any).car_brand || '',
      car_model: (product as any).car_model || '',
      car_condition: (product as any).car_condition || '',
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  if (loading) return <div>Chargement des produits...</div>;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Gestion des Produits</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un produit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Titre</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="price">Prix</Label>
                  <Input
                    id="price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="location">Localisation</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Catégorie</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electronics">Électronique</SelectItem>
                      <SelectItem value="vehicles">Véhicules</SelectItem>
                      <SelectItem value="furniture">Mobilier</SelectItem>
                      <SelectItem value="clothing">Vêtements</SelectItem>
                      <SelectItem value="sports">Sport</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Champs spécifiques aux voitures */}
                {formData.category === 'vehicles' && (
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="font-semibold text-sm">Détails du véhicule</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="car_brand">Marque</Label>
                        <Input
                          id="car_brand"
                          value={formData.car_brand}
                          onChange={(e) => setFormData({ ...formData, car_brand: e.target.value })}
                          placeholder="Ex: Peugeot"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="car_model">Modèle</Label>
                        <Input
                          id="car_model"
                          value={formData.car_model}
                          onChange={(e) => setFormData({ ...formData, car_model: e.target.value })}
                          placeholder="Ex: 208"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="car_fuel_type">Carburant</Label>
                        <Select value={formData.car_fuel_type} onValueChange={(value) => setFormData({ ...formData, car_fuel_type: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Type de carburant" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="essence">Essence</SelectItem>
                            <SelectItem value="diesel">Diesel</SelectItem>
                            <SelectItem value="hybride">Hybride</SelectItem>
                            <SelectItem value="electrique">Électrique</SelectItem>
                            <SelectItem value="gpl">GPL</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="car_transmission">Transmission</Label>
                        <Select value={formData.car_transmission} onValueChange={(value) => setFormData({ ...formData, car_transmission: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Transmission" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manuelle">Manuelle</SelectItem>
                            <SelectItem value="automatique">Automatique</SelectItem>
                            <SelectItem value="semi-automatique">Semi-automatique</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="car_year">Année</Label>
                        <Input
                          id="car_year"
                          type="number"
                          value={formData.car_year}
                          onChange={(e) => setFormData({ ...formData, car_year: e.target.value })}
                          placeholder="Ex: 2020"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="car_mileage">Kilométrage</Label>
                        <Input
                          id="car_mileage"
                          type="number"
                          value={formData.car_mileage}
                          onChange={(e) => setFormData({ ...formData, car_mileage: e.target.value })}
                          placeholder="Ex: 50000"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="car_condition">État</Label>
                      <Select value={formData.car_condition} onValueChange={(value) => setFormData({ ...formData, car_condition: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="État du véhicule" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="neuf">Neuf</SelectItem>
                          <SelectItem value="tres-bon">Très bon état</SelectItem>
                          <SelectItem value="bon">Bon état</SelectItem>
                          <SelectItem value="correct">État correct</SelectItem>
                          <SelectItem value="a-renover">À rénover</SelectItem>
                          <SelectItem value="accidente">Accidenté</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                
                <div>
                  <Label htmlFor="image_url">URL de l'image</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingProduct ? 'Modifier' : 'Créer'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
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
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.title}</TableCell>
                <TableCell>{product.is_free ? 'Gratuit' : product.price}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.location}</TableCell>
                <TableCell>
                  {product.is_reserved ? (
                    <span className="text-orange-600">Réservé</span>
                  ) : (
                    <span className="text-green-600">Disponible</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}