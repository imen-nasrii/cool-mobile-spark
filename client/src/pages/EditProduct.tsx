import { useState, useEffect } from "react";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient, queryClient } from "@/lib/queryClient";
import { useLanguage } from "@/hooks/useLanguage";
import { ProductMap } from "@/components/Map/ProductMap";

const categories = [
  { id: "voiture", name: "Voiture" },
  { id: "immobilier", name: "Immobilier" },
  { id: "emplois", name: "Emplois" },
  { id: "autres", name: "Autres" }
];

interface EditProductProps {
  productId: string;
  onBack?: () => void;
  onSave?: () => void;
}

export const EditProduct = ({ productId, onBack, onSave }: EditProductProps) => {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    category: "",
    is_free: false
  });
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        toast({
          title: "Erreur",
          description: "Produit non trouvé ou accès refusé",
          variant: "destructive"
        });
        onBack?.();
        return;
      }

      setProduct(data);
      setFormData({
        title: data.title || "",
        description: data.description || "",
        price: data.price || "",
        location: data.location || "",
        category: data.category || "",
        is_free: data.is_free || false
      });
    };

    fetchProduct();
  }, [productId, user, onBack, toast]);

  const handleSave = async () => {
    if (!user || !product) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({
          title: formData.title,
          description: formData.description,
          price: formData.is_free ? "Free" : formData.price,
          location: formData.location,
          category: formData.category,
          is_free: formData.is_free,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Produit mis à jour avec succès"
      });

      onSave?.();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le produit",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !product) return;

    const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?");
    if (!confirmed) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Produit supprimé avec succès"
      });

      onBack?.();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le produit",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-40 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-semibold">Modifier le produit</h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={deleting}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations du produit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Titre *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Titre du produit"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Catégorie *</label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Prix</label>
              <div className="flex gap-4 mb-4">
                <Button
                  type="button"
                  variant={!formData.is_free ? "default" : "outline"}
                  onClick={() => setFormData(prev => ({ ...prev, is_free: false }))}
                >
                  Payant
                </Button>
                <Button
                  type="button"
                  variant={formData.is_free ? "default" : "outline"}
                  onClick={() => setFormData(prev => ({ ...prev, is_free: true }))}
                >
                  Gratuit
                </Button>
              </div>
              {!formData.is_free && (
                <Input
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="Prix en DT"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Localisation *</label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Ville, région"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description du produit"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Localisation sur la carte</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductMap
              location={formData.location}
              onLocationSelect={(location) => setFormData(prev => ({ ...prev, location }))}
              className="w-full"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};