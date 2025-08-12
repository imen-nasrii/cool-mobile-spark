import { useState } from "react";
import { ArrowLeft, BarChart3, Users, Package, Grid3X3, TrendingUp, ShoppingCart, Zap, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/queryClient";
import { CategoryManager } from "@/components/Admin/CategoryManager";
import { ProductManager } from "@/components/Admin/ProductManager";
import { UserManager } from "@/components/Admin/UserManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const { toast } = useToast();

  // Real stats data from database
  const { data: stats = {}, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: () => apiClient.request('/admin/stats'),
  });

  const statsCards = [
    {
      title: "Total Produits",
      value: stats.totalProducts || 0,
      icon: Package,
      description: `+${stats.recentProducts || 0} ce mois`,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      title: "Utilisateurs",
      value: stats.totalUsers || 0,
      icon: Users,
      description: `${stats.activeUsers || 0} actifs`,
      color: "text-green-600",
      bgColor: "bg-green-50",
      gradient: "from-green-500 to-green-600"
    },
    {
      title: "Catégories",
      value: stats.totalCategories || 0,
      icon: Grid3X3,
      description: "Gestion complète",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      gradient: "from-purple-500 to-purple-600"
    },
    {
      title: "Publicités",
      value: stats.totalAdvertisements || 0,
      icon: Zap,
      description: `${stats.promotedProducts || 0} promus`,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      gradient: "from-orange-500 to-orange-600"
    },
    {
      title: "Total Likes",
      value: stats.totalLikes || 0,
      icon: Heart,
      description: "Engagement",
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      gradient: "from-pink-500 to-pink-600"
    }
  ];

  const DashboardOverview = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="space-y-8 p-8">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="floating-element">
            <h1 className="text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 bg-clip-text text-transparent">
              Dashboard Administrateur
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
            Contrôlez et gérez votre plateforme e-commerce Tomati avec style et élégance
          </p>
          <div className="flex justify-center">
            <Badge variant="default" className="bg-green-100 text-green-800 px-6 py-3 rounded-full modern-shadow-lg text-lg">
              <TrendingUp size={20} className="mr-3" />
              Système opérationnel
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="glass-card card-3d group hover:modern-shadow-lg border-0">
                <CardContent className="p-6 relative overflow-hidden">
                  {/* Background gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-gray-50/30 group-hover:to-gray-100/40 transition-all duration-500"></div>
                  
                  {/* Content */}
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300 modern-shadow`}>
                        <Icon size={24} className={`${stat.color} drop-shadow-sm`} />
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                          {stat.title}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                        {statsLoading ? (
                          <div className="animate-pulse bg-gray-200 h-8 w-16 rounded-lg"></div>
                        ) : (
                          stat.value
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground font-semibold">
                        {stat.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Bottom accent line */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Management Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <Card className="glass-card card-3d group border-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 opacity-50"></div>
            <CardHeader className="pb-4 relative z-10">
              <CardTitle className="flex items-center gap-4 text-2xl">
                <div className="p-3 rounded-xl bg-blue-100 group-hover:bg-blue-200 transition-colors modern-shadow">
                  <Package size={28} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold">Gestion des Produits</h3>
                  <p className="text-sm text-muted-foreground font-normal">Centre de contrôle produits</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-4">
                <p className="text-muted-foreground">Gérez les produits, catégories et inventaire de votre plateforme avec des outils avancés.</p>
                <Button 
                  onClick={() => setActiveTab("products")} 
                  className={`w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 modern-shadow-lg font-semibold text-lg transition-all duration-300 hover:scale-105`}
                >
                  Accéder au centre de gestion
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card card-3d group border-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 opacity-50"></div>
            <CardHeader className="pb-4 relative z-10">
              <CardTitle className="flex items-center gap-4 text-2xl">
                <div className="p-3 rounded-xl bg-green-100 group-hover:bg-green-200 transition-colors modern-shadow">
                  <Users size={28} className="text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold">Gestion des Utilisateurs</h3>
                  <p className="text-sm text-muted-foreground font-normal">Administration utilisateurs</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-4">
                <p className="text-muted-foreground">Administrez les comptes utilisateurs, leurs permissions et surveillez l'activité.</p>
                <Button 
                  onClick={() => setActiveTab("users")} 
                  className={`w-full h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 modern-shadow-lg font-semibold text-lg transition-all duration-300 hover:scale-105`}
                >
                  Accéder au centre de gestion
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Modern Header */}
      <div className="glass-card border-0 rounded-none border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center gap-3 hover:bg-white/10 h-12 px-6 rounded-xl transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft size={20} />
              <span className="font-semibold">Retour au site</span>
            </Button>
            <div className="flex items-center gap-6">
              <Badge variant="outline" className="bg-blue-100 text-blue-800 px-4 py-2 modern-shadow">
                Super Admin
              </Badge>
              <div className="text-right">
                <div className="font-bold text-gray-900">Administrateur</div>
                <div className="text-sm text-muted-foreground">admin@tomati.com</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-8 pt-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-4 glass-card border-0 modern-shadow">
              <TabsTrigger value="dashboard" className="font-semibold">
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="products" className="font-semibold">
                <Package className="w-4 h-4 mr-2" />
                Produits
              </TabsTrigger>
              <TabsTrigger value="users" className="font-semibold">
                <Users className="w-4 h-4 mr-2" />
                Utilisateurs
              </TabsTrigger>
              <TabsTrigger value="categories" className="font-semibold">
                <Grid3X3 className="w-4 h-4 mr-2" />
                Catégories
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="mt-0">
            <DashboardOverview />
          </TabsContent>

          <TabsContent value="products" className="mt-8 px-8">
            <div className="glass-card p-8 rounded-2xl border-0 modern-shadow-lg">
              <ProductManager onStatsUpdate={() => {}} />
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-8 px-8">
            <div className="glass-card p-8 rounded-2xl border-0 modern-shadow-lg">
              <UserManager onStatsUpdate={() => {}} />
            </div>
          </TabsContent>

          <TabsContent value="categories" className="mt-8 px-8">
            <div className="glass-card p-8 rounded-2xl border-0 modern-shadow-lg">
              <CategoryManager onStatsUpdate={() => {}} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}