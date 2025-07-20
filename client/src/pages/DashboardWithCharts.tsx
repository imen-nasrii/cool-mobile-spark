import { useState } from "react";
import { Package, TrendingUp, BarChart3, Users, Plus, ArrowLeft } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, PieChart, Cell } from 'recharts';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/queryClient";

export default function DashboardWithCharts() {
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

  // Données pour les graphiques avec des courbes
  const salesData = [
    { name: 'Jan', ventes: 65, revenus: 2400, visiteurs: 120 },
    { name: 'Fév', ventes: 59, revenus: 1398, visiteurs: 110 },
    { name: 'Mar', ventes: 80, revenus: 9800, visiteurs: 200 },
    { name: 'Avr', ventes: 81, revenus: 3908, visiteurs: 278 },
    { name: 'Mai', ventes: 56, revenus: 4800, visiteurs: 189 },
    { name: 'Jun', ventes: 55, revenus: 3800, visiteurs: 239 },
    { name: 'Jul', ventes: 40, revenus: 4300, visiteurs: 349 },
  ];

  const categoryData = [
    { name: 'Électronique', value: 400, color: '#8884d8' },
    { name: 'Véhicules', value: 300, color: '#82ca9d' },
    { name: 'Immobilier', value: 300, color: '#ffc658' },
    { name: 'Mode', value: 200, color: '#ff7c7c' },
    { name: 'Sport', value: 150, color: '#8dd1e1' },
  ];

  const trafficData = [
    { name: '00h', visiteurs: 12, conversions: 2 },
    { name: '04h', visiteurs: 19, conversions: 4 },
    { name: '08h', visiteurs: 45, conversions: 12 },
    { name: '12h', visiteurs: 78, conversions: 23 },
    { name: '16h', visiteurs: 52, conversions: 15 },
    { name: '20h', visiteurs: 28, conversions: 8 },
    { name: '24h', visiteurs: 35, conversions: 10 },
  ];

  const growthData = [
    { name: 'S1', croissance: 10 },
    { name: 'S2', croissance: 15 },
    { name: 'S3', croissance: 12 },
    { name: 'S4', croissance: 18 },
    { name: 'S5', croissance: 25 },
    { name: 'S6', croissance: 22 },
    { name: 'S7', croissance: 30 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Retour aux produits</span>
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord Analytique</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => navigate('/admin')}>
                <Package className="h-4 w-4 mr-2" />
                Gérer Produits
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Produits</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.length}</div>
                <p className="text-xs text-muted-foreground">
                  +20.1% depuis le mois dernier
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ventes ce mois</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">247</div>
                <p className="text-xs text-muted-foreground">
                  +12% depuis le mois dernier
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenus</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12,543€</div>
                <p className="text-xs text-muted-foreground">
                  +8.2% depuis le mois dernier
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utilisateurs Actifs</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">
                  +15.3% depuis le mois dernier
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Trend with Multiple Lines */}
            <Card>
              <CardHeader>
                <CardTitle>Tendances de Performance</CardTitle>
                <CardDescription>Évolution des ventes, revenus et visiteurs</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="ventes"
                      stroke="#8884d8"
                      strokeWidth={3}
                      dot={{ fill: '#8884d8', strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8 }}
                      name="Ventes"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="revenus"
                      stroke="#82ca9d"
                      strokeWidth={3}
                      dot={{ fill: '#82ca9d', strokeWidth: 2, r: 6 }}
                      name="Revenus (€)"
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="visiteurs"
                      stroke="#ffc658"
                      strokeWidth={3}
                      dot={{ fill: '#ffc658', strokeWidth: 2, r: 6 }}
                      name="Visiteurs"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Répartition par Catégorie</CardTitle>
                <CardDescription>Distribution des produits par catégorie</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Tooltip />
                    <Legend />
                    <PieChart 
                      data={categoryData} 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={120} 
                      fill="#8884d8" 
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </PieChart>
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Additional Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Traffic and Conversions */}
            <Card>
              <CardHeader>
                <CardTitle>Trafic et Conversions</CardTitle>
                <CardDescription>Analyse horaire du trafic et des conversions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trafficData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="visiteurs"
                      stackId="1"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                      name="Visiteurs"
                    />
                    <Area
                      type="monotone"
                      dataKey="conversions"
                      stackId="2"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.8}
                      name="Conversions"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Growth Curve */}
            <Card>
              <CardHeader>
                <CardTitle>Courbe de Croissance</CardTitle>
                <CardDescription>Évolution hebdomadaire de la croissance (%)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}%`, 'Croissance']} />
                    <Line
                      type="monotone"
                      dataKey="croissance"
                      stroke="#ff7c7c"
                      strokeWidth={4}
                      dot={{ fill: '#ff7c7c', strokeWidth: 3, r: 8 }}
                      activeDot={{ r: 10, stroke: '#ff7c7c', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Summary Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Résumé de Performance</CardTitle>
              <CardDescription>Métriques clés de votre plateforme e-commerce</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">94.2%</div>
                  <div className="text-sm text-muted-foreground">Satisfaction client</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">2.3s</div>
                  <div className="text-sm text-muted-foreground">Temps de chargement</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">67%</div>
                  <div className="text-sm text-muted-foreground">Trafic mobile</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">€45.2</div>
                  <div className="text-sm text-muted-foreground">Panier moyen</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}