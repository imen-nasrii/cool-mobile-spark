import { Package, TrendingUp, BarChart3, Users, ArrowLeft, Activity, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/queryClient";

export default function SimpleDashboard() {
  const navigate = useNavigate();

  // Fetch products
  const { data: products = [] } = useQuery({
    queryKey: ['/products'],
    queryFn: () => apiClient.getProducts(),
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['/categories'],
    queryFn: () => apiClient.getCategories(),
  });

  // Fetch dashboard statistics
  const { data: dashboardStats } = useQuery({
    queryKey: ['/dashboard/stats'],
    queryFn: () => apiClient.getDashboardStats(),
  });

  // Graphique simple avec CSS
  const createBarChart = (data: number[], labels: string[]) => (
    <div className="space-y-3">
      {data.map((value, index) => (
        <div key={index} className="flex items-center space-x-3">
          <div className="w-16 text-sm font-medium text-gray-600">{labels[index]}</div>
          <div className="flex-1 bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-1000"
              style={{ width: `${value}%` }}
            ></div>
          </div>
          <div className="w-12 text-sm text-gray-500">{value}%</div>
        </div>
      ))}
    </div>
  );

  // Utiliser uniquement les vraies données
  const salesData = dashboardStats?.salesTrends || [];
  const salesProgress = salesData.map(d => d.value || 0);
  const salesLabels = salesData.map(d => d.name || '');

  const categoryData = dashboardStats?.topCategories || [];
  const categoryProgress = categoryData.map(cat => Math.min(100, (cat.count / Math.max(...categoryData.map(c => c.count), 1)) * 100));
  const categoryLabels = categoryData.map(cat => cat.name);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin')}
                className="flex items-center space-x-2 hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Retour aux produits</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Dashboard Analytics
                </h1>
                <p className="text-gray-600">Tableau de bord administrateur avec analyses avancées</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={() => navigate('/admin')} className="hover:bg-blue-50">
                <Package className="h-4 w-4 mr-2" />
                Gérer Produits
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Statistics Cards avec animations */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Produits</CardTitle>
                <Package className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{dashboardStats?.totalProducts || products.length}</div>
                <div className="flex items-center space-x-1 text-sm">
                  <Activity className="h-3 w-3 text-green-500" />
                  <span className="text-green-600 font-medium">+{dashboardStats?.monthlyGrowthProducts || 0}%</span>
                  <span className="text-gray-500">ce mois</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Ventes Mensuelles</CardTitle>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{dashboardStats?.monthlySales || 0}</div>
                <div className="flex items-center space-x-1 text-sm">
                  <Activity className="h-3 w-3 text-green-500" />
                  <span className="text-green-600 font-medium">+{dashboardStats?.monthlyGrowthSales || 0}%</span>
                  <span className="text-gray-500">vs mois dernier</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Revenus</CardTitle>
                <DollarSign className="h-5 w-5 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {dashboardStats?.revenue ? `${Math.round(dashboardStats.revenue).toLocaleString()} TND` : '0 TND'}
                </div>
                <div className="flex items-center space-x-1 text-sm">
                  <Activity className="h-3 w-3 text-green-500" />
                  <span className="text-green-600 font-medium">+{dashboardStats?.monthlyGrowthRevenue || 0}%</span>
                  <span className="text-gray-500">ce mois</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Utilisateurs Actifs</CardTitle>
                <Users className="h-5 w-5 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{dashboardStats?.totalUsers || 0}</div>
                <div className="flex items-center space-x-1 text-sm">
                  <Activity className="h-3 w-3 text-green-500" />
                  <span className="text-green-600 font-medium">+{dashboardStats?.monthlyGrowthUsers || 0}%</span>
                  <span className="text-gray-500">ce mois</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Graphiques simples avec CSS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Tendances des ventes */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  <span>Tendances des Ventes</span>
                </CardTitle>
                <CardDescription>Performance mensuelle des ventes</CardDescription>
              </CardHeader>
              <CardContent>
                {createBarChart(salesProgress, salesLabels)}
              </CardContent>
            </Card>

            {/* Répartition par catégorie */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-purple-500" />
                  <span>Répartition par Catégorie</span>
                </CardTitle>
                <CardDescription>Distribution des produits par catégorie</CardDescription>
              </CardHeader>
              <CardContent>
                {createBarChart(categoryProgress, categoryLabels)}
              </CardContent>
            </Card>
          </div>

          {/* Métriques de performance */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-green-500" />
                <span>Métriques de Performance</span>
              </CardTitle>
              <CardDescription>Indicateurs clés de performance de votre plateforme</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {dashboardStats?.performance?.customerSatisfaction || 0}%
                  </div>
                  <div className="text-sm text-blue-700 font-medium">Satisfaction Client</div>
                  <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ 
                      width: `${dashboardStats?.performance?.customerSatisfaction || 0}%` 
                    }}></div>
                  </div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {dashboardStats?.performance?.loadTime || '0s'}
                  </div>
                  <div className="text-sm text-green-700 font-medium">Temps de Chargement</div>
                  <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">
                    {dashboardStats?.performance?.mobileTraffic || 0}%
                  </div>
                  <div className="text-sm text-purple-700 font-medium">Trafic Mobile</div>
                  <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ 
                      width: `${dashboardStats?.performance?.mobileTraffic || 0}%` 
                    }}></div>
                  </div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600">
                    {dashboardStats?.performance?.averageCart || 0} TND
                  </div>
                  <div className="text-sm text-orange-700 font-medium">Panier Moyen</div>
                  <div className="w-full bg-orange-200 rounded-full h-2 mt-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activité récente */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle>Activité Récente</CardTitle>
              <CardDescription>Dernières actions sur la plateforme</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardStats?.recentActivity?.length > 0 ? (
                  dashboardStats.recentActivity.map((activity: any, index: number) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                      <div className="flex-1">
                        <div className="font-medium">{activity.type}</div>
                        <div className="text-sm text-gray-500">{activity.description}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    Aucune activité récente à afficher
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}