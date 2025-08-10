import { useState } from "react";
import { ArrowLeft, BarChart3, Users, Package, Grid3X3, TrendingUp, ShoppingCart, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { CategoryManager } from "@/components/Admin/CategoryManager";
import { ProductManager } from "@/components/Admin/ProductManager";
import { UserManager } from "@/components/Admin/UserManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const { toast } = useToast();

  // Stats data
  const { data: stats = {}, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      return {
        totalProducts: 47,
        totalUsers: 156,
        totalCategories: 6,
        totalOrders: 89,
        recentProducts: 12,
        activeUsers: 45
      };
    },
  });

  // Fetch products for dashboard overview
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['/api/products'],
    queryFn: () => apiClient.getProducts()
  });

  const statsCards = [
    {
      title: "Total Produits",
      value: stats.totalProducts || products.length,
      icon: Package,
      description: `+${stats.recentProducts || 5} ce mois`,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Utilisateurs",
      value: stats.totalUsers || 156,
      icon: Users,
      description: `${stats.activeUsers || 45} actifs`,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Catégories",
      value: stats.totalCategories || 6,
      icon: Grid3X3,
      description: "Toutes actives",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Commandes",
      value: stats.totalOrders || 89,
      icon: ShoppingCart,
      description: "+12% ce mois",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  const DashboardOverview = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tableau de Bord Administrateur</h1>
          <p className="text-muted-foreground mt-2">
            Gérez votre plateforme e-commerce Tomati
          </p>
        </div>
        <Badge variant="default" className="bg-green-100 text-green-800">
          <TrendingUp size={14} className="mr-1" />
          Système en ligne
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">
                      {isLoading || statsLoading ? "..." : stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon size={24} className={stat.color} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package size={20} />
            Produits Récents
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {products.slice(0, 5).map((product: any) => (
                <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{product.title}</h4>
                    <p className="text-sm text-muted-foreground">{product.category} • {product.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{product.price}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(product.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Button 
              onClick={() => setActiveTab("products")} 
              className="h-20 flex flex-col gap-2"
            >
              <Package size={24} />
              <span>Gérer les Produits</span>
            </Button>
            <Button 
              onClick={() => navigate('/admin/products')} 
              variant="destructive" 
              className="h-20 flex flex-col gap-2"
            >
              <Package size={24} />
              <span>Supprimer Produits</span>
            </Button>
            <Button 
              onClick={() => navigate('/admin/advertisements')} 
              variant="secondary" 
              className="h-20 flex flex-col gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200"
            >
              <Zap size={24} />
              <span>Supprimer Pubs Bleues</span>
            </Button>
            <Button 
              onClick={() => setActiveTab("categories")} 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
            >
              <Grid3X3 size={24} />
              <span>Gérer les Catégories</span>
            </Button>
            <Button 
              onClick={() => setActiveTab("users")} 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
            >
              <Users size={24} />
              <span>Gérer les Utilisateurs</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              Retour au site
            </Button>
            <div className="flex items-center gap-4">
              <Badge variant="outline">Admin</Badge>
              <div className="text-sm">
                <div className="font-medium">Super Admin</div>
                <div className="text-muted-foreground">admin@tomati.com</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 size={16} />
              Tableau de Bord
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package size={16} />
              Produits
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Grid3X3 size={16} />
              Catégories
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users size={16} />
              Utilisateurs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <DashboardOverview />
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <ProductManager />
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <CategoryManager />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}