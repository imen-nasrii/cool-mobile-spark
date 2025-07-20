import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
// Admin functionality disabled for now - TODO: Implement with new API
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Package, BarChart3, Settings } from "lucide-react";
import { ProductsAdmin } from "./ProductsAdmin";
import { UsersAdmin } from "./UsersAdmin";
import { AnalyticsAdmin } from "./AnalyticsAdmin";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalMessages: 0,
  });

  useEffect(() => {
    checkAdminRole();
    fetchStats();
  }, [user]);

  const checkAdminRole = async () => {
    if (!user) return;
    
    // Admin functionality disabled for now - TODO: Implement with new API
    setIsAdmin(false);
    setLoading(false);
  };

  const fetchStats = async () => {
    // Admin functionality disabled for now - TODO: Implement with new API
    setStats({
      totalUsers: 0,
      totalProducts: 0,
      totalMessages: 0,
    });
  };

  if (loading) {
    return <div className="p-8">Chargement...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-destructive">Accès refusé</h1>
        <p className="text-muted-foreground">Vous n'avez pas les permissions pour accéder à cette page.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Administrateur</h1>
        <p className="text-muted-foreground">Gérez votre plateforme et surveillez les statistiques</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produits</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMessages}</div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tabs */}
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="products">
            <Package className="h-4 w-4 mr-2" />
            Produits
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Utilisateurs
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Statistiques
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="products">
          <ProductsAdmin onStatsUpdate={fetchStats} />
        </TabsContent>
        
        <TabsContent value="users">
          <UsersAdmin onStatsUpdate={fetchStats} />
        </TabsContent>
        
        <TabsContent value="analytics">
          <AnalyticsAdmin />
        </TabsContent>
      </Tabs>
    </div>
  );
}